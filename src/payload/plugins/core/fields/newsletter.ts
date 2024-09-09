import type { CollectionConfig } from 'payload/types';

export type NewsletterParams = {
  fields: CollectionConfig['fields'];
};

/// todo: migrate fields to core library UI
export const newsletterEmails = ({ fields }: NewsletterParams): CollectionConfig['fields'] => {
  return [...fields];
};
