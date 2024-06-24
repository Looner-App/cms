import type { DeployCollectionParams, DeployCollectionResponse } from '../types';

export const deployCollection = async ({
  // payload,
  chainId,
  name,
  symbol,
}: DeployCollectionParams): Promise<DeployCollectionResponse> => {
  /// call thirdweb engine to deploy a contract
  const result = await fetch(`http://localhost:3005/deploy/${chainId}/prebuilts/nft-collection`, {
    method: `POST`,
    headers: {
      'Content-Type': `application/json`,
      Authorization: `Bearer ` + process.env.THIRDWEB_ACCESS_TOKEN,
      /// todo: get it from global or collections
      'x-backend-wallet-address': `0x9a5D0fc8da84F86e06A761EA26466a5d67390bcE`,
    },
    body: JSON.stringify({
      contractMetadata: {
        name,
        symbol,
      },
    }),
  });

  const data = await result.json();

  return data.result;
};
