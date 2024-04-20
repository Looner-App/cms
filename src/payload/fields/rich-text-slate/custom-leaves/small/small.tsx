import { type RichTextCustomLeaf } from '@payloadcms/richtext-slate';

import { ButtonSmall } from './button';
import { Small } from './component';

export const small: RichTextCustomLeaf = {
  name: `small`,
  Button: ButtonSmall,
  Leaf: Small,
};
