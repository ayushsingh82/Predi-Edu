import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PrivyProvider } from '@privy-io/react-auth'
import './index.css'
import App from './App.jsx'
import Home from './components/Home'
import Profile from './components/Profile'
import Create from './components/Create'
import LiveBet from './components/LiveBet'
import { PrivateRoute } from './components/PrivateRoute'
import Eliza from './components/Eliza'
import BuyBet from './components/BuyBet'
import { flowTestnet } from 'viem/chains'




ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>

    <PrivyProvider
      appId="cm6ifh5ql004ze7raa9cr0n3k"
      config={{
        loginMethods: ['email', 'wallet'],
        defaultChain: flowTestnet ,
        supportedChains: [ flowTestnet], 
        appearance: {
          theme: 'dark',
          accentColor: '#3B82F6',
          logo: 'https://your-logo-url',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route
              path="profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="create"
              element={
                <PrivateRoute>
                  <Create />
                </PrivateRoute>
              }
            />
            <Route
              path="live-bets"
              element={
                <PrivateRoute>
                  <LiveBet />
                </PrivateRoute>
              }
            />
            <Route
              path="eliza"
              element={
                <PrivateRoute>
                  <Eliza />
                </PrivateRoute>
              }
            />
            <Route
              path="buy-bet"
              element={
                <PrivateRoute>
                  <BuyBet />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </PrivyProvider>

  </React.StrictMode>
)
