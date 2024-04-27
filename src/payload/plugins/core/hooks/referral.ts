import type { AfterOperationHook } from 'payload/dist/collections/config/types';
import type { CollectionConfig } from 'payload/types';

import type { Settings } from '../types';

export type Referral = {
  hooks: CollectionConfig['hooks'];
};

export const referralCreate: AfterOperationHook = async ({ operation, req, result }) => {
  if (operation === `create`) {
    try {
      const invitationReferralCode = result.invitationReferralCode;
      if (!invitationReferralCode) return;

      const inviter = await req.payload.find({
        collection: `users`,
        where: {
          referralCode: { equals: invitationReferralCode },
        },
      });

      inviter.docs.map(async inviter => {
        const inviterReferralCode = inviter.referralCode;
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

        inviterReferral.docs.map(async inviterReferralData => {
          await req.payload.update({
            collection: `referral`,
            id: inviterReferralData.id,
            data: {
              points: Number(inviterReferralData.points) + Number(coreSettings.pointsPerReferral),
            },
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
