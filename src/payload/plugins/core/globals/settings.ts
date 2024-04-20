import type { Config } from 'payload/config';

/// @todo: does not import as external do it as plugin utility from owl plugin
import { admins } from '../../../access';
import { SettingsKeys } from '../types';

export type Settings = {
  globals: Config['globals'];
};

export const settings = ({ globals }: Settings): Config['globals'] => [
  ...globals,
  {
    slug: `core`,
    typescript: {
      interface: `Core`,
    },
    graphQL: {
      name: `Core`,
    },
    access: {
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
            label: `General settings`,
            fields: [
              {
                name: SettingsKeys.PointsPerReferral,
                label: `Points per referral`,
                type: `number`,
                required: true,
                admin: {
                  description: `Points to be awarded for each referral`,
                },
                validate: val => {
                  if (!val) {
                    return `You must provide a number of points per referral`;
                  }
                  if (val < 1) {
                    return `Must be greater than 0.`;
                  }
                  return true;
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
