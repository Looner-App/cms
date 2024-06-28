import type { Config as PayloadConfig } from 'payload/config';

import { flow, merge, reduce } from 'lodash';

import type { Config as ThirdwebConfig } from './types';

import { collections } from './collections';

export const thirdweb = (thirdwebConfig: ThirdwebConfig) => {
  return flow(
    (payloadConfig: PayloadConfig) => merge({}, payloadConfig), /// shallow copy
    (payloadConfig: PayloadConfig) =>
      reduce(
        [`users`, `deployCollection`, `mintCollection`],
        (config, kind) => ({
          ...config,
          ...collections[kind]({
            payloadConfig: config,
            thirdwebConfig,
          }),
        }),
        payloadConfig,
      ),
    (payloadConfig: PayloadConfig) => {
      if (typeof window !== `undefined`) {
        if (!payloadConfig.admin?.components?.afterLogin) {
          payloadConfig.admin.components.afterLogin = [];
        }
        payloadConfig.admin.components.afterLogin = [
          ...payloadConfig.admin.components.afterLogin,
          require(`./config/components/Provider`).default,
        ];
      }
      return payloadConfig;
    },
  );
};
