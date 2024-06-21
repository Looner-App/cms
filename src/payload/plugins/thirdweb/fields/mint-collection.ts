import type { CollectionConfig } from 'payload/types';

/// @todo: move to core
import { admins } from '../../../access';
import { MintsContext } from '../types';

export type FieldsParams = {
  context: MintsContext;
  fields: CollectionConfig['fields'];
};

export const fields = ({ fields, context }: FieldsParams): CollectionConfig['fields'] => {
  if (context === MintsContext.Mints) {
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
      {
        name: `claimable`,
        label: `Claimable`,
        type: `relationship`,
        relationTo: `items`,
      },
      {
        name: `user`,
        label: `User`,
        type: `relationship`,
        relationTo: `users`,
      },
      {
        name: `category`,
        label: `Category`,
        type: `relationship`,
        relationTo: `categories`,
      },
    ];
  }

  return [...fields];
};
