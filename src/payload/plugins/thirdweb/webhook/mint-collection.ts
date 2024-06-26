import type { MintCollectioParams, MintCollectionResponse } from '../types';

export const webhook = async ({
  // payload,
  collectionAddress,
  to,
  name,
  description,
  chainId,
}: MintCollectioParams): Promise<MintCollectionResponse> => {
  /// call thirdweb engine to deploy a contract
  const result = await fetch(
    `${process.env.THIRDWEB_ENGINE_URL}/contract/${chainId}/${collectionAddress}/erc721/mint-to`,
    {
      method: `POST`,
      headers: {
        'Content-Type': `application/json`,
        Authorization: `Bearer ` + process.env.THIRDWEB_ACCESS_TOKEN,
        /// todo: get it from global or collections
        'x-backend-wallet-address': process.env.THIRDWEB_BACKEND_WALLET,
      },
      body: JSON.stringify({
        receiver: to,
        metadata: {
          name,
          description,
        },
        metadataWithSupply: {
          supply: `1`,
        },
      }),
    },
  );

  const data = await result.json();

  return data.result;
};
