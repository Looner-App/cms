import type { CollectionConfig } from 'payload/types';

/// @todo: does not import as external do it as plugin utility from owl plugin
import { admins } from '../../../access';

export enum DeployCollectionContext {
  Categories,
  DeployCollection,
}

export const deployCollection = (
  fields: CollectionConfig['fields'],
  context: DeployCollectionContext,
): CollectionConfig['fields'] => {
  if (context === DeployCollectionContext.Categories) {
    return [
      ...fields,
      {
        name: `deployedCollection`,
        label: `Deployed collection`,
        type: `relationship`,
        access: {
          update: () => false,
          create: admins,
        },
        relationTo: `deploy-collection`,
      },
    ];
  }
  return [
    ...fields,
    {
      name: `title`,
      label: `Title`,
      type: `text`,
      required: true,
    },
    {
      label: `Collection`,
      type: `tabs`,
      tabs: [
        {
          name: `details`,
          label: `Details`,
          fields: [
            {
              name: `name`,
              label: `Name`,
              type: `text`,
              required: true,
              access: {
                update: () => false,
                create: admins,
              },
            },
            {
              required: true,
              name: `symbol`,
              label: `Symbol`,
              type: `text`,
              access: {
                update: () => false,
                create: admins,
              },
            },
            {
              name: `collectionAddress`,
              label: `Collection Address`,
              type: `text`,
              access: {
                update: () => false,
                create: admins,
              },
              admin: {
                condition: (data, siblingData) => {
                  const collectionAddress = siblingData.collectionAddress;
                  return collectionAddress && data.id;
                },
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
  ];
};
