import type { GlobalConfig } from 'payload/types';

import { admins } from '../../access/admins';

export const Settings: GlobalConfig = {
  slug: `settings`,
  typescript: {
    interface: `Settings`,
  },
  graphQL: {
    name: `Settings`,
  },
  access: {
    read: () => true,
    update: admins,
  },
  admin: {
    group: `Settings`,
  },
  fields: [
    {
      type: `tabs`,
      tabs: [
        {
          label: `General Settings`,
          fields: [
            {
              name: `homePage`,
              type: `relationship`,
              relationTo: `pages`,
              admin: {
                description: `Select the page that you wanted to show for the Homepage`,
              },
            },
          ],
        },
        {
          label: `Social Links`,
          fields: [
            {
              name: `socialLinks`,
              type: `group`,
              fields: [
                {
                  name: `instagram`,
                  type: `text`,
                },
                {
                  name: `tiktok`,
                  type: `text`,
                },
                {
                  name: `twitter`,
                  type: `text`,
                },
                {
                  name: `youtube`,
                  type: `text`,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
