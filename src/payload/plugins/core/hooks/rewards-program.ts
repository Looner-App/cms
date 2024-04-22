import type { CollectionAfterOperationHook, CollectionConfig, TypeWithID } from 'payload/types';

export type RewardsProgramResult = TypeWithID & {
  rewardProgram: {
    details: {
      pointsPerClaim: number;
    };
  };
};

export type RewardsProgram = {
  hooks: CollectionConfig['hooks'];
};

export const rewardsProgramUpdate: CollectionAfterOperationHook = async ({
  operation,
  req,
  result,
}) => {
  if (operation === `create`) {
    const categoryId = result.category as string;

    if (!result.category) return result;

    const rewardsProgramCategory = await req.payload.findByID({
      collection: `categories`,
      id: categoryId,
    });

    const {
      rewardProgram: {
        details: { pointsPerClaim },
      },
    } = rewardsProgramCategory as RewardsProgramResult;

    await req.payload.update({
      collection: `items`,
      where: {
        id: { equals: result.id },
      },
      data: {
        rewardsPointsEarned: pointsPerClaim,
      },
    });
  }

  return result;
};

export const rewardsProgram = ({ hooks }: RewardsProgram): CollectionConfig['hooks'] => {
  return {
    ...hooks,
    afterOperation: [...(hooks?.afterOperation || []), rewardsProgramUpdate],
  };
};
