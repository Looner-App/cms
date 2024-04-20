import type { CollectionConfig } from 'payload/types';

import { admins, adminsOrPublished } from '../../access';
import { slug } from '../../fields';
import { populatePublishedDate } from '../../hooks';
import { populateAuthors, revalidatePost } from './hooks';

export const Blogs: CollectionConfig = {
  slug: `blogs`,
  admin: {
    useAsTitle: `title`,
    defaultColumns: [
      `title`,
      `slug`,
      `categories`,
      `authors`,
      `_status`,
      `createdAt`,
      `updatedAt`,
      `publishedDate`,
    ],
    preview: doc => {
      return `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/api/preview?url=${encodeURIComponent(
        `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/blogs/${doc?.slug}`,
      )}&secret=${process.env.PAYLOAD_PUBLIC_DRAFT_SECRET}`;
    },
  },
  hooks: {
    beforeChange: [populatePublishedDate],
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
  },
  versions: {
    drafts: true,
    maxPerDoc: 5,
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
      name: `categories`,
      type: `relationship`,
      relationTo: `categories`,
      hasMany: true,
      admin: {
        position: `sidebar`,
      },
    },
    {
      name: `publishedDate`,
      type: `date`,
      admin: {
        position: `sidebar`,
        date: {
          pickerAppearance: `dayAndTime`,
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === `published` && !value) {
              return new Date();
            }
            return value;
          },
        ],
      },
    },
    {
      name: `authors`,
      type: `relationship`,
      relationTo: `users`,
      hasMany: true,
      admin: {
        position: `sidebar`,
      },
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: `populatedAuthors`,
      type: `array`,
      admin: {
        readOnly: true,
        disabled: true,
      },
      access: {
        update: () => false,
      },
      fields: [
        {
          name: `id`,
          type: `text`,
        },
        {
          name: `name`,
          type: `text`,
        },
      ],
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
              blocks: [],
            },
          ],
        },
      ],
    },
    {
      name: `relatedPosts`,
      type: `relationship`,
      relationTo: `blogs`,
      hasMany: true,
      filterOptions: ({ id }) => {
        return {
          id: {
            not_in: [id],
          },
        };
      },
    },
  ],
};
