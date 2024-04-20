import type { Block } from 'payload/types';

import { richTextSlate, sectionID } from '../../fields';
import Image from './preview.jpg';

export const mapItems: Block = {
  slug: `map-items`,
  imageURL: `${Image}`,
  fields: [
    sectionID(),
    richTextSlate({
      name: `title`,
      elements: [`h`, `link`],
      admin: {
        description: `The map marker will autogenerate from collections > items`,
      },
    }),
  ],
};
