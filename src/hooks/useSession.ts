import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../components/AuthProvider'

// AuthProviderから認証情報を取得するシンプルなフック
export const useSession = () => {
  const auth = useAuth()
  return auth
}
