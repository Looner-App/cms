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
  name = `jwt`;
  opts: StrategyOptions;
  payload: Payload;
  serverClient: ServerClient;
  serverClientAuth: ServerClientAuth;
  slug: string;

  constructor(payload: Payload, slug: string, opts: StrategyOptions) {
    super();

    this.payload = payload;
    this.opts = opts;
    this.slug = slug;

    this.serverClient = createClient({
      secretKey: this.opts.secretKey,
    });

    this.serverClientAuth = createClientAuth(
      this.serverClient,
      this.opts.domain,
      this.opts.privateKey,
    );
  }

  static extractJWT(req: Request) {
    const cookie = new Cookies(req, null);
    return cookie.get(`jwt`);
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

      console.log(`thirdweb user`, data);

      return data;
    } catch (e) {
      this.payload.logger.error(e);
      return [];
    }
  }

  private login(user: User): void {
    user.collection = this.slug;
    user._strategy = `${this.slug}-${this.name}`;
    console.log(`user`, user);
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
    const authResult = await this.getJWTPayload(req);

    if (!authResult || !authResult?.sub) {
      this.fail();
      this.payload.logger.error(`Failed to authenticate user. JWT payload is missing or invalid.`);

      return;
    }

    this.signIn(authResult.sub);
  }

  createRandomPassword() {
    return this.payload.encrypt(crypto.randomUUID());
  }

  async getJWTPayload(req: Request) {
    const jwt = ThirdwebStrategy.extractJWT(req);
    if (!jwt) return null;

    const result = await this.verifyJWT({ jwt });
    if (!result?.sub) return null;

    return result;
  }

  async verifyJWT(params: VerifyJWTParams): Promise<JWTPayload> {
    const result = await this.serverClientAuth.verifyJWT(params);
    return result.valid
      ? {
          ...result.parsedJWT,
        }
      : null;
  }
}

export default ThirdwebStrategy;
