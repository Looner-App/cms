import type { Access } from 'payload/config';

import { checkRole } from '../utilities';

export const adminsOrPublished: Access = ({ req: { user } }) => {
  if (user && checkRole([`admin`], user)) {
    return true;
  }

  return {
    _status: {
      equals: `published`,
    },
  };
};
