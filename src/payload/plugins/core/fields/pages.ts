import type { CollectionConfig } from 'payload/types';

export enum PagesContext {
  Homepage,
}

export type Pages = {
  context: PagesContext;
  fields: CollectionConfig['fields'];
};

export const pages = ({ fields, context }: Pages): CollectionConfig['fields'] => {
  if (context === PagesContext.Homepage) {
    return [...fields];
  }

  return [...fields];
};
