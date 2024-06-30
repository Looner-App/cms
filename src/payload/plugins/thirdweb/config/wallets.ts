import { createWallet, inAppWallet, walletConnect } from 'thirdweb/wallets';

export const wallets = [
  createWallet(`io.metamask`),
  inAppWallet({
    auth: {
      options: [`email`, `google`],
    },
  }),
  walletConnect(),
];

export default wallets;
