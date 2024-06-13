import type { Request } from 'express';

import { verifyJWT } from './endpoints';

export class ThirdwebStrategy {
  async authenticate(req: Request) {
    const jwt = req.cookies?.get(`jwt`);
    if (!jwt) return null;

    const result = await verifyJWT(jwt);

    if (!result?.valid) return null;
    if (!result.sub) return null;

    return result;
  }
}

export default ThirdwebStrategy;
