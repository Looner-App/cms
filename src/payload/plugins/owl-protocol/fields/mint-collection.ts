import type { CollectionConfig } from 'payload/types';

/// @todo: does not import as external do it as plugin utility from owl plugin
import { admins } from '../../../access';

export const mintCollection = (fields: CollectionConfig['fields']): CollectionConfig['fields'] => {
  return [
    ...fields,
    {
      name: `tokenId`,
      label: `Token ID`,
      type: `text`,
      access: {
        update: () => false,
        create: admins,
      },
      admin: {
        condition: (data, siblingData) => {
          const tokenId = siblingData.tokenId;
          return tokenId && data.id;
        },
        readOnly: true,
      },
    },
  ];
};
