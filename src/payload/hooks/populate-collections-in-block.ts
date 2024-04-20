import type { PayloadRequest } from 'payload/types';

export interface PopulateCollectionsInBlock {
  args: {
    doc: any;
    req: PayloadRequest;
  };
  blockType: string;
  collection: string;
  limit?: number;
  sort?: string;
}

export const populateCollectionsInBlock = async ({
  args,
  blockType,
  collection,
  limit,
  sort,
}: PopulateCollectionsInBlock) => {
  const {
    doc,
    req: { payload },
  } = args;

  if (!Object.keys(payload.collections).includes(collection)) {
    payload.logger.error(
      `\n***\nCollection ${collection} is not exist! \nCheck your populate list function. \n***`,
    );
  }

  // TODO: find a way to check if block-type is correctly exist by checking on collections tabs -> layout
  /**
   * Cara 1 : await di setiap looping block, sebenernya ga boleh karena ada query di dalam looping, tapi bakal berguna kalo pake limit dan sort di dalam block-list
   * Cara 2 : query sekali di awal, nanti assign datanya di setiap looping block. Jadi data limit & sort ambil dari archive, lebih aman di query looping. Tapi user ga leluasa buat bikin limit dan sort di setiap block
   */
  if (Object.keys(payload.collections).includes(collection)) {
    for (const layout of doc.layout) {
      // first loop for checking layout
      if (layout.blockType === blockType) {
        const datas = await payload.find({
          collection,
          limit: limit || layout.limit || undefined,
          sort: sort || layout.sort || undefined,
        });

        if (datas.totalDocs <= 0) continue;

        Object.assign(layout, datas);
      }
    }
  }

  return doc;
};
