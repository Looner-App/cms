import type { Endpoint, Config as PayloadConfig } from 'payload/config';
import type { CollectionConfig } from 'payload/types';

import { isEmpty } from 'lodash';
import map from 'lodash/map';
import payload from 'payload';

import type { Config as ThirdwebConfig } from '../types';

import ThirdwebStrategy from '../config/ThirdwebStrategy';
import { isServer } from '../config/client';
import { endpoints } from '../endpoints/users';
import { fields } from '../fields/users';
import { strategies } from '../strategies/users';

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
      }

      collection.fields = fields({
        fields: collection.fields,
      });
    }

    return collection;
  });

  return payloadConfig;
};
