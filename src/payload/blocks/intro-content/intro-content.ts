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
        {
          type: `select`,
          name: `imagePosition`,
          label: `Image Position`,
          defaultValue: `right`,
          admin: {
            condition: (_, siblingData) => !!siblingData?.image,
            description: `Position of the image relative to the text`,
          },
          options: [
            {
              label: `Left`,
              value: `left`,
            },
            {
              label: `Right`,
              value: `right`,
            },
          ],
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
    {
      type: `select`,
      name: `cardVariant`,
      label: `Card Variant`,
      defaultValue: `default`,
      admin: {
        description: `Choose the variant for the card.`,
      },
      options: [
        {
          label: `Default`,
          value: `default`,
        },

        {
          label: `Primary`,
          value: `primary`,
        },

        {
          label: `Secondary`,
          value: `secondary`,
        },
      ],
    },
  ],
};
