import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  let build: UserConfig['build'], esbuild: UserConfig['esbuild'], define: UserConfig['define']

  if (mode === 'development') {
    build = {
      minify: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    }

    esbuild = {
      jsxDev: true,
      keepNames: true,
      minifyIdentifiers: false,
    }

    define = {
      'process.env.NODE_ENV': '"development"',
      '__DEV__': 'true',
    }
  }

  return {
    base: '/',
    plugins: [react()],
    build,
    esbuild,
    define,
    resolve: {
      alias: {
        '@': '/src',
        '@fonts': resolve(__dirname, 'node_modules/@fontsource/noto-sans-jp/files')
      }
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    // HTTP設定（スマホカメラアクセス用）
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      historyApiFallback: {
        index: '/index.html'
      },
    },
    // GitHub Pages対応のための設定
    preview: {
      host: true,
      port: 5173
    },
    // Base64ファイルのインポートを許可
    assetsInclude: ['**/*.base64']
  }
})