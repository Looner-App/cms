import type { Config } from 'payload/config';
import type { BeforeDuplicate, CollectionConfig } from 'payload/types';

interface PluginConfig {
  collections: Array<CollectionConfig['slug']>;
}

const format = (val: string): string =>
  val
    .replace(/ /g, `-`)
    .replace(/[^\w-]+/g, ``)
    .toLowerCase();

const beforeDuplicate: BeforeDuplicate = ({ data }) => {
  return {
    ...data,
    title: `${data.title} Copy`,
    slug: null,
  };
};

export const slugHandler =
  (pluginConfig: PluginConfig) =>
  (config: Config): Config => {
    return {
      ...config,
      collections:
        config.collections?.map(collection => {
          const { slug } = collection;
          const isEnabled = pluginConfig?.collections?.includes(slug);

          // console.log(collection);

          if (isEnabled) {
            return {
              ...collection,
              admin: {
                ...collection?.admin,
                hooks: {
                  ...collection?.admin?.hooks,
                  beforeDuplicate,
                },
              },
              hooks: {
                ...collection?.hooks,
                beforeChange: [
                  ...(collection?.hooks?.beforeChange || []),
                  ({ data }) => {
                    if (typeof data?.slug !== `undefined`) {
                      const slugs = data?.slug.split(`-`);
                      if (
                        slugs[slugs.length - 1] === `copy` ||
                        data?.slug === null ||
                        data?.slug === ``
                      ) {
                        data.slug = format(data?.title);
                      }
                    }
                  },
                ],
              },
              fields: [...(collection?.fields || [])],
            };
          }

          return collection;
        }) || [],
    };
  };
