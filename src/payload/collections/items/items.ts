import type { CollectionConfig } from 'payload/types';

import randomLocation from 'random-location';
import randomstring from 'randomstring';

import { admins, anyone } from '../../access';
import { richTextSlate } from '../../fields';
import { QrCode } from './qrcode';

export const Items: CollectionConfig = {
  slug: `items`,
  admin: {
    useAsTitle: `title`,
    defaultColumns: [`title`, `category`, `uniqueLink`, `claimedBy`, `claimedAt`, `createdAt`],
    hooks: {
      beforeDuplicate: ({ data }) => {
        return {
          ...data,
          title: `${data.title} Copy`,
          barcode: null,
          uniqueLink: null,
          claimedBy: null,
          claimedAt: null,
        };
      },
    },
  },
  access: {
    read: anyone,
    update: admins,
    create: admins,
    delete: admins,
  },
  hooks: {
    afterOperation: [
      async ({ operation, req, result }) => {
        if (operation === `create`) {
          if (!result.batchCreationCount) return result;

          /// update the first item with #1
          await req.payload.update({
            collection: `items`,
            id: result.id,
            data: {
              title: `${result.title} #1`,
            },
          });

          /// create upcoming items as batch
          for (let i = 1; i < Number(result.batchCreationCount); i++) {
            const lng = result.location[0];
            const lat = result.location[1];

            const randomRadiusLocation = randomLocation.randomCirclePoint(
              {
                latitude: lat,
                longitude: lng,
              },
              100000,
              Math.random,
            );

            await req.payload.create({
              collection: `items`,
              data: {
                /// copy all fields
                title: `${result.title} #${i + 1}`,
                publicUniqueLink: result.publicUniqueLink,
                category: result.category,
                location: [randomRadiusLocation.longitude, randomRadiusLocation.latitude],
                image: result.image,
                desc: result.desc,
              },
            });
          }
        }

        return result;
      },
    ],
  },
  fields: [
    {
      name: `title`,
      type: `text`,
      required: true,
    },
    {
      name: `category`,
      type: `relationship`,
      relationTo: `categories`,
      required: true,
    },
    {
      name: `barcode`,
      type: `text`,
      unique: true,
      access: {
        read: admins,
      },
      admin: {
        readOnly: true,
        position: `sidebar`,
        description: `The code will autogenerate`,
      },
      hooks: {
        afterRead: [
          ({ value, siblingData }) => {
            if (!value) {
              value = randomstring.generate({
                charset: `${siblingData.id}${new Date().getTime()}`,
              });
            }

            return value;
          },
        ],
        beforeChange: [
          ({ value, siblingData }) => {
            if (!value) {
              value = randomstring.generate({
                charset: `${siblingData.id}${new Date().getTime()}`,
              });
            }

            return value;
          },
        ],
      },
    },
    {
      name: `uniqueLink`,
      type: `text`,
      unique: true,
      access: {
        read: ({ req, siblingData }) => {
          if (siblingData?.publicUniqueLink) {
            return true;
          }
          return admins({ req });
        },
      },
      admin: {
        position: `sidebar`,
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) => {
            if (siblingData.barcode) {
              value = `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/claim/${siblingData.barcode}`;
            }

            return value;
          },
        ],
        afterRead: [
          ({ value, siblingData }) => {
            if (siblingData.barcode) {
              value = `${process.env.PAYLOAD_PUBLIC_FRONTEND_URL}/claim/${siblingData.barcode}`;
            }

            return value;
          },
        ],
      },
    },
    {
      name: `publicUniqueLink`,
      type: `checkbox`,
      label: `Public Unique Link`,
      admin: {
        position: `sidebar`,
      },
    },
    {
      name: `batchCreation`,
      type: `checkbox`,
      label: `Batch Creation`,
      access: {
        read: admins,
        update: () => false,
        create: admins,
      },
    },
    {
      name: `batchCreationCount`,
      type: `number`,
      label: `Batch Creation Count`,
      admin: {
        condition: (_, siblingData) => {
          return siblingData?.batchCreation;
        },
      },
      access: {
        read: admins,
        update: () => false,
        create: admins,
      },
      validate: value => {
        if (!value) {
          return `Batch Creation Count should not empty`;
        }

        if (value < 1) {
          return `Batch Creation Count should greater than 0`;
        }

        return true;
      },
    },
    {
      name: `barcodeQR`,
      type: `ui`,
      admin: {
        position: `sidebar`,
        components: {
          Field: QrCode,
        },
      },
    },
    /// todo: move to core
    {
      name: `location`,
      type: `point`,
      required: true,
      validate: val => {
        if (!val) {
          return `Latitude and Longitude should not empty`;
        }

        if (val && Array.isArray(val) && val.length === 2) {
          const lng = val[0];
          const lat = val[1];

          if (typeof lng !== `number`) {
            return `Longitude should not empty`;
          }

          if (typeof lat !== `number`) {
            return `Latitude should not empty`;
          }

          if (lng < -180 || lng > 180) {
            return `Longitude should between -180 and 180`;
          }

          if (lat < -90 || lat > 90) {
            return `Latitude should between -90 and 90`;
          }
        }

        return true;
      },
    },
    {
      name: `image`,
      type: `upload`,
      relationTo: `media`,
    },
    {
      name: `marker_3d`,
      type: `upload`,
      relationTo: `media`,
    },
    richTextSlate({
      name: `desc`,
      label: `Description`,
      elements: [`link`],
    }),
    /// todo: move to core
    {
      name: `claimedBy`,
      type: `relationship`,
      relationTo: `users`,
      admin: {
        readOnly: true,
        position: `sidebar`,
      },
    },
    /// todo: move to core
    {
      name: `claimedAt`,
      type: `date`,
      admin: {
        readOnly: true,
        position: `sidebar`,
        date: {
          pickerAppearance: `dayAndTime`,
        },
      },
    },
  ],
};
