import type { Config as PayloadConfig } from 'payload/config';

import map from 'lodash/map';

import type { Config as ThirdwebConfig } from '../types';

import { anyone } from '../../../access';
import { fields } from '../fields';
import { hooks } from '../hooks';
import { MintsContext } from '../types';

export type CollectionsParams = {
  payloadConfig: PayloadConfig;
  thirdwebConfig: ThirdwebConfig;
};

export const collections = ({ payloadConfig }: CollectionsParams): PayloadConfig => {
  const collectionsWithMints = [
    ...payloadConfig.collections,
    {
      slug: `mints`,
      labels: {
        singular: `Mint`,
        plural: `Mints`,
      },
      typescript: {
        interface: `Mint`,
      },
      admin: {
        useAsTitle: `title`,
        group: `Thirdweb`,
        defaultColumns: [`title`, `tokenId`, `user.name`, `category.name`],
      },
      access: {
        read: anyone,
        update: () => false,
        create: () => false,
        delete: () => false,
      },
      fields: fields.mintCollection({
        fields: [],
        context: MintsContext.Mints,
      }),
    },
  ];

  payloadConfig.collections = map(collectionsWithMints, collection => {
    if (collection.slug === `items`) {
      collection.fields = fields.mintCollection({
        fields: collection.fields,
        context: MintsContext.Items,
      });

      collection.hooks = hooks.mintCollection({
        hooks: collection.hooks,
        context: MintsContext.Items,
      });
    }

    return collection;
  });

  return payloadConfig;
};
