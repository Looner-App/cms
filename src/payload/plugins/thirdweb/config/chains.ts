import { merge } from 'lodash';
import { base, baseSepolia } from 'wagmi/chains';

import type { Chain } from './types';

export type { Chain };

export const baseSepoliaChain: Chain = merge(baseSepolia, {
  /// insert custom fields here
});

export const baseChain: Chain = merge(base, {
  /// insert custom fields here
});
