import { ALCHEMY_API_KEY, WALLET_CONNECT_PROJECT_ID } from '@/lib/constants'
import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'
import '@/styles/globals.css'
import { alchemyProvider } from 'wagmi/providers/alchemy'

const projectId = WALLET_CONNECT_PROJECT_ID

// 2. Configure wagmi client
const chains = [polygonMumbai]

const { provider } = configureChains(chains, [walletConnectProvider({projectId: projectId}), alchemyProvider({apiKey: ALCHEMY_API_KEY, priority: 0})])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ version: '1', appName: 'web3Modal', chains, projectId }),
  provider
})

// 3. Configure modal ethereum client
const ethereumClient = new EthereumClient(wagmiClient, chains)

// 4. Wrap your app with WagmiProvider and add <Web3Modal /> compoennt
export default function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <>
      {ready ? (
        <WagmiConfig client={wagmiClient}>
          <Component className=' bg-gray-50' {...pageProps} />
        </WagmiConfig>
      ) : null}

      <Web3Modal themeMode='light' themeBackground='themeColor' themeColor='blackWhite' projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )}