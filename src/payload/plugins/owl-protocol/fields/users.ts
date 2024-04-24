import type { CollectionConfig } from 'payload/types';

/// @todo: does not import as external do it as plugin utility from owl plugin
import { admins } from '../../../access';

export const users = (fields: CollectionConfig['fields']): CollectionConfig['fields'] => {
  return [
    ...fields,
    {
      name: `address`,
      label: `Address`,
      type: `text`,
      access: {
        read: () => true,
        update: () => false,
        create: admins,
      },
      admin: {
        readOnly: true,
        condition: (data, siblingData) => {
          const address = siblingData.address;
          return address && data.id;
        },
      },
    },
  ];
};
