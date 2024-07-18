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
            ({ value }) => {
              if (!value) {
                value = crypto.randomUUID();
              }

              return value;
            },
          ],
          beforeChange: [
            async ({ value, siblingData, req }) => {
              if (!value) {
                value = crypto.randomUUID();

                await req.payload.create({
                  collection: `referral`,
                  data: {
                    title: siblingData.email,
                    referralCode: value,
                  },
                  user: req.user,
                });
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
      type: `text`,
      name: `title`,
      label: `Title`,
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
