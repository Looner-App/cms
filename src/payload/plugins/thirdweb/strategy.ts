import type { Payload } from 'payload';
import type { User } from 'payload/auth';

import type { ServerClientAuth } from './client';

import { ThirdwebStrategy } from './ThirdwebStrategy';
import { Role } from './utils/roles';
import { saltHashGenerator } from './utils/saltHashPassword';

export class AuthStrategy extends ThirdwebStrategy {
  ctx: Payload;
  slug: string;

  constructor(ctx: Payload, client: ServerClientAuth) {
    super(client);
    this.ctx = ctx;
    this.slug = `users`;
  }

  createPassword() {
    return this.ctx.encrypt(crypto.randomUUID());
  }

  async createUser(sub: string, role: Role): Promise<User> {
    const password = this.createPassword();

    const { salt, hash } = await saltHashGenerator({ password });

    const email = `${crypto.randomUUID()}@looner.io`;

    const newUser = await this.ctx.create({
      collection: `users`,
      data: {
        email,
        password,
        salt,
        hash,
        sub,
        roles: [role],
      },
    });

    return newUser as User;
  }

  async findUser(payload: Payload, sub: string): Promise<User | null> {
    const users = await payload.find({
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

  login(user: User): void {
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
