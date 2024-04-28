import type { Config } from 'payload/config';

import map from 'lodash/map';

import { anyone } from '../../../access';
import { fields } from '../fields';
import { PointsContext } from '../fields/points';

export type Pages = {
  collections: Config['collections'];
};

export const points = ({ collections }: Pages): Config['collections'] => {
  const collectionsWithPoints = [
    ...collections,
    {
      slug: `points`,
      labels: {
        singular: `Point`,
        plural: `Points`,
      },
      typescript: {
        interface: `Points`,
      },
      admin: {
        useAsTitle: `user.name`,
        group: `Core`,
        defaultColumns: [`user.name`, `rewardsPointsEarned`, `rewardProgram.title`],
      },
      access: {
        read: anyone,
        update: () => false,
        create: () => false,
        delete: () => false,
      },
      fields: fields.points({
        fields: [],
        context: PointsContext.Points,
      }),
    },
  ];

  return map(collectionsWithPoints, collection => {
    return collection;
  });
};
