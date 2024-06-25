import type { CollectionConfig } from 'payload/types';

import { APIError } from 'payload/errors';

import { MintsContext } from '../types';
import { webhook } from '../webhook';

export type HooksParams = {
  context: MintsContext;
  hooks: CollectionConfig['hooks'];
};

export const hooks = ({ hooks, context }: HooksParams): CollectionConfig['hooks'] => {
  if (context === MintsContext.Mints) {
    return hooks;
  }

  return {
    ...hooks,
    /// check if theres a max mint per user from collection before operation create
    beforeOperation: [
      ...(hooks?.beforeOperation || []),
      async ({ operation, req, args }) => {
        if (operation === `update`) {
          try {
            /// find item itself
            const { where } = args;
            if (!where) return args;

            const item = await req.payload.find({
              collection: `items`,
              where,
            });

            const { docs } = item;
            const doc: any = docs[0];
            if (!doc) return args;

            const { category } = doc;
            if (!category) return args;

            const { deployedCollection, id: categoryId } = category;
            if (!deployedCollection) return args;

            const { settings } = deployedCollection;

            // /// skip if collection settings is not available
            if (!settings) return args;
            const { maxMintPerUser } = settings;

            /// skip if collection address is not available
            if (!maxMintPerUser) return args;

            /// check claimed by in items
            const items = await req.payload.find({
              collection: `items`,
              where: {
                and: [
                  {
                    claimedBy: {
                      equals: args.data.claimedBy,
                    },
                  },
                  {
                    category: {
                      equals: categoryId,
                    },
                  },
                ],
              },
            });

            if (items.docs.length >= maxMintPerUser) {
              throw new Error(`Max mint per user reached`);
            }

            return args;
          } catch (error) {
            const msg = error instanceof Error ? error.message : error;
            req.payload.logger.error(`Error miting collection: ${msg}`);

            throw new APIError(msg, 400);
          }
        }

        return args;
      },
    ],

    /// mint collection after operation
    afterOperation: [
      ...(hooks?.afterOperation || []),
      async ({ result, operation, req }) => {
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
              if (mint.docs.length >= 1) return result;

              /// skip if use dont have address
              if (!doc.claimedBy?.sub) return result;

              const { deployedCollection } = doc.category;

              /// skip if collection is not deployed
              if (!deployedCollection) return result;

              const { details } = deployedCollection;

              /// skip if collection details is not available
              if (!details) return result;

              const { collectionAddress } = details;

              /// skip if collection address is not available
              if (!collectionAddress) return result;

              /// if skip if collection address is not available
              if (!collectionAddress) return result;

              await webhook.mintCollection({
                collectionAddress,
                payload: req.payload,
                to: doc.claimedBy.sub,
                chainId: 84532,
                name: doc.name,
                description: doc.description,
              });

              const updatedMint = await req.payload.create({
                collection: `mints`,
                data: {
                  user: doc.claimedBy.id,
                  category: doc.category.id,
                  claimable: doc.id,
                },
              });

              req.payload.logger.info(
                `Collection mint successfully:` + JSON.stringify(updatedMint),
              );
            });

            return result;
          } catch (error) {
            const msg = error instanceof Error ? error.message : error;
            req.payload.logger.error(`Error minting collection: ${msg}`);
            throw new APIError(msg, 400);
          }
        }
        return result;
      },
    ],
  };
};
