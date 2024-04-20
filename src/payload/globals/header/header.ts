import type { GlobalConfig } from 'payload/types';

import { admins } from '../../access/admins';
import { linkGroup } from '../../fields/link-group';

export const Header: GlobalConfig = {
  slug: `header`,
  access: {
    read: () => true,
    update: admins,
  },
  admin: {
    group: `Theme Settings`,
  },
  fields: [
    {
      type: `tabs`,
      tabs: [
        {
          name: `logo`,
          fields: [
            {
              name: `title`,
              type: `text`,
              required: true,
            },
            {
              name: `image`,
              type: `upload`,
              relationTo: `media`,
            },
          ],
        },
        {
          name: `menu`,
          fields: [
            linkGroup({
              name: `links`,
              overrides: {
                maxRows: 5,
              },
            }),
          ],
        },
      ],
    },
  ],
};
