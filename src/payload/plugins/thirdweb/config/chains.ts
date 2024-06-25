import type { Chain } from './types';

/// todo: why wagmi chains doesnt work here?need to fix the webpack to hanlde these modules

export type { Chain };

export const baseSepoliaChain: Chain = {
  id: 84532,
  network: `base-sepolia`,
  name: `Base Sepolia`,
  nativeCurrency: { name: `Sepolia Ether`, symbol: `ETH`, decimals: 18 },
  rpcUrls: {
    alchemy: {
      http: [`https://base-sepolia.g.alchemy.com/v2`],
      webSocket: [`wss://base-sepolia.g.alchemy.com/v2`],
    },
    default: {
      http: [`https://sepolia.base.org`],
    },
    public: {
      http: [`https://sepolia.base.org`],
    },
  },
  blockExplorers: {
    default: {
      name: `Blockscout`,
      url: `https://base-sepolia.blockscout.com`,
    },
  },
  testnet: true,
};

export const baseChain: Chain = {
  id: 8453,
  network: `base`,
  name: `Base`,
  nativeCurrency: { name: `Ether`, symbol: `ETH`, decimals: 18 },
  rpcUrls: {
    alchemy: {
      http: [`https://base-mainnet.g.alchemy.com/v2`],
      webSocket: [`wss://base-mainnet.g.alchemy.com/v2`],
    },
    infura: {
      http: [`https://base-mainnet.infura.io/v3`],
      webSocket: [`wss://base-mainnet.infura.io/ws/v3`],
    },
    default: {
      http: [`https://mainnet.base.org`],
    },
    public: {
      http: [`https://mainnet.base.org`],
    },
  },
  blockExplorers: {
    default: {
      name: `Basescan`,
      url: `https://basescan.org`,
    },
    etherscan: {
      name: `Basescan`,
      url: `https://basescan.org`,
    },
  },
  contracts: {
    multicall3: {
      address: `0xca11bde05977b3631167028862be2a173976ca11`,
      blockCreated: 5022,
    },
  },
};
