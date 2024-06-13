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
    privateKey: process.env.PAYLOAD_SECRET,
  }),
});
