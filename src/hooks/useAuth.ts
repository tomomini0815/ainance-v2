import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'
import { useMockAuth } from './useMockAuth'

// Lumi SDKに依存しないモック認証フック
export const useAuth = useMockAuth
