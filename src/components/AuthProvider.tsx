import React, { createContext, useContext, ReactNode, useMemo } from 'react'
import { useMockAuth } from '../hooks/useMockAuth'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (name: string, email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useMockAuth()

  console.log('AuthProviderの状態:', auth)

  const contextValue = useMemo(() => ({
    ...auth
  }), [auth])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}