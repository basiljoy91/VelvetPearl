import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.VITE_PROXY_API_TARGET || env.VITE_API_BASE_URL || 'http://localhost:5009'
  const deploymentId =
    process.env.BUILD_ID ||
    process.env.HOSTINGER_DEPLOYMENT_ID ||
    new Date().toISOString().replace(/[-:.TZ]/g, '')

  return {
    plugins: [react()],
    build: {
      assetsDir: `assets-${deploymentId}`,
    },
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
