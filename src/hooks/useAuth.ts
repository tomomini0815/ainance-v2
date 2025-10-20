import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'
import { useSession } from './useSession'

// Supabaseセッションを使用する認証フック
export const useAuth = useSession