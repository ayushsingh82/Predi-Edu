import { usePrivy } from '@privy-io/react-auth'
import { useEffect } from 'react'
import { chainConfig } from '../config'

export function ConnectButton() {
  const { login, logout, authenticated, user, ready } = usePrivy()

  useEffect(() => {
    if (window.ethereum && authenticated) {
      setupNetwork()
    }
  }, [authenticated])

  const setupNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainConfig.chainId }],
      })
    } catch (switchError) {
      // If chain doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          })
        } catch (addError) {
          console.error('Error adding chain:', addError)
        }
      }
    }
  }

  if (!ready) {
    return (
      <button className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl opacity-50">
        Loading...
      </button>
    )
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 transition-colors"
      >
        Connect Wallet
      </button>
    )
  }

  // Get the shortened version of the wallet address
  const shortenAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-black font-medium">
        {shortenAddress(user?.wallet?.address)}
      </span>
      <button
        onClick={logout}
        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors"
      >
        Disconnect
      </button>
    </div>
  )
} 