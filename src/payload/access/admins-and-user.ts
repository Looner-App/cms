import type { AccessArgs } from 'payload/types';

import { checkRole } from '../utilities/check-role';

export const adminsAndUser = ({ id, req: { user } }: AccessArgs) => {
  if (user) {
    // Admin can access
    if (checkRole([`admin`], user)) {
      return true;
    }

    // Only current user can access theirself data
    if (id === user.id) {
      return true;
    }
  }

  return false;
};
