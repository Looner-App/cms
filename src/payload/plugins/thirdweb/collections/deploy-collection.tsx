import type { Config as PayloadConfig } from 'payload/config';

import map from 'lodash/map';

import type { Config as ThirdwebConfig } from '../types';

/// @todo: move to core
import { admins, anyone } from '../../../access';
import { fields } from '../fields';
import { hooks } from '../hooks';
import { DeployCollectionContext } from '../types';

export type CollectionsParams = {
  payloadConfig: PayloadConfig;
  thirdwebConfig: ThirdwebConfig;
};

export const collections = ({ payloadConfig }: CollectionsParams): PayloadConfig => {
  const collectionsWitDeployCollection = [
    ...payloadConfig.collections,
    {
      slug: `deploy-collection`,
      admin: {
        useAsTitle: `title`,
        defaultColumns: [`title`, `createdAt`, `updatedAt`],
        group: `Thirdweb`,
      },
      access: {
        read: anyone,
        update: admins,
        create: admins,
        delete: admins,
      },
      fields: fields.deployCollection({
        fields: [],
        context: DeployCollectionContext.DeployCollection,
      }),
      hooks: hooks.deployCollection({
        hooks: {},
        context: DeployCollectionContext.DeployCollection,
      }),
    },
  ];

  payloadConfig.collections = map(collectionsWitDeployCollection, collection => {
    if (collection.slug === `categories`) {
      collection.fields = fields.deployCollection({
        fields: collection.fields,
        context: DeployCollectionContext.Categories,
      });
    }

    return collection;
  });

  return payloadConfig;
};
