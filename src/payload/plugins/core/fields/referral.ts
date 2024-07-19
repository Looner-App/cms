import type { CollectionConfig } from 'payload/types';

import { adminsAndUser } from '../../../access';

export enum ReferralContext {
  Users,
  Referrals,
}

export type Referral = {
  context: ReferralContext;
  fields: CollectionConfig['fields'];
};

export const referral = ({ fields, context }: Referral): CollectionConfig['fields'] => {
  if (context === ReferralContext.Users) {
    return [
      ...fields,
      {
        type: `text`,
        name: `referralCode`,
        label: `Referral Code`,
        unique: true,
        admin: {
          readOnly: true,
          position: `sidebar`,
          description: `The code will autogenerate`,
        },
        hooks: {
          afterRead: [
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async ({ value, req }) => {
              if (!value) {
                // try {
                // /// before, find one item that has the same user
                // const referral = await req.payload.find({
                //   collection: `referral`,
                //   where: {
                //     user: req.user,
                //   },
                // });

                // const foundReferral = referral.docs?.[0]?.referralCode;

                // if (foundReferral) {
                //   value = foundReferral;
                // } else {
                value = crypto.randomUUID();
                // await req.payload.create({
                //       user: req.user,
                //       collection: `referral`,
                //       data: {
                //         user: req.user,
                //         referralCode: value,
                //       },
                //     });
                //   }
                // } catch {
                //   req.payload.logger.info(`error generatin referral code`);
                // }
              }

              return value;
            },
          ],
          beforeChange: [
            async ({ value, req, siblingData }) => {
              if (!value) {
                // try {
                //   /// before, find one item that has the same user
                //   const referral = await req.payload.find({
                //     collection: `referral`,
                //     where: {
                //       user: req.user,
                //     },
                //   });

                //   const foundReferral = referral.docs?.[0]?.referralCode;

                //   if (foundReferral) {
                //     value = foundReferral;
                //   } else {
                value = crypto.randomUUID();
                await req.payload.create({
                  user: req.user,
                  collection: `referral`,
                  data: {
                    user: siblingData.id,
                    referralCode: value,
                  },
                });
                //   }
                // } catch {
                //   req.payload.logger.info(`error generatin referral code`);
                // }
              }

              return value;
            },
          ],
        },
      },
      {
        name: `invitationReferralCode`,
        label: `Invitation Referral Code`,
        type: `text`,
        admin: {
          position: `sidebar`,
        },
        access: {
          update: () => false,
          create: adminsAndUser,
          read: () => true,
        },
      },
    ];
  }

  return [
    ...fields,

    {
      type: `relationship`,
      name: `user`,
      label: `User`,
      relationTo: `users`,
      admin: {
        position: `sidebar`,
      },
    },
    {
      type: `text`,
      name: `referralCode`,
      label: `Referral Code`,
      admin: {
        readOnly: true,
      },
    },
    {
      type: `number`,
      name: `points`,
      label: `Points`,
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
  ];
};
