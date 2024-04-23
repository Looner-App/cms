import type { Block } from 'payload/types';

import { richTextSlate, sectionID } from '../../fields';

export const cards: Block = {
  slug: `cards`,
  fields: [
    sectionID(),
    richTextSlate({
      name: `title`,
      elements: [`h`, `link`],
    }),
    richTextSlate({
      name: `description`,
      elements: [`h`, `link`],
    }),
    {
      type: `array`,
      name: `cardsList`,
      label: `Cards`,
      labels: {
        singular: `Card`,
        plural: `Cards`,
      },
      fields: [
        {
          type: `text`,
          name: `title`,
          label: `Title`,
          required: true,
        },
        {
          type: `textarea`,
          name: `description`,
          label: `Description`,
          required: true,
        },
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
    },
  ],
};
