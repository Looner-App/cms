import type { Config } from 'payload/config';

import { flow, merge, reduce } from 'lodash';

import { collections } from './collections';
import { globals } from './globals';

export const owlProtocol = () => {
  return flow(
    (incomingConfig: Config) => merge({}, incomingConfig), // Make a shallow copy of incomingConfig
    (config: Config) =>
      reduce(
        [`mintCollection`, `users`, `deployCollection`],
        (acc, method) => ({
          ...acc,
          collections: collections[method]({ collections: acc.collections }),
        }),
        config,
      ),
    (config: Config) => ({ ...config, globals: globals.settings({ globals: config.globals }) }),
  );
};

/// todo: https://docs-api.owlprotocol.xyz/docs/getting-started#typescript-api
