import { motion } from 'framer-motion'
import { useInView } from '@/hooks/useInView'
import SectionHeading from '@/components/SectionHeading'
import VignetteBloomBackground from '@/components/VignetteBloomBackground'
import { personal } from '@/data/personal'
import { Mail, Phone, MapPin, Github, Linkedin, Download, ExternalLink } from 'lucide-react'

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: personal.email,
    href: `mailto:${personal.email}`,
  },
  {
    icon: Phone,
    label: 'Phone',
    value: personal.phone,
    href: `tel:${personal.phone.replace(/\s/g, '')}`,
  },
  {
    icon: MapPin,
    label: 'Location',
    value: personal.location,
    href: null,
  },
]

export default function Contact() {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15 })
  const [infoRef, infoInView] = useInView<HTMLDivElement>({ threshold: 0.2 })

  return (
    <section
      id="contact"
      aria-label="Contact Shaun Stephen Banis"
      className="relative py-32 px-6 md:px-12 lg:px-24 bg-lab-bg overflow-hidden"
    >
      {/* 21st.dev Vignette Bloom ASCII Mosaic Art Animated Background */}
      <VignetteBloomBackground darkness={0.76} cellSize={15} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="section-divider mb-20" />
        <SectionHeading
          number="07"
          title="LET'S BUILD SOMETHING INTELLIGENT."
          subtitle="Interested in AI/ML engineering, machine learning, computer vision, AI security, and software development opportunities. Open to meaningful collaborations, internships, and technical opportunities."
        />

        <div className="grid lg:grid-cols-5 gap-16">
          {/* Left — CTA buttons */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 space-y-4"
          >
            {/* Primary: Email */}
            <a
              href={`mailto:${personal.email}`}
              className="flex items-center gap-3 w-full px-7 py-4 bg-lab-accent text-lab-bg
                         font-mono text-sm tracking-wider hover:bg-lab-accent/90
                         transition-colors duration-200 group"
              aria-label="Send email to Shaun"
            >
              <Mail className="w-4 h-4" />
              <span>Email Me</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60 group-hover:opacity-100" />
            </a>

            {/* Secondary: LinkedIn */}
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-7 py-4 border border-lab-border-light
                         text-lab-muted font-mono text-sm tracking-wider
                         hover:border-lab-accent/50 hover:text-lab-text
                         transition-colors duration-200 group"
              aria-label="LinkedIn profile"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-40 group-hover:opacity-80" />
            </a>

            {/* Secondary: GitHub */}
            <a
              href={personal.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-7 py-4 border border-lab-border-light
                         text-lab-muted font-mono text-sm tracking-wider
                         hover:border-lab-accent/50 hover:text-lab-text
                         transition-colors duration-200 group"
              aria-label="GitHub profile"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-40 group-hover:opacity-80" />
            </a>

            {/* Resume download */}
            <a
              href="/resume.pdf"
              download
              className="flex items-center gap-3 w-full px-7 py-4 border border-lab-border-light
                         text-lab-muted font-mono text-sm tracking-wider
                         hover:border-lab-accent/50 hover:text-lab-text
                         transition-colors duration-200 group"
              aria-label="Download resume PDF"
            >
              <Download className="w-4 h-4" />
              <span>Download Resume</span>
            </a>
          </motion.div>

          {/* Right — Contact info */}
          <motion.div
            ref={infoRef}
            initial={{ opacity: 0, x: 20 }}
            animate={infoInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <span className="font-mono text-[10px] text-lab-accent tracking-[0.2em] uppercase block mb-6">
                Contact Information
              </span>
              <div className="space-y-5">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-lab-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-mono text-[10px] text-lab-dim tracking-wider uppercase block mb-0.5">
                        {label}
                      </span>
                      {href ? (
                        <a
                          href={href}
                          className="font-sans text-sm text-lab-muted hover:text-lab-text transition-colors"
                          {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="font-sans text-sm text-lab-muted">{value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Philosophy quote */}
            <div className="border-l-2 border-lab-accent/30 pl-5 mt-8">
              <p className="font-display text-sm italic text-lab-muted leading-relaxed">
                "Don't just train a model.<br />Build the system around it."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

