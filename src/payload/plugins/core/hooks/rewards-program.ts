import type { CollectionAfterOperationHook, CollectionConfig } from 'payload/types';

export type RewardsProgram = {
  hooks: CollectionConfig['hooks'];
};

export const rewardsProgramUpdate: CollectionAfterOperationHook = async ({
  operation,
  req,
  result,
}) => {
  if (operation === `update`) {
    try {
      result.docs.forEach(async (doc: any) => {
        const points = await req.payload.find({
          collection: `points`,
          where: {
            claimable: {
              equals: doc.id,
            },
          },
        });

        /// skip if already claimed
        if (points.docs.length > 1) return;

        const {
          rewardProgram: {
            id: rewardProgramId,
            details: { pointsPerClaim },
          },
        } = doc.category;

        await req.payload.create({
          collection: `points`,
          data: {
            claimable: doc.id,
            rewardsPointsEarned: pointsPerClaim,
            user: doc.claimedBy.id,
            rewardProgram: rewardProgramId,
          },
        });
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : error;
      req.payload.logger.error(`Error setting points: ${msg}`);
      return result;
    }
  }

  return result;
};

export const rewardsProgram = ({ hooks }: RewardsProgram): CollectionConfig['hooks'] => {
  return {
    ...hooks,
    afterOperation: [...(hooks?.afterOperation || []), rewardsProgramUpdate],
  };
};
