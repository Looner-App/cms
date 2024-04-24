import type { CollectionAfterOperationHook, CollectionConfig, TypeWithID } from 'payload/types';

import { webhook } from '../webhook';

export type CreateResult = TypeWithID & {
  address?: string;
  email: string;
  name: string;
};

export type Users = {
  hooks: CollectionConfig['hooks'];
};

export const createUser: CollectionAfterOperationHook = async ({ operation, req, result }) => {
  if (operation === `create`) {
    const { email, name, id, address } = result as CreateResult;

    if (address) return result;

    try {
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
    } catch (error) {
      const msg = error instanceof Error ? error.message : error;
      req.payload.logger.error(`Error creating account: ${msg}`);
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
