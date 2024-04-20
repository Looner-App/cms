import type { Payload } from 'payload';

import APIError from 'payload/dist/errors/APIError';

import { type Settings, SettingsKeys } from '../types';

export type GetUserResponse = {
  email: string;
  externalId: string;
  fullName: string;
  safeAddress: string;
  userId: string;
};

export type GetUser = {
  email: string;
  externalId: string;
  payload: Payload;
  userId: string;
};

export const getUser = async ({
  email,
  userId,
  externalId,
  payload,
}: GetUser): Promise<GetUserResponse> => {
  const owlSettings = (await payload.findGlobal({
    slug: `owlProtocol`,
  })) as Settings;

  const headers = new Headers();
  headers.set(`Accept`, `application/json`);
  headers.set(`content-type`, `application/json`);
  headers.set(`x-api-key`, `${owlSettings[SettingsKeys.XApiKey]}`);

  const queryParams = new URLSearchParams();
  queryParams.set(`email`, email);
  queryParams.set(`userId`, userId);
  queryParams.set(`externalId`, externalId);
  queryParams.set(`projectId`, `${owlSettings[SettingsKeys.ProjectId]}`);
  queryParams.set(`chainId`, `${owlSettings[SettingsKeys.ChainId]}`);
  queryParams.set(`authMode`, `project`);

  const result = await fetch(
    `${owlSettings[SettingsKeys.API]}` + `/project/projectUser?${queryParams}`,
    {
      method: `GET`,
      headers,
    },
  );

  if (result.status !== 200) {
    const msg = await result.text();
    throw new APIError(msg, result.status);
  }

  const data = await result.json();

  return data;
};
