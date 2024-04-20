import type { Config } from 'payload/config';

import map from 'lodash/map';

import { admins, anyone } from '../../../access';
import { fields } from '../fields';
import { RewardsProgramContext } from '../fields/rewards-program';
import { hooks } from '../hooks';

export type RewardsProgram = {
  collections: Config['collections'];
};

export const rewardsProgram = ({ collections }: RewardsProgram): Config['collections'] => {
  const collectionsWithRewardsPrograms = [
    ...collections,
    {
      slug: `rewards-program`,
      labels: {
        singular: `Rewards Program`,
        plural: `Rewards Programs`,
      },
      admin: {
        useAsTitle: `title`,
      },
      access: {
        read: anyone,
        update: admins,
        create: admins,
        delete: admins,
      },
      fields: fields.rewardsProgram([], RewardsProgramContext.RewardsProgram),
    },
  ];

  return map(collectionsWithRewardsPrograms, collection => {
    if (collection.slug === `categories`) {
      collection.fields = fields.rewardsProgram(
        collection.fields,
        RewardsProgramContext.Categories,
      );
    }

    if (collection.slug === `items`) {
      collection.fields = fields.rewardsProgram(collection.fields, RewardsProgramContext.Items);

      collection.hooks = {
        afterOperation: [...(collection.hooks?.afterOperation || []), hooks.rewardsProgram],
      };
    }

    return collection;
  });
};
