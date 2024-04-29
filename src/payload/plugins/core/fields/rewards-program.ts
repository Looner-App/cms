import type { CollectionConfig } from 'payload/types';

/// @todo: does not import as external do it as plugin utility from owl plugin
import { admins } from '../../../access';

export enum RewardsProgramContext {
  Categories,
  RewardsProgram,
}

export type RewardsProgram = {
  context: RewardsProgramContext;
  fields: CollectionConfig['fields'];
};

export const rewardsProgram = ({ fields, context }: RewardsProgram): CollectionConfig['fields'] => {
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
        // {
        //   name: `leaderboard`,
        //   label: `Leaderboard`,
        //   fields: [
        //     {
        //       required: true,
        //       name: `epochName`,
        //       label: `Epoch name`,
        //       type: `text`,
        //       access: {
        //         read: () => true,
        //         update: () => false,
        //         create: admins,
        //       },
        //     },
        //     {
        //       required: true,
        //       name: `description`,
        //       label: `Epoch description`,
        //       access: {
        //         read: () => true,
        //         update: admins,
        //         create: admins,
        //       },
        //       type: `textarea`,
        //     },
        //     {
        //       name: `image`,
        //       type: `upload`,
        //       relationTo: `media`,
        //       access: {
        //         read: () => true,
        //         update: admins,
        //         create: admins,
        //       },
        //     },
        //   ],
        // },
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
                read: () => true,
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
