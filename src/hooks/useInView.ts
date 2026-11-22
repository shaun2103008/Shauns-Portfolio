import { useEffect, useState, useRef } from 'react'

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): [React.RefCallback<T>, boolean] {
  const { threshold = 0.15, rootMargin = '0px', once = true } = options
  const nodeRef = useRef<T | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [isInView, setIsInView] = useState(false)

  const ref: React.RefCallback<T> = (node) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    if (node) {
      nodeRef.current = node
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            if (once) observerRef.current?.unobserve(node)
          } else if (!once) {
            setIsInView(false)
          }
        },
        { threshold, rootMargin }
      )
      observerRef.current.observe(node)
    }
  }

  return [ref, isInView]
}

