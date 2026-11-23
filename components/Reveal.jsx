'use client'
import {useEffect, useRef} from 'react'
import gsap from 'gsap'

/**
 * Reveal — Apple Design spring scroll-reveal.
 * Animates from y+20/opacity:0 to y:0/opacity:1 on first viewport intersection.
 * Respects prefers-reduced-motion (opacity-only fade when reduced).
 */
export default function Reveal({as: Tag = 'div', delay = 0, className = '', children, ...p}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Start invisible
    gsap.set(el, {opacity: 0, y: 20})

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power3.out',
          delay: Math.min(delay, 300) / 1000,
          overwrite: 'auto'
        })
      })
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.to(el, {
          opacity: 1,
          duration: 0.2,
          delay: 0,
          overwrite: 'auto'
        })
      })
    }, {threshold: 0.12, rootMargin: '0px 0px -6% 0px'})

    io.observe(el)
    return () => io.disconnect()
  }, [delay])

  return (
    <Tag ref={ref} className={className} {...p}>
      {children}
    </Tag>
  )
}
