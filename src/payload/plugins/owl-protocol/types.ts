import type { TypeWithID } from 'payload/types';

export enum SettingsKeys {
  API = `API`,
  ChainId = `chainId`,
  ProjectId = `projectId`,
  XApiKey = `xApiKey`,
}

export type Settings = TypeWithID &
  Record<string, unknown> & {
    [key in SettingsKeys]: number | string;
  };

export enum DeployCollectionContext {
  Categories,
  DeployCollection,
}

export enum MintsContext {
  Items,
  Mints,
}
