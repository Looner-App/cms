import type { Config } from 'payload/config';

import map from 'lodash/map';

import { anyone } from '../../../access';
import { fields } from '../fields';
import { ReferralContext } from '../fields/referral';
import { hooks } from '../hooks';
// import { hooks } from '../hooks';

export type Referral = {
  collections: Config['collections'];
};

export const referral = ({ collections }: Referral): Config['collections'] => {
  const collectionsWithReferral = [
    ...collections,
    {
      slug: `referral`,
      labels: {
        singular: `Referral`,
        plural: `Referrals`,
      },
      admin: {
        useAsTitle: `title`,
      },
      access: {
        read: anyone,
        update: () => false,
        create: () => false,
        delete: () => false,
      },
      fields: fields.referral([], ReferralContext.Referrals),
    },
  ];

  return map(collectionsWithReferral, collection => {
    if (collection.slug === `users`) {
      collection.fields = fields.referral(collection.fields, ReferralContext.Users);

      collection.hooks = {
        ...collection.hooks,
        afterOperation: [...(collection.hooks?.afterOperation || []), hooks.referral],
      };
    }

    return collection;
  });
};
