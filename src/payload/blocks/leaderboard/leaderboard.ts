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
  ],
};
