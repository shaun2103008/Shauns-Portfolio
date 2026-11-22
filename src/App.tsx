import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

import Navbar from '@/components/Navbar'
import ScrollProgress from '@/components/ScrollProgress'
import CustomCursor from '@/components/CustomCursor'
import Hero from '@/components/Hero'
import About from '@/components/About'
import TechStack from '@/components/TechStack'
import FeaturedProjects from '@/components/FeaturedProjects'
import AdditionalProjects from '@/components/AdditionalProjects'
import Education from '@/components/Education'
import Hackathons from '@/components/Hackathons'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-top"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center
                     border border-lab-border-light bg-lab-surface text-lab-muted
                     hover:border-lab-accent hover:text-lab-accent transition-colors duration-200"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-lab-bg text-lab-text">
      {/* Global UI chrome */}
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <BackToTop />

      {/* Grain overlay — fixed, over everything */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Page sections */}
      <main>
        <Hero />
        <About />
        <TechStack />
        <FeaturedProjects />
        <AdditionalProjects />
        <Education />
        <Hackathons />
        <Contact />
      </main>

      <Footer />
    </div>
  )
}

