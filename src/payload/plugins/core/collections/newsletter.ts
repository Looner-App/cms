import type { Config } from 'payload/config';

import map from 'lodash/map';

import { admins, adminsAndUser } from '../../../access';
import { fields } from '../fields';

export type Pages = {
  collections: Config['collections'];
};

export const newsletterEmails = ({ collections }: Pages): Config['collections'] => {
  const collectionsWithNewsletterEmails = [
    ...collections,
    {
      slug: `newsletter_emails`,
      labels: {
        singular: `Email`,
        plural: `Emails`,
      },
      typescript: {
        interface: `NewsletterEmails`,
      },
      admin: {
        group: `Newsletter`,
      },
      access: {
        read: admins,
        update: () => false,
        create: adminsAndUser,
        delete: () => false,
      },
      fields: fields.newsletterEmails({
        fields: [],
      }),
    },
  ];

  return map(collectionsWithNewsletterEmails, collection => {
    return collection;
  });
};
