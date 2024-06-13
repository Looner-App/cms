import type { Response } from 'express';
import type { PayloadRequest } from 'payload/types';

import Cookies from 'cookies';

import { serverClientAuth } from './client';

export const verifyJWT = async (jwt: string) => {
  const result = await serverClientAuth.verifyJWT({ jwt });
  return result.valid
    ? {
        valid: true,
        ...result.parsedJWT,
      }
    : null;
};

/// generate payload
export const login = async (req: PayloadRequest, res: Response) => {
  const generatedPayload = await serverClientAuth.generatePayload({
    address: req.query.address as string,
  });

  return res.json(generatedPayload);
};

/// authenticate payload
export const auth = async (req: PayloadRequest, res: Response) => {
  const verifiedPayload = await serverClientAuth.verifyPayload(req.body);
  const cookies = new Cookies(req, res);

  if (verifiedPayload.valid) {
    const jwt = await serverClientAuth.generateJWT({
      payload: verifiedPayload.payload,
    });

    cookies.set(`jwt`, jwt, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    return res.json({ token: jwt });
  }

  return res.send(401);
};

/// account details
export const account = async (req: PayloadRequest, res: Response) => {
  const cookies = new Cookies(req, res);

  const jwt = cookies.get(`jwt`);

  console.log(`jwt`, jwt);

  if (!jwt) {
    return res.json({ isLoggedIn: false });
  }

  const authResult = await verifyJWT(jwt);

  return res.json({ isLoggedIn: authResult?.valid ?? false });
};

/// logout
export const logout = async (req: PayloadRequest, res: Response) => {
  const cookies = new Cookies(req, res);

  cookies.set(`jwt`, ``);

  return res.json({ success: true });
};
