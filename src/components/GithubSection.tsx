import { motion } from 'framer-motion'
import { useInView } from '@/hooks/useInView'
import SectionHeading from '@/components/SectionHeading'
import { Github, ExternalLink } from 'lucide-react'

const repos = [
  {
    name: 'PRISM',
    fullName: 'shaun2103008/PRISM',
    description: 'Predictive Risk Intelligence for Security Monitoring — Temporal Transformer for network threat forecasting.',
    tags: ['PyTorch', 'Scapy', 'Docker', 'Streamlit'],
    url: 'https://github.com/shaun2103008/PRISM',
  },
  {
    name: 'Behavioral-CAPTCHA',
    fullName: 'shaun2103008/Behavioral-Capcha',
    description: 'Behavioral biometrics-based bot detection using mouse telemetry, FastAPI, Random Forest & Isolation Forest.',
    tags: ['FastAPI', 'Scikit-learn', 'Docker'],
    url: 'https://github.com/shaun2103008/Behavioral-Capcha',
  },
  {
    name: 'Hybrid Energy Predictor',
    fullName: 'shaun2103008/Hybrid-Solar-Wind-Energy-Yield-Predictor',
    description: 'ML platform for solar-wind energy forecasting. Hybrid voting ensemble with R² = 0.9227. Deployed on Vercel + HF.',
    tags: ['XGBoost', 'LightGBM', 'Next.js', 'Vercel'],
    url: 'https://github.com/shaun2103008/Hybrid-Solar-Wind-Energy-Yield-Predictor',
    live: 'https://hybrid-solar-wind-energy-yield-pred.vercel.app/',
  },
  {
    name: 'Gesture Control',
    fullName: 'shaun2103008/gesture_control_project',
    description: 'Real-time webcam hand gesture recognition with MediaPipe for contactless system volume control.',
    tags: ['OpenCV', 'MediaPipe', 'PyAutoGUI'],
    url: 'https://github.com/shaun2103008/gesture_control_project',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function GithubSection() {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 })
  const [heroRef, heroInView] = useInView<HTMLDivElement>({ threshold: 0.4 })

  return (
    <section
      id="github"
      aria-label="GitHub activity"
      className="py-32 px-6 md:px-12 lg:px-24 bg-lab-bg"
    >
      <div className="max-w-7xl mx-auto">
        <div className="section-divider mb-20" />
        <SectionHeading
          number="05"
          title="BUILT IN PUBLIC."
          subtitle="Open source development. Real repositories. Shipped projects."
        />

        {/* Large GitHub CTA */}
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 24 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <a
            href="https://github.com/shaun2103008/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit GitHub profile"
            className="group inline-flex items-center gap-4 border border-lab-border-light
                       hover:border-lab-accent/50 px-8 py-5 transition-colors duration-300"
          >
            <Github className="w-7 h-7 text-lab-accent" />
            <div>
              <span className="font-mono text-xs text-lab-muted tracking-widest block mb-0.5">
                GITHUB PROFILE
              </span>
              <span className="font-display font-semibold text-lg text-lab-text
                               group-hover:text-lab-accent transition-colors duration-200">
                github.com/shaun2103008
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-lab-dim ml-4 group-hover:text-lab-accent transition-colors" />
          </a>
        </motion.div>

        {/* Repo cards */}
        <div
          ref={ref}
          className="grid sm:grid-cols-2 gap-5 mb-10"
        >
          {repos.map((repo, i) => (
            <motion.div
              key={repo.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="group bg-lab-surface border border-lab-border p-6
                         hover:border-lab-accent/30 transition-colors duration-300"
            >
              {/* Repo name */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-[9px] text-lab-dim tracking-widest block mb-1">
                    {repo.fullName}
                  </span>
                  <h3 className="font-display font-bold text-base text-lab-text">
                    {repo.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {repo.live && (
                    <a
                      href={repo.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Live demo for ${repo.name}`}
                      className="text-lab-dim hover:text-lab-accent transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${repo.name} on GitHub`}
                    className="text-lab-dim hover:text-lab-accent transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Description */}
              <p className="font-sans text-xs text-lab-muted leading-relaxed mb-4">
                {repo.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {repo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] text-lab-dim border border-lab-border px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Explore all */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <a
            href="https://github.com/shaun2103008?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs text-lab-muted
                       hover:text-lab-accent transition-colors duration-200 tracking-wider"
          >
            <span>Explore all repositories</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

