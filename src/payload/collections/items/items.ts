import type { CollectionConfig } from 'payload/types';

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
        read: admins,
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
      name: `barcodeQR`,
      type: `ui`,
      admin: {
        position: `sidebar`,
        components: {
          Field: QrCode,
        },
      },
    },
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
    richTextSlate({
      name: `desc`,
      label: `Description`,
      elements: [`link`],
    }),
    {
      name: `claimedBy`,
      type: `relationship`,
      relationTo: `users`,
      admin: {
        readOnly: true,
        position: `sidebar`,
      },
    },
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
