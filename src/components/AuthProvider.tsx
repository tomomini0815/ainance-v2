import React, { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabaseClient'
// Firebaseのインポートを一時的に無効化しました
// import { auth, googleProvider } from '../lib/firebase'
// import { signInWithPopup, User as FirebaseUser } from 'firebase/auth'

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (name: string, email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  // Firebase関連の関数を一時的に無効化しました
  // signInWithGoogle: () => Promise<any>;
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  }

  const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    })
    
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Firebase関連の関数を一時的に無効化しました
  // const signInWithGoogle = async () => {
  //   try {
  //     const result = await signInWithPopup(auth, googleProvider);
  //     const user = result.user;
  //     return user;
  //   } catch (error) {
  //     console.error("Googleサインインエラー:", error);
  //     throw error;
  //   }
  // };

  const value = useMemo(() => ({
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    // loadingステートを常にfalseに設定し、即時表示を実現
    loading: false,
    signIn,
    signUp,
    signOut,
    // Firebase関連の関数を一時的に無効化しました
    // signInWithGoogle,
  }), [session])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}