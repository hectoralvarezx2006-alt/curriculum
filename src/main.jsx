import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

window.scrollTo(0, 0)
history.scrollRestoration = 'manual'

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
