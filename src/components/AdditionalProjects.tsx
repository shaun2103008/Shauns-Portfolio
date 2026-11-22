import { motion } from 'framer-motion'
import { useInView } from '@/hooks/useInView'
import { additionalProjects, featuredProjects } from '@/data/projects'
import { ArrowUpRight, Github } from 'lucide-react'

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function AdditionalProjects() {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 })
  const [headerRef, headerInView] = useInView<HTMLDivElement>({ threshold: 0.2 })

  return (
    <section
      id="additional-projects"
      aria-label="Additional projects"
      className="py-20 px-6 md:px-12 lg:px-24 bg-lab-bg"
    >
      <div className="max-w-7xl mx-auto">
        <div className="section-divider mb-16 md:mb-20" />

        {/* Header Row: Title & Attractive GitHub Hub Card */}
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={headerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4 mb-4"
            >
              <span className="font-mono text-xs tracking-[0.2em] text-lab-accent">
                04.1
              </span>
              <div className="h-px w-12 bg-lab-border-light" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-display-lg font-bold text-lab-text tracking-tight"
            >
              MORE PROJECTS.
            </motion.h2>
          </div>

          {/* Attractive GitHub CTA Card */}
          <motion.a
            href="https://github.com/shaun2103008?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Explore all repositories on GitHub"
            initial={{ opacity: 0, y: 15 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative flex items-center gap-3.5 px-5 py-3.5 bg-[#0C0E0C] hover:bg-[#121612] border border-[#222822] hover:border-[#C5F36B] rounded-xl transition-all duration-300 shadow-xl hover:shadow-[0_0_25px_rgba(197,243,107,0.18)]"
          >
            {/* Top-Right Accent Edge */}
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#C5F36B]/60 rounded-tr-lg" />

            {/* GitHub Octocat Icon Box */}
            <div className="w-10 h-10 rounded-lg bg-[#141814] border border-[#262E26] group-hover:border-[#C5F36B]/50 flex items-center justify-center transition-colors shrink-0">
              <Github className="w-5 h-5 text-[#C5F36B] group-hover:scale-110 transition-transform duration-300" />
            </div>

            {/* Meta & Username */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5F36B] animate-pulse" />
                <span className="font-mono text-[10px] tracking-widest text-[#8A8A8A] uppercase">
                  GITHUB PROFILE
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#182218] border border-[#283628] text-[9px] font-mono text-[#C5F36B]">
                  OPEN ARCHIVE
                </span>
              </div>
              <span className="font-display font-semibold text-sm sm:text-base text-[#F5F0EB] group-hover:text-[#C5F36B] transition-colors leading-tight mt-0.5">
                github.com/shaun2103008
              </span>
            </div>

            {/* Arrow Linkout Badge */}
            <div className="ml-2 pl-3.5 border-l border-[#1F251F] flex items-center gap-1 text-[#8A8A8A] group-hover:text-[#C5F36B] text-xs font-mono transition-colors">
              <span className="hidden sm:inline text-[11px] font-semibold">Explore</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </motion.a>
        </div>

        <div
          ref={ref}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {additionalProjects.map((project, i) => (
            <motion.div
              key={project.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="group relative bg-lab-surface border border-lab-border p-5
                         hover:border-lab-accent/40 transition-colors duration-300 cursor-default"
            >
              {/* Number label */}
              <span className="font-mono text-[10px] text-lab-dim tracking-widest mb-3 block">
                {String(featuredProjects.length + i + 1).padStart(2, '0')}
              </span>

              {/* Title */}
              <h3 className="font-display font-semibold text-sm text-lab-text mb-2 leading-snug">
                {project.title}
              </h3>

              {/* Description */}
              <p className="font-sans text-xs text-lab-muted leading-relaxed">
                {project.description}
              </p>

              {/* Arrow icon on hover */}
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.title} on GitHub`}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100
                             transition-opacity duration-200 text-lab-accent"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              ) : (
                <span
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-30
                              transition-opacity duration-200 text-lab-muted font-mono text-[9px] tracking-wider"
                >
                  SOON
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

