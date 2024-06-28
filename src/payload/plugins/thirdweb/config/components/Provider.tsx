'use client';

import React from 'react';
import { ThirdwebProvider } from 'thirdweb/react';

export const Provider = ({ children }: any) => {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
};

export default Provider;
