import type { Config as PayloadConfig } from 'payload/config';

import { flow, merge, reduce } from 'lodash';

import type { Config as ThirdwebConfig } from './types';

import { collections } from './collections';
// import { Provider } from './config/components/Provider';
// import SignInButton from './config/components/SignInButton';

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
      payloadConfig.admin = {
        ...payloadConfig.admin,
        components: {
          ...payloadConfig.admin.components,
          /// todo:
          // providers: [...payloadConfig.admin.components.providers, Provider],
          // afterLogin: [...payloadConfig.admin.components.afterLogin, SignInButton],
        },
      };

      return payloadConfig;
    },
  );
};
