import type { Request } from 'express';
import type { Payload } from 'payload';
import type { User } from 'payload/auth';

import { Strategy } from 'passport';

import { ThirdwebStrategy } from './ThirdwebStrategy';
import { Role } from './utils/roles';
import { saltHashGenerator } from './utils/saltHashPassword';

class StrategyProxy extends Strategy {
  ctx: Payload;
  name = `thirdweb-strategy`;
  proxiedStrategy: ThirdwebStrategy;
  slug: string;

  constructor(ctx: Payload, strategy: ThirdwebStrategy) {
    super();
    this.ctx = ctx;
    this.proxiedStrategy = strategy;
    this.slug = `users`;
  }

  async authenticate(req: Request): Promise<void> {
    // if (req.user) {
    //   this.successCallback(req.user);
    //   return;
    // }

    try {
      const authResult = await this.proxiedStrategy.authenticate(req.cookies);
      console.log(authResult);

      if (!authResult?.valid || !authResult?.sub) {
        this.fail();
        return;
      }

      const user = await this.findUser(this.ctx, authResult.sub);

      if (!user) {
        const newUser = await this.createUser(authResult.sub, Role.User);
        this.successCallback(newUser);
        return;
      }

      return this.successCallback(user);
    } catch {
      this.fail();
    }
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

  successCallback(user: User): void {
    user.collection = this.slug;
    user._strategy = `${this.slug}-${this.name}`;
    this.success(user);
  }
}

export const strategy = (ctx: Payload) => {
  const thirdwebStrategy = new ThirdwebStrategy();

  return new StrategyProxy(ctx, thirdwebStrategy);
};

export default strategy;
