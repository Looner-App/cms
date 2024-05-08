import type { CreateUser } from './create-user';
import type { DeployCollection } from './deploy-collection';
import type { GetUser } from './get-user';
import type { MintCollection } from './mint-collection';

import { createUser } from './create-user';
import { deployCollection } from './deploy-collection';
import { getUser } from './get-user';
import { mintCollection } from './mint-collection';

export type { CreateUser, DeployCollection, GetUser, MintCollection };

/// todo: try to use owlprotocol/core-trpc package
export const webhook = {
  deployCollection,
  mintCollection,
  getUser,
  createUser,
};
