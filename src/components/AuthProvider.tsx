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
  // Firebase関連の関数を一時的に無効化しました
  // signInWithGoogle: () => Promise<any>;
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
    // 初期セッションの取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false) // セッション取得後にloadingをfalseに設定
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setLoading(false) // 認証状態変更時にloadingをfalseに設定
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
    setLoading(true) // ログアウト処理開始時にloadingをtrueに設定
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } finally {
      setLoading(false) // ログアウト処理終了時にloadingをfalseに設定
    }
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
    user: user,
    isAuthenticated: !!user,
    loading, // 実際のloadingステートを使用
    signIn,
    signUp,
    signOut,
    // Firebase関連の関数を一時的に無効化しました
    // signInWithGoogle,
  }), [user, loading]) // userとloadingを依存配列に追加

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