import type { Config } from 'payload/config';

import { flow, merge, reduce } from 'lodash';

import { collections } from './collections';
import { globals } from './globals';

export const core = () => {
  return flow(
    (incomingConfig: Config) => merge({}, incomingConfig), // Make a shallow copy of incomingConfig
    (config: Config) => {
      return reduce(
        [`rewardsProgram`, `referral`],
        (acc, method) => ({
          ...acc,
          collections: collections[method]({ collections: acc.collections }),
        }),
        config,
      );
    },
    (config: Config) => {
      return {
        ...config,
        globals: globals.settings({ globals: config.globals }),
      };
    },
  );
};
