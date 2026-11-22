import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { skillCategories } from '@/data/skills';
import SectionHeading from '@/components/SectionHeading';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

export default function TechStack() {
  const [ref, isInView] = useInView({ threshold: 0.1, once: true });

  return (
    <section id="stack" className="relative py-32 px-6 md:px-12 lg:px-24">
      {/* Subtle top divider */}
      <div className="h-px bg-lab-border w-full absolute top-0 left-0" />

      <div className="max-w-7xl mx-auto">
        <SectionHeading number="03" title="TOOLS OF THE TRADE." />

        <motion.div
          ref={ref as React.Ref<HTMLDivElement>}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-16"
        >
          {skillCategories.map((category) => (
            <motion.div
              key={category.name}
              variants={cardVariants}
              className="bg-lab-surface border border-lab-border p-6 group"
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-xs text-lab-accent">
                  {category.tag}
                </span>
                <span className="font-mono text-xs text-lab-muted tracking-wide uppercase">
                  {category.name}
                </span>
              </div>

              {/* Thin separator */}
              <div className="h-px bg-lab-border mb-5" />

              {/* Skills pills */}
              <motion.div
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.04 } },
                }}
                className="flex flex-wrap gap-2"
              >
                {category.skills.map((skill) => (
                  <motion.span
                    key={skill}
                    variants={pillVariants}
                    className="inline-block font-mono text-xs px-3 py-1.5 border border-lab-border text-lab-text
                               hover:border-lab-accent hover:text-lab-accent transition-colors duration-200 cursor-default select-none"
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
