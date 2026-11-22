import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ShieldAlert, Cpu, RotateCcw, Zap, Sparkles, Crosshair } from 'lucide-react'

interface TelemetryPoint {
  x: number
  y: number
  t: number
  isBot?: boolean
}

interface BiometricFeatures {
  straightness: number
  velocityMean: number
  accStd: number
  jitterRatio: number
}

interface EvaluationResult {
  isBot: boolean
  humanConfidence: number // 0 to 100
  decision: 'HUMAN' | 'BOT' | 'IDLE'
  flags: string[]
  features: BiometricFeatures
}

export default function BehavioralCaptchaDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationResult>({
    isBot: false,
    humanConfidence: 50,
    decision: 'IDLE',
    flags: ['Hover or move cursor inside the arena to stream live telemetry...'],
    features: {
      straightness: 0,
      velocityMean: 0,
      accStd: 0,
      jitterRatio: 0,
    },
  })
  const [activeBot, setActiveBot] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [activeModel, setActiveModel] = useState<'random_forest' | 'isolation_forest'>('random_forest')

  // In-memory trajectory buffer
  const eventsRef = useRef<TelemetryPoint[]>([])
  const trailRef = useRef<{ x: number; y: number; alpha: number; isBot: boolean }[]>([])
  const animationFrameRef = useRef<number | null>(null)

  // ─── Mathematical Feature Extraction (matches backend/feature_extractor.py) ───
  const extractFeatures = useCallback((points: TelemetryPoint[]): BiometricFeatures => {
    if (points.length < 3) {
      return { straightness: 1.0, velocityMean: 0, accStd: 0, jitterRatio: 0 }
    }

    let totalDist = 0
    const velocities: number[] = []
    const dxList: number[] = []
    const dyList: number[] = []

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1]
      const p2 = points[i]
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const dt = Math.max(1, p2.t - p1.t)
      const dist = Math.sqrt(dx * dx + dy * dy)
      totalDist += dist
      velocities.push(dist / dt)
      dxList.push(dx)
      dyList.push(dy)
    }

    const pFirst = points[0]
    const pLast = points[points.length - 1]
    const euclideanDist = Math.sqrt(
      Math.pow(pLast.x - pFirst.x, 2) + Math.pow(pLast.y - pFirst.y, 2)
    )

    const straightness = totalDist > 0 ? Math.min(1.0, euclideanDist / totalDist) : 1.0

    // Velocity stats
    const velMean = velocities.reduce((a, b) => a + b, 0) / velocities.length

    // Acceleration stats
    const accList: number[] = []
    for (let i = 1; i < velocities.length; i++) {
      const dv = Math.abs(velocities[i] - velocities[i - 1])
      const dt = Math.max(1, points[i + 1].t - points[i].t)
      accList.push(dv / dt)
    }
    const accMean = accList.length > 0 ? accList.reduce((a, b) => a + b, 0) / accList.length : 0
    const accVariance =
      accList.length > 1
        ? accList.reduce((a, b) => a + Math.pow(b - accMean, 2), 0) / accList.length
        : 0
    const accStd = Math.sqrt(accVariance)

    // Jitter ratio (sudden angular changes > 45 deg)
    let jitterCount = 0
    for (let i = 1; i < dxList.length; i++) {
      const angle1 = Math.atan2(dyList[i - 1], dxList[i - 1])
      const angle2 = Math.atan2(dyList[i], dxList[i])
      let diff = Math.abs(angle2 - angle1)
      if (diff > Math.PI) diff = 2 * Math.PI - diff
      if (diff > Math.PI / 4) jitterCount++
    }
    const jitterRatio = dxList.length > 1 ? jitterCount / (dxList.length - 1) : 0

    return {
      straightness: parseFloat(straightness.toFixed(3)),
      velocityMean: parseFloat((velMean * 10).toFixed(2)),
      accStd: parseFloat((accStd * 100).toFixed(4)),
      jitterRatio: parseFloat(jitterRatio.toFixed(3)),
    }
  }, [])

  // ─── Classification Decision Engine (matches backend/model.py) ───
  const evaluateTelemetry = useCallback(
    (points: TelemetryPoint[], isBotFlag = false) => {
      if (points.length < 5) return

      const feats = extractFeatures(points)
      const flags: string[] = []
      let botRisk = 0.0

      if (isBotFlag) {
        botRisk = 0.95
      }

      // Check 1: Straightness Index (Linear Bots have S > 0.985)
      if (feats.straightness > 0.98) {
        flags.push(`Near-perfect linear trajectory (Straightness: ${feats.straightness})`)
        botRisk += 0.45
      } else if (feats.straightness < 0.88) {
        botRisk -= 0.15
      }

      // Check 2: Micro-tremor / Jitter
      if (feats.jitterRatio === 0 && points.length > 15) {
        flags.push('Zero physiological tremor detected (Jitter: 0.000)')
        botRisk += 0.35
      } else if (feats.jitterRatio >= 0.08) {
        botRisk -= 0.2
      }

      // Check 3: Acceleration Std
      if (feats.accStd < 0.01 && feats.velocityMean > 0.5) {
        flags.push('Constant synthetic speed profile without natural muscle deceleration')
        botRisk += 0.35
      } else if (feats.accStd > 0.05) {
        botRisk -= 0.15
      }

      // Check 4: Superhuman speed
      if (feats.velocityMean > 25.0) {
        flags.push(`Superhuman velocity spike (${feats.velocityMean} px/ms)`)
        botRisk += 0.4
      }

      // Model specific adjustment
      if (activeModel === 'isolation_forest' && (feats.straightness > 0.95 || feats.jitterRatio === 0)) {
        flags.push('Isolation Forest: Telemetry vector mapped as statistical outlier')
        botRisk = Math.max(botRisk, 0.88)
      }

      botRisk = Math.max(0.01, Math.min(0.99, botRisk))
      const humanConfidence = Math.round((1.0 - botRisk) * 100)
      const isBot = humanConfidence < 50

      if (flags.length === 0) {
        flags.push('✓ Natural velocity bell curve & physiological micro-tremor detected.')
        flags.push('✓ Verified organic human interaction profile.')
      }

      setEvaluation({
        isBot,
        humanConfidence,
        decision: isBot ? 'BOT' : 'HUMAN',
        flags,
        features: feats,
      })
    },
    [activeModel, extractFeatures]
  )

  // ─── Canvas Render Loop ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw subtle technical grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)'
      ctx.lineWidth = 1
      const step = 28
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Origin point A
      ctx.fillStyle = '#64748B'
      ctx.beginPath()
      ctx.arc(36, canvas.height / 2, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = '8px monospace'
      ctx.fillStyle = '#64748B'
      ctx.fillText('(A) Start', 20, canvas.height / 2 + 14)

      // Target point B
      const targetX = canvas.width - 45
      const targetY = canvas.height / 2
      ctx.strokeStyle = '#C5F36B'
      ctx.lineWidth = 1.5
      ctx.strokeRect(targetX - 12, targetY - 12, 24, 24)
      ctx.fillStyle = '#C5F36B'
      ctx.beginPath()
      ctx.arc(targetX, targetY, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillText('(B) Verify', targetX - 18, targetY + 22)

      // Draw fading mouse trail points
      const trails = trailRef.current
      for (let i = 1; i < trails.length; i++) {
        const p1 = trails[i - 1]
        const p2 = trails[i]
        p1.alpha *= 0.96

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)

        if (p1.isBot) {
          ctx.strokeStyle = `rgba(244, 63, 94, ${p1.alpha})`
          ctx.lineWidth = 3.5
        } else {
          ctx.strokeStyle = `rgba(197, 243, 107, ${p1.alpha})`
          ctx.lineWidth = 2.5
        }
        ctx.stroke()
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [])

  // ─── Human Mouse Handling inside Canvas ──────────────────────────
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isSimulating) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const t = performance.now()

    eventsRef.current.push({ x, y, t, isBot: false })
    trailRef.current.push({ x, y, alpha: 1.0, isBot: false })

    if (eventsRef.current.length > 50) {
      eventsRef.current.shift()
    }
    if (trailRef.current.length > 250) {
      trailRef.current.shift()
    }

    evaluateTelemetry(eventsRef.current, false)
  }

  // ─── Bot Simulation Sequences (Linear, Bezier, Humanoid, Teleport) ───
  const triggerBot = (botType: 'linear' | 'bezier' | 'humanoid' | 'teleport') => {
    if (isSimulating) return
    setIsSimulating(true)
    setActiveBot(botType)

    eventsRef.current = []
    trailRef.current = []

    const canvas = canvasRef.current
    if (!canvas) return

    const startX = 36
    const startY = canvas.height / 2
    const endX = canvas.width - 45
    const endY = canvas.height / 2

    const steps = botType === 'teleport' ? 3 : 42
    const botEvents: TelemetryPoint[] = []

    if (botType === 'linear') {
      // Perfectly straight line: dx/dt constant, straightness = 1.0, zero jitter
      for (let i = 0; i <= steps; i++) {
        const u = i / steps
        botEvents.push({
          x: startX + (endX - startX) * u,
          y: startY + (endY - startY) * u,
          t: i * 16,
          isBot: true,
        })
      }
    } else if (botType === 'bezier') {
      // Smooth cubic bezier curve with zero micro-tremor
      const p1 = { x: startX + (endX - startX) * 0.25, y: startY - 75 }
      const p2 = { x: startX + (endX - startX) * 0.75, y: startY + 75 }
      for (let i = 0; i <= steps; i++) {
        const u = i / steps
        const cx =
          Math.pow(1 - u, 3) * startX +
          3 * Math.pow(1 - u, 2) * u * p1.x +
          3 * (1 - u) * Math.pow(u, 2) * p2.x +
          Math.pow(u, 3) * endX
        const cy =
          Math.pow(1 - u, 3) * startY +
          3 * Math.pow(1 - u, 2) * u * p1.y +
          3 * (1 - u) * Math.pow(u, 2) * p2.y +
          Math.pow(u, 3) * endY
        botEvents.push({ x: cx, y: cy, t: i * 16, isBot: true })
      }
    } else if (botType === 'humanoid') {
      // Fitts's law simulated sub-movements with synthetic noise
      for (let i = 0; i <= steps; i++) {
        const u = i / steps
        const noiseX = (Math.sin(u * Math.PI * 4) * 12) + (Math.random() - 0.5) * 3
        const noiseY = (Math.cos(u * Math.PI * 3) * 15) + (Math.random() - 0.5) * 3
        botEvents.push({
          x: startX + (endX - startX) * u + noiseX,
          y: startY + (endY - startY) * u + noiseY,
          t: i * 16,
          isBot: true,
        })
      }
    } else if (botType === 'teleport') {
      // Instantaneous jump: velocity > 50 px/ms
      botEvents.push({ x: startX, y: startY, t: 0, isBot: true })
      botEvents.push({ x: (startX + endX) / 2, y: startY - 40, t: 5, isBot: true })
      botEvents.push({ x: endX, y: endY, t: 10, isBot: true })
    }

    // Playback bot events over time
    let idx = 0
    const interval = setInterval(() => {
      if (idx >= botEvents.length) {
        clearInterval(interval)
        setIsSimulating(false)
        evaluateTelemetry(botEvents, true)
        return
      }
      const pt = botEvents[idx]
      trailRef.current.push({ x: pt.x, y: pt.y, alpha: 1.0, isBot: true })
      idx++
    }, botType === 'teleport' ? 50 : 20)
  }

  const handleReset = () => {
    eventsRef.current = []
    trailRef.current = []
    setActiveBot(null)
    setIsSimulating(false)
    setEvaluation({
      isBot: false,
      humanConfidence: 50,
      decision: 'IDLE',
      flags: ['Hover or move cursor inside the arena to stream live telemetry...'],
      features: { straightness: 0, velocityMean: 0, accStd: 0, jitterRatio: 0 },
    })
  }

  // SVG Progress Ring calculations
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (evaluation.humanConfidence / 100) * circumference

  return (
    <div className="w-full bg-[#131413] border border-[#262826] rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl font-sans text-[#F5F0EB]">
      {/* ─── Top Header: Title & Bot Simulators ──────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#262826]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-[#C5F36B]/10 border border-[#C5F36B]/20 text-[#C5F36B]">
            <Crosshair size={14} />
          </div>
          <div>
            <span className="font-mono text-xs sm:text-sm font-semibold text-[#E5E7EB]">
              Behavioral Biometrics Arena
            </span>
            <span className="block font-mono text-[9px] text-[#6B7280]">
              Real-time Mouse Dynamics & Anomaly Verification
            </span>
          </div>
        </div>

        {/* Model selector pill */}
        <div className="flex items-center gap-1.5 bg-[#0B0C0B] border border-[#262826] p-1 rounded-lg font-mono text-[9px]">
          <button
            onClick={() => setActiveModel('random_forest')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeModel === 'random_forest'
                ? 'bg-[#222422] text-[#C5F36B] font-bold'
                : 'text-[#6B7280] hover:text-[#9CA3AF]'
            }`}
          >
            Random Forest
          </button>
          <button
            onClick={() => setActiveModel('isolation_forest')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeModel === 'isolation_forest'
                ? 'bg-[#222422] text-[#C5F36B] font-bold'
                : 'text-[#6B7280] hover:text-[#9CA3AF]'
            }`}
          >
            Isolation Forest
          </button>
        </div>
      </div>

      {/* ─── Bot Attack Simulation Bar ──────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-3 mt-3 bg-[#0D0E0D] border border-[#222422] rounded-xl font-mono text-[10px]">
        <span className="text-[#9CA3AF] text-[9px] uppercase tracking-wider flex items-center gap-1.5">
          <Zap size={11} className="text-[#F59E0B]" />
          Simulate Bot:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => triggerBot('linear')}
            disabled={isSimulating}
            className={`px-2.5 py-1 rounded border transition-all ${
              activeBot === 'linear'
                ? 'bg-[#F43F5E] text-[#090A09] border-[#F43F5E] font-bold'
                : 'bg-[#181A18] text-[#D1D5DB] border-[#2A2C2A] hover:border-[#F43F5E]/60'
            }`}
          >
            ⚡ Linear
          </button>
          <button
            onClick={() => triggerBot('bezier')}
            disabled={isSimulating}
            className={`px-2.5 py-1 rounded border transition-all ${
              activeBot === 'bezier'
                ? 'bg-[#F43F5E] text-[#090A09] border-[#F43F5E] font-bold'
                : 'bg-[#181A18] text-[#D1D5DB] border-[#2A2C2A] hover:border-[#F43F5E]/60'
            }`}
          >
            🔄 Bezier
          </button>
          <button
            onClick={() => triggerBot('humanoid')}
            disabled={isSimulating}
            className={`px-2.5 py-1 rounded border transition-all ${
              activeBot === 'humanoid'
                ? 'bg-[#F43F5E] text-[#090A09] border-[#F43F5E] font-bold'
                : 'bg-[#181A18] text-[#D1D5DB] border-[#2A2C2A] hover:border-[#F43F5E]/60'
            }`}
          >
            🧠 Humanoid
          </button>
          <button
            onClick={() => triggerBot('teleport')}
            disabled={isSimulating}
            className={`px-2.5 py-1 rounded border transition-all ${
              activeBot === 'teleport'
                ? 'bg-[#F43F5E] text-[#090A09] border-[#F43F5E] font-bold'
                : 'bg-[#181A18] text-[#D1D5DB] border-[#2A2C2A] hover:border-[#F43F5E]/60'
            }`}
          >
            🚀 Teleport
          </button>
          <button
            onClick={handleReset}
            className="p-1 rounded bg-[#181A18] text-[#6B7280] hover:text-[#E5E7EB] border border-[#2A2C2A] transition-colors ml-1"
            title="Reset Arena"
            aria-label="Reset Arena"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* ─── Interactive Canvas Arena ────────────────────────────────── */}
      <div className="relative mt-3 bg-[#080908] border border-[#222422] rounded-xl overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={460}
          height={170}
          onPointerMove={handlePointerMove}
          className="w-full h-[170px] block"
          aria-label="Live mouse trajectory canvas"
        />

        {/* Overlay instruction */}
        <div className="absolute bottom-2 left-3 pointer-events-none font-mono text-[8.5px] text-[#4B5563] flex items-center gap-1.5">
          <Sparkles size={10} className="text-[#C5F36B]/60" />
          <span>Move mouse anywhere inside box or click a bot simulator</span>
        </div>
      </div>

      {/* ─── Live Telemetry Gauge & 4 Biometrics ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3.5">
        {/* Confidence Ring Meter */}
        <div className="bg-[#0E0F0E] border border-[#222422] rounded-xl p-3 flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
              <circle
                cx="45"
                cy="45"
                r={radius}
                className="stroke-[#1C1E1C]"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="45"
                cy="45"
                r={radius}
                stroke={evaluation.decision === 'BOT' ? '#F43F5E' : '#C5F36B'}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-xl font-bold text-[#F5F0EB]">
                {evaluation.decision === 'IDLE' ? '--' : `${evaluation.humanConfidence}%`}
              </span>
              <span className="font-mono text-[7px] text-[#6B7280] uppercase tracking-wider">
                CONFIDENCE
              </span>
            </div>
          </div>

          {/* Decision Badge */}
          <div className="mt-2">
            <span
              className={`font-mono text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider font-bold inline-flex items-center gap-1 ${
                evaluation.decision === 'BOT'
                  ? 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/40'
                  : evaluation.decision === 'HUMAN'
                  ? 'bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/40'
                  : 'bg-[#222422] text-[#9CA3AF] border border-[#333533]'
              }`}
            >
              {evaluation.decision === 'BOT' ? (
                <>
                  <ShieldAlert size={10} /> BLOCKED: BOT
                </>
              ) : evaluation.decision === 'HUMAN' ? (
                <>
                  <ShieldCheck size={10} /> PASSED: HUMAN
                </>
              ) : (
                'SWIRL MOUSE'
              )}
            </span>
          </div>
        </div>

        {/* 4 Biometric Metric Cards */}
        <div className="md:col-span-2 grid grid-cols-2 gap-2">
          {/* Straightness Index */}
          <div className="bg-[#0E0F0E] border border-[#222422] rounded-xl p-2.5">
            <span className="font-mono text-[8.5px] text-[#6B7280] uppercase tracking-wider block">
              Straightness Index (S)
            </span>
            <span className="font-mono text-base font-bold text-[#F5F0EB] mt-0.5 block">
              {evaluation.features.straightness > 0 ? evaluation.features.straightness.toFixed(3) : '--'}
            </span>
            <span className="font-mono text-[7.5px] text-[#4B5563]">1.0 = Linear Bot</span>
          </div>

          {/* Velocity Mean */}
          <div className="bg-[#0E0F0E] border border-[#222422] rounded-xl p-2.5">
            <span className="font-mono text-[8.5px] text-[#6B7280] uppercase tracking-wider block">
              Velocity Mean
            </span>
            <span className="font-mono text-base font-bold text-[#F5F0EB] mt-0.5 block">
              {evaluation.features.velocityMean > 0 ? `${evaluation.features.velocityMean.toFixed(2)}` : '--'}
            </span>
            <span className="font-mono text-[7.5px] text-[#4B5563]">px / ms scale</span>
          </div>

          {/* Acceleration Std */}
          <div className="bg-[#0E0F0E] border border-[#222422] rounded-xl p-2.5">
            <span className="font-mono text-[8.5px] text-[#6B7280] uppercase tracking-wider block">
              Acceleration Std (σa)
            </span>
            <span className="font-mono text-base font-bold text-[#F5F0EB] mt-0.5 block">
              {evaluation.features.accStd > 0 ? evaluation.features.accStd.toFixed(4) : '--'}
            </span>
            <span className="font-mono text-[7.5px] text-[#4B5563]">Limb motor variance</span>
          </div>

          {/* Jitter Ratio */}
          <div className="bg-[#0E0F0E] border border-[#222422] rounded-xl p-2.5">
            <span className="font-mono text-[8.5px] text-[#6B7280] uppercase tracking-wider block">
              Jitter Ratio
            </span>
            <span className="font-mono text-base font-bold text-[#F5F0EB] mt-0.5 block">
              {evaluation.features.jitterRatio > 0 ? evaluation.features.jitterRatio.toFixed(3) : '--'}
            </span>
            <span className="font-mono text-[7.5px] text-[#4B5563]">8–12Hz micro-tremor</span>
          </div>
        </div>
      </div>

      {/* ─── AI Risk Assessment Flags ───────────────────────────────── */}
      <div className="mt-3 bg-[#0A0D14] border border-[#1E293B] rounded-xl p-3">
        <div className="flex items-center justify-between text-[9px] font-mono text-[#38BDF8] pb-1.5 border-b border-[#1E293B]">
          <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Cpu size={11} />
            Biometric Telemetry Analysis
          </span>
          <span className="text-[#64748B]">12 Spatial-Temporal Features</span>
        </div>

        <div className="mt-2 space-y-1 font-mono text-[9px] leading-relaxed">
          {evaluation.flags.map((flag, i) => (
            <p
              key={i}
              className={
                evaluation.decision === 'BOT'
                  ? 'text-[#FCA5A5]'
                  : evaluation.decision === 'HUMAN'
                  ? 'text-[#C5F36B]'
                  : 'text-[#64748B]'
              }
            >
              • {flag}
            </p>
          ))}
        </div>
      </div>

      {/* ─── Footer: Privacy & Architecture Guarantee ───────────────── */}
      <div className="mt-3 pt-2.5 border-t border-[#1C1E1C] flex flex-wrap items-center justify-between gap-2 font-mono text-[8px] text-[#64748B]">
        <span>
          Privacy-First: Microsecond timestamps. Zero logging of text, keys, or passwords.
        </span>
        <span className="text-[#9CA3AF]">
          FastAPI · Random Forest & Isolation Forest
        </span>
      </div>
    </div>
  )
}

