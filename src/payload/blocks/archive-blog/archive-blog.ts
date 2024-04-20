import type { Block } from 'payload/types';

import Label from 'payload/dist/admin/components/forms/Label';
import React from 'react';

import { sectionID } from '../../fields';
import Image from './preview.jpg';

/**
 * Archive Blog
 * This one is only used on a Global -> Archive to show all and handling pagination if needed
 * If you wanted to create kind of Featured Blog that limit 3 blog on the top create it by yourself!
 */

export const archiveBlog: Block = {
  slug: `archive-blog`,
  imageURL: `${Image}`,
  fields: [
    sectionID(),
    {
      name: `uiOnly`,
      type: `ui`,
      admin: {
        components: {
          Field: () =>
            React.createElement(Label, {
              label: `Note: on this blocks you don't need to think about which to choose as the data is pulled from Archive`,
            }),
        },
      },
    },
    {
      type: `relationship`,
      name: `docs`,
      label: `Docs`,
      relationTo: `blogs`,
      hasMany: true,
      admin: {
        disabled: true,
        description: `This field is auto-populated after-read`,
      },
    },
    {
      type: `number`,
      name: `totalDocs`,
      admin: {
        disabled: true,
        description: `This field is auto-populated after-read`,
      },
    },
    {
      type: `number`,
      name: `limit`,
      admin: {
        disabled: true,
        description: `This field is auto-populated after-read`,
      },
    },
    {
      type: `number`,
      name: `totalPages`,
      admin: {
        disabled: true,
        description: `This field is auto-populated after-read`,
      },
    },
    {
      type: `number`,
      name: `page`,
      admin: {
        disabled: true,
        description: `This field is auto-populated after-read`,
      },
    },
    {
      type: `number`,
      name: `pagingCounter`,
      admin: {
        disabled: true,
        description: `This field is auto-populated after-read`,
      },
    },
    {
      type: `checkbox`,
      name: `hasPrevPage`,
      admin: {
        disabled: true,
        description: `This field is auto-populated after-read`,
      },
    },
    {
      type: `checkbox`,
      name: `hasNextPage`,
      admin: {
        disabled: true,
        description: `This field is auto-populated after-read`,
      },
    },
    {
      type: `number`,
      name: `prevPage`,
      admin: {
        disabled: true,
        description: `This field is auto-populated after-read`,
      },
    },
    {
      type: `number`,
      name: `nextPage`,
      admin: {
        disabled: true,
        description: `This field is auto-populated after-read`,
      },
    },
  ],
};
