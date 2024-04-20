import type { RichTextLeaf } from '@payloadcms/richtext-slate';

import { small } from './custom-leaves';

export type CustomRichTextLeaf = `small` | RichTextLeaf;

export const defaultLeaves: CustomRichTextLeaf[] = [
  `bold`,
  `italic`,
  `underline`,
  `strikethrough`,
  `small`,
];

export const mappingCustomLeaves = (leaves: CustomRichTextLeaf[]) => {
  const mappedLeaves: RichTextLeaf[] = [];

  leaves.forEach(leaf => {
    switch (leaf) {
      case `small`:
        mappedLeaves.push(small);
        break;
      default:
        mappedLeaves.push(leaf);
        break;
    }
  });

  return mappedLeaves;
};
