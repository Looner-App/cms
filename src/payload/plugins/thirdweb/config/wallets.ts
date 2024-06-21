import { createWallet, inAppWallet, walletConnect } from 'thirdweb/wallets';

export const wallets = [
  createWallet(`io.metamask`),
  createWallet(`com.coinbase.wallet`, {
    walletConfig: {
      options: `smartWalletOnly`,
    },
  }),
  inAppWallet({
    auth: {
      options: [`email`, `google`],
    },
  }),
  walletConnect(),
];

export default wallets;
