import { motion } from 'framer-motion'
import { useInView } from '@/hooks/useInView'
import SectionHeading from '@/components/SectionHeading'

const events = [
  {
    type: 'HACKATHON',
    name: 'TechTatva Hackathon',
    description:
      'Participated in a competitive technical hackathon as part of an engineering team. Project details and achievements to be confirmed.',
    note: 'Details to be updated',
  },
  {
    type: 'COMPETITION',
    name: 'Datathon',
    description:
      'Participated in a data science competition, applying machine learning and analytical skills. Project and outcome details to be confirmed.',
    note: 'Details to be updated',
  },
]

export default function Hackathons() {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.2 })

  return (
    <section
      id="hackathons"
      aria-label="Hackathons and competitions"
      className="py-20 px-6 md:px-12 lg:px-24 bg-lab-bg"
    >
      <div className="max-w-7xl mx-auto">
        <div className="section-divider mb-20" />
        <SectionHeading number="06" title="COMPETE. COLLABORATE. CREATE." />

        <div
          ref={ref}
          className="grid md:grid-cols-2 gap-6"
        >
          {events.map((event, i) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.55,
                delay: i * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="bg-lab-surface border border-lab-border p-8 hover:border-lab-accent/20
                         transition-colors duration-300 relative overflow-hidden"
            >
              {/* Large background number */}
              <span
                className="absolute right-5 top-4 font-display font-black text-[6rem]
                           leading-none text-lab-accent/[0.03] select-none pointer-events-none"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Type label */}
              <span className="font-mono text-[10px] text-lab-accent tracking-[0.2em] uppercase block mb-5">
                {event.type}
              </span>

              {/* Event name */}
              <h3 className="font-display font-bold text-xl text-lab-text mb-4 leading-tight">
                {event.name}
              </h3>

              {/* Description */}
              <p className="font-sans text-sm text-lab-muted leading-relaxed mb-6">
                {event.description}
              </p>

              {/* Note pill */}
              <span
                className="inline-block font-mono text-[10px] border border-lab-border
                           text-lab-dim tracking-wider px-2.5 py-1"
              >
                {event.note}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

