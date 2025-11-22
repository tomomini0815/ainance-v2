import React, { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabaseClient'
import { auth, googleProvider } from '../lib/firebase'
import { signInWithPopup, User as FirebaseUser } from 'firebase/auth'

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (name: string, email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // ネットワーク状態の監視
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Supabaseセッション状態の監視
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const contextValue = useMemo(() => ({
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    loading: session === undefined,
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      setSession(data.session)
      return data
    },
    signUp: async (name: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      if (error) throw error
      setSession(data.session)
      return data
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setSession(null)
    },
    signInWithGoogle: async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser: FirebaseUser = result.user;
        
        // Firebaseユーザー情報をSupabaseに同期
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: await firebaseUser.getIdToken(),
        });
        
        if (error) throw error;
        
        setSession(data.session);
        return data;
      } catch (error: any) {
        console.error('Googleログインエラー:', error);
        throw error;
      }
    }
  }), [session])

  // オフライン時の表示
  if (!isOnline) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700 max-w-md">
          <div className="text-4xl mb-4">🌐</div>
          <h2 className="text-2xl font-bold text-white mb-2">ネットワーク接続エラー</h2>
          <p className="text-gray-300 mb-6">インターネットに接続されていません。ネットワーク接続を確認してください。</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

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