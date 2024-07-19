import type { CollectionConfig } from 'payload/types';

import { APIError } from 'payload/errors';

import type { RewardsProgram, User } from '../../../payload-types';

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
            const {
              id,
              invitationReferralCode,
              referralCode: invitedReferralCode,
            } = result as unknown as User;

            /// if theres no invitation, just return result
            if (!invitationReferralCode) return result;

            /// find inviter
            const inviter = await req.payload.find({
              collection: `users`,
              where: {
                referralCode: { equals: invitationReferralCode },
              },
            });

            /// check if theres an inviter available, if not return result
            if (!inviter.docs?.length) return result;

            inviter.docs.forEach(async inviterUser => {
              /// get inviter data
              const { referralCode: inviterReferralCode, id: inviterUserId } = inviterUser;

              /// check if user has a referral code, if not return
              if (!inviterReferralCode) return;

              /// get referral data of inviter
              const inviterReferral = await req.payload.find({
                collection: `referral`,
                where: {
                  referralCode: { equals: inviterReferralCode },
                },
              });

              /// check if inviter has a referral relationship
              if (!inviterReferral.docs?.length) return;

              /// get settings
              const coreSettings = (await req.payload.findGlobal({
                slug: `core`,
              })) as Settings;
              /// referral settings
              const rewardsProgram: RewardsProgram[] = coreSettings[SettingsKeys.RewardsProgram];
              const pointsPerReferral = Number(coreSettings[SettingsKeys.PointsPerReferral]);
              const pointsPerReferralInvited = Number(
                coreSettings[SettingsKeys.PointsPerReferralInvited],
              );

              /// INVITED
              /// get invited data
              const invitedReferral = await req.payload.find({
                collection: `referral`,
                where: {
                  referralCode: { equals: invitedReferralCode },
                },
              });

              /// check if invited has a referral relationship
              if (pointsPerReferralInvited > 0 && invitedReferral.docs.length > 0) {
                invitedReferral.docs.forEach(async invitedReferralData => {
                  /// check if theres a rewards program available
                  if (rewardsProgram?.length) {
                    rewardsProgram.forEach(async (rewardsProgram: RewardsProgram) => {
                      /// create points for the invited referral for each rewards program
                      await req.payload.create({
                        collection: `points`,
                        data: {
                          referrals: [],
                          rewardsPointsEarned: pointsPerReferralInvited,
                          user: id,
                          rewardsProgram: rewardsProgram.id,
                        },
                      });
                    });
                  } else {
                    /// since its first user account, create points for it without rewards program
                    await req.payload.create({
                      collection: `points`,
                      data: {
                        referrals: [],
                        rewardsPointsEarned: pointsPerReferralInvited,
                        user: id,
                      },
                    });
                  }

                  /// update the invited referral points since referral is created in user creation
                  await req.payload.update({
                    collection: `referral`,
                    id: invitedReferralData.id,
                    data: {
                      points: pointsPerReferralInvited,
                    },
                  });
                });
                req.payload.logger.info(
                  `Referral points has been added for the invited ${id} with ${pointsPerReferralInvited} points`,
                );
              } else {
                req.payload.logger.info(`Referral points has failed to add for the invited ${id}`);
              }

              /// INVITER
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
                if (!rewardsProgram?.length) {
                  /// Todo: even if its created before, is necessary to check again?)
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
                            exists: false,
                          },
                        },
                      ],
                    },
                  });

                  /// if already exist update
                  if (pointsUser.docs?.length > 0) {
                    pointsUser.docs.forEach(async (pointsUserData: any) => {
                      /// prepare points and get old referrals
                      const rewardsPointsEarned = Number(pointsUserData.rewardsPointsEarned);
                      const newPoints = rewardsPointsEarned + pointsPerReferral;
                      const referrals = pointsUserData.referrals || [];

                      /// use already exist this referal, dont add again (skip duplicated referrations)
                      if (referrals.some(referral => referral.referral.id === id)) return;

                      /// update the points
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
                    /// if points not exist yet, create one and attach the referral
                    await req.payload.create({
                      collection: `points`,
                      data: {
                        referrals: [{ referral: id, rewardsPointsEarned: pointsPerReferral }],
                        rewardsPointsEarned: pointsPerReferral,
                        user: inviterUserId,
                      },
                    });
                  }

                  return;
                } else {
                  rewardsProgram.forEach(async (rewardsProgram: RewardsProgram) => {
                    /// get user points data
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

                    /// check if points already exist
                    if (pointsUser.docs?.length > 0) {
                      pointsUser.docs.forEach(async (pointsUserData: any) => {
                        /// prepare points and get old referrals
                        const rewardsPointsEarned = Number(pointsUserData.rewardsPointsEarned);
                        const newPoints = rewardsPointsEarned + pointsPerReferral;
                        const referrals = pointsUserData.referrals || [];

                        /// use already exist this referal, dont add again
                        if (referrals.some(referral => referral.referral.id === id)) return;

                        /// update the points
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
                        },
                      });
                    }
                  });
                }
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
