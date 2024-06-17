import type { CreateThirdwebClientOptions } from 'thirdweb';

import { createThirdwebClient } from 'thirdweb';
import { createAuth } from 'thirdweb/auth';
import { privateKeyToAccount } from 'thirdweb/wallets';

export const createClient = (args: CreateThirdwebClientOptions) => {
  return createThirdwebClient(args);
};

export const isServer = typeof window === `undefined`;

export const createClientAuth = (client: ServerClient, domain: string, privateKey: string) => {
  return createAuth({
    domain,
    client,
    adminAccount: privateKeyToAccount({
      client,
      privateKey,
    }),
  });
};

export type ServerClientAuth = ReturnType<typeof createAuth>;
export type ServerClient = ReturnType<typeof createClient>;
