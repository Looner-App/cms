import type { Endpoint, Config as PayloadConfig } from 'payload/config';
import type { CollectionConfig } from 'payload/types';

import { isEmpty } from 'lodash';
import map from 'lodash/map';
import payload from 'payload';

import type { Config as ThirdwebConfig } from '../types';

import ThirdwebStrategy from '../config/ThirdwebStrategy';
import { isServer } from '../config/client';
import { Provider } from '../config/components/Provider';
import SignInButton from '../config/components/SignInButton';
import { endpoints } from '../endpoints/users';
import { fields } from '../fields/users';
import { strategies } from '../strategies/users';

export type CollectiosParams = {
  payloadConfig: PayloadConfig;
  thirdwebConfig: ThirdwebConfig;
};

export const collections = ({ payloadConfig, thirdwebConfig }: CollectiosParams): PayloadConfig => {
  payloadConfig.collections = map(payloadConfig.collections, (collection: CollectionConfig) => {
    if (collection.slug === `users`) {
      /**
       * Authentication injection
       *
       * inject the thrdweb strategy and endpoints
       */
      if (isServer) {
        const strategy = new ThirdwebStrategy(payload, `users`, thirdwebConfig.strategyOptions);

        if (typeof collection.auth === `boolean`) {
          throw new Error(
            `Collection ${collection.slug} set as boolean for auth, must be an object or empty to enable strategies injection`,
          );
        }

        if (isEmpty(collection.auth)) {
          collection.auth = {};
        }

        collection.auth.strategies = strategies({
          strategies: collection.auth.strategies,
          strategy,
        });

        collection.endpoints = endpoints({
          endpoints: collection.endpoints as Endpoint[],
          strategy,
        });

        collection.fields = fields({
          fields: collection.fields,
        });
      } else {
        /**
         * Client side
         *
         * Inject components
         */

        payloadConfig.admin = {
          ...payloadConfig.admin,
          components: {
            ...payloadConfig.admin.components,
            providers: [...payloadConfig.admin.components.providers, Provider],
            afterLogin: [...payloadConfig.admin.components.afterLogin, SignInButton],
          },
        };
      }
    }

    return collection;
  });

  return payloadConfig;
};
