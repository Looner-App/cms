import { merge } from 'lodash';
import {
  BASE_SEPOLIA_BASENAME_RESOLVER_ADDRESS,
  BASENAME_RESOLVER_ADDRESS,
} from 'thirdweb/extensions/ens';
import { base, baseSepolia } from 'viem/chains';

import type { Chain } from './types';

export type { Chain };

export const baseSepoliaChain: Chain = merge(baseSepolia, {
  /// insert custom fields here
  custom: {
    resolverAddress: BASE_SEPOLIA_BASENAME_RESOLVER_ADDRESS,
  },
});

export const baseChain: Chain = merge(base, {
  /// insert custom fields here
  custom: {
    resolverAddress: BASENAME_RESOLVER_ADDRESS,
  },
});
