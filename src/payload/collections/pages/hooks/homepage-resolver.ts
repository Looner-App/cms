import type { PayloadRequest } from 'payload/types';

import type { Page } from '../../../payload-types';

import { checkRole } from '../../../utilities';

/**
 * This homepage resolver is a function that get a slug from a preMiddleware, and remove the actual slug
 * It is intended to make sure the slug of homepage empty on the API
 * @returns Page
 */

export const homepageResolver = ({
  doc,
  req: { payload, user },
}: {
  doc: Page;
  req: PayloadRequest;
}): Page => {
  if (!checkRole([`admin`], user) && doc.id === payload.config.custom.slugHomepage) {
    doc.slug = ``;
  }

  return doc;
};
