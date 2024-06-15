import type { Request } from 'express';
import type { Payload } from 'payload';
import type { VerifyJWTParams } from 'thirdweb/dist/types/auth/core/verify-jwt';
import type { JWTPayload } from 'thirdweb/dist/types/utils/jwt/types';

import Cookies from 'cookies';
import crypto from 'crypto';

import type { ServerClientAuth } from './client';

export const extractJWT = (req: Request) => {
  const cookie = new Cookies(req, null);
  return cookie.get(`jwt`);
};

export const verifyJWT = async (
  serverClientAuth: ServerClientAuth,
  params: VerifyJWTParams,
): Promise<JWTPayload> => {
  const result = await serverClientAuth.verifyJWT(params);
  return result.valid
    ? {
        ...result.parsedJWT,
      }
    : null;
};

export const getJWTPayload = async (req: Request, serverClientAuth: ServerClientAuth) => {
  const jwt = extractJWT(req);
  if (!jwt) return null;

  const result = await verifyJWT(serverClientAuth, { jwt });
  if (!result.sub) return null;

  return result;
};

export const createRandomPassword = (payload: Payload) => {
  return payload.encrypt(crypto.randomUUID());
};

type Args = {
  password: string;
};

function randomBytes(): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    crypto.randomBytes(32, (err, saltBuffer) => (err ? reject(err) : resolve(saltBuffer))),
  );
}

function pbkdf2Promisified(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    crypto.pbkdf2(password, salt, 25000, 512, `sha256`, (err, hashRaw) =>
      err ? reject(err) : resolve(hashRaw),
    ),
  );
}

export const saltHashGenerator = async ({
  password,
}: Args): Promise<{ hash: string; salt: string }> => {
  const saltBuffer = await randomBytes();
  const salt = saltBuffer.toString(`hex`);

  const hashRaw = await pbkdf2Promisified(password, salt);
  const hash = hashRaw.toString(`hex`);

  return { hash, salt };
};
