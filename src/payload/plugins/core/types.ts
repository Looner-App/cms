import type { TypeWithID } from 'payload/types';

export enum SettingsKeys {
  PointsPerReferral = `pointsPerReferral`,
}

export type Settings = TypeWithID &
  Record<string, unknown> & {
    [key in SettingsKeys]: number | string;
  };
