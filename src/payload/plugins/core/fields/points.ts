import type { CollectionConfig } from 'payload/types';

export enum PointsContext {
  Points,
}

export type Points = {
  context: PointsContext;
  fields: CollectionConfig['fields'];
};

/// todo: migrate fields to core library UI
export const points = ({ fields, context }: Points): CollectionConfig['fields'] => {
  if (context === PointsContext.Points) {
    return [
      ...fields,
      {
        name: `user`,
        label: `User`,
        type: `relationship`,
        relationTo: `users`,
        admin: {
          readOnly: true,
        },
      },
      {
        name: `rewardProgram`,
        label: `Reward program`,
        type: `relationship`,
        access: {
          update: () => false,
          create: () => false,
          read: () => true,
        },
        relationTo: `rewards-program`,
        admin: {
          readOnly: true,
        },
      },
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
        },
      },
      {
        name: `claimable`,
        label: `Claimable`,
        type: `relationship`,
        relationTo: `items`,
      },
    ];
  }

  return [...fields];
};
