import '../styles/globals.css'

import {
  getChainOptions,
  StaticWalletProvider,
  WalletControllerChainOptions,
  WalletProvider
} from '@terra-money/wallet-provider'
import type { AppProps } from 'next/app'
import React from 'react'

function App({
  Component,
  pageProps,
  defaultNetwork,
  walletConnectChainIds
}: AppProps & WalletControllerChainOptions) {
  const main = <Component {...pageProps} />

  return typeof window !== 'undefined' ? (
    <WalletProvider
      defaultNetwork={defaultNetwork}
      walletConnectChainIds={walletConnectChainIds}
    >
      {main}
    </WalletProvider>
  ) : (
    <StaticWalletProvider defaultNetwork={defaultNetwork}>
      {main}
    </StaticWalletProvider>
  )
}

App.getInitialProps = async () => {
  const chainOptions = await getChainOptions()
  return {
    ...chainOptions
  }
}

export default App
