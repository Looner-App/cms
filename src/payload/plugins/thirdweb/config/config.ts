import { merge, reduce } from 'lodash';

import type { Chain } from './chains';

import { baseChain, baseSepoliaChain } from './chains';

export type { Chain };

export const mainnets = [baseChain];
export const testnets = [baseSepoliaChain];

export const allowedChains = (process.env.TESTNET_MODE === `1` ? testnets : mainnets) as [
  Chain,
  ...Chain[],
];

export const allowedChainsConfig = reduce(
  allowedChains,
  (acc, chain: Chain) =>
    merge(acc, {
      [chain.id]: chain,
    }),
  {} as { [key: number]: Chain },
);

export const wagmiChains = allowedChains.map(chain => ({
  name: chain.name,
  id: chain.id,
  rpc: chain.rpcUrls.default.http[0],
  resolverAddress: chain?.custom?.resolverAddress,
  nativeCurrency: chain.nativeCurrency,
  testnet: !!chain.testnet as true, /// PR: https://github.com/thirdweb-dev/js/pull/3338/files,
  blockExplorers: chain.blockExplorers?.default
    ? [
        {
          name: chain.blockExplorers.default.name,
          url: chain.blockExplorers.default.url,
        },
      ]
    : [],
}));
