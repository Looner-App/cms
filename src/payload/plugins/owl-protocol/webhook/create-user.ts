import type { Payload } from 'payload';

import APIError from 'payload/dist/errors/APIError';

import { type Settings, SettingsKeys } from '../types';

export type CreateUserResponse = {
  email: string;
  externalId: string;
  userId: string;
};

export type CreateUser = {
  email: string;
  externalId: string;
  fullname: string;
  payload: Payload;
};

export const createUser = async ({
  email,
  fullname,
  externalId,
  payload,
}: CreateUser): Promise<CreateUserResponse> => {
  const owlSettings = (await payload.findGlobal({
    slug: `owlProtocol`,
  })) as Settings;

  const headers = new Headers();
  headers.set(`Accept`, `application/json`);
  headers.set(`content-type`, `application/json`);
  headers.set(`x-api-key`, `${owlSettings[SettingsKeys.XApiKey]}`);

  const result = await fetch(`${owlSettings[SettingsKeys.API]}` + `/project/projectUser`, {
    method: `POST`,
    headers,
    body: JSON.stringify({
      projectId: owlSettings[SettingsKeys.ProjectId],
      authMode: `project`,
      email,
      fullname,
      externalId,
    }),
  });

  if (result.status !== 200) {
    const msg = await result.text();
    throw new APIError(msg, result.status);
  }

  const data = await result.json();
  return data;
};
