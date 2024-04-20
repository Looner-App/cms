import type { Referral } from './referral';
import type { RewardsProgram } from './rewards-program';

import { referral } from './referral';
import { rewardsProgram } from './rewards-program';

export type { Referral, RewardsProgram };

export const collections = {
  rewardsProgram,
  referral,
};
