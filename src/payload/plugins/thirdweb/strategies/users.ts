import type { IncomingAuthType } from 'payload/auth';

import { ThirdwebStrategy } from '../config/ThirdwebStrategy';

export type StrategiesParams = {
  strategies: IncomingAuthType['strategies'];
  strategy: ThirdwebStrategy;
};

export const strategies = ({
  strategies = [],
  strategy,
}: StrategiesParams): IncomingAuthType['strategies'] => {
  return [
    ...strategies,
    {
      name: ThirdwebStrategy.name,
      strategy: ctx => {
        /**
         * Todo:
         * Strategy already has payload instance, we should keep the current context instance to avoid missleading data?
         */
        strategy.payload = ctx;
        return strategy;
      },
    },
  ];
};
