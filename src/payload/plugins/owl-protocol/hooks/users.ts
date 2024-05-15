import type { CollectionAfterOperationHook, CollectionConfig } from 'payload/types';

import { APIError } from 'payload/errors';

import { webhook } from '../webhook';

export type Users = {
  hooks: CollectionConfig['hooks'];
};

export const createUser: CollectionAfterOperationHook = async ({ operation, req, result }) => {
  if (operation === `create`) {
    try {
      const { email, name, id, address } = result as any;

      if (address) return result;
      const { userId } = await webhook.createUser({
        payload: req.payload,
        externalId: `${id}`,
        fullname: name,
        email,
      });

      const { safeAddress } = await webhook.getUser({
        payload: req.payload,
        externalId: `${id}`,
        email,
        userId,
      });

      const updatedUser = await req.payload.update({
        collection: `users`,
        id,
        data: {
          address: safeAddress,
        },
      });

      req.payload.logger.info(`Account creationg successfully: ${JSON.stringify(updatedUser)}`);
      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : error;
      req.payload.logger.error(`Error creating account: ${msg}`);
      throw new APIError(msg, 400);
    }
  }

  return result;
};

export const users = ({ hooks }: Users): CollectionConfig['hooks'] => {
  return {
    ...hooks,
    afterOperation: [...(hooks?.afterOperation || []), createUser],
  };
};
