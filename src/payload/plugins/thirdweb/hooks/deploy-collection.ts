import type { CollectionConfig } from 'payload/types';

import { DeployCollectionContext } from '../types';

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
            /**
             * code here
             */
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
