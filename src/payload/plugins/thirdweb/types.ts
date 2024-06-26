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
  domainClient: string;
  privateKey: string;
  secretKey: string;
  userDetailsUrl: string;
};

export enum StrategyContext {
  Admin,
  Client,
}

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

export type MintCollectioParams = {
  chainId: Chain['id'];
  collectionAddress: string;
  description: string;
  name: string;
  payload: Payload;
  to: string;
};
export type MintCollectionResponse = {
  /// something here
};
