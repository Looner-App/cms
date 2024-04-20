import type { Field, RichTextField } from 'payload/dist/fields/config/types';

import { slateEditor } from '@payloadcms/richtext-slate';
import { startCase } from 'lodash';

import type { CustomRichTextElement } from './elements';
import type { CustomRichTextLeaf } from './leaves';

import deepMerge from '../../utilities/deep-merge';
import { defaultElements, mappingCustomElements } from './elements';
import { defaultLeaves, mappingCustomLeaves } from './leaves';
import { parseDocs, serialize } from './utilities';

type RichTextSlate = (
  overrides: Partial<RichTextField> & {
    elements?: CustomRichTextElement[];
    leaves?: CustomRichTextLeaf[];
    name: string;
  },
) => Field;

export const richTextSlate: RichTextSlate = ({
  name,
  label,
  localized,
  elements,
  leaves,
  ...args
}) => ({
  name,
  label: false,
  localized,
  type: `group`,
  fields: [
    deepMerge<RichTextField, Partial<RichTextField>>(
      {
        name: `slate`,
        label: label || startCase(name),
        type: `richText`,
        required: false,
        editor: slateEditor({
          admin: {
            elements: mappingCustomElements(elements || defaultElements),
            leaves: mappingCustomLeaves(leaves || defaultLeaves),
            // TODO: Add archive link, stuck in admin condition display
            // link: {
            //   fields(args) {
            //     const customFields = [];
            //
            //     args.defaultFields.forEach((field: any) => {
            //       // Override options value
            //       if (field.name === `linkType`) {
            //         field.defaultValue = `internal`;
            //         field.options = [
            //           {
            //             label: `Internal link`,
            //             value: `internal`,
            //           },
            //           {
            //             label: `Archive Link`,
            //             value: `archive`,
            //           },
            //           {
            //             label: `Custom URL`,
            //             value: `custom`,
            //           },
            //         ];
            //       }
            //
            //       if (field.name === `url`) {
            //         // Override admin condition
            //         field.admin = {
            //           condition: (_, siblingData) => siblingData?.linkType === `custom`,
            //         };
            //       }
            //
            //       // FIXME: restrict selected collection
            //       if (field.name === `doc`) {
            //         // Override admin condition
            //         field.admin = {
            //           condition: (_, siblingData) => siblingData?.linkType === `internal`,
            //         };
            //
            //         // Inject field archive link
            //         customFields.push({
            //           name: `archive`,
            //           label: `Archive to link to`,
            //           type: `text`,
            //           admin: {
            //             components: {
            //               Field: ArchiveLink,
            //             },
            //             // condition: (_, siblingData) => {
            //             //   return siblingData?.linkType === `archive`;
            //             // },
            //           },
            //         });
            //       }
            //
            //       customFields.push(field);
            //     });
            //
            //     return customFields;
            //   },
            // },
          },
        }),
      },
      args,
    ),
    {
      name: `html`,
      type: `textarea`,
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          async ({ siblingData }) => {
            const { slate } = siblingData;

            if (
              !slate ||
              (slate.length <= 1 &&
                slate[0].children.length <= 1 &&
                slate[0].children[0].text == ``)
            ) {
              return ``;
            }

            // Parse payload doc string into object
            const slateWithDocs = await parseDocs(slate);

            return serialize(slateWithDocs);
          },
        ],
      },
    },
  ],
});
