import type { DeployCollection } from './deploy-collection';
import type { MintCollection } from './mint-collection';

import { deployCollection } from './deploy-collection';
import { mintCollection } from './mint-collection';
import { type Users } from './users';
import { users } from './users';

export type { DeployCollection, MintCollection, Users };

export const collections = {
  deployCollection,
  users,
  mintCollection,
};
