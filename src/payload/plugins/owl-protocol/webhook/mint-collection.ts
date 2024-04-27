import type { Payload } from 'payload';

import APIError from 'payload/dist/errors/APIError';

import { type Settings, SettingsKeys } from '../types';

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

  const headers = new Headers();
  headers.set(`Accept`, `application/json`);
  headers.set(`content-type`, `application/json`);
  headers.set(`x-api-key`, `${owlSettings[SettingsKeys.XApiKey]}`);

  const result = await fetch(
    `${owlSettings[SettingsKeys.API]}` +
      `/project/collection/${owlSettings[SettingsKeys.ChainId]}/${collectionAddress}/mint/erc721AutoId`,
    {
      method: `POST`,
      headers,
      body: JSON.stringify({
        projectId: owlSettings[SettingsKeys.ProjectId],
        authMode: `project`,
        txWait: 6,
        mints: [
          {
            to,
          },
        ],
      }),
    },
  );

  if (result.status !== 200) {
    const msg = await result.text();
    throw new APIError(msg, result.status);
  }

  const data = await result.json();

  return data;
};
