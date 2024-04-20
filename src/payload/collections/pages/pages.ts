import type { CollectionConfig } from 'payload/types';

import { admins, adminsOrPublished } from '../../access';
import { introContent, mapItems } from '../../blocks';
import { slug } from '../../fields';
import { populatePublishedDate } from '../../hooks/populate-published-date';
import { homepageResolver, revalidatePage } from './hooks';

export const Pages: CollectionConfig = {
  slug: `pages`,
  admin: {
    useAsTitle: `title`,
    defaultColumns: [`title`, `slug`, `_status`, `createdAt`, `updatedAt`, `publishedDate`],
    // preview: doc => {
    //   return `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/api/preview?url=${encodeURIComponent(
    //     `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/${doc.slug !== `home` ? doc.slug : ``}`,
    //   )}&secret=${process.env.PAYLOAD_PUBLIC_DRAFT_SECRET}`;
    // },
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
              blocks: [
                // textContent, // TODO: orine hide @henrytrianta
                introContent,
                mapItems,
              ],
            },
          ],
        },
      ],
    },
  ],
};
