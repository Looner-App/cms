import type { CollectionConfig } from 'payload/types';

import { admins, adminsOrPublished } from '../../access';
import { cards, introContent, leaderboard, mapItems } from '../../blocks';
import { roadmap } from '../../blocks/roadmap';
import { slug } from '../../fields';
import { populatePublishedDate } from '../../hooks/populate-published-date';
import { homepageResolver, revalidatePage } from './hooks';

export const Pages: CollectionConfig = {
  slug: `pages`,
  admin: {
    useAsTitle: `title`,
    defaultColumns: [`title`, `slug`, `_status`, `createdAt`, `updatedAt`, `publishedDate`],
  },
  hooks: {
    beforeChange: [populatePublishedDate],
    afterChange: [revalidatePage],
    afterRead: [homepageResolver],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: adminsOrPublished,
    update: admins,
    create: admins,
    delete: admins,
  },
  fields: [
    slug(),
    {
      name: `title`,
      type: `text`,
      required: true,
      localized: true,
    },
    {
      name: `publishedDate`,
      type: `date`,
      admin: {
        position: `sidebar`,
      },
    },
    {
      type: `tabs`,
      tabs: [
        {
          label: `Content`,
          fields: [
            {
              name: `layout`,
              type: `blocks`,
              /// todo: move this to core plugin
              blocks: [introContent, mapItems, cards, roadmap, leaderboard],
            },
          ],
        },
      ],
    },
  ],
};
