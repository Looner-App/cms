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
    slug: `owlProtocol`,
    typescript: {
      interface: `OwlProtocol`,
    },
    graphQL: {
      name: `OwlProtocol`,
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
                name: SettingsKeys.API,
                label: `API URL`,
                type: `text`,
                required: true,
                admin: {
                  description: `The API URL is the base URL that is used to communicate with the Owl Protocol API.`,
                },
              },
              {
                name: SettingsKeys.XApiKey,
                label: `X-API-Key`,
                type: `text`,
                required: true,
                admin: {
                  description: `The XApiKey is a unique key that is used to authenticate the user with the Owl Protocol API.`,
                },
              },
              {
                name: SettingsKeys.ProjectId,
                label: `Project Id`,
                type: `text`,
                required: true,
                admin: {
                  description: `The ProjectId is a unique key that is used to identify the project with the Owl Protocol API.`,
                },
              },
              {
                name: SettingsKeys.ChainId,
                label: `Chain Id`,
                type: `number`,
                required: true,
                admin: {
                  description: `The ChainId is a unique number that is used to identify the chain with the Owl Protocol API.`,
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
