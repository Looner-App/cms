'use client';
import React from 'react';
import { ConnectButton } from 'thirdweb/react';

import { createClient } from '../client';
import { allowedChains } from '../config';
import { wallets } from '../wallets';

export const SignInButton = () => {
  const client = createClient({
    clientId: process.env.PAYLOAD_PUBLIC_THIRDWEB_CLIENT_ID,
  });

  return (
    <div className="bg-azure-blue text-white rounded-lg button-wallet">
      <ConnectButton
        auth={{
          getLoginPayload: async ({ address, chainId }) => {
            const data = await fetch(
              `/api/users/auth_admin?address=${address}&chainId=${chainId}`,
              {
                method: `GET`,
              },
            ).then(res => res.json());

            return data;
          },

          doLogin: async params => {
            const { token } = await fetch(`/api/users/auth_admin`, {
              method: `POST`,
              headers: {
                'Content-Type': `application/json`,
              },
              body: JSON.stringify(params),
            }).then(res => res.json());

            if (token) {
              setTimeout(() => {
                window.history.pushState({}, ``, `/admin`);
                window.history.go(0);
              }, 6000);
            }
          },

          isLoggedIn: async () => {
            const data = await fetch(`/api/users/auth_admin/account`, {
              method: `GET`,
            }).then(res => res.json());

            return data.isLoggedIn;
          },

          doLogout: async () => {
            await fetch(`/api/users/logout`, {
              method: `POST`,
            }).then(res => res.json());
          },
        }}
        chains={allowedChains.map(chain => ({
          name: chain.name,
          id: chain.id,
          rpc: chain.rpcUrls.default.http[0],
          nativeCurrency: chain.nativeCurrency,
          testnet: !!chain.testnet as true, /// PR: https://github.com/thirdweb-dev/js/pull/3338/files,
          blockExplorers: chain.blockExplorers?.default
            ? [
                {
                  name: chain.blockExplorers.default.name,
                  url: chain.blockExplorers.default.url,
                },
              ]
            : [],
        }))}
        client={client}
        connectModal={{
          size: `compact`,
          showThirdwebBranding: false,
        }}
        theme="dark"
        wallets={wallets}
      />
    </div>
  );
};

export default SignInButton;
