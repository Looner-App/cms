import type { DeployCollectionParams, DeployCollectionResponse } from '../types';

export const webhook = async ({
  // payload,
  chainId,
  name,
  symbol,
}: DeployCollectionParams): Promise<DeployCollectionResponse> => {
  /// call thirdweb engine to deploy a contract
  const result = await fetch(
    `${process.env.THIRDWEB_ENGINE_URL}/deploy/${chainId}/prebuilts/nft-collection`,
    {
      method: `POST`,
      headers: {
        'Content-Type': `application/json`,
        Authorization: `Bearer ` + process.env.THIRDWEB_ACCESS_TOKEN,
        /// todo: get it from global or collections
        'x-backend-wallet-address': process.env.THIRDWEB_BACKEND_WALLET,
      },
      body: JSON.stringify({
        contractMetadata: {
          name,
          symbol,
        },
      }),
    },
  );

  const data = await result.json();

  return data.result;
};
