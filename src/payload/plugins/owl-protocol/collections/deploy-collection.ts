import type { Config } from 'payload/config';

import map from 'lodash/map';

/// @todo: does not import as external do it as plugin utility from owl plugin
import { admins, anyone } from '../../../access';
import { fields } from '../fields';
import { DeployCollectionContext } from '../fields/deploy-collection';
import { hooks } from '../hooks';

export type DeployCollection = {
  collections: Config['collections'];
};

export const deployCollection = ({ collections }: DeployCollection): Config['collections'] => {
  const collectionsWitDeployCollection = [
    ...collections,
    {
      slug: `deploy-collection`,
      admin: {
        useAsTitle: `title`,
        defaultColumns: [`title`, `createdAt`, `updatedAt`],
      },
      access: {
        read: anyone,
        update: admins,
        create: admins,
        delete: admins,
      },
      fields: fields.deployCollection([], DeployCollectionContext.DeployCollection),
      hooks: {
        afterOperation: [hooks.deployCollection],
      },
    },
  ];

  return map(collectionsWitDeployCollection, collection => {
    if (collection.slug === `categories`) {
      collection.fields = fields.deployCollection(
        collection.fields,
        DeployCollectionContext.Categories,
      );
    }

    return collection;
  });
};
