import type { Pages } from './pages';
import type { Referral } from './referral';
import type { RewardsProgram } from './rewards-program';

import { pages } from './pages';
import { referral } from './referral';
import { rewardsProgram } from './rewards-program';

export type { Pages, Referral, RewardsProgram };

export const collections = {
  rewardsProgram,
  referral,
  pages,
};
