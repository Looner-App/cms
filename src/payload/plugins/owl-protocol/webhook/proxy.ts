import type { Payload } from 'payload';

import APIError from 'payload/dist/errors/APIError';

import { type Settings, SettingsKeys } from '../types';

export type ProxyParams = {
  method: `DELETE` | `GET` | `POST` | `PUT`;
  params?: {
    [key: string]: any;
  };
  path: string;
  payload: Payload;
};

export const proxy = async <T>({ params, payload, path, method }: ProxyParams): Promise<T> => {
  const owlSettings = (await payload.findGlobal({
    slug: `owlProtocol`,
  })) as Settings;

  const headers = new Headers();
  headers.set(`Accept`, `application/json`);
  headers.set(`content-type`, `application/json`);
  headers.set(`x-api-key`, `${owlSettings[SettingsKeys.XApiKey]}`);

  const result = await fetch(`${owlSettings[SettingsKeys.API]}` + path, {
    method,
    headers,
    body: params
      ? JSON.stringify({
          ...params,
          projectId: owlSettings[SettingsKeys.ProjectId],
          authMode: `project`,
        })
      : undefined,
  });

  if (result.status !== 200) {
    const msg = await result.text();
    throw new APIError(msg, result.status);
  }

  const data = await result.json();
  return data;
};
