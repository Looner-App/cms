import type { Request } from 'express';
import type { Payload } from 'payload';
import type { User } from 'payload/auth';
import type { VerifyJWTParams } from 'thirdweb/dist/types/auth/core/verify-jwt';
import type { JWTPayload } from 'thirdweb/dist/types/utils/jwt/types';

import Cookies from 'cookies';
import crypto from 'crypto';
import merge from 'lodash/merge';
import { Strategy } from 'passport';

import type { ThirdwebUser } from '../types';
import type { StrategyOptions } from '../types';
import type { ServerClient, ServerClientAuth } from './client';

import { createClient, createClientAuth } from './client';
import { Role } from './roles';

export class ThirdwebStrategy extends Strategy {
  _serverClientAuth: ServerClientAuth;
  _serverClientAuthClient: ServerClientAuth;

  name = `thirdweb`;
  opts: StrategyOptions;
  payload: Payload;
  serverClient: ServerClient;
  slug: string;

  constructor(payload: Payload, slug: string, opts: StrategyOptions) {
    super();

    this.payload = payload;
    this.opts = opts;
    this.slug = slug;

    /// work in ssr and csr
    this.serverClient = createClient({
      secretKey: this.opts.secretKey,
    });

    /// only ssr
    this._serverClientAuth = createClientAuth(
      this.serverClient,
      this.opts.domain,
      this.opts.privateKey,
    );

    /// only csr
    this._serverClientAuthClient = createClientAuth(
      this.serverClient,
      this.opts.domainClient,
      this.opts.privateKey,
    );
  }

  static extractJWT(req: Request, key: string) {
    const cookie = new Cookies(req, null);
    return cookie.get(key);
  }

  private async createUser(sub: string, role: Role): Promise<User> {
    const password = this.createRandomPassword();
    const email = `${crypto.randomUUID()}@looner.io`;

    const newUser = await this.payload.create({
      showHiddenFields: true,
      collection: this.slug,
      data: {
        name: `Looner`,
        email,
        password,
        sub,
        roles: [role],
      },
    });

    return newUser as User;
  }

  private async findPayloadUser(payload: Payload, sub: string): Promise<User | null> {
    const users = await payload.find({
      showHiddenFields: true,
      collection: this.slug,
      where: {
        sub: {
          equals: sub,
        },
      },
    });

    if (users.docs.length > 0) {
      const thirdWebUser = await this.findThirdwebUser(sub);
      const updatedUser = await this.mergeUser(users.docs[0] as User, thirdWebUser[0]);
      return updatedUser;
    }

    return null;
  }

  private async findThirdwebUser(sub: string): Promise<ThirdwebUser[]> {
    try {
      if (!sub) return [];

      const url = new URL(this.opts.userDetailsUrl);
      if (sub) {
        url.searchParams.set(`queryBy`, `walletAddress`);
        url.searchParams.set(`walletAddress`, sub);
      }

      const headers = new Headers();
      headers.append(`Authorization`, `Bearer ${this.opts.secretKey}`);

      const resp = await fetch(url, {
        method: `GET`,
        headers,
      });

      const data = await resp.json();

      return data;
    } catch (e) {
      this.payload.logger.error(e);
      return [];
    }
  }

  private login(user: User): void {
    user.collection = this.slug;
    user._strategy = `${this.slug}-${this.name}`;
    this.payload.logger.info(`User has been authenticated: ${JSON.stringify(user)}`);
    this.success(user);
  }

  private async mergeUser(user: User, thirdwebUser?: ThirdwebUser): Promise<User> {
    const updatedUser = await this.payload.update({
      collection: this.slug,
      id: user.id,
      data: merge(user, {
        createdAt: thirdwebUser?.createdAt || user.createdAt,
        email: thirdwebUser?.email || user.email,
      }),
    });

    return updatedUser as User;
  }

  private async signIn(sub: string): Promise<void> {
    try {
      const user = await this.findPayloadUser(this.payload, sub);

      if (!user) {
        const newUser = await this.createUser(sub, Role.User);

        this.login(newUser);
        return;
      }

      return this.login(user);
    } catch (e) {
      this.payload.logger.error(e);
      this.fail();
    }
  }

  async authenticate(req: Request) {
    const isAdminPath = this.isAdminPath(req.headers?.referer || ``);

    const key = this.getSessionKey(isAdminPath);

    const authResult = await this.getJWTPayload(req);
    if (!authResult || !authResult?.sub) {
      this.fail();
      this.payload.logger.error(
        `Failed to authenticate user. JWT payload is missing or invalid: ${key}`,
      );

      return;
    }

    this.signIn(authResult.sub);
  }

  createRandomPassword() {
    return this.payload.encrypt(crypto.randomUUID());
  }

  async getJWTPayload(req: Request) {
    const isAdminPath = this.isAdminPath(req.headers.referer || ``);

    const key = this.getSessionKey(isAdminPath);
    const jwt = ThirdwebStrategy.extractJWT(req, key);

    if (!jwt) return null;

    const result = await this.verifyJWT(req, { jwt });
    if (!result?.sub) return null;

    return result;
  }

  getServerClientAuth(isAdmin: boolean) {
    if (isAdmin) {
      return this._serverClientAuth;
    }

    return this._serverClientAuthClient;
  }

  getSessionKey(isAdmin: boolean) {
    if (isAdmin) {
      return `thirdweb_backend`;
    }

    return `thirdweb_frontend`;
  }

  isAdminPath(path: string) {
    return path.includes(this.opts.domain);
  }

  async verifyJWT(req: Request, params: VerifyJWTParams): Promise<JWTPayload> {
    const isAdminPath = this.isAdminPath(req.headers.referer || ``);
    const clientAuth = this.getServerClientAuth(isAdminPath);

    const result = await clientAuth.verifyJWT(params);

    return result.valid
      ? {
          ...result.parsedJWT,
        }
      : null;
  }
}

export default ThirdwebStrategy;
