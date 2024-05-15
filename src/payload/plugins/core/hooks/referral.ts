import type { CollectionConfig } from 'payload/types';

import { APIError } from 'payload/errors';

import type { RewardsProgram } from '../../../payload-types';

import { type Settings, SettingsKeys } from '../types';

export type Referral = {
  hooks: CollectionConfig['hooks'];
};

export const referral = ({ hooks }: Referral): CollectionConfig['hooks'] => {
  return {
    ...hooks,
    afterOperation: [
      ...(hooks?.afterOperation || []),
      async ({ operation, req, result }) => {
        if (operation === `create`) {
          try {
            const { invitationReferralCode, id } = result;

            ///  check if theres an invitation code
            if (!invitationReferralCode) return result;

            const inviter = await req.payload.find({
              collection: `users`,
              where: {
                referralCode: { equals: invitationReferralCode },
              },
            });

            /// check if theres an inviter available
            if (!inviter.docs?.length) return result;

            inviter.docs.forEach(async inviterUser => {
              const { referralCode: inviterReferralCode, id: inviterUserId } = inviterUser;

              /// check if user has a referral code
              if (!inviterReferralCode) return;

              const inviterReferral = await req.payload.find({
                collection: `referral`,
                where: {
                  referralCode: { equals: inviterReferralCode },
                },
              });

              /// check if inviter has a referral relationship
              if (!inviterReferral.docs?.length) return;

              const coreSettings = (await req.payload.findGlobal({
                slug: `core`,
              })) as Settings;

              const pointsPerReferral = Number(coreSettings[SettingsKeys.PointsPerReferral]);
              const rewardsProgram = coreSettings[SettingsKeys.RewardsProgram];

              inviterReferral.docs.forEach(async inviterReferralData => {
                /// update the inviter referral points
                await req.payload.update({
                  collection: `referral`,
                  id: inviterReferralData.id,
                  data: {
                    points: Number(inviterReferralData.points || 0) + pointsPerReferral,
                  },
                });

                /// check if theres a rewards program available
                if (!rewardsProgram) {
                  /// if not, create a point without rewards program relatioship
                  await req.payload.create({
                    collection: `points`,
                    data: {
                      referrals: [{ referral: id, rewardsPointsEarned: pointsPerReferral }],
                      rewardsPointsEarned: pointsPerReferral,
                      user: inviterUserId,
                    },
                  });

                  return;
                }

                rewardsProgram.forEach(async (rewardsProgram: RewardsProgram) => {
                  const pointsUser = await req.payload.find({
                    collection: `points`,
                    where: {
                      and: [
                        {
                          user: {
                            equals: inviterUserId,
                          },
                        },
                        {
                          rewardsProgram: {
                            equals: rewardsProgram.id,
                          },
                        },
                      ],
                    },
                  });

                  if (pointsUser.docs?.length > 0) {
                    pointsUser.docs.forEach(async (pointsUserData: any) => {
                      /// if already exist, increment the points and save in the claims array the new claim
                      const rewardsPointsEarned = Number(pointsUserData.rewardsPointsEarned);
                      const newPoints = rewardsPointsEarned + pointsPerReferral;
                      const referrals = pointsUserData.referrals || [];

                      if (referrals.some(referral => referral.referral.id === id)) return;

                      await req.payload.update({
                        collection: `points`,
                        id: pointsUserData.id,
                        data: {
                          rewardsPointsEarned: newPoints,
                          referrals: [
                            {
                              referral: id,
                              rewardsPointsEarned: pointsPerReferral,
                            },
                          ].concat(
                            referrals.map(referralData => {
                              return {
                                referral: referralData.referral.id,
                                rewardsPointsEarned: referralData.rewardsPointsEarned,
                              };
                            }),
                          ),
                        },
                      });
                    });
                  } else {
                    /// if not exist yet to this rewardsProgram, create one and attach the referral
                    await req.payload.create({
                      collection: `points`,
                      data: {
                        referrals: [{ referral: id, rewardsPointsEarned: pointsPerReferral }],
                        rewardsPointsEarned: pointsPerReferral,
                        user: inviterUserId,
                        rewardsProgram: rewardsProgram.id,
                      },
                    });
                  }
                });
              });

              req.payload.logger.info(
                `Referral points added to user ${inviterUserId} with ${pointsPerReferral} points`,
              );
            });

            return result;
          } catch (error) {
            const msg = error instanceof Error ? error.message : error;
            req.payload.logger.error(`Error setting referral: ${msg}`);
            throw new APIError(msg, 400);
          }
        }

        return result;
      },
    ],
  };
};
