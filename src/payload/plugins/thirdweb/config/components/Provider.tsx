'use client';

import type { HTMLProps } from 'react';

import React from 'react';
import { ThirdwebProvider } from 'thirdweb/react';

export const Provider = ({ children }: HTMLProps<HTMLDivElement>) => {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
};
