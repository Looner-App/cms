import type { Endpoint, Config as PayloadConfig } from 'payload/config';
import type { CollectionConfig } from 'payload/types';

import { isEmpty } from 'lodash';
import map from 'lodash/map';
import payload from 'payload';

import ThirdwebStrategy from '../config/ThirdwebStrategy';
import { isServer } from '../config/client';
import { endpoints as userEndpoints } from '../endpoints/users';
import { fields } from '../fields/users';
import { strategies as userStrategies } from '../strategies/users';
import { StrategyContext, type Config as ThirdwebConfig } from '../types';

export type CollectionsParams = {
  payloadConfig: PayloadConfig;
  thirdwebConfig: ThirdwebConfig;
};

export const collections = ({
  payloadConfig,
  thirdwebConfig,
}: CollectionsParams): PayloadConfig => {
  payloadConfig.collections = map(payloadConfig.collections, (collection: CollectionConfig) => {
    if (collection.slug === `users`) {
      if (isServer) {
        /**
         * Authentication injection
         *
         * inject the thrdweb strategy and endpoints
         */

        if (typeof collection.auth === `boolean`) {
          throw new Error(
            `Collection ${collection.slug} set as boolean for auth, must be an object or empty to enable strategies injection`,
          );
        }

        if (isEmpty(collection.auth)) {
          collection.auth = {
            strategies: [],
          };
        }

        const strategy = new ThirdwebStrategy(payload, `users`, thirdwebConfig.strategyOptions);

        if (isEmpty(collection.auth.strategies)) {
          collection.auth.strategies = [];
        }

        collection.auth.strategies = userStrategies({
          strategies: collection.auth.strategies,
          strategy,
        });

        collection.endpoints = userEndpoints({
          endpoints: collection.endpoints as Endpoint[],
          context: StrategyContext.Client,
          strategy,
        });
      }

      collection.fields = fields({
        fields: collection.fields,
      });
    }

    return collection;
  });

  return payloadConfig;
};
