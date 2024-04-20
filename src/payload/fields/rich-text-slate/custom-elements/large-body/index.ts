import type { RichTextCustomElement } from '@payloadcms/richtext-slate';

import Button from './button';
import Element from './element';
import withLargeBody from './plugin';

export const richTextLargeBody: RichTextCustomElement = {
  name: `large-body`,
  Button,
  Element,
  plugins: [withLargeBody],
};
