'use client';

import React from 'react';
import { ThirdwebProvider } from 'thirdweb/react';

import SignInButton from './SignInButton';

export const Provider = () => {
  return (
    <ThirdwebProvider>
      <SignInButton />
    </ThirdwebProvider>
  );
};

export default Provider;
