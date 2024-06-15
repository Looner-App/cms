import type { Request } from 'express';
import type { Payload } from 'payload';

import type { ServerClientAuth } from './client';

import { PayloadStrategy } from './strategy';
import { getJWTPayload } from './utility';

export class ThirdwebStrategy extends PayloadStrategy {
  serverClientAuth: ServerClientAuth;

  constructor(ctx: Payload, serverClientAuth: ServerClientAuth) {
    super(ctx);

    this.serverClientAuth = serverClientAuth;
  }

  async authenticate(req: Request) {
    const authResult = await getJWTPayload(req, this.serverClientAuth);

    if (!authResult) {
      this.fail();
      return;
    }

    this.signIn(authResult.sub);
  }
}

export default ThirdwebStrategy;
