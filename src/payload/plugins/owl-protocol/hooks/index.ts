import { createUser } from './create-user';
import { deployCollection } from './deploy-collection';
import { mintCollection } from './mint-collection';

export const hooks = {
  deployCollection,
  mintCollection,
  createUser,
};
