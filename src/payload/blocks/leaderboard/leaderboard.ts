import type { Block } from 'payload/types';

import { sectionID } from '../../fields';

export const leaderboard: Block = {
  slug: `leaderboard`,
  fields: [
    sectionID(),
    {
      name: `rewardsProgram`,
      label: `Rewards Program`,
      type: `relationship`,
      relationTo: `rewards-program`,
    },
    {
      type: `select`,
      name: `cardVariant`,
      label: `Card Variant`,
      defaultValue: `default`,
      admin: {
        description: `Choose the variant for the card.`,
      },
      options: [
        {
          label: `Default`,
          value: `default`,
        },

        {
          label: `Primary`,
          value: `primary`,
        },

        {
          label: `Secondary`,
          value: `secondary`,
        },
      ],
    },
  ],
};
