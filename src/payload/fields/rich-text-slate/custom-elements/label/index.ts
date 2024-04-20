import type { RichTextCustomElement } from '@payloadcms/richtext-slate';

import Button from './button';
import Element from './element';
import withLabel from './plugin';

export const richTextLabel: RichTextCustomElement = {
  name: `label`,
  Button,
  Element,
  plugins: [withLabel],
};
