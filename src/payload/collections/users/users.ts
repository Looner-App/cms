import type { CollectionConfig } from 'payload/types';

import { admins, adminsAndUser, anyone } from '../../access';
import { serverClientAuth } from '../../plugins/thirdweb/client';
import * as endpointsv2 from '../../plugins/thirdweb/endpoints';
import { AuthStrategy } from '../../plugins/thirdweb/strategy';
import { ensureFirstUserIsAdmin, loginAfterCreate } from './hooks';

export const Users: CollectionConfig = {
  slug: `users`,
  admin: {
    useAsTitle: `name`,
    defaultColumns: [`name`, `email`, `roles`, `country`, `createdAt`, `updatedAt`],
  },
  access: {
    read: anyone,
    create: admins,
    update: adminsAndUser,
    delete: admins,
    admin: admins,
  },
  hooks: {
    afterChange: [loginAfterCreate],
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
        name: AuthStrategy.name,
        strategy: ctx => {
          return new AuthStrategy(ctx, serverClientAuth);
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
