import { createPublicClient, createWalletClient , http, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

// Custom Flow Testnet configuration
export const eduChainTestnet = {
  id: 656476,
  name: 'Educhain Testnet',
  network: 'edu-chain-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Educhain',
    symbol: 'EDU',
  },
  rpcUrls: {
    default: {
      http: ['https://open-campus-codex-sepolia.drpc.org'],
      
    },
    public: {
      http: ['https://open-campus-codex-sepolia.drpc.org'],
    },
  },
  blockExplorers: {
    default: { name: 'EduchainScan', url: 'https://edu-chain-testnet.blockscout.com/.' },
  },
  testnet: true,
}

// Public client
export const publicClient = createPublicClient({
  chain: eduChainTestnet,
  transport: http()
})

// Wallet client
export const walletClient = createWalletClient({
  chain: eduChainTestnet,
  transport: custom(window.ethereum)
})

// Get Wallet Client function
export const getWalletClient = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain: eduChainTestnet,
      transport: custom(window.ethereum),
      account: window.ethereum.selectedAddress
    })
  }
  return null
}

// Chain configuration for wallet connection
export const chainConfig = {
  chainId: '0xa045c', // 545 in hex
  chainName: ' Educhain Testnet',
  nativeCurrency: {
    name: 'Educhain',
    symbol: 'EDU',
    decimals: 18
  },
  rpcUrls: ['https://open-campus-codex-sepolia.drpc.org'],
  blockExplorerUrls: ['https://edu-chain-testnet.blockscout.com/.']
}

// JSON-RPC Account
// export const [account] = await walletClient.getAddresses()

// Local Account
export const account = privateKeyToAccount('0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e')


