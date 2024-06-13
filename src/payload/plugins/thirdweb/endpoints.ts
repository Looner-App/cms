import type { PayloadRequest } from 'payload/types';
import type { VerifyLoginPayloadParams } from 'thirdweb/auth';

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
export const auth = async (req: PayloadRequest) => {
  const payload: VerifyLoginPayloadParams = await req.body;
  const verifiedPayload = await serverClientAuth.verifyPayload(payload);

  if (verifiedPayload.valid) {
    const jwt = await serverClientAuth.generateJWT({
      payload: verifiedPayload.payload,
    });

    req.cookies().set(`jwt`, jwt);

    return Response.json({ token: jwt });
  }

  return Response.error();
};

/// generate payload
export const login = async (req: PayloadRequest) => {
  const generatedPayload = await serverClientAuth.generatePayload({
    address: req.query.address as string,
  });

  return Response.json(generatedPayload);
};

/// account details
export const account = async (req: PayloadRequest) => {
  const jwt = req.cookies().get(`jwt`);

  if (!jwt?.value) {
    return Response.json({ isLoggedIn: false });
  }

  const authResult = await verifyJWT(jwt.value);

  return Response.json({ isLoggedIn: authResult?.valid ?? false });
};

/// logout
export const logout = async (req: PayloadRequest) => {
  req.cookies().delete(`jwt`);
  req.user = null;
  return Response.json({ success: true });
};
