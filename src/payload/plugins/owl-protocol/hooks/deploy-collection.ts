import type { AfterOperationHook, TypeWithID } from 'payload/dist/collections/config/types';

import { webhook } from '../webhook';

export type DeployResult = TypeWithID & {
  details: {
    name: string;
    symbol: string;
  };
};

export const deployCollection: AfterOperationHook = async ({ result, operation, req }) => {
  const { details } = result as DeployResult;

  if (operation === `create`) {
    try {
      const data = await webhook.deployCollection({
        payload: req.payload,
        name: details.name,
        symbol: details.symbol,
      });

      await req.payload.update({
        collection: `deploy-collection`,
        where: {
          id: { equals: result.id },
        },
        data: {
          details: {
            collectionAddress: data.contractAddress,
          },
        },
      });

      req.payload.logger.info(`Collection deployed successfully: ${JSON.stringify(data)}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : error;
      req.payload.logger.error(`Error deploying collection: ${msg}`);
    }
  }

  return result;
};
