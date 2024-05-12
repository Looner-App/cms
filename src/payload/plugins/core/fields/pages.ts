import type { CollectionConfig } from 'payload/types';

import { flow, map } from 'lodash';

///todo: move to core
import { sectionID } from '../../../fields';

export enum PagesContext {
  Pages,
}

export type Pages = {
  context: PagesContext;
  fields: CollectionConfig['fields'];
};

export const pages = ({ fields, context }: Pages): CollectionConfig['fields'] => {
  if (context === PagesContext.Pages) {
    return flow(
      /// copy fields
      fields => [...fields],
      /// add fields
      fields =>
        map(fields, field => {
          if (field.type === `tabs`) {
            return {
              ...field,
              tabs: map(field.tabs, tab => {
                if (tab.label === `Content`) {
                  return {
                    ...tab,
                    fields: map(tab.fields, tabField => {
                      if (tabField.name === `layout`) {
                        return {
                          ...tabField,
                          blocks: [
                            ...tabField.blocks,

                            {
                              slug: `leaderboard`,
                              fields: [
                                sectionID(),
                                {
                                  name: `rewardsProgram`,
                                  label: `Rewards Program`,
                                  type: `relationship`,
                                  relationTo: `rewards-program`,
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
                      }
                    }),
                  };
                }

                return tab;
              }),
            };
          }

          return field;
        }),
    )(fields);
  }

  return [...fields];
};
