import { useAuth as useAuthProvider } from '../components/AuthProvider'

export const useAuth = () => {
  // AuthProviderから提供されるコンテキストを使用する
  return useAuthProvider()
}