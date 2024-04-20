import type { Block } from 'payload/types';

import { linkGroup, richTextSlate, sectionID } from '../../fields';
import Image from './preview.jpg';

export const introContent: Block = {
  slug: `intro-content`,
  imageURL: `${Image}`,
  fields: [
    sectionID(),
    {
      type: `row`,
      fields: [
        richTextSlate({
          name: `title`,
          elements: [`h`, `link`],
        }),
        {
          name: `image`,
          type: `upload`,
          relationTo: `media`,
          admin: {
            description: `Transparent png image would be good`,
          },
        },
      ],
    },
    richTextSlate({
      name: `desc`,
      label: `Description`,
      elements: [`link`],
    }),
    linkGroup({
      name: `links`,
      overrides: {
        maxRows: 1,
      },
    }),
  ],
};
