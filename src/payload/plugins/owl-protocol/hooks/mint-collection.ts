import type { AfterOperationHook } from 'payload/dist/collections/config/types';

import { webhook } from '../webhook';

export type RelationshipResult = {
  deployedCollection: {
    details: {
      collectionAddress: string;
    };
  };
};

export type ClaimedByResult = {
  address: string;
};

export const mintCollection: AfterOperationHook = async ({ result, operation, req }) => {
  if (operation === `update`) {
    try {
      const { docs } = result;

      docs.forEach(async doc => {
        const claimedBy = doc[`claimedBy`] as ClaimedByResult | undefined;
        if (!claimedBy?.address) return;

        const currentDoc = await req.payload.findByID({
          collection: `items`,
          id: doc.id,
        });

        if (currentDoc.tokenId) return;

        const { deployedCollection } = doc[`category`] as RelationshipResult;
        if (!deployedCollection) return;

        const {
          details: { collectionAddress },
        } = deployedCollection;

        if (collectionAddress) {
          const data = await webhook.mintCollection({
            payload: req.payload,
            collectionAddress,
            to: claimedBy.address,
          });

          await req.payload.update({
            collection: `items`,
            where: {
              id: { equals: doc.id },
            },
            data: {
              tokenId: data.mints[0].tokenId,
            },
          });

          req.payload.logger.info(`Collection mint successfully:` + JSON.stringify(data));
        }
      });

      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : error;
      req.payload.logger.error(`Error deploying collection: ${msg}`);
      return result;
    }
  }

  return result;
};
