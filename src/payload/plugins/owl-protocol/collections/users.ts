import type { Config } from 'payload/config';

import map from 'lodash/map';

import { fields } from '../fields';
import { hooks } from '../hooks';

export type Users = {
  collections: Config['collections'];
};

export const users = ({ collections }: Users): Config['collections'] => {
  return map(collections, collection => {
    if (collection.slug === `users`) {
      collection.fields = fields.users(collection.fields);

      collection.hooks = hooks.users({
        hooks: collection.hooks,
      });
    }

    return collection;
  });
};
