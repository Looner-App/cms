import type { Request } from 'express';
import type { Payload } from 'payload';
import type { User } from 'payload/auth';

import { Strategy } from 'passport';

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
      return users.docs[0] as User;
    }

    return null;
  }

  private login(user: User): void {
    user.collection = this.slug;
    user._strategy = `${this.slug}-${this.name}`;
    this.success(user);
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
