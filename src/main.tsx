import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useAuthStore } from './store/authStore'
import { usePlatformStore } from './store/platformStore'

// Initialize auth on app start (async, non-blocking)
useAuthStore.getState().initialize().catch((error) => {
  console.error('Failed to initialize auth:', error)
})

// Initialize platform settings (async, non-blocking)
usePlatformStore.getState().initialize().catch((error) => {
  console.error('Failed to initialize platform settings:', error)
})

const root = document.getElementById('root')
if (!root) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


