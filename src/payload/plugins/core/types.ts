import type { TypeWithID } from 'payload/types';

export enum SettingsKeys {
  PointsPerReferral = `pointsPerReferral`,
  PointsPerReferralInvited = `pointsPerReferralInvited`,
  RewardsProgram = `rewardsProgram`,
}

export type Settings = TypeWithID &
  Record<string, unknown> & {
    [key in SettingsKeys]: any;
  };
