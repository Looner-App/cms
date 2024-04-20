import type { Block } from 'payload/types';

import { richTextSlate, sectionID } from '../../fields';
import Image from './preview.jpg';

export const textContent: Block = {
  slug: `text-content`,
  imageURL: `${Image}`,
  fields: [
    sectionID(),
    richTextSlate({
      name: `content`,
    }),
  ],
};
