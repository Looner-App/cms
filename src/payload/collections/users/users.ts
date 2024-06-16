import type { CollectionConfig } from 'payload/types';

import { admins, adminsAndUser, anyone } from '../../access';
import { ThirdwebStrategy } from '../../plugins/thirdweb/ThirdwebStrategy';
import { serverClientAuth } from '../../plugins/thirdweb/client';
import * as endpointsv2 from '../../plugins/thirdweb/endpoints';
import { ensureFirstUserIsAdmin } from './hooks';

export const Users: CollectionConfig = {
  slug: `users`,
  admin: {
    useAsTitle: `name`,
    defaultColumns: [`name`, `email`, `roles`, `createdAt`, `updatedAt`],
  },
  access: {
    read: anyone,
    create: adminsAndUser,
    update: adminsAndUser,
    delete: () => false,
    admin: admins,
  },

  endpoints: [
    {
      path: `/auth`,
      method: `get`,
      handler: endpointsv2.login,
    },
    {
      path: `/auth`,
      method: `post`,
      handler: endpointsv2.auth,
    },
    {
      path: `/auth/account`,
      method: `get`,
      handler: endpointsv2.account,
    },
  ],
  auth: {
    strategies: [
      {
        name: ThirdwebStrategy.name,
        strategy: ctx => {
          return new ThirdwebStrategy(ctx, serverClientAuth);
        },
      },
    ],
  },
  fields: [
    {
      name: `email`,
      type: `email`,
      required: true,
      unique: true,
      access: {
        read: adminsAndUser,
        update: adminsAndUser,
      },
    },
    {
      name: `name`,
      type: `text`,
    },
    {
      name: `roles`,
      type: `select`,
      hasMany: true,
      defaultValue: [`user`],
      options: [
        {
          label: `admin`,
          value: `admin`,
        },
        {
          label: `user`,
          value: `user`,
        },
      ],
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      access: {
        read: admins,
        create: admins,
        update: admins,
      },
    },
    {
      name: `loginAttempts`,
      type: `number`,
      access: {
        read: admins,
      },
    },
    {
      name: `createdAt`,
      type: `date`,
      access: {
        read: adminsAndUser,
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: `sub`,
      type: `text`,
      label: `Sub`,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: `updatedAt`,
      type: `date`,
      access: {
        read: adminsAndUser,
      },
      admin: {
        hidden: true,
      },
    },
  ],
  timestamps: true,
};
