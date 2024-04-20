import type { ArrayField } from 'payload/dist/fields/config/types';
import type { Field } from 'payload/types';

import deepMerge from '../../utilities/deep-merge';
import { link } from '../link';

type LinkGroupType = (options?: {
  linkAppearanceDefaultValue?: string;
  linkAppearances?: { label: string; value: string }[] | false | string[];
  linkDisableLabel?: boolean;
  linkOverrides?: Record<string, unknown>;
  name?: string;
  overrides?: Partial<ArrayField>;
}) => Field;

export const linkGroup: LinkGroupType = ({
  name,
  overrides = {},
  linkAppearances = false,
  linkAppearanceDefaultValue,
  linkDisableLabel,
  linkOverrides,
} = {}) => {
  const generatedLinkGroup: Field = {
    name: name || `links`,
    type: `array`,
    fields: [
      link({
        appearances: linkAppearances,
        appearanceDefaultValue: linkAppearanceDefaultValue,
        disableLabel: linkDisableLabel,
        overrides: linkOverrides,
      }),
    ],
  };

  return deepMerge(generatedLinkGroup, overrides);
};
