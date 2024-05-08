import type { Payload } from 'payload';

import { proxy } from './proxy';

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

export const createUser = async ({ email, fullname, externalId, payload }: CreateUser) => {
  return proxy<CreateUserResponse>({
    method: `POST`,
    path: `/project/projectUser`,
    params: {
      email,
      fullname,
      externalId,
    },
    payload,
  });
};
