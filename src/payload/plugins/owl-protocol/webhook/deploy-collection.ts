import type { Payload } from 'payload';

// import APIError from 'payload/dist/errors/APIError';

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

  // const owlSettings = (await payload.findGlobal({
  //   slug: `owlProtocol`,
  // })) as Settings;

  // const headers = new Headers();
  // headers.set(`Accept`, `application/json`);
  // headers.set(`content-type`, `application/json`);
  // headers.set(`x-api-key`, `${owlSettings[SettingsKeys.XApiKey]}`);

  // const result = await fetch(`${owlSettings[SettingsKeys.API]}` + `/project/collection/deploy`, {
  //   method: `POST`,
  //   headers,
  //   body: JSON.stringify({
  //     projectId: owlSettings[SettingsKeys.ProjectId],
  //     chainId: owlSettings[SettingsKeys.ChainId],
  //     authMode: `project`,
  //     feeNumerator: `500`,
  //     name,
  //     symbol,
  //     txWait: 2,
  //   }),
  // });

  // if (result.status !== 200) {
  //   const msg = await result.text();
  //   throw new APIError(msg, result.status);
  // }

  // const data: DeployResponse = await result.json();

  // return data;
};
