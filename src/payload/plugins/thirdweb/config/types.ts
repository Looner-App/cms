import type { Chain as IChain } from 'wagmi/chains';

export type Chain = IChain & {
  /// insert custom fields here
};

export type ChainContracts = Chain['contracts'];
