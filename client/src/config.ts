import { createPublicClient, createWalletClient , http, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { flowTestnet } from 'viem/chains'

// Custom Flow Testnet configuration
export const flowTestnetTry = {
  id: 545,
  name: 'Flow Testnet',
  network: 'flow-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org'],
      
    },
    public: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: { name: 'FlowScan', url: 'https://testnet.flowscan.org' },
  },
  testnet: true,
}

// Public client
export const publicClient = createPublicClient({
  chain: flowTestnet,
  transport: http()
})

// Wallet client
export const walletClient = createWalletClient({
  chain: flowTestnet,
  transport: custom(window.ethereum)
})

// Get Wallet Client function
export const getWalletClient = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return createWalletClient({
      chain: flowTestnet,
      transport: custom(window.ethereum),
      account: window.ethereum.selectedAddress
    })
  }
  return null
}

// Chain configuration for wallet connection
export const chainConfig = {
  chainId: '0x221', // 545 in hex
  chainName: 'Flow Testnet',
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18
  },
  rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
  blockExplorerUrls: ['https://testnet.flowscan.org']
}

// JSON-RPC Account
// export const [account] = await walletClient.getAddresses()

// Local Account
export const account = privateKeyToAccount('0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e')


