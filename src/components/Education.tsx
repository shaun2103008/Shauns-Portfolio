import { motion } from 'framer-motion'
import { useInView } from '@/hooks/useInView'
import SectionHeading from '@/components/SectionHeading'

const timelineItems = [
  {
    period: '2022 – 2026 (Expected)',
    degree: 'Bachelor of Engineering',
    field: 'Artificial Intelligence & Machine Learning',
    institution: 'St. John College of Engineering and Management',
    location: 'Mumbai, Maharashtra, India',
    status: 'Third Year · In Progress',
    cgpa: [
      { label: 'Sem 1–2', value: '9.23' },
      { label: 'Sem 3–4', value: '9.43' },
      { label: 'Current', value: '9.41' },
    ],
  },
  {
    period: 'Prior Qualification',
    degree: 'Diploma in Electronics',
    field: '',
    institution: 'Institution and completion details to be confirmed',
    location: '',
    status: 'Completed',
    cgpa: null,
  },
]

export default function Education() {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15 })

  return (
    <section
      id="education"
      aria-label="Education"
      className="py-32 px-6 md:px-12 lg:px-24 bg-lab-bg"
    >
      <div className="max-w-7xl mx-auto">
        <div className="section-divider mb-20" />
        <SectionHeading number="05" title="THE FOUNDATION." />

        <div ref={ref} className="relative">
          {/* Vertical timeline line */}
          <div
            className="absolute left-0 top-3 bottom-3 w-px bg-gradient-to-b
                        from-lab-accent via-lab-accent/30 to-transparent"
            aria-hidden="true"
          />

          <div className="space-y-20 pl-10 md:pl-16">
            {timelineItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative"
              >
                {/* Timeline dot */}
                <div
                  className="absolute -left-[2.65rem] md:-left-[4.4rem] top-1.5 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-lab-accent ring-4 ring-lab-bg" />
                </div>

                {/* Period */}
                <span className="font-mono text-[10px] text-lab-accent tracking-widest uppercase block mb-3">
                  {item.period}
                </span>

                {/* Degree */}
                <h3 className="font-display font-bold text-display-md text-lab-text leading-tight mb-1">
                  {item.degree}
                </h3>
                {item.field && (
                  <p className="font-display text-lg text-lab-muted font-medium mb-3">
                    {item.field}
                  </p>
                )}

                {/* Institution */}
                <p className="font-sans text-sm text-lab-muted mb-1">
                  {item.institution}
                  {item.location && (
                    <span className="text-lab-dim"> · {item.location}</span>
                  )}
                </p>

                {/* Status badge */}
                <span className="inline-block font-mono text-[10px] tracking-wider
                                 border border-lab-border text-lab-dim px-2 py-0.5 mb-5">
                  {item.status}
                </span>

                {/* CGPA progression */}
                {item.cgpa && (
                  <div className="mt-4">
                    <span className="font-mono text-[10px] text-lab-dim tracking-widest uppercase block mb-3">
                      CGPA Progression
                    </span>
                    <div className="flex items-center gap-6 flex-wrap">
                      {item.cgpa.map((entry, j) => (
                        <div key={j} className="flex flex-col items-start">
                          <span className="font-display text-2xl font-bold text-lab-accent leading-none mb-1">
                            {entry.value}
                          </span>
                          <span className="font-mono text-[10px] text-lab-dim tracking-wider uppercase">
                            {entry.label}
                          </span>
                        </div>
                      ))}
                      {/* Arrow between them */}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      {item.cgpa.map((_, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="w-3 h-px bg-lab-accent/40" />
                          {j < item.cgpa!.length - 1 && (
                            <span className="font-mono text-lab-accent/40 text-xs">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

