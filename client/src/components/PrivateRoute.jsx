import { usePrivy } from '@privy-io/react-auth'

export function PrivateRoute({ children }) {
  // Just return the children without any authentication check
  return children
} 