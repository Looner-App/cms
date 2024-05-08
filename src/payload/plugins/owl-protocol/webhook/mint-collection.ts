import type { Payload } from 'payload';

import { type Settings, SettingsKeys } from '../types';
import { proxy } from './proxy';

export type MintCollectionResponse = {
  address: string;
  chainId: number;
  mints: {
    to: string;
  }[];
  tokens: {
    tokenId: number | string;
  }[];
};

export type MintCollection = {
  collectionAddress: string;
  payload: Payload;
  to: string;
};

export const mintCollection = async ({
  collectionAddress,
  to,
  payload,
}: MintCollection): Promise<MintCollectionResponse> => {
  const owlSettings = (await payload.findGlobal({
    slug: `owlProtocol`,
  })) as Settings;

  return proxy<MintCollectionResponse>({
    method: `POST`,
    path: `/project/collection/${owlSettings[SettingsKeys.ChainId]}/${collectionAddress}/mint/erc721AutoId`,
    payload,
    params: {
      txWait: 6,
      mints: [
        {
          to,
        },
      ],
    },
  });
};
