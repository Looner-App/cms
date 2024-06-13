import type { CollectionConfig } from 'payload/types';

import type { User } from '../../payload-types';

import { admins, adminsAndUser, anyone } from '../../access';
import { emailForgotPassword } from '../../mjml';
import * as endpointsv2 from '../../plugins/thirdweb/endpoints';
import strategy from '../../plugins/thirdweb/strategy';
import { checkRole } from '../../utilities';
import { userRegister } from './endpoints';
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
      handler: userRegister,
      method: `post`,
      path: `/register`,
    },
    {
      path: `/auth`,
      method: `post`,
      handler: endpointsv2.auth,
    },
    {
      path: `/auth/login`,
      method: `get`,
      handler: endpointsv2.login,
    },
    {
      path: `/auth/account`,
      method: `get`,
      handler: endpointsv2.account,
    },
    {
      path: `/auth/logout`,
      method: `get`,
      handler: endpointsv2.logout,
    },
  ],
  auth: {
    strategies: [
      {
        name: strategy.name,
        strategy,
      },
    ],
    forgotPassword: {
      generateEmailSubject: () => {
        return `Reset Your Password - ${process.env.PAYLOAD_PUBLIC_SITE_NAME}`;
      },
      generateEmailHTML: ({ token, user }) => {
        const link = checkRole([`admin`], user as User)
          ? `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/admin/reset/${token}`
          : `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/reset-password?token=${token}`;

        return emailForgotPassword({
          name: (user as User).name,
          link,
        });
      },
    },
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
      name: `instagram`,
      type: `text`,
      access: {
        read: adminsAndUser,
      },
    },
    {
      name: `country`,
      type: `text`,
      access: {
        read: adminsAndUser,
      },
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
