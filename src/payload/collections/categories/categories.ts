import type { CollectionConfig } from 'payload/types';

import { admins, anyone } from '../../access';
import { slug } from '../../fields';

export const Categories: CollectionConfig = {
  slug: `categories`,
  admin: {
    useAsTitle: `title`,
    defaultColumns: [`title`, `shortTitle`, `createdAt`, `updatedAt`],
  },
  access: {
    read: anyone,
    update: admins,
    create: admins,
    delete: admins,
  },
  fields: [
    slug(),
    {
      type: `row`,
      fields: [
        {
          name: `title`,
          type: `text`,
          required: true,
        },
        {
          name: `shortTitle`,
          type: `text`,
        },
      ],
    },
  ],
};
