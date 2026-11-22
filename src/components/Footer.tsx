import { Github, Linkedin, Mail } from 'lucide-react'
import { personal } from '@/data/personal'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="border-t border-lab-border bg-lab-bg py-12 px-6 md:px-12"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center
                      justify-between gap-6 text-center md:text-left">
        {/* Tagline */}
        <div>
          <p className="font-mono text-[11px] text-lab-dim tracking-[0.2em] uppercase mb-2">
            Designed with Curiosity. Built with Intelligence.
          </p>
          <p className="font-mono text-[11px] text-lab-dim/60">
            © {year} {personal.name}. All rights reserved.
          </p>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-5">
          <a
            href={personal.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-lab-dim hover:text-lab-accent transition-colors duration-200"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-lab-dim hover:text-lab-accent transition-colors duration-200"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href={`mailto:${personal.email}`}
            aria-label="Email"
            className="text-lab-dim hover:text-lab-accent transition-colors duration-200"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}

