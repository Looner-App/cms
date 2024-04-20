import type { PayloadHandler } from 'payload/config';

/**
 * This endpoint is used to get all the slug on each post
 * Useful for generateStaticParams for Nextjs
 */

export const getSlugs: PayloadHandler = async (req, res, next) => {
  try {
    const collections = req.params.collections || null;

    // if (!req.payload?.collections.hasOwnProperty(collections))
    if (!Object.prototype.hasOwnProperty.call(req.payload.collections, collections))
      throw new Error(`getSLugs Custom API: Total docs 0`);

    const datas = await req.payload.find({
      collection: collections,
      // false pagination to get all the data in one query
      pagination: false,
    });

    if (datas.totalDocs <= 0) throw new Error(`getSlugs Custom API: Total docs 0`);

    const slugs = datas.docs.map((data: any) => {
      // if (!data.hasOwnProperty(`slug`)) data.slug = ``;
      if (!Object.prototype.hasOwnProperty.call(data, `slug`)) data.slug = ``;

      return {
        title: data.title,
        slug: data.slug || ``,
      };
    });

    res.json(slugs);
  } catch (error) {
    next(error);
  }
};
