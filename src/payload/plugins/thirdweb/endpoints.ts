import type { Response } from 'express';
import type { PayloadRequest } from 'payload/types';

import ThirdwebStrategy from './ThirdwebStrategy';
import { serverClientAuth } from './client';

export const login = async (req: PayloadRequest, res: Response) => {
  const payload = await serverClientAuth.generatePayload({
    address: `${req.query.address}`,
  });

  return res.send(payload);
};

export const auth = async (req: PayloadRequest, res: Response) => {
  const verifiedPayloadResult = await serverClientAuth.verifyPayload(req.body);

  if (verifiedPayloadResult.valid) {
    const jwt = await serverClientAuth.generateJWT({
      payload: verifiedPayloadResult.payload,
    });

    return res.send({ token: jwt });
  }

  return res.sendStatus(401);
};

export const account = async (req: PayloadRequest, res: Response) => {
  const jwt = ThirdwebStrategy.extractJWT(req);
  if (!jwt) {
    return res.sendStatus(401);
  }

  const authResult = await ThirdwebStrategy.verifyJWT(serverClientAuth, { jwt });
  if (!authResult) {
    return res.sendStatus(401);
  }

  return res.send({ isLoggedIn: true });
};
