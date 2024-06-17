import type { CollectionConfig } from 'payload/types';

export type FieldsParams = {
  fields: CollectionConfig['fields'];
};

export const fields = ({ fields }: FieldsParams): CollectionConfig['fields'] => {
  return [
    ...fields,
    {
      name: `sub`,
      type: `text`,
      label: `Sub`,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
  ];
};
