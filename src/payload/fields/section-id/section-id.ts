import type { Field } from 'payload/types';

import deepMerge from '../../utilities/deep-merge';

export type SectionID = (overrides?: Partial<Field>) => Field;

export const sectionID: SectionID = overrides =>
  deepMerge<Field, Partial<Field>>(
    {
      name: `sectionID`,
      label: `Section ID`,
      type: `text`,
      validate: value => {
        if (value && !/^[\w-]+$/.test(value)) {
          return `Field should only using alphanumeric and -`;
        }

        return true;
      },
    },
    overrides,
  );
