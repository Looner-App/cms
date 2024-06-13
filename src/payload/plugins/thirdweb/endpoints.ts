import type { Response } from 'express';
import type { PayloadRequest } from 'payload/types';
import type { VerifyLoginPayloadParams } from 'thirdweb/auth';

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

/// authenticate payload
export const auth = async (req: PayloadRequest, res: Response) => {
  const payload: VerifyLoginPayloadParams = await req.body;
  const verifiedPayload = await serverClientAuth.verifyPayload(payload);
  const cookies = new Cookies(req, res);

  if (verifiedPayload.valid) {
    const jwt = await serverClientAuth.generateJWT({
      payload: verifiedPayload.payload,
    });

    cookies.set(`jwt`, jwt);

    return res.json({ token: jwt });
  }

  return res.send(401);
};

/// generate payload
export const login = async (req: PayloadRequest, res: Response) => {
  const generatedPayload = await serverClientAuth.generatePayload({
    address: req.query.address as string,
  });

  return res.json(generatedPayload);
};

/// account details
export const account = async (req: PayloadRequest, res: Response) => {
  const cookies = new Cookies(req, res);

  const jwt = cookies.get(`jwt`);

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
