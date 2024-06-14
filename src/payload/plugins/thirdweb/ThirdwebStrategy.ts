import type { Request } from 'express';

import Cookies from 'cookies';

import { verifyJWT } from './endpoints';

export class ThirdwebStrategy {
  async authenticate(req: Request) {
    const cookie = new Cookies(req, null);
    const jwt = cookie.get(`jwt`);
    if (!jwt) return null;

    const result = await verifyJWT(jwt);

    if (!result?.valid) return null;
    if (!result.sub) return null;

    return result;
  }
}

export default ThirdwebStrategy;
