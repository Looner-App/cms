import type { Config } from 'payload/config';

import map from 'lodash/map';

import { anyone } from '../../../access';
import { fields } from '../fields';
import { ReferralContext } from '../fields/referral';
import { hooks } from '../hooks';

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
      typescript: {
        interface: `Referral`,
      },
      admin: {
        useAsTitle: `title`,
        group: `Core`,
      },
      access: {
        read: anyone,
        update: () => false,
        create: () => false,
        delete: () => false,
      },
      hooks: {},
      fields: fields.referral({
        fields: [],
        context: ReferralContext.Referrals,
      }),
    },
  ];

  /// extending payload default collections
  return map(collectionsWithReferral, collection => {
    if (collection.slug === `users`) {
      collection.fields = fields.referral({
        fields: collection.fields,
        context: ReferralContext.Users,
      });

      collection.hooks = hooks.referral({
        hooks: collection.hooks,
      });
    }

    return collection;
  });
};
