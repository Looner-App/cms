import type { Payload } from 'payload';
import type { User } from 'payload/auth';

import { Strategy } from 'passport';

import { Role } from './roles';
import { createRandomPassword } from './utility';

export class PayloadStrategy extends Strategy {
  ctx: Payload;
  slug: string;

  constructor(ctx: Payload) {
    super();
    this.ctx = ctx;
    this.slug = `users`;
  }

  private async createUser(sub: string, role: Role): Promise<User> {
    const password = createRandomPassword(this.ctx);
    ///todo: check if necessary
    // const { salt, hash } = await saltHashGenerator({ password });

    const email = `${crypto.randomUUID()}@looner.io`;
    const newUser = await this.ctx.create({
      ///todo: check if necessary

      showHiddenFields: true,
      collection: `users`,
      data: {
        name: `Looner`,
        email,
        password,
        ///todo: check if necessary

        // salt,
        // hash,
        sub,
        roles: [role],
      },
    });

    return newUser as User;
  }

  private async findUser(payload: Payload, sub: string): Promise<User | null> {
    const users = await payload.find({
      collection: `users`,
      ///todo: check if necessary

      showHiddenFields: true,
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

  async signIn(sub?: string): Promise<void> {
    try {
      if (!sub) {
        this.fail();
        return;
      }

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
