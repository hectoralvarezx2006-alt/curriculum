import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Simple client-side router sin dependencias extra
const path = window.location.pathname

let Component
if (path === '/chat') {
  const { default: ChatPage } = await import('./pages/ChatPage.jsx')
  Component = ChatPage
} else {
  const { default: App } = await import('./App.jsx')
  Component = App
}

window.scrollTo(0, 0)
history.scrollRestoration = 'manual'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Component />
  </React.StrictMode>
)
