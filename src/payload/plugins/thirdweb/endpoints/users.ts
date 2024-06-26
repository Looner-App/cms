import type { Response } from 'express';
import type { Endpoint, Config as PayloadConfig } from 'payload/config';
import type { PayloadRequest } from 'payload/types';

import { ThirdwebStrategy } from '../config/ThirdwebStrategy';

export type EndpointParams = {
  endpoints: PayloadConfig['endpoints'];
  strategy: ThirdwebStrategy;
};

export const endpoints = ({ endpoints = [], strategy }: EndpointParams): Endpoint[] => {
  return [
    ...endpoints,
    {
      path: `/auth`,
      method: `get`,
      handler: async (req: PayloadRequest, res: Response) => {
        const payload = await strategy.serverClientAuth.generatePayload({
          address: `${req.query.address}`,
        });

        return res.send(payload);
      },
    },
    {
      path: `/auth`,
      method: `post`,
      handler: async (req: PayloadRequest, res: Response) => {
        const verifiedPayloadResult = await strategy.serverClientAuth.verifyPayload(req.body);

        if (verifiedPayloadResult.valid) {
          const jwt = await strategy.serverClientAuth.generateJWT({
            payload: verifiedPayloadResult.payload,
          });

          return res.send({ token: jwt });
        }

        return res.sendStatus(401);
      },
    },
    {
      path: `/auth/account`,
      method: `get`,
      handler: async (req: PayloadRequest, res: Response) => {
        const jwt = ThirdwebStrategy.extractJWT(req);

        if (!jwt) {
          return res.sendStatus(401);
        }

        const authResult = await strategy.verifyJWT({
          jwt,
        });

        if (!authResult) {
          return res.sendStatus(401);
        }

        return res.send({ isLoggedIn: true });
      },
    },
  ];
};
