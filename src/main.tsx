import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'
import { ElectionProvider } from './context/ElectionProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ElectionProvider>
      <App />
    </ElectionProvider>
  </StrictMode>,
)
