import type { TypeWithID } from 'payload/types';

export enum SettingsKeys {
  PointsPerReferral = `pointsPerReferral`,
  RewardsProgram = `rewardsProgram`,
}

export type Settings = TypeWithID &
  Record<string, unknown> & {
    [key in SettingsKeys]: any;
  };
