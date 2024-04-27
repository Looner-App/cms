import type { CollectionAfterOperationHook, CollectionConfig } from 'payload/types';

import { webhook } from '../webhook';

export const deployCollectionHook: CollectionAfterOperationHook = async ({
  result,
  operation,
  req,
}) => {
  const { details } = result;

  if (operation === `create`) {
    const { name, symbol, collectionAddress } = details;
    if (collectionAddress) return result;

    try {
      const data = await webhook.deployCollection({
        payload: req.payload,
        name,
        symbol,
      });

      const deployedCollection = await req.payload.update({
        collection: `deploy-collection`,
        id: result.id,
        data: {
          details: {
            collectionAddress: data.contractAddress,
          },
        },
      });

      req.payload.logger.info(
        `Collection deployed successfully: ${JSON.stringify(deployedCollection)}`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : error;
      req.payload.logger.error(`Error deploying collection: ${msg}`);
    }
  }

  return result;
};

export const deployCollection = (): CollectionConfig['hooks'] => {
  return {
    afterOperation: [deployCollectionHook],
  };
};
