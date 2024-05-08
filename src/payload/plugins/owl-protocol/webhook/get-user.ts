import type { Payload } from 'payload';

import { type Settings, SettingsKeys } from '../types';
import { proxy } from './proxy';

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
  const queryParams = new URLSearchParams();
  queryParams.set(`email`, email);
  queryParams.set(`userId`, userId);
  queryParams.set(`externalId`, externalId);
  queryParams.set(`projectId`, `${owlSettings[SettingsKeys.ProjectId]}`);
  queryParams.set(`chainId`, `${owlSettings[SettingsKeys.ChainId]}`);
  queryParams.set(`authMode`, `project`);

  return proxy<GetUserResponse>({
    method: `GET`,
    path: `/project/projectUser?${queryParams}`,
    payload,
  });
};
