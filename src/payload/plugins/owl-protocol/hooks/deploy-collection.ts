import type { CollectionConfig } from 'payload/types';

import type { DeployCollection as DeployCollectionType } from '../../../payload-types';

import { DeployCollectionContext } from '../types';
import { webhook } from '../webhook';

export type DeployCollection = {
  context: DeployCollectionContext;
  hooks: CollectionConfig['hooks'];
};

export const deployCollection = ({
  hooks,
  context,
}: DeployCollection): CollectionConfig['hooks'] => {
  if (context === DeployCollectionContext.Categories) {
    return hooks;
  }

  return {
    ...hooks,
    afterOperation: [
      ...(hooks?.afterOperation || []),
      async ({ result, operation, req }) => {
        if (operation === `create`) {
          try {
            const { details } = result as unknown as DeployCollectionType;

            const { name, symbol, collectionAddress } = details;
            if (collectionAddress) return result;

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
      },
    ],
  };
};
