import type { Block } from 'payload/types';

import { richTextSlate, sectionID } from '../../fields';
import Image from './preview.jpg';

export const arExperience: Block = {
  slug: `ar-experience`,
  imageURL: `${Image}`,
  fields: [
    sectionID(),
    richTextSlate({
      name: `title`,
      elements: [`h`, `link`],
      admin: {
        description: `You don't need to config anything here, the AR experience will autogenerate`,
      },
    }),
  ],
};
