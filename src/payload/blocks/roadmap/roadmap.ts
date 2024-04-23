import type { Block } from 'payload/types';

import { sectionID } from '../../fields';

export const roadmap: Block = {
  slug: `roadmap`,
  fields: [
    sectionID(),
    {
      name: `image`,
      type: `upload`,
      relationTo: `media`,
      label: `Image desktop`,
      admin: {
        description: `Transparent png image would be good`,
      },
    },
    {
      name: `imageMobile`,
      type: `upload`,
      relationTo: `media`,
      label: `Image mobile`,
      admin: {
        description: `Transparent png image would be good`,
      },
    },
  ],
};
