import type { AfterOperationHook } from 'payload/dist/collections/config/types';
import type { CollectionConfig } from 'payload/types';

import { type Settings, SettingsKeys } from '../types';

export type Referral = {
  hooks: CollectionConfig['hooks'];
};

export const referralCreate: AfterOperationHook = async ({ operation, req, result }) => {
  if (operation === `create`) {
    try {
      const { invitationReferralCode, id } = result;
      if (!invitationReferralCode) return;

      const inviter = await req.payload.find({
        collection: `users`,
        where: {
          referralCode: { equals: invitationReferralCode },
        },
      });

      inviter.docs.forEach(async user => {
        const inviterReferralCode = user.referralCode;
        if (!inviterReferralCode) return;

        const inviterReferral = await req.payload.find({
          collection: `referral`,
          where: {
            referralCode: { equals: inviterReferralCode },
          },
        });

        const coreSettings = (await req.payload.findGlobal({
          slug: `core`,
        })) as Settings;

        const pointsPerReferral = Number(coreSettings[SettingsKeys.PointsPerReferral]);

        inviterReferral.docs.forEach(async (inviterReferralData: any) => {
          await req.payload.update({
            collection: `referral`,
            id: inviterReferralData.id,
            data: {
              points: Number(inviterReferralData.points) + pointsPerReferral,
            },
          });

          coreSettings[SettingsKeys.RewardsProgram].forEach(async (rewardsProgram: any) => {
            const pointsUser = await req.payload.find({
              collection: `points`,
              where: {
                and: [
                  {
                    user: {
                      equals: user.id,
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
            if (pointsUser.docs.length > 0) {
              /// if already exist, increment the points and save in the claims array the new claim
              const rewardsPointsEarned = Number(pointsUser.docs[0].rewardsPointsEarned);
              const newPoints = rewardsPointsEarned + pointsPerReferral;
              const referrals = (pointsUser.docs[0].referrals || []) as any;

              if (referrals.some((referral: any) => referral.referral.id === id)) {
                throw new Error(`Already referred`);
              }

              await req.payload.update({
                collection: `points`,
                id: pointsUser.docs[0].id,
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
            } else {
              await req.payload.create({
                collection: `points`,
                data: {
                  referrals: [{ referral: id, rewardsPointsEarned: pointsPerReferral }],
                  rewardsPointsEarned: pointsPerReferral,
                  user: user.id,
                  rewardsProgram: rewardsProgram.id,
                },
              });
            }
          });
        });
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : error;
      req.payload.logger.error(`Error setting referral: ${msg}`);
      return result;
    }
  }

  return result;
};

export const referral = ({ hooks }: Referral): CollectionConfig['hooks'] => {
  return {
    ...hooks,
    afterOperation: [...(hooks?.afterOperation || []), referralCreate],
  };
};
