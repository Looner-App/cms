import type { CollectionConfig } from 'payload/types';

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
