import type { CollectionConfig } from 'payload/types';

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
    return [...fields];
  }

  return [
    ...fields,
    {
      type: `relationship`,
      name: `user`,
      label: `User`,
      relationTo: `users`,
      unique: true,
      admin: {
        position: `sidebar`,
        readOnly: true,
      },
    },
    {
      type: `text`,
      name: `referralCode`,
      unique: true,
      label: `Referral Code`,
      admin: {
        readOnly: true,
        description: `The referral code of user`,
      },
    },
    {
      name: `invitationReferralCode`,
      label: `Invitation Referral Code`,
      relationTo: `referral`,
      type: `relationship`,
      admin: {
        readOnly: true,
        description: `The referral code from inviter`,
      },
      access: {
        update: () => false,
        create: () => false,
        read: () => true,
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
