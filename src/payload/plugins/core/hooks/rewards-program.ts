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
        const {
          rewardProgram: {
            id: rewardProgramId,
            details: { pointsPerClaim },
          },
        } = doc.category;

        const pointsUser = await req.payload.find({
          collection: `points`,
          where: {
            and: [
              {
                user: {
                  equals: doc.claimedBy.id,
                },
              },
              {
                rewardsProgram: {
                  equals: rewardProgramId,
                },
              },
            ],
          },
        });

        if (pointsUser.docs.length > 0) {
          /// if already exist, increment the points and save in the claims array the new claim
          const rewardsPointsEarned = Number(pointsUser.docs[0].rewardsPointsEarned);
          const newPoints = rewardsPointsEarned + pointsPerClaim;
          const claims = (pointsUser.docs[0].claims || []) as any;

          if (claims.some((claimed: any) => claimed.claimable.id === doc.id)) {
            throw new Error(`Already claimed`);
          }

          await req.payload.update({
            collection: `points`,
            id: pointsUser.docs[0].id,
            data: {
              rewardsPointsEarned: newPoints,
              claims: [
                {
                  claimable: doc.id,
                  rewardsPointsEarned: pointsPerClaim,
                },
              ].concat(
                claims.map(claimData => {
                  return {
                    claimable: claimData.claimable.id,
                    rewardsPointsEarned: claimData.rewardsPointsEarned,
                  };
                }),
              ),
            },
          });
        } else {
          await req.payload.create({
            collection: `points`,
            data: {
              claims: [
                {
                  claimable: doc.id,
                  rewardsPointsEarned: pointsPerClaim,
                },
              ],
              rewardsPointsEarned: pointsPerClaim,
              user: doc.claimedBy.id,
              rewardsProgram: rewardProgramId,
            },
          });
        }
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
