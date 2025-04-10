import React, { useState } from 'react'
import { ConnectButton } from './ConnectButton'
import { FaChartLine, FaPlus, FaUser, FaShoppingCart } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { publicClient, walletClient, chainConfig } from '../config'
import { wagmiAbi } from '../abi'
import { usePrivy } from '@privy-io/react-auth'
import { createPublicClient , http } from 'viem'
import { createWalletClient ,custom } from 'viem'

const eduChainTestnet = {
  id: 656476,
  name: 'Educhain Testnet',
  network: 'edu-chain-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'EDU',
    symbol: 'EDU',
  },
  rpcUrls: {
    default: {
      http: ['https://open-campus-codex-sepolia.drpc.org']
    },
    public: {
      http: ['https://open-campus-codex-sepolia.drpc.org']
    }
  }
}


function BuyBet() {
  const navigate = useNavigate()
  const { user } = usePrivy()

  const [amount, setAmount] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!window.ethereum) {
        throw new Error('No ethereum provider found')
      }

      if (!amount) {
        throw new Error('Please enter an amount')
      }

      // Convert amount to BigInt (1 FLOW = 1e18 wei)
      const amountInWei = BigInt(Math.floor(Number(amount) * 1e18))

      // Create public client
      const publicClient = createPublicClient({
        chain: eduChainTestnet,
        transport: http()
      })

      // Create wallet client
      const walletClient = createWalletClient({
        chain: eduChainTestnet,
        transport: custom(window.ethereum)
      })

      // Switch to Flow Testnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xa045c' }]
        })
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xa045c',
              chainName: 'Educhain Testnet',
              nativeCurrency: {
                name: 'EDU',
                symbol: 'EDU',
                decimals: 18
              },
              rpcUrls: ['https://open-campus-codex-sepolia.drpc.org'],
              blockExplorerUrls: ['https://edu-chain-testnet.blockscout.com/.']
            }]
          })
        }
      }

      // Get current chain ID to verify
      const chainId = await walletClient.getChainId()
      if (chainId !== 656476) {
        throw new Error('Please switch to Educhain Testnet')
      }

      // Prepare the contract write
      const { request } = await publicClient.simulateContract({
        account: user.wallet.address,
        address: '0x5a8E771b5D0B3d2e4d218478CB7C9029d00c4e5a',
        abi: wagmiAbi,
        functionName: 'depositFunds',
        args: [amountInWei],
        value: 0n,
      })

      // Execute the contract write
      const hash = await walletClient.writeContract({
        ...request,
        account: user.wallet.address,
      })

      setSuccess('Waiting for transaction confirmation...')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('Transaction receipt:', receipt)

      setSuccess('Funds deposited successfully!')
      setTimeout(() => navigate('/live-bets'), 2000)

    } catch (err) {
      console.error('Error depositing funds:', err)
      setError(err.message || 'Failed to deposit funds. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-pink-200 flex flex-col items-center justify-center p-8">
      {/* Header with Wallet Connection */}
      <div className="w-full max-w-3xl mb-16">
        <div className="flex flex-col items-center mb-4">
          <h1 
            onClick={() => navigate('/')}
            className="text-3xl font-bold text-pink-600 cursor-pointer hover:text-pink-500 transition-colors mb-4"
          >
            PrediEdu
          </h1>
          <div className="bg-blue-500 rounded-2xl p-2">
            <ConnectButton />
          </div>
        </div>
        <div className="h-px bg-pink-800/60 w-full mt-4"></div>
      </div>

      {/* Purchase Form */}
      <div className="w-full max-w-xl mb-16">
        <div className="bg-pink-300 rounded-2xl p-8 border-2 border-pink-500">
          <div className="flex items-center justify-center gap-3 mb-8">
            <FaShoppingCart className="text-pink-400 text-3xl" />
            <h2 className="text-2xl font-bold text-white text-center">Purchase Shares</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
            
            {/* Amount Input */}
            <div className="bg-pink-200 p-5 rounded-xl border border-pink-400">
              <label className="block text-black text-sm font-semibold mb-2">
                Amount (EDU)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-pink-400 text-black placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter amount..."
                min="0"
                step="0.1"
              />
            </div>

            {/* Options */}
            <div className="bg-pink-200 p-5 rounded-xl border border-pink-400">
              <label className="block text-black text-sm font-semibold mb-3">
                Choose Option
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedOption('yes')}
                  className={`px-4 py-3 rounded-xl border-2 transition-all transform ${
                    selectedOption === 'yes'
                      ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white border-pink-500 scale-105'
                      : 'bg-white text-black border-pink-400 hover:border-pink-500'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOption('no')}
                  className={`px-4 py-3 rounded-xl border-2 transition-all transform ${
                    selectedOption === 'no'
                      ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white border-pink-500 scale-105'
                      : 'bg-white text-black border-pink-400 hover:border-pink-500'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 
                text-white font-bold py-3.5 px-6 rounded-xl border-2 border-pink-500/50 transition-all 
                transform hover:scale-[1.02] active:scale-[0.98] shadow-lg
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Purchase Shares'}
            </button>
          </form>
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="w-full max-w-3xl">
        <div className="bg-pink-300 rounded-2xl p-6 border-2 border-pink-500 flex justify-between items-center px-16">
          <button 
            onClick={() => navigate('/live-bets')}
            className="flex flex-col items-center gap-2 text-black"
          >
            <FaChartLine size={32} />
            <span className="text-sm">Live Bets</span>
          </button>
          <button 
            onClick={() => navigate('/create')}
            className="bg-pink-600 hover:bg-pink-500 text-white p-5 rounded-full transition-colors border-2 border-pink-500"
          >
            <FaPlus size={36} />
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-2 text-black"
          >
            <FaUser size={32} />
            <span className="text-sm">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuyBet