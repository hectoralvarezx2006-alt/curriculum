import { useEffect, useRef } from 'react'

export default function Cursor() {
  const cursorRef = useRef(null)
  const ringRef   = useRef(null)
  const pos       = useRef({ x: 0, y: 0 })
  const ringPos   = useRef({ x: 0, y: 0 })
  const raf       = useRef(null)

  // Don't show custom cursor on touch devices
  const isTouch = 'ontouchstart' in window
  
  useEffect(() => {
    if (isTouch) return
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top  = e.clientY + 'px'
      }
    }

    const animate = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12
      if (ringRef.current) {
        ringRef.current.style.left = ringPos.current.x + 'px'
        ringRef.current.style.top  = ringPos.current.y + 'px'
      }
      raf.current = requestAnimationFrame(animate)
    }

    const onDown = () => {
      if (cursorRef.current) cursorRef.current.style.transform = 'translate(-50%,-50%) scale(0.6)'
      if (ringRef.current)   { ringRef.current.style.width = '50px'; ringRef.current.style.height = '50px' }
    }
    const onUp = () => {
      if (cursorRef.current) cursorRef.current.style.transform = 'translate(-50%,-50%) scale(1)'
      if (ringRef.current)   { ringRef.current.style.width = '36px'; ringRef.current.style.height = '36px' }
    }

    const onHover = (e) => {
      const isInteractive = e.target.matches('a,button,[data-hover]')
      if (ringRef.current) {
        ringRef.current.style.width       = isInteractive ? '56px' : '36px'
        ringRef.current.style.height      = isInteractive ? '56px' : '36px'
        ringRef.current.style.borderColor = isInteractive
          ? 'rgba(16,185,129,0.6)'
          : 'rgba(139,92,246,0.5)'
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('mouseover', onHover)
    raf.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('mouseover', onHover)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <>
      <div ref={cursorRef} id="cursor" />
      <div ref={ringRef}   id="cursor-ring" />
    </>
  )
}
