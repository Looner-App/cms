import type { Payload } from 'payload';

import type { Chain } from './config/types';

export type ThirdwebUser = {
  createdAt: string;
  email?: string;
  phone?: string;
  userId: string;
  walletAddress: string;
};

export type StrategyOptions = {
  clientId: string;
  domain: string;
  privateKey: string;
  secretKey: string;
  userDetailsUrl: string;
};

export type Config = {
  strategyOptions: StrategyOptions;
};

export enum DeployCollectionContext {
  Categories,
  DeployCollection,
}

export enum MintsContext {
  Items,
  Mints,
}

export type DeployCollectionResponse = {
  deployedAddress: string;
};

export type DeployCollectionParams = {
  chainId: Chain['id'];
  name: string;
  payload: Payload;
  symbol: string;
};
