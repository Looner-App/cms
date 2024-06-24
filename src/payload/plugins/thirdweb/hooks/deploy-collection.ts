import type { CollectionConfig } from 'payload/types';

import type { DeployCollection } from '../../../payload-types';

// import { allowedChains } from '../config/config';
import { DeployCollectionContext } from '../types';
import { webhook } from '../webhook';

export type HooksParams = {
  context: DeployCollectionContext;
  hooks: CollectionConfig['hooks'];
};

export const hooks = ({ hooks, context }: HooksParams): CollectionConfig['hooks'] => {
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
            const { details } = result as unknown as DeployCollection;

            const { name, symbol } = details;

            const data = await webhook.deployCollection({
              payload: req.payload,
              name,
              /// todo: get it from global config and also provide a way to receive it from api calls
              chainId: 84532,
              symbol,
            });

            const deployedCollection = await req.payload.update({
              collection: `deploy-collection`,
              id: result.id,
              data: {
                details: {
                  collectionAddress: data.deployedAddress,
                },
              },
            });

            req.payload.logger.info(
              `Collection deployed successfully: ${JSON.stringify(deployedCollection)}`,
            );

            return result;
          } catch (error) {
            const msg = error instanceof Error ? error.message : error;
            req.payload.logger.error(`Error deploying collection: ${msg}`);
            return result;
          }
        }

        return result;
      },
    ],
  };
};
