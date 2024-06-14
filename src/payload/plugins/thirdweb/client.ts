import type { CreateThirdwebClientOptions } from 'thirdweb';

import { createThirdwebClient } from 'thirdweb';
import { createAuth } from 'thirdweb/auth';
import { privateKeyToAccount } from 'thirdweb/wallets';

export const createClient = (args: CreateThirdwebClientOptions) => {
  return createThirdwebClient(args);
};

export const serverClient = createClient({
  secretKey: `KCoWk3WxgLYZCvyGGaRW21B-ryMkTFXXnHJiQDB5Tfzy03mUdrs3IBHRcM_1yUMXJzT2gpGbynX3RpVNgobSMQ`,
});

export const serverClientAuth = createAuth({
  domain: `http://localhost:3000`,
  client: serverClient,
  adminAccount: privateKeyToAccount({
    client: serverClient,
    privateKey: `ede99aed9ee38e15d48acf771b299a6f8e98e3bd5864c9c24fcf0dfd3b8bb8dd`,
  }),
});
