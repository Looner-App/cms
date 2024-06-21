import { merge, reduce } from 'lodash';

import type { Chain } from './chains';

import { baseChain, baseSepoliaChain } from './chains';

export type { Chain };

export const mainnets = [baseChain];
export const testnets = [baseSepoliaChain];

export const allowedChains = (
  process.env.NEXT_PUBLIC_TESTNET_MODE === `1` ? testnets : mainnets
) as [Chain, ...Chain[]];

export const allowedChainsConfig = reduce(
  allowedChains,
  (acc, chain: Chain) =>
    merge(acc, {
      [chain.id]: chain,
    }),
  {} as { [key: number]: Chain },
);
