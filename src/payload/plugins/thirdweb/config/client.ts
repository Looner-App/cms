import type { CreateThirdwebClientOptions } from 'thirdweb';

import { createThirdwebClient } from 'thirdweb';
import { createAuth } from 'thirdweb/auth';
import { privateKeyToAccount } from 'thirdweb/wallets';

export type ServerClientAuth = ReturnType<typeof createAuth>;
export type ServerClient = ReturnType<typeof createThirdwebClient>;

export const createClient = (args: CreateThirdwebClientOptions): ServerClient => {
  return createThirdwebClient(args);
};

export const isServer = typeof window === `undefined`;

export const createClientAuth = (
  client: ServerClient,
  domain: string,
  privateKey: string,
): ServerClientAuth => {
  return createAuth({
    domain,
    client,
    adminAccount: privateKeyToAccount({
      client,
      privateKey,
    }),
  });
};
