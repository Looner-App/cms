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
      /// @dev it will apply the field for ask if it should deploy the collection
      collection.fields = fields.users(collection.fields);

      collection.hooks = {
        ...collection.hooks,
        afterOperation: [...(collection.hooks?.afterOperation || []), hooks.createUser],
      };
    }

    return collection;
  });
};
