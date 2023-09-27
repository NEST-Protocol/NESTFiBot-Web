'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets, darkTheme,
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  bsc,
  mainnet,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet, bsc
  ],
  [publicProvider()]
);

const projectId = '91c4a65d26960c2d42b245b5bf92b17c';

const { wallets } = getDefaultWallets({
  appName: 'NESTFi Bot',
  projectId,
  chains,
});

const demoAppInfo = {
  appName: 'NESTFi Bot',
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} appInfo={demoAppInfo} theme={darkTheme({
        accentColor: '#EAAA00',
        accentColorForeground: '#030308',
        borderRadius: 'medium',
        fontStack: 'system',
        overlayBlur: 'small',
      })}>
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
