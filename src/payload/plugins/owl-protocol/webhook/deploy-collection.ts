import type { Payload } from 'payload';

import type { Settings } from '../types';

import { SettingsKeys } from '../types';
import { proxy } from './proxy';

export type DeployResponse = {
  contractAddress: string;
};

export type DeployCollection = {
  name: string;
  payload: Payload;
  symbol: string;
};

export const deployCollection = async ({
  payload,
  name,
  symbol,
}: DeployCollection): Promise<DeployResponse> => {
  const owlSettings = (await payload.findGlobal({
    slug: `owlProtocol`,
  })) as Settings;
  return proxy<DeployResponse>({
    method: `POST`,
    path: `/project/collection/deploy`,
    params: {
      chainId: owlSettings[SettingsKeys.ChainId],
      name,
      symbol,
      feeNumerator: `500`,
      txWait: 2,
    },

    payload,
  });
};
