import type { GenerateTitle } from '@payloadcms/plugin-seo/types';

import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import nestedDocs from '@payloadcms/plugin-nested-docs';
import redirects from '@payloadcms/plugin-redirects';
import seo from '@payloadcms/plugin-seo';
import { slateEditor } from '@payloadcms/richtext-slate';
import dotenv from 'dotenv';
import path from 'path';
import { buildConfig } from 'payload/config';

import { Categories, Items, Media, Pages, Users } from './collections';
import { NoRobots } from './components/no-robots';
import { claimItem, generateItem, getItem, getSlugs } from './endpoints';
import { Header, Settings } from './globals';
import { slugHandler } from './modules/slug-handler';
import { core, thirdweb } from './plugins';

const generateTitle: GenerateTitle = () => {
  return process.env.PAYLOAD_PUBLIC_SITE_NAME || `Looner`;
};

const generateConfigUrls = () => {
  const urls: string[] = [];
  const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL;
  const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL;

  if (typeof serverUrl === `string` && serverUrl.length > 0) {
    urls.push(serverUrl);
  }

  if (typeof frontendUrl === `string` && frontendUrl.length > 0) {
    urls.push(serverUrl);
  }

  return urls;
};

const getLocaleDefault = () => {
  return process.env.PAYLOAD_PUBLIC_LOCALE_DEFAULT || `en`;
};

const getLocales = () => {
  const locales: Array<{ code: string; label: string }> = [];
  let envLocale = process.env.PAYLOAD_PUBLIC_LOCALE_LIST;

  if (!envLocale || envLocale.length < 0) {
    envLocale = `en:English`;
  }

  envLocale.split(` `).forEach(item => {
    const locale = item.split(`:`);
    locales.push({
      code: locale[0],
      label: locale[1],
    });
  });

  return locales;
};

dotenv.config({
  path: path.resolve(__dirname, `../../.env`),
});

export default buildConfig({
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
    connectOptions:
      process.env.NODE_ENV === `production`
        ? {
            dbName: `looner-cms`,
          }
        : undefined,
  }),
  editor: slateEditor({}),
  admin: {
    bundler: webpackBundler(),
    webpack: config => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          [path.resolve(__dirname, `utilities/plaiceholder`)]: path.resolve(
            __dirname,
            `empty-module-mock.js`,
          ),
          [path.resolve(__dirname, `mjml/generate-mjml`)]: path.resolve(
            __dirname,
            `empty-module-mock.js`,
          ),
        },
      },
    }),
    user: Users.slug,
    components: {
      beforeLogin: [NoRobots],
      beforeDashboard: [],
    },
  },
  email: process.env.SMTP_HOST
    ? {
        fromName: process.env.PAYLOAD_PUBLIC_SITE_NAME,
        fromAddress: process.env.SMTP_FROM_EMAIL,
        transportOptions: {
          host: process.env.SMTP_HOST,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          port: Number(process.env.SMTP_HOST),
          secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false (the default) for 587 and others
          requireTLS: true,
        },
      }
    : undefined,
  /// Todo: move to core
  endpoints: [
    {
      path: `/custom/:collections/get-slugs`,
      method: `get`,
      handler: getSlugs,
    },
    {
      path: `/custom/claim/:barcode`,
      method: `get`,
      handler: getItem,
    },
    {
      path: `/custom/claim/:barcode`,
      method: `patch`,
      handler: claimItem,
    },
    {
      path: `/custom/generate-item`,
      method: `post`,
      handler: generateItem,
    },
  ],
  express: {
    preMiddleware: [
      // inject id of homepage
      async (req, _res, next) => {
        try {
          let homepage = null;
          homepage = await req.payload
            .findGlobal({
              slug: `settings`,
            })
            .then(e => e.homePage.id || null);
          req.payload.config.custom = { homepage };
          next();
        } catch (error) {
          next();
        }
      },
    ],
  },
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  collections: [
    /// Todo: move to core
    Items,
    Categories,
    Pages,
    Media,
    Users,
  ],
  globals: [
    /// Todo: move to core
    Settings,
    Header,
  ],
  localization: {
    defaultLocale: getLocaleDefault(),
    locales: getLocales(),
    fallback: true,
  },
  typescript: {
    declare: false,
    outputFile: path.resolve(__dirname, `payload-types.ts`),
  },
  graphQL: {
    // disabled by default as we rarely use it
    disable: true,
    schemaOutputFile: path.resolve(__dirname, `generated-schema.graphql`),
  },
  cors: process.env.NODE_ENV === `production` ? generateConfigUrls() : `*`,
  csrf: process.env.NODE_ENV === `production` ? generateConfigUrls() : [],
  rateLimit: {
    skip: () => true,
  },
  plugins: [
    redirects({
      collections: [`pages`],
    }),
    nestedDocs({
      collections: [],
    }),
    seo({
      collections: [`pages`],
      generateTitle,
      uploadsCollection: `media`,
    }),
    slugHandler({
      collections: [`pages`],
    }),
    core(),
    thirdweb({
      strategyOptions: {
        clientId: process.env.PAYLOAD_PUBLIC_THIRDWEB_CLIENT_ID,
        domain: process.env.PAYLOAD_PUBLIC_SERVER_URL,
        domainClient: process.env.PAYLOAD_PUBLIC_FRONTEND_URL,
        privateKey: process.env.THIRDWEB_WALLET_PRIVATE_KEY,
        secretKey: process.env.THIRDWEB_SECRET_KEY,
        userDetailsUrl: process.env.THIRDWEB_WALLET_DETAILS_URL,
      },
    }),
  ],
});
