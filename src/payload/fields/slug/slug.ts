import type { Field } from 'payload/types';

import deepMerge from '../../utilities/deep-merge';
import formatSlug from '../../utilities/format-slug';

export type Slug = (options?: { fieldToUse?: string; overrides?: Partial<Field> }) => Field;

export const slug: Slug = ({ fieldToUse = `title`, overrides = {} } = {}) =>
  deepMerge<Field, Partial<Field>>(
    {
      name: `slug`,
      type: `text`,
      index: true,
      admin: {
        position: `sidebar`,
      },
      hooks: {
        beforeValidate: [formatSlug(fieldToUse)],
      },
    },
    overrides,
  );
