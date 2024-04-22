import type { CollectionConfig } from 'payload/types';

import { map } from 'lodash';

export enum PagesContext {
  Homepage,
}

export type Pages = {
  context: PagesContext;
  fields: CollectionConfig['fields'];
};

export const pages = ({ fields, context }: Pages): CollectionConfig['fields'] => {
  if (context === PagesContext.Homepage) {
    return map(fields, field => {
      if (field.type === `tabs`) {
        return {
          ...field,
          tabs: map(field.tabs, tab => {
            if (tab.label === `Content`) {
              return {
                ...tab,
                fields: map(tab.fields, tabField => {
                  if (tabField.type === `blocks`) {
                    return {
                      ...tabField,
                      blocks: [
                        ...tabField.blocks,
                        {
                          slug: `cards`,
                          fields: [
                            {
                              name: `sectionID`,
                              label: `Section ID`,
                              type: `text`,
                              validate: value => {
                                if (value && !/^[\w-]+$/.test(value)) {
                                  return `Field should only using alphanumeric and -`;
                                }
                                return true;
                              },
                            },
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
                                },
                                {
                                  type: `textarea`,
                                  name: `description`,
                                  label: `Description`,
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
                        },
                      ],
                    };
                  }

                  return tabField;
                }),
              };
            }

            return tab;
          }),
        };
      }

      return field;
    });
  }

  return [...fields];
};
