import type { Request } from 'express';
import type { VerifyJWTParams } from 'thirdweb/dist/types/auth/core/verify-jwt';
import type { JWTPayload } from 'thirdweb/dist/types/utils/jwt/types';

import Cookies from 'cookies';
import { Strategy } from 'passport';

import type { ServerClientAuth } from './client';

export abstract class ThirdwebStrategy extends Strategy {
  name = `thirdweb`;
  serverClientAuth: ServerClientAuth;

  constructor(serverClientAuth: ServerClientAuth) {
    super();
    this.serverClientAuth = serverClientAuth;
  }

  static extractJWT(req: Request) {
    const cookie = new Cookies(req, null);
    return cookie.get(`jwt`);
  }

  static async verifyJWT(
    serverClientAuth: ServerClientAuth,
    params: VerifyJWTParams,
  ): Promise<JWTPayload> {
    const result = await serverClientAuth.verifyJWT(params);
    return result.valid
      ? {
          ...result.parsedJWT,
        }
      : null;
  }

  private async getJWTPayload(req: Request) {
    const jwt = ThirdwebStrategy.extractJWT(req);
    if (!jwt) return null;

    const result = await ThirdwebStrategy.verifyJWT(this.serverClientAuth, { jwt });
    if (!result.sub) return null;

    return result;
  }

  async authenticate(req: Request) {
    const authResult = await this.getJWTPayload(req);

    if (!authResult) {
      this.fail();
      return;
    }

    this.signIn(authResult.sub);
  }

  abstract signIn(sub: string): Promise<void>;
}

export default ThirdwebStrategy;
