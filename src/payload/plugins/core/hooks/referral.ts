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

        const user = args?.req?.user as unknown as User;
        if (!user) return args;

        /// check if user has a referral relationship
        const referral = await req.payload.find({
          collection: `referral`,
          where: {
            user: { equals: user.id },
          },
        });

        /// if already have a referral relationship, return
        if (referral.docs?.length) {
          return args;
        }

        /// prepare user user
        const userData: Partial<ReferralEntity> = {
          user: user.id,
          referralCode: crypto.randomUUID(),
          invitationReferralCode: undefined,
        };

        /// get referral code from cookies and set for user referral
        const cookieWithReferralFromInviter = new Cookies(req, null);
        const invitationReferralCode = cookieWithReferralFromInviter.get(`referral`);

        if (invitationReferralCode) {
          const inviterReferralDoc = await req.payload.find({
            collection: `referral`,
            where: {
              referralCode: { equals: invitationReferralCode },
            },
          });

          const inviterReferral = inviterReferralDoc.docs[0];

          if (inviterReferral) {
            userData.invitationReferralCode = inviterReferral.id as string;
          }
        }

        /// create referral data
        const invitedReferralDoc = (await req.payload.create({
          collection: `referral`,
          data: userData,
        })) as unknown as ReferralEntity;

        try {
          /// ========================================================================
          /// Initial Referral Data
          /// ========================================================================
          const invitedUser = user;

          /// check if user have referral relationship
          // const invitedReferralDocs = await req.payload.find({
          //   collection: `referral`,
          //   where: {
          //     user: { equals: invitedUser.id },
          //   },
          // });

          /// get invited referral doc
          // const invitedReferralDoc = invitedReferralDocs.docs?.[0] as unknown as ReferralEntity;

          /// if empty just return result
          if (!invitedReferralDoc) return args;

          /// get inviter referral code
          const inviterReferralDoc =
            invitedReferralDoc.invitationReferralCode as unknown as ReferralEntity;

          /// if theres no invitation, just return result
          if (!inviterReferralDoc?.id) return args;

          const inviterReferralDocwUser = inviterReferralDoc?.user as unknown as User;

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
                      equals: inviterReferralDocwUser.id,
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
                  user: inviterReferralDocwUser.id,
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
                        equals: inviterReferralDocwUser.id,
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

              const inviterPointsDoc = inviterPointsDocs.docs?.[0] as unknown as Points;

              /// check if points already exist
              if (inviterPointsDocs) {
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
                    user: inviterReferralDocwUser.id,
                    rewardsProgram: rewardsProgram.id,
                  },
                });
              }
            });
          }

          req.payload.logger.info(
            `Referral points added to user ${inviterReferralDocwUser.id} with ${pointsPerReferral} points`,
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
