import type { Config } from 'payload/config';

import map from 'lodash/map';

import { fields } from '../fields';
import { hooks } from '../hooks';

export type MintCollection = {
  collections: Config['collections'];
};

export const mintCollection = ({ collections }: MintCollection): Config['collections'] => {
  return map(collections, collection => {
    if (collection.slug === `items`) {
      collection.fields = fields.mintCollection(collection.fields);

      collection.hooks = hooks.mintCollection({
        hooks: collection.hooks,
      });
    }

    return collection;
  });
};
