import React, { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react'
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
  signInWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true) // 初期値をtrueに変更
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
    console.log('🔐 AuthProvider: セッション監視を開始');

    // 初期セッションの取得
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔐 AuthProvider: 初期セッション取得', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error
      });
      setUser(session?.user || null)
      setLoading(false)
    }).catch((error) => {
      console.error('🔐 AuthProvider: セッション取得エラー', error);
      setUser(null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 AuthProvider: 認証状態変更', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      });
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true) // ログイン処理開始時にloadingをtrueに設定
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      setUser(data.user)
      return data
    } finally {
      setLoading(false) // ログイン処理終了時にloadingをfalseに設定
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true) // サインアップ処理開始時にloadingをtrueに設定
    try {
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
      setUser(data.user)
      return data
    } finally {
      setLoading(false) // サインアップ処理終了時にloadingをfalseに設定
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Supabase OAuth - Googleログイン
  const signInWithGoogle = async () => {
    setLoading(true)
    console.log('🔐 AuthProvider: Googleログイン開始');
    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log('🔐 AuthProvider: リダイレクトURL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Googleサインインエラー:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(() => ({
    user: user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }), [user, loading])

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