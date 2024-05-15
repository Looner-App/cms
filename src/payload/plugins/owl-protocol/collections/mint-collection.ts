import type { Config } from 'payload/config';

import map from 'lodash/map';

import { anyone } from '../../../access';
import { fields } from '../fields';
import { hooks } from '../hooks';
import { MintsContext } from '../types';

export type MintCollection = {
  collections: Config['collections'];
};

export const mintCollection = ({ collections }: MintCollection): Config['collections'] => {
  const collectionsWithMints = [
    ...collections,
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
        group: `Owl protocol`,
        defaultColumns: [`title`, `tokenId`, `user.name`, `category.name`],
      },
      access: {
        read: anyone,
        update: () => false,
        create: () => false,
        delete: () => false,
      },
      fields: fields.mintCollection([], MintsContext.Mints),
    },
  ];

  return map(collectionsWithMints, collection => {
    if (collection.slug === `items`) {
      collection.fields = fields.mintCollection(collection.fields, MintsContext.Items);

      collection.hooks = hooks.mintCollection({
        hooks: collection.hooks,
        context: MintsContext.Items,
      });
    }

    return collection;
  });
};
