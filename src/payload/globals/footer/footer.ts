import type { GlobalConfig } from 'payload/types';

import { admins } from '../../access/admins';

export const Footer: GlobalConfig = {
  slug: `footer`,
  access: {
    read: () => true,
    update: admins,
  },
  admin: {
    group: `Theme Settings`,
  },
  fields: [],
};
