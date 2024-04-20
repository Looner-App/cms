import type { BeforeChangeHook } from 'payload/dist/globals/config/types';

export const populateGlobalsPublishedDate: BeforeChangeHook = ({ data, req }) => {
  if (req.body && !req.body.publishedDate) {
    const now = new Date();
    return {
      ...data,
      publishedDate: now,
    };
  }

  return data;
};
