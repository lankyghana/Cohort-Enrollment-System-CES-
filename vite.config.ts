import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
function devFaviconMiddleware(): Plugin {
  return {
    name: 'dev-favicon-middleware',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/favicon.ico') {
          // Silence default browser favicon request 404s in dev.
          res.statusCode = 204
          res.end()
          return
        }
        next()
      })
    },
  }
}

export default defineConfig(({ command }) => ({
  envDir: './backend',
  plugins: [react(), devFaviconMiddleware()],
  // In dev we want SPA routes like `/enrollment-success` to work at the origin.
  // In build we keep assets under `/app/` so Laravel can serve them from `public/app/*`.
  base: command === 'serve' ? '/' : '/app/',
  build: {
    outDir: path.resolve(__dirname, './backend/public/app'),
    emptyOutDir: true,
    manifest: 'manifest.json',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Make dev behave like the Laravel-served SPA (same paths, no CORS).
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
}))

