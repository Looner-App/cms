import type { CollectionAfterOperationHook, CollectionConfig } from 'payload/types';

import { webhook } from '../webhook';

export type MintCollection = {
  hooks: CollectionConfig['hooks'];
};

export const mintCollectionHook: CollectionAfterOperationHook = async ({
  result,
  operation,
  req,
}) => {
  if (operation === `update`) {
    try {
      const { docs } = result;

      docs.forEach(async (doc: any) => {
        const mint = await req.payload.find({
          collection: `mints`,
          where: {
            claimable: {
              equals: doc.id,
            },
          },
        });

        /// skip if already claimed
        if (mint.docs.length > 1) return;

        /// skip if use dont have address
        if (!doc.claimedBy?.address) return;

        const { deployedCollection } = doc.category;

        /// skip if collection is not deployed
        if (!deployedCollection) return;

        const {
          details: { collectionAddress },
        } = deployedCollection;

        /// if skip if collection address is not available
        if (!collectionAddress) return;

        const data = await webhook.mintCollection({
          payload: req.payload,
          collectionAddress,
          to: doc.claimedBy.address,
        });

        const updatedMint = await req.payload.create({
          collection: `mints`,
          data: {
            tokenId: data.tokens[0].tokenId,
            user: doc.claimedBy.id,
            category: doc.category.id,
            claimable: doc.id,
          },
        });

        req.payload.logger.info(`Collection mint successfully:` + JSON.stringify(updatedMint));
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

export const mintCollection = ({ hooks }: MintCollection): CollectionConfig['hooks'] => {
  return {
    ...hooks,
    afterOperation: [...(hooks?.afterOperation || []), mintCollectionHook],
  };
};
