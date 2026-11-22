import { motion } from 'framer-motion'
import { useInView } from '@/hooks/useInView'

interface SectionHeadingProps {
  number: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export default function SectionHeading({
  number,
  title,
  subtitle,
  align = 'left',
}: SectionHeadingProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.3 })

  return (
    <div
      ref={ref}
      className={`mb-16 md:mb-20 ${align === 'center' ? 'text-center' : ''}`}
    >
      <motion.div
        initial={{ opacity: 0, x: align === 'center' ? 0 : -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 mb-4"
        style={{ justifyContent: align === 'center' ? 'center' : 'flex-start' }}
      >
        <span className="font-mono text-xs tracking-[0.2em] text-lab-accent">
          {number}
        </span>
        <div className="h-px w-12 bg-lab-border-light" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-display text-display-lg font-bold text-lab-text tracking-tight"
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-4 font-sans text-base md:text-lg text-lab-muted max-w-2xl"
          style={{ marginLeft: align === 'center' ? 'auto' : undefined, marginRight: align === 'center' ? 'auto' : undefined }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

