import type { CollectionConfig } from 'payload/types';

/// @todo: does not import as external do it as plugin utility from owl plugin
import { admins } from '../../../access';

export enum RewardsProgramContext {
  Categories,
  RewardsProgram,
  Items,
}

export const rewardsProgram = (
  fields: CollectionConfig['fields'],
  context: RewardsProgramContext,
): CollectionConfig['fields'] => {
  if (context === RewardsProgramContext.Categories) {
    return [
      ...fields,
      {
        name: `rewardProgram`,
        label: `Reward program`,
        type: `relationship`,
        access: {
          update: () => false,
          create: admins,
        },
        relationTo: `rewards-program`,
      },
    ];
  }

  if (context === RewardsProgramContext.Items) {
    return [
      ...fields,
      {
        name: `rewardsPointsEarned`,
        label: `Rewards points earned`,
        type: `number`,
        access: {
          update: () => false,
          create: () => false,
          read: () => true,
        },

        admin: {
          readOnly: true,
          condition: (data, siblingData) => {
            const rewardProgram = siblingData.rewardsPointsEarned && siblingData.claimedBy;
            return !!rewardProgram && data.id;
          },
        },
      },
    ];
  }

  return [
    ...fields,
    {
      required: true,
      name: `title`,
      label: `Title`,
      type: `text`,
    },

    {
      label: `Rewards`,
      type: `tabs`,
      tabs: [
        {
          name: `leaderboard`,
          label: `Leaderboard`,
          fields: [
            {
              required: true,
              name: `epochName`,
              label: `Epoch name`,
              type: `text`,
              access: {
                update: () => false,
                create: admins,
              },
            },
            {
              required: true,
              name: `description`,
              label: `Epoch description`,
              access: {
                update: admins,
                create: admins,
              },
              type: `textarea`,
            },
            {
              name: `image`,
              type: `upload`,
              relationTo: `media`,
            },
          ],
        },
        {
          name: `details`,
          label: `Details`,
          fields: [
            {
              name: `pointsPerClaim`,
              label: `Points per claim`,
              required: true,
              type: `number`,
              access: {
                update: () => false,
                create: admins,
              },
              validate: val => {
                if (!val) {
                  return `You must provide a number of points per claim`;
                }

                if (val < 1) {
                  return `Must be greater than 0.`;
                }

                return true;
              },
            },
          ],
        },
      ],
    },
  ];
};
