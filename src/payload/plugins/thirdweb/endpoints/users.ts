import type { Response } from 'express';
import type { Endpoint, Config as PayloadConfig } from 'payload/config';
import type { PayloadRequest } from 'payload/types';

import { ThirdwebStrategy } from '../config/ThirdwebStrategy';
import { StrategyContext } from '../types';

export type EndpointParams = {
  context: StrategyContext;
  endpoints: PayloadConfig['endpoints'];
  strategy: ThirdwebStrategy;
};

export const endpoints = ({ endpoints = [], strategy, context }: EndpointParams): Endpoint[] => {
  if (context === StrategyContext.Admin) {
    return [
      ...endpoints,
      {
        path: `/auth_admin`,
        method: `get`,
        handler: async (req: PayloadRequest, res: Response) => {
          const payload = await strategy.serverClientAuth.generatePayload({
            address: `${req.query.address}`,
          });

          return res.send(payload);
        },
      },
      {
        path: `/auth_admin`,
        method: `post`,
        handler: async (req: PayloadRequest, res: Response) => {
          const verifiedPayloadResult = await strategy.serverClientAuth.verifyPayload(req.body);

          if (verifiedPayloadResult.valid) {
            const jwt = await strategy.serverClientAuth.generateJWT({
              payload: verifiedPayloadResult.payload,
            });

            res.cookie(strategy.key, jwt, {
              httpOnly: true,
              secure: process.env.NODE_ENV === `production`,
            });

            return res.send({ token: jwt });
          }

          return res.send({
            token: null,
          });
        },
      },
      {
        path: `/auth_admin/account`,
        method: `get`,
        handler: async (req: PayloadRequest, res: Response) => {
          const jwt = ThirdwebStrategy.extractJWT(req, strategy.key);

          if (!jwt) {
            return res.json({ isLoggedIn: false });
          }

          const authResult = await strategy.verifyJWT({
            jwt,
          });

          if (!authResult) {
            return res.json({ isLoggedIn: false });
          }

          return res.send({ isLoggedIn: true });
        },
      },
    ];
  }

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

        return res.send({ token: null });
      },
    },
    {
      path: `/auth/account`,
      method: `get`,
      handler: async (req: PayloadRequest, res: Response) => {
        const jwt = ThirdwebStrategy.extractJWT(req, strategy.key);

        if (!jwt) {
          return res.send({ isLoggedIn: false });
        }

        const authResult = await strategy.verifyJWT({
          jwt,
        });

        if (!authResult) {
          return res.send({ isLoggedIn: false });
        }

        return res.send({ isLoggedIn: true });
      },
    },
  ];
};
