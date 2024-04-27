import type { CollectionConfig } from 'payload/types';

/// @todo: does not import as external do it as plugin utility from owl plugin
import { admins } from '../../../access';

export enum MintsContext {
  Items,
  Mints,
}

export const mintCollection = (
  fields: CollectionConfig['fields'],
  context: MintsContext,
): CollectionConfig['fields'] => {
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
