import type { CollectionConfig } from 'payload/types';

export type NewsletterParams = {
  fields: CollectionConfig['fields'];
};

export const newsletterEmails = ({ fields }: NewsletterParams): CollectionConfig['fields'] => {
  return [
    ...fields,
    {
      type: `email`,
      name: `email`,
      label: `Email`,
      required: true,
      unique: true,
    },
  ];
};
