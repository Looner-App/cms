import type { AfterOperationHook, TypeWithID } from 'payload/dist/collections/config/types';
import type { CollectionConfig } from 'payload/types';

import type { Settings } from '../types';

export type InvitedReferralResult = TypeWithID & {
  points: number;
};

export type Referral = {
  hooks: CollectionConfig['hooks'];
};

export const referralCreate: AfterOperationHook = async ({ operation, req, result }) => {
  if (operation === `create`) {
    const invitationReferralCode = result.invitationReferralCode as string;
    if (!invitationReferralCode) return;

    const inviter = await req.payload.find({
      collection: `users`,
      where: {
        referralCode: { equals: invitationReferralCode },
      },
    });

    inviter.docs.map(async inviter => {
      const inviterReferralCode = inviter.referralCode as string;
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

      inviterReferral.docs.map(async (inviterReferralData: InvitedReferralResult) => {
        const inviterReferralId = inviterReferralData.id as string;
        const inviterReferralPoints = inviterReferralData.points;

        await req.payload.update({
          collection: `referral`,
          where: {
            or: [
              {
                id: { equals: inviterReferralId },
                _id: { equals: inviterReferralId },
              },
            ],
          },
          data: {
            points: inviterReferralPoints + Number(coreSettings.pointsPerReferral),
          },
        });
      });
    });
  }

  return result;
};

export const referral = ({ hooks }: Referral): CollectionConfig['hooks'] => {
  return {
    ...hooks,
    afterOperation: [...(hooks?.afterOperation || []), referralCreate],
  };
};
