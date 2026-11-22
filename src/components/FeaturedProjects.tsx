import { useInView } from '@/hooks/useInView'
import { motion } from 'framer-motion'
import SectionHeading from '@/components/SectionHeading'
import { featuredProjects, type FeaturedProject } from '@/data/projects'
import { ExternalLink, Github, ArrowUpRight } from 'lucide-react'
import PrismLiveDemo from '@/components/PrismLiveDemo'
import BehavioralCaptchaDemo from '@/components/BehavioralCaptchaDemo'
import EnergyPredictorDemo from '@/components/EnergyPredictorDemo'
import GestureControlDemo from '@/components/GestureControlDemo'
import PlantDiseaseDemo from '@/components/PlantDiseaseDemo'
import BrainTumorDemo from '@/components/BrainTumorDemo'

/* ─── Placeholder: PRISM now uses PrismLiveDemo above ───────────────── */

function CaptchaTrajectoryViz() {
  const humanPath = 'M 20 170 C 60 160 80 50 120 60 C 160 70 180 30 220 25 C 250 22 270 40 280 35'
  const botPath = 'M 20 170 L 50 155 L 55 140 L 80 128 L 83 115 L 110 100 L 115 90 L 150 72 L 148 68 L 200 50 L 205 55 L 240 40 L 280 35'

  return (
    <div className="relative">
      <svg
        viewBox="0 0 300 200"
        fill="none"
        className="w-full max-w-[300px] h-auto"
        aria-label="Mouse trajectory comparison — human vs bot"
      >
        {/* grid dots */}
        {Array.from({ length: 7 }).map((_, xi) =>
          Array.from({ length: 5 }).map((_, yi) => (
            <circle
              key={`g-${xi}-${yi}`}
              cx={20 + xi * 44}
              cy={20 + yi * 40}
              r={0.7}
              fill="#F5F0EB"
              fillOpacity={0.08}
            />
          ))
        )}

        {/* human path — CSS-animated via strokeDasharray/offset */}
        <path
          d={humanPath}
          stroke="#C5F36B"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeOpacity={0.7}
          fill="none"
          strokeDasharray="600"
          strokeDashoffset="600"
          style={{ animation: 'drawPath 2s ease-in-out 0.3s forwards' }}
        />
        <text x={42} y={188} fill="#C5F36B" fillOpacity={0.7} fontSize={9} fontFamily="monospace">
          Human
        </text>

        {/* bot path */}
        <path
          d={botPath}
          stroke="#F5F0EB"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeOpacity={0.3}
          strokeDasharray="3 3"
          fill="none"
          style={{ opacity: 0.3, animation: 'fadeIn 1s ease-in-out 1s forwards' }}
        />
        {/* bot label */}
        <text x={42} y={176} fill="#F5F0EB" fillOpacity={0.35} fontSize={9} fontFamily="monospace">
          Bot
        </text>

        {/* start / end markers */}
        <circle cx={20} cy={170} r={3} fill="#C5F36B" fillOpacity={0.5} />
        <circle cx={280} cy={35} r={3} fill="#C5F36B" fillOpacity={0.5} />
        <text x={8} y={165} fill="#F5F0EB" fillOpacity={0.25} fontSize={7} fontFamily="monospace">
          start
        </text>
        <text x={262} y={30} fill="#F5F0EB" fillOpacity={0.25} fontSize={7} fontFamily="monospace">
          end
        </text>
      </svg>
    </div>
  )
}

