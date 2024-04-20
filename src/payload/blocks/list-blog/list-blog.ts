import type { Block } from 'payload/types';

import Label from 'payload/dist/admin/components/forms/Label';
import React from 'react';

import { sectionID } from '../../fields';
import Image from './preview.jpg';

/**
 * List Blog
 * This one is used for a block that needs a functionalities to list several post
 * Example: you create a homepage, and in this homepage you have a list of 3 blog with a button of See All
 * You will need to create a list blog and need to use our helper to automatically populate data to your block
 */

export const listBlog: Block = {
  slug: `list-blog`,
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
              label: `Note: on this blocks you don't need to think about which to choose as the data is pulled from Blog`,
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
