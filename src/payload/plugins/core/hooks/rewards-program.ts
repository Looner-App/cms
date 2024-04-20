import type { AfterOperationHook, TypeWithID } from 'payload/dist/collections/config/types';

export type RewardsProgramResult = TypeWithID & {
  rewardProgram: {
    details: {
      pointsPerClaim: number;
    };
  };
};

export const rewardsProgram: AfterOperationHook = async ({ operation, req, result }) => {
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