function EnergyBarChartViz() {
  const data = [
    { solar: 60, wind: 40 },
    { solar: 45, wind: 55 },
    { solar: 80, wind: 35 },
    { solar: 70, wind: 50 },
    { solar: 55, wind: 60 },
    { solar: 85, wind: 45 },
    { solar: 65, wind: 70 },
  ]
  const barW = 10
  const gap = 30
  const baseY = 170
  const startX = 30

  const combinedPoints = data
    .map((d, i) => {
      const x = startX + i * gap + barW
      const y = baseY - (d.solar + d.wind) * 0.8
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="relative">
      <svg
        viewBox="0 0 300 200"
        fill="none"
        className="w-full max-w-[300px] h-auto"
        aria-label="Solar and wind energy yield bar chart"
      >
        {/* axis */}
        <line x1={25} y1={baseY} x2={275} y2={baseY} stroke="#F5F0EB" strokeOpacity={0.1} strokeWidth={0.5} />

        {data.map((d, i) => {
          const x = startX + i * gap
          const solarH = d.solar * 0.8
          const windH = d.wind * 0.8
          return (
            <g key={i}>
              {/* solar bar */}
              <rect
                x={x}
                y={baseY - solarH}
                width={barW}
                height={solarH}
                fill="#D4A843"
                fillOpacity={0.5}
                rx={1}
              />
              {/* wind bar */}
              <rect
                x={x + barW + 2}
                y={baseY - windH}
                width={barW}
                height={windH}
                fill="#2DD4BF"
                fillOpacity={0.4}
                rx={1}
              />
            </g>
          )
        })}

        {/* combined line */}
        <polyline
          points={combinedPoints}
          stroke="#C5F36B"
          strokeWidth={1.2}
          strokeOpacity={0.6}
          fill="none"
          strokeLinejoin="round"
        />

        {/* legend */}
        <rect x={175} y={8} width={8} height={8} fill="#D4A843" fillOpacity={0.5} rx={1} />
        <text x={187} y={15} fill="#F5F0EB" fillOpacity={0.35} fontSize={8} fontFamily="monospace">
          Solar
        </text>
        <rect x={215} y={8} width={8} height={8} fill="#2DD4BF" fillOpacity={0.4} rx={1} />
        <text x={227} y={15} fill="#F5F0EB" fillOpacity={0.35} fontSize={8} fontFamily="monospace">
          Wind
        </text>
        <line x1={254} y1={12} x2={270} y2={12} stroke="#C5F36B" strokeWidth={1} strokeOpacity={0.5} />
        <text x={274} y={15} fill="#F5F0EB" fillOpacity={0.35} fontSize={8} fontFamily="monospace">
          Σ
        </text>
      </svg>
    </div>
  )
}

function HandLandmarkViz() {
  // Simplified MediaPipe hand landmarks (21 points)
  const landmarks = [
    // wrist
    { x: 150, y: 190 },
    // thumb: CMC, MCP, IP, TIP
    { x: 112, y: 170 }, { x: 85, y: 148 }, { x: 68, y: 125 }, { x: 55, y: 105 },
    // index: MCP, PIP, DIP, TIP
    { x: 118, y: 128 }, { x: 108, y: 90 }, { x: 105, y: 62 }, { x: 102, y: 38 },
    // middle: MCP, PIP, DIP, TIP
    { x: 142, y: 122 }, { x: 140, y: 80 }, { x: 139, y: 52 }, { x: 138, y: 28 },
    // ring: MCP, PIP, DIP, TIP
    { x: 165, y: 128 }, { x: 168, y: 85 }, { x: 170, y: 58 }, { x: 172, y: 36 },
    // pinky: MCP, PIP, DIP, TIP
    { x: 188, y: 138 }, { x: 198, y: 102 }, { x: 204, y: 78 }, { x: 208, y: 58 },
  ]

  // Connections following MediaPipe topology
  const connections: [number, number][] = [
    // thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // index
    [0, 5], [5, 6], [6, 7], [7, 8],
    // middle
    [0, 9], [9, 10], [10, 11], [11, 12],
    // ring
    [0, 13], [13, 14], [14, 15], [15, 16],
    // pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
    // palm cross-connections
    [5, 9], [9, 13], [13, 17],
  ]

  return (
    <div className="relative">
      <svg
        viewBox="0 0 300 210"
        fill="none"
        className="w-full max-w-[300px] h-auto"
        aria-label="Simplified hand landmark detection visualization"
      >
        {/* connections */}
        {connections.map(([a, b], i) => (
          <line
            key={`c-${i}`}
            x1={landmarks[a].x}
            y1={landmarks[a].y}
            x2={landmarks[b].x}
            y2={landmarks[b].y}
            stroke="#C5F36B"
            strokeOpacity={0.2}
            strokeWidth={1}
          />
        ))}
        {/* landmark dots */}
        {landmarks.map((l, i) => (
          <circle
            key={`l-${i}`}
            cx={l.x}
            cy={l.y}
            r={i === 0 ? 4 : (i % 4 === 0 ? 3 : 2)}
            fill="#C5F36B"
            fillOpacity={i % 4 === 0 ? 0.7 : 0.4}
          />
        ))}
        {/* labels */}
        <text x={150} y={208} textAnchor="middle" fill="#F5F0EB" fillOpacity={0.25} fontSize={7} fontFamily="monospace">
          21-point hand landmark detection
        </text>
      </svg>
    </div>
  )
}

/* ─── Visualization map ───────────────────────────────────────────── */

const vizMap: Record<string, React.FC> = {
  prism: PrismLiveDemo,
  'behavioral-captcha': BehavioralCaptchaDemo,
  'energy-predictor': EnergyPredictorDemo,
  'gesture-control': GestureControlDemo,
  'plant-disease': PlantDiseaseDemo,
  'brain-tumor': BrainTumorDemo,
}

/* ─── Single Project Block ────────────────────────────────────────── */

function ProjectBlock({
  project,
  index,
}: {
  project: FeaturedProject
  index: number
}) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.1 })
  const isEven = index % 2 === 1
  const Viz = vizMap[project.id]
  const highlights = project.implementation.slice(0, 5)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative py-20 md:py-28"
    >
      {/* watermark number */}
      <span
        className="absolute top-10 font-display text-section-num text-lab-accent/10 select-none pointer-events-none leading-none"
        style={{ [isEven ? 'right' : 'left']: 0 }}
        aria-hidden="true"
      >
        {project.number}
      </span>

      {/* two-column grid: text + viz */}
      <div
        className={`relative z-10 grid gap-12 lg:gap-16 items-start ${
          isEven
            ? 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]'
            : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]'
        }`}
      >
        {/* Text column */}
        <div className={`space-y-6 ${isEven ? 'lg:order-2' : ''}`}>
          {/* category tag */}
          <span className="font-mono text-xs tracking-widest text-lab-accent uppercase">
            {project.category}
          </span>

          {/* title */}
          <h3 className="font-display text-display-lg font-bold text-lab-text tracking-tight">
            {project.title}
          </h3>

          {/* full title subtitle */}
          <p className="font-sans text-sm text-lab-muted -mt-3">{project.fullTitle}</p>

          {/* description */}
          <p className="font-sans text-base leading-relaxed text-lab-muted max-w-xl">
            {project.description}
          </p>

          {/* implementation highlights */}
          <ul className="space-y-1.5">
            {highlights.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-lab-muted">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-lab-accent/40 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* metrics */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {project.metrics.map((m, i) => {
                const isHighlight = m.highlight
                return (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-lg px-4 py-3.5 min-w-[130px] flex-1 transition-all duration-300 ${
                      isHighlight
                        ? 'bg-lab-card/90 border border-lab-accent/40 shadow-[0_0_20px_rgba(197,243,107,0.07)] hover:border-lab-accent/70'
                        : 'bg-lab-surface/70 border border-lab-border hover:border-lab-border-light'
                    }`}
                  >
                    {/* Top ambient highlight line for highlighted cards */}
                    {isHighlight && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-lab-accent to-transparent opacity-90" />
                    )}

                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono text-[10px] font-medium text-lab-muted uppercase tracking-wider truncate">
                        {m.label}
                      </span>
                      {m.badge && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-lab-accent/15 text-lab-accent border border-lab-accent/30 font-semibold tracking-wide whitespace-nowrap">
                          {m.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <div
                        className={`text-2xl sm:text-3xl font-display font-bold leading-none tracking-tight ${
                          isHighlight
                            ? 'text-lab-accent drop-shadow-[0_0_8px_rgba(197,243,107,0.25)]'
                            : 'text-lab-text'
                        }`}
                      >
                        {m.value}
                      </div>
                      {isHighlight && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lab-accent opacity-60"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-lab-accent"></span>
                        </span>
                      )}
                    </div>

                    {m.note && (
                      <div className="font-mono text-[10px] text-lab-dim mt-1.5 truncate">
                        {m.note}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* PRISM metrics disclaimer */}
          {project.id === 'prism' && (
            <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-lab-muted">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-lab-accent/80 shrink-0" />
              <span>Evaluated across adversarial network telemetry &amp; MITRE ATT&amp;CK benchmark attack scenarios.</span>
            </div>
          )}

          {/* technologies */}
          <div className="flex flex-wrap gap-2 pt-2">
            {project.technologies.map((t) => (
              <span
                key={t}
                className="border border-lab-border text-lab-muted font-mono text-[11px] px-2.5 py-1 rounded"
              >
                {t}
              </span>
            ))}
          </div>

          {/* links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-lab-border text-lab-text font-mono text-xs px-4 py-2 rounded hover:border-lab-accent hover:text-lab-accent transition-colors"
            >
              <Github size={14} />
              GitHub
            </a>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-lab-accent text-lab-bg font-mono text-xs px-4 py-2 rounded hover:bg-lab-accent-dim transition-colors font-semibold"
              >
                <ExternalLink size={14} />
                Live Demo
              </a>
            )}
            {project.apiUrl && (
              <a
                href={project.apiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-lab-border text-lab-muted font-mono text-xs px-4 py-2 rounded hover:border-lab-accent hover:text-lab-accent transition-colors"
              >
                <ArrowUpRight size={14} />
                API
              </a>
            )}
          </div>
        </div>

        {/* Viz column */}
        <div
          className={`flex items-start justify-center pt-6 lg:pt-12 ${
            isEven ? 'lg:order-1' : ''
          }`}
        >
          {Viz && (
            <div className="w-full max-w-2xl">
              <Viz />
            </div>
          )}
        </div>
      </div>

      {/* separator between projects */}
      {index < featuredProjects.length - 1 && (
        <div className="mt-20 md:mt-28 h-px w-full bg-gradient-to-r from-transparent via-lab-border to-transparent" />
      )}
    </motion.div>
  )
}

/* ─── Main Component ──────────────────────────────────────────────── */

export default function FeaturedProjects() {
  return (
    <section id="projects" className="py-32 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          number="04"
          title="FEATURED PROJECTS."
          subtitle="Complete systems. Real implementations. Deployed applications."
        />

        {featuredProjects.map((project, index) => (
          <ProjectBlock key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  )
}
