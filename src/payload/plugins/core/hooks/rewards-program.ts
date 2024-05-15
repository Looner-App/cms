import type { CollectionConfig } from 'payload/types';

import { APIError } from 'payload/errors';

import type { RewardsProgram as RewardsProgramType } from '../../../payload-types';

export type RewardsProgram = {
  hooks: CollectionConfig['hooks'];
};

export const rewardsProgram = ({ hooks }: RewardsProgram): CollectionConfig['hooks'] => {
  return {
    ...hooks,
    afterOperation: [
      ...(hooks?.afterOperation || []),
      async ({ operation, req, result }) => {
        if (operation === `update`) {
          try {
            result.docs.forEach(async (doc: any) => {
              const rewardsProgram: RewardsProgramType = doc.category[`rewardProgram`];

              ///check if theres a rewards program enabled
              if (!rewardsProgram) return;

              const { id: rewardProgramId, details } = rewardsProgram;
              /// check if theres a rewards program details and id
              if (!rewardProgramId || !details) return;

              const { pointsPerClaim } = details;
              /// check if theres a points per claim
              if (!pointsPerClaim) return;

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

              const newUserClaim = {
                claimable: doc.id,
                rewardsPointsEarned: pointsPerClaim,
              };

              /// check if user has points
              if (pointsUser.docs?.length > 0) {
                /// if already exist, increment the points and save in the claims array the new claim
                pointsUser.docs.forEach(async (point: any) => {
                  const rewardsPointsEarned = Number(point.rewardsPointsEarned);
                  const newPoints = rewardsPointsEarned + pointsPerClaim;
                  const claims = point.claims || [];

                  if (claims.some(claimed => claimed.claimable.id === doc.id)) return;

                  /// concat claims with new one
                  const updatedClaims = [newUserClaim].concat(
                    claims.map(claimData => {
                      return {
                        claimable: claimData.claimable.id,
                        rewardsPointsEarned: claimData.rewardsPointsEarned,
                      };
                    }),
                  );

                  await req.payload.update({
                    collection: `points`,
                    id: point.id,
                    data: {
                      rewardsPointsEarned: newPoints,
                      claims: updatedClaims,
                    },
                  });
                });
              } else {
                /// if user has no points, create a new one with the new claim
                await req.payload.create({
                  collection: `points`,
                  data: {
                    claims: [newUserClaim],
                    rewardsPointsEarned: pointsPerClaim,
                    user: doc.claimedBy.id,
                    rewardsProgram: rewardProgramId,
                  },
                });
              }

              req.payload.logger.info(
                `Rewards programs points ${pointsPerClaim} set for user ${doc.claimedBy.id}`,
              );
            });

            return result;
          } catch (error) {
            const msg = error instanceof Error ? error.message : error;
            req.payload.logger.error(`Error setting points: ${msg}`);
            throw new APIError(msg, 400);
          }
        }

        return result;
      },
    ],
  };
};
