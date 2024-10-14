import type { Chain as IChain } from 'wagmi/chains';

export type Chain = IChain & {
  /// insert custom fields here
  custom?: Record<string, any>;
};

export type ChainContracts = Chain['contracts'];
