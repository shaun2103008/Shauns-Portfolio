import { motion, Variants } from 'framer-motion'
import { useInView } from '@/hooks/useInView'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  type?: 'word' | 'char'
  once?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
}

const containerVariants: Variants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export default function AnimatedText({
  text,
  className = '',
  delay = 0,
  stagger = 0.04,
  type = 'word',
  once = true,
  as: Tag = 'div',
}: AnimatedTextProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.2, once })
  const items = type === 'word' ? text.split(' ') : text.split('')

  return (
    <Tag ref={ref as any} className={className} aria-label={text}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        custom={stagger}
        style={{ display: 'inline' }}
        transition={{ delayChildren: delay }}
      >
        {items.map((item, i) => (
          <motion.span
            key={i}
            variants={itemVariants}
            style={{
              display: 'inline-block',
              whiteSpace: type === 'word' ? 'pre' : undefined,
            }}
          >
            {item}
            {type === 'word' && i < items.length - 1 ? '\u00A0' : ''}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  )
}

