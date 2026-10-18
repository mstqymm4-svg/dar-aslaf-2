import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  optimizeDeps: {
    // Including react-dom/client (used by src/main.jsx) ensures the client API
    // is pre-bundled alongside react/react-dom so they share one module
    // instance — and any change here invalidates a stale .vite/deps cache
    // (which otherwise causes "dispatcher.useState is null" hook errors).
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
  },
  server: {
    // Never let the browser cache dev JS/CSS. A stale cached Vite chunk or
    // /src module (served with an outdated source map) is what produces the
    // "dispatcher.useState is null" error in the preview. no-store forces a
    // fresh fetch on every reload. (Dev-server only; prod serves hashed assets.)
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  },
  plugins: [
    react(),
  ]
});