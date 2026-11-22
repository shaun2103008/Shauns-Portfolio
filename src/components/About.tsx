import { motion } from 'framer-motion'
import { useInView } from '@/hooks/useInView'
import SectionHeading from '@/components/SectionHeading'
import { personal } from '@/data/personal'

const paragraphVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      delay: i * 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

const sideVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const tagVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: 0.6 + i * 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

export default function About() {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15 })

  return (
    <section id="about" className="relative bg-lab-bg" aria-label="About section">
      {/* Section divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-lab-border-light to-transparent" aria-hidden="true" />

      <div className="py-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <SectionHeading number="02" title="BEYOND THE ALGORITHM." />

        <div ref={ref} className="lg:grid lg:grid-cols-5 gap-16">
          {/* Left column — paragraphs */}
          <div className="col-span-3 mb-16 lg:mb-0">
            {personal.aboutParagraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                custom={i}
                variants={paragraphVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className="font-sans text-base md:text-lg text-lab-muted leading-relaxed mb-6 last:mb-0"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          {/* Right column — philosophy + highlights */}
          <div className="col-span-2">
            {/* Philosophy quote */}
            <motion.blockquote
              variants={sideVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="relative mb-12 pl-6 border-l-2 border-lab-accent/30"
            >
              <span
                className="absolute -top-6 -left-2 font-display text-6xl text-lab-accent/20 leading-none select-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="font-display text-xl md:text-2xl italic text-lab-accent leading-snug">
                {personal.philosophy}
              </p>
            </motion.blockquote>

            {/* Highlights */}
            <motion.div
              variants={sideVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="flex flex-wrap gap-3"
            >
              {personal.highlights.map((highlight, i) => (
                <motion.span
                  key={highlight}
                  custom={i}
                  variants={tagVariants}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  className="inline-block px-4 py-1.5 font-mono text-xs tracking-wider text-lab-accent border border-lab-accent/30 rounded-sm
                             hover:border-lab-accent/60 transition-colors duration-200"
                >
                  {highlight}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
