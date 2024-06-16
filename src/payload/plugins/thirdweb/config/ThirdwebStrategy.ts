import type { Request } from 'express';
import type { Payload } from 'payload';
import type { User } from 'payload/auth';

import merge from 'lodash/merge';
import { Strategy } from 'passport';

import type { ThirdwebUser } from '../types';
import type { ServerClientAuth } from './client';

import { Role } from './roles';
import { createRandomPassword } from './utility';
import { getJWTPayload } from './utility';

export class ThirdwebStrategy extends Strategy {
  ctx: Payload;
  serverClientAuth: ServerClientAuth;
  slug = `users`;

  constructor(ctx: Payload, serverClientAuth: ServerClientAuth) {
    super();
    this.ctx = ctx;
    this.serverClientAuth = serverClientAuth;
  }

  private async createUser(sub: string, role: Role): Promise<User> {
    const password = createRandomPassword(this.ctx);
    const email = `${crypto.randomUUID()}@looner.io`;

    const newUser = await this.ctx.create({
      showHiddenFields: true,
      collection: `users`,
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

  private async findThirdwebUser(sub: string): Promise<ThirdwebUser[]> {
    if (!sub) return [];

    const url = new URL(
      `https://embedded-wallet.thirdweb.com/api/2023-11-30/embedded-wallet/user-details`,
    );
    if (sub) {
      url.searchParams.set(`queryBy`, `walletAddress`);
      url.searchParams.set(`walletAddress`, sub);
    }

    const resp = await fetch(url.href, {
      headers: {
        Authorization: `Bearer ${`KCoWk3WxgLYZCvyGGaRW21B-ryMkTFXXnHJiQDB5Tfzy03mUdrs3IBHRcM_1yUMXJzT2gpGbynX3RpVNgobSMQ`}`,
      },
    });

    const data = await resp.json();

    return data;
  }

  private async findUser(payload: Payload, sub: string): Promise<User | null> {
    const users = await payload.find({
      showHiddenFields: true,
      collection: `users`,
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

  private login(user: User): void {
    user.collection = this.slug;
    user._strategy = `${this.slug}-${this.name}`;
    this.success(user);
  }

  private async mergeUser(user: User, thirdwebUser: ThirdwebUser): Promise<User> {
    const updatedUser = await this.ctx.update({
      collection: this.slug,
      id: user.id,
      data: merge(user, {
        createdAt: thirdwebUser.createdAt,
        email: thirdwebUser.email,
      }),
    });

    return updatedUser as User;
  }

  async authenticate(req: Request) {
    const authResult = await getJWTPayload(req, this.serverClientAuth);

    if (!authResult) {
      this.fail();
      return;
    }

    this.signIn(authResult.sub);
  }

  async signIn(sub: string): Promise<void> {
    try {
      const user = await this.findUser(this.ctx, sub);

      if (!user) {
        const newUser = await this.createUser(sub, Role.User);
        this.login(newUser);
        return;
      }

      return this.login(user);
    } catch (e) {
      this.fail();
    }
  }
}

export default ThirdwebStrategy;
