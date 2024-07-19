import type { CollectionConfig } from 'payload/types';

import Cookies from 'cookies';

import type {
  Points,
  Referral as ReferralEntity,
  RewardsProgram,
  User,
} from '../../../payload-types';

import { type Settings, SettingsKeys } from '../types';

export type Referral = {
  hooks: CollectionConfig['hooks'];
};

export const referral = ({ hooks }: Referral): CollectionConfig['hooks'] => {
  return {
    ...hooks,
    beforeOperation: [
      ...(hooks?.beforeOperation || []),
      async ({ operation, req, args }) => {
        if (operation !== `read`) return args;

        try {
          /// ========================================================================
          /// Initial Referral Data
          /// ========================================================================

          const invitedUser = args?.req?.user as unknown as User;
          if (!invitedUser) return args;

          /// get invited
          const referral = await req.payload.find({
            collection: `referral`,
            where: {
              user: { equals: invitedUser.id },
            },
          });

          /// if already have a referral relationship, return
          if (referral.docs?.length) {
            return args;
          }

          /// prepare user user
          const userReferralData: Partial<ReferralEntity> = {
            user: invitedUser.id,
            referralCode: crypto.randomUUID(),
            points: 0,
            invitationReferralCode: undefined,
          };

          /// get referral code from cookies and set for user referral
          const cookies = new Cookies(req, null);
          const inviterReferralCodeCookie = cookies.get(`referral`);

          if (inviterReferralCodeCookie) {
            const inviterReferralDocs = await req.payload.find({
              collection: `referral`,
              where: {
                referralCode: { equals: inviterReferralCodeCookie },
              },
            });

            const inviterReferralDoc = inviterReferralDocs.docs[0] as unknown as ReferralEntity;
            if (inviterReferralDoc) {
              userReferralData.invitationReferralCode = inviterReferralDoc.id;
            }
          }

          /// create referral data
          const invitedReferralDoc = (await req.payload.create({
            collection: `referral`,
            data: userReferralData,
          })) as unknown as ReferralEntity;

          /// if empty just return result
          if (!invitedReferralDoc) return args;

          /// get inviter referral
          const inviterReferralDoc =
            invitedReferralDoc.invitationReferralCode as unknown as ReferralEntity;

          /// if no inviter user, theres no valid referral
          if (!inviterReferralDoc?.id) return args;
          const inviterReferralDocUser = inviterReferralDoc?.user as unknown as User;
          if (!inviterReferralDocUser?.id) return args;

          /// ========================================================================
          /// Settings
          /// ========================================================================
          const coreSettings = (await req.payload.findGlobal({
            slug: `core`,
          })) as Settings;

          const rewardsProgram: RewardsProgram[] = coreSettings[SettingsKeys.RewardsProgram];
          const pointsPerReferral = Number(coreSettings[SettingsKeys.PointsPerReferral]);
          const pointsPerReferralInvited = Number(
            coreSettings[SettingsKeys.PointsPerReferralInvited],
          );

          /// ========================================================================
          /// INVITED
          /// ========================================================================
          /// check if invited has a referral relationship
          if (pointsPerReferralInvited > 0) {
            /// check if theres a rewards program available
            if (rewardsProgram?.length) {
              rewardsProgram.forEach(async (rewardsProgram: RewardsProgram) => {
                /// create points for the invited referral for each rewards program
                await req.payload.create({
                  collection: `points`,
                  data: {
                    referrals: [],
                    rewardsPointsEarned: pointsPerReferralInvited,
                    user: invitedUser.id,
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
                  user: invitedUser.id,
                },
              });
            }

            /// update the invited referral points since referral is created in user creation
            await req.payload.update({
              collection: `referral`,
              id: invitedReferralDoc.id,
              data: {
                points: pointsPerReferralInvited,
              },
            });

            req.payload.logger.info(
              `Referral points added to user ${invitedUser.id} with ${pointsPerReferralInvited} points`,
            );
          }

          /// ========================================================================
          /// INVITER
          /// ========================================================================

          /// update the inviter referral points
          await req.payload.update({
            collection: `referral`,
            id: inviterReferralDoc.id,
            data: {
              points: Number(inviterReferralDoc.points || 0) + pointsPerReferral,
            },
          });

          /// check if theres a rewards program available
          if (!rewardsProgram?.length) {
            const inviterPointsDocs = await req.payload.find({
              collection: `points`,
              where: {
                and: [
                  {
                    user: {
                      equals: inviterReferralDocUser.id,
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

            /// theres just one that is not assigned to a rewards program
            const inviterPointsDoc = inviterPointsDocs.docs?.[0] as unknown as Points;

            /// if already exist update
            if (inviterPointsDoc) {
              /// prepare points and get old referrals
              const rewardsPointsEarned = Number(inviterPointsDoc.rewardsPointsEarned);
              const newPoints = rewardsPointsEarned + pointsPerReferral;
              const referrals = inviterPointsDoc.referrals || [];

              /// use already exist this referal, dont add again (skip duplicated referrations)
              if (
                !referrals.some(
                  referral => (referral.referral as ReferralEntity).id === invitedUser.id,
                )
              ) {
                /// update the points
                await req.payload.update({
                  collection: `points`,
                  id: inviterPointsDoc.id,
                  data: {
                    rewardsPointsEarned: newPoints,
                    referrals: [
                      {
                        referral: invitedUser.id,
                        rewardsPointsEarned: pointsPerReferral,
                      },
                    ].concat(
                      referrals.map(referralData => {
                        return {
                          referral: (referralData.referral as ReferralEntity).id,
                          rewardsPointsEarned: referralData.rewardsPointsEarned,
                        };
                      }),
                    ),
                  },
                });
              }
            } else {
              /// if points not exist yet, create one and attach the referral
              await req.payload.create({
                collection: `points`,
                data: {
                  referrals: [{ referral: invitedUser.id, rewardsPointsEarned: pointsPerReferral }],
                  rewardsPointsEarned: pointsPerReferral,
                  user: inviterReferralDocUser.id,
                },
              });
            }
          } else {
            rewardsProgram.forEach(async (rewardsProgram: RewardsProgram) => {
              /// get user points data
              const inviterPointsDocs = await req.payload.find({
                collection: `points`,
                where: {
                  and: [
                    {
                      user: {
                        equals: inviterReferralDocUser.id,
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

              /// theres only one point doc per rewards program
              const inviterPointsDoc = inviterPointsDocs.docs?.[0] as unknown as Points;

              /// check if points already exist
              if (inviterPointsDoc) {
                ///if exist, update each of them
                /// prepare points and get old referrals
                const rewardsPointsEarned = Number(inviterPointsDoc.rewardsPointsEarned);
                const newPoints = rewardsPointsEarned + pointsPerReferral;
                const referrals = inviterPointsDoc.referrals || [];

                /// use already exist this referal, dont add again
                if (
                  !referrals.some(
                    referral => (referral.referral as ReferralEntity).id === invitedUser.id,
                  )
                ) {
                  /// update the points
                  await req.payload.update({
                    collection: `points`,
                    id: inviterPointsDoc.id,
                    data: {
                      rewardsPointsEarned: newPoints,
                      referrals: [
                        {
                          referral: invitedUser.id,
                          rewardsPointsEarned: pointsPerReferral,
                        },
                      ].concat(
                        referrals.map(referralData => {
                          return {
                            referral: (referralData.referral as ReferralEntity).id,
                            rewardsPointsEarned: referralData.rewardsPointsEarned,
                          };
                        }),
                      ),
                    },
                  });
                }
              } else {
                /// if not exist yet to this rewardsProgram, create one and attach the referral
                await req.payload.create({
                  collection: `points`,
                  data: {
                    referrals: [
                      { referral: invitedUser.id, rewardsPointsEarned: pointsPerReferral },
                    ],
                    rewardsPointsEarned: pointsPerReferral,
                    user: inviterReferralDocUser.id,
                    rewardsProgram: rewardsProgram.id,
                  },
                });
              }
            });
          }

          req.payload.logger.info(
            `Referral points added to user ${inviterReferralDocUser.id} with ${pointsPerReferral} points`,
          );

          return args;
        } catch (error) {
          const msg = error instanceof Error ? error.message : error;
          req.payload.logger.error(`Error setting referral: ${msg}`);
          return args;
        }
      },
    ],
  };
};
