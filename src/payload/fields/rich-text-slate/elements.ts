import type { RichTextElement } from '@payloadcms/richtext-slate';

import { richTextLabel, richTextLargeBody } from './custom-elements';

export type CustomRichTextElement = `h` | `label` | `large-body` | RichTextElement;

export const defaultElements: CustomRichTextElement[] = [
  `h1`,
  `h2`,
  `h3`,
  `h4`,
  `h5`,
  `h6`,
  `ol`,
  `ul`,
  `link`,
];

export const mappingCustomElements = (elements: CustomRichTextElement[]) => {
  const mappedElements: RichTextElement[] = [];

  elements.forEach(element => {
    switch (element) {
      case `h`:
        mappedElements.push(`h1`, `h2`, `h3`, `h4`, `h5`, `h6`);
        break;
      case `label`:
        mappedElements.push(richTextLabel);
        break;
      case `large-body`:
        mappedElements.push(richTextLargeBody);
        break;
      default:
        mappedElements.push(element);
        break;
    }
  });

  return mappedElements;
};
