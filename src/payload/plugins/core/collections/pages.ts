import type { Config } from 'payload/config';

import map from 'lodash/map';

import { fields } from '../fields';
import { PagesContext } from '../fields/pages';

export type Pages = {
  collections: Config['collections'];
};

export const pages = ({ collections }: Pages): Config['collections'] => {
  return map(collections, collection => {
    if (collection.slug === `pages`) {
      collection.fields = fields.pages({
        fields: collection.fields,
        context: PagesContext.Pages,
      });
    }

    return collection;
  });
};
