import { createClient } from '@lumi.new/sdk'

export const lumi = createClient({
  projectId: 'p364423076073435136',
  apiBaseUrl: 'https://api.lumi.new',
  authOrigin: 'https://auth.lumi.new',
  // デバッグモードを有効化
  debug: true,
})