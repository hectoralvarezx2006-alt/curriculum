import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

window.scrollTo(0, 0)
history.scrollRestoration = 'manual'

// Global audio that persists across page navigations
window.__audio = window.__audio || (() => {
  const a = new Audio('/music.mp3')
  a.loop   = true
  a.volume = 0.18
  a.play().catch(() => {})
  return a
})()

const path = window.location.pathname

async function init() {
  let Component
  if (path === '/chat') {
    const mod = await import('./pages/ChatPage.jsx')
    Component = mod.default
  } else {
    const mod = await import('./App.jsx')
    Component = mod.default
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Component />
    </React.StrictMode>
  )
}

init()