import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, ShieldAlert, Play, RotateCcw, Activity } from 'lucide-react'

// ─── Real model trajectories from PRISM cred_theft scenario (25 windows of 15s) ───
// Step 0-19: Benign warm-up windows (all models stay <= 0.05)
// Step 20: Attacker executes cred_theft against target-server (Apache)
// Step 20-21: RAMX variants spike over 0.50 threshold (0.57 and 0.58). Base models miss it!
interface ModelPoint {
  step: number
  ary30Base: number
  ary30Ramx: number
  ary5Base: number
  ary5Ramx: number
}

const TRAJECTORY_DATA: ModelPoint[] = [
  { step: 0, ary30Base: 0.00, ary30Ramx: 0.01, ary5Base: 0.02, ary5Ramx: 0.02 },
  { step: 1, ary30Base: 0.00, ary30Ramx: 0.01, ary5Base: 0.02, ary5Ramx: 0.02 },
  { step: 2, ary30Base: 0.01, ary30Ramx: 0.02, ary5Base: 0.03, ary5Ramx: 0.03 },
  { step: 3, ary30Base: 0.00, ary30Ramx: 0.01, ary5Base: 0.02, ary5Ramx: 0.02 },
  { step: 4, ary30Base: 0.00, ary30Ramx: 0.01, ary5Base: 0.02, ary5Ramx: 0.02 },
  { step: 5, ary30Base: 0.01, ary30Ramx: 0.02, ary5Base: 0.03, ary5Ramx: 0.03 },
  { step: 6, ary30Base: 0.00, ary30Ramx: 0.01, ary5Base: 0.03, ary5Ramx: 0.03 },
  { step: 7, ary30Base: 0.01, ary30Ramx: 0.02, ary5Base: 0.02, ary5Ramx: 0.03 },
  { step: 8, ary30Base: 0.00, ary30Ramx: 0.01, ary5Base: 0.03, ary5Ramx: 0.03 },
  { step: 9, ary30Base: 0.00, ary30Ramx: 0.02, ary5Base: 0.03, ary5Ramx: 0.03 },
  { step: 10, ary30Base: 0.01, ary30Ramx: 0.02, ary5Base: 0.03, ary5Ramx: 0.04 },
  { step: 11, ary30Base: 0.00, ary30Ramx: 0.02, ary5Base: 0.03, ary5Ramx: 0.03 },
  { step: 12, ary30Base: 0.00, ary30Ramx: 0.01, ary5Base: 0.03, ary5Ramx: 0.03 },
  { step: 13, ary30Base: 0.01, ary30Ramx: 0.02, ary5Base: 0.04, ary5Ramx: 0.04 },
  { step: 14, ary30Base: 0.00, ary30Ramx: 0.02, ary5Base: 0.03, ary5Ramx: 0.03 },
  { step: 15, ary30Base: 0.00, ary30Ramx: 0.02, ary5Base: 0.04, ary5Ramx: 0.04 },
  { step: 16, ary30Base: 0.01, ary30Ramx: 0.02, ary5Base: 0.03, ary5Ramx: 0.04 },
  { step: 17, ary30Base: 0.00, ary30Ramx: 0.02, ary5Base: 0.04, ary5Ramx: 0.04 },
  { step: 18, ary30Base: 0.01, ary30Ramx: 0.03, ary5Base: 0.04, ary5Ramx: 0.04 },
  { step: 19, ary30Base: 0.01, ary30Ramx: 0.03, ary5Base: 0.05, ary5Ramx: 0.05 },
  // Step 20: Attack initiation (cred_theft)
  { step: 20, ary30Base: 0.00, ary30Ramx: 0.57, ary5Base: 0.04, ary5Ramx: 0.58 },
  { step: 21, ary30Base: 0.01, ary30Ramx: 0.42, ary5Base: 0.05, ary5Ramx: 0.44 },
  { step: 22, ary30Base: 0.00, ary30Ramx: 0.22, ary5Base: 0.04, ary5Ramx: 0.25 },
  { step: 23, ary30Base: 0.00, ary30Ramx: 0.15, ary5Base: 0.04, ary5Ramx: 0.17 },
  { step: 24, ary30Base: 0.00, ary30Ramx: 0.16, ary5Base: 0.04, ary5Ramx: 0.18 },
]

export default function PrismLiveDemo() {
  const [currentStep, setCurrentStep] = useState<number>(24)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const startPlayback = useCallback(() => {
    stopPlayback()
    setCurrentStep(0)
    setIsPlaying(true)
    let step = 0
    timerRef.current = setInterval(() => {
      step += 1
      if (step >= TRAJECTORY_DATA.length) {
        if (timerRef.current) clearInterval(timerRef.current)
        setIsPlaying(false)
        setCurrentStep(TRAJECTORY_DATA.length - 1)
      } else {
        setCurrentStep(step)
      }
    }, 260)
  }, [stopPlayback])

  useEffect(() => {
    return () => stopPlayback()
  }, [stopPlayback])

  const visibleData = TRAJECTORY_DATA.slice(0, currentStep + 1)
  const latest = TRAJECTORY_DATA[currentStep] || TRAJECTORY_DATA[0]
  const attackOccurred = currentStep >= 20

  // SVG Chart Geometry
  const svgWidth = 460
  const svgHeight = 205
  const padLeft = 45
  const padRight = 30
  const padTop = 22
  const padBottom = 34
  const plotWidth = svgWidth - padLeft - padRight
  const plotHeight = svgHeight - padTop - padBottom

  const getX = (step: number) => padLeft + (step / 24) * plotWidth
  const getY = (val: number) => padTop + plotHeight - val * plotHeight

  // Generate SVG path for a metric
  const makePath = (key: keyof Omit<ModelPoint, 'step'>) => {
    if (visibleData.length === 0) return ''
    return visibleData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.step).toFixed(1)} ${getY(d[key]).toFixed(1)}`)
      .join(' ')
  }

  // Color palette matching the reference image exactly:
  const colors = {
    ary30Base: '#64748B',
    ary30Ramx: '#3B82F6',
    ary5Base: '#10B981',
    ary5Ramx: '#2DD4BF',
  }

  return (
    <div className="w-full bg-[#131413] border border-[#262826] rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl font-sans text-[#F5F0EB]">
      {/* ─── Top Bar: Live Round Header + Actions ─────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[#262826]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F87171] animate-pulse" />
          <span className="font-mono text-xs sm:text-sm text-[#D1D5DB] tracking-wide">
            Recorded live round — <span className="text-[#F87171] font-semibold">cred_theft</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startPlayback}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#F87171] hover:bg-[#ef4444] text-[#090A09] font-mono font-bold text-xs rounded-full transition-all duration-200 shadow-md active:scale-95"
            aria-label="Hack again"
          >
            <Play size={11} className="fill-current" />
            Hack again
          </button>
          <button
            onClick={() => {
              stopPlayback()
              startPlayback()
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1F211F] hover:bg-[#2A2C2A] text-[#E5E7EB] border border-[#333533] font-mono text-xs rounded-full transition-all duration-200 active:scale-95"
            aria-label="Replay simulation"
          >
            <RotateCcw size={11} />
            Replay
          </button>
        </div>
      </div>

      {/* ─── Interactive Multi-Model Forecasting Chart ────────────────── */}
      <div className="relative mt-3.5 bg-[#0A0B0A] border border-[#222422] rounded-xl p-3 pt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          aria-label="PRISM Multi-Model Detection Chart"
        >
          {/* Y Axis Grid lines & labels */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((val) => {
            const y = getY(val)
            return (
              <g key={val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#222422"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#6B7280"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val === 0 ? '0' : val === 1 ? '1' : val.toString()}
                </text>
              </g>
            )
          })}

          {/* X Axis Labels */}
          {[0, 5, 10, 15, 20].map((step) => {
            const x = getX(step)
            return (
              <text
                key={step}
                x={x}
                y={svgHeight - padBottom + 16}
                textAnchor="middle"
                fill="#6B7280"
                fontSize="9"
                fontFamily="monospace"
              >
                {step}
              </text>
            )
          })}

          {/* Axis Titles */}
          <text
            x={12}
            y={padTop + plotHeight / 2}
            textAnchor="middle"
            fill="#6B7280"
            fontSize="9"
            fontFamily="monospace"
            transform={`rotate(-90 12 ${padTop + plotHeight / 2})`}
          >
            P(attack)
          </text>
          <text
            x={padLeft + plotWidth / 2}
            y={svgHeight - 4}
            textAnchor="middle"
            fill="#6B7280"
            fontSize="8.5"
            fontFamily="monospace"
          >
            window step (15 s each)
          </text>

          {/* Dashed Threshold line at P=0.5 */}
          <line
            x1={padLeft}
            y1={getY(0.5)}
            x2={svgWidth - padRight}
            y2={getY(0.5)}
            stroke="#60A5FA"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            strokeOpacity="0.8"
          />
          <text
            x={padLeft + 4}
            y={getY(0.5) - 4}
            fill="#93C5FD"
            fontSize="8.5"
            fontFamily="monospace"
          >
            alert at 0.5
          </text>

          {/* Vertical Shaded Attack Zone (step 20-22) */}
          <rect
            x={getX(20) - 3}
            y={padTop}
            width={getX(22) - getX(20) + 6}
            height={plotHeight}
            fill="#EF4444"
            fillOpacity="0.14"
          />
          <text
            x={getX(21)}
            y={padTop - 7}
            textAnchor="middle"
            fill="#F87171"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            attack
          </text>

          {/* Plotted model lines */}
          <path
            d={makePath('ary30Base')}
            fill="none"
            stroke={colors.ary30Base}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d={makePath('ary30Ramx')}
            fill="none"
            stroke={colors.ary30Ramx}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d={makePath('ary5Base')}
            fill="none"
            stroke={colors.ary5Base}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d={makePath('ary5Ramx')}
            fill="none"
            stroke={colors.ary5Ramx}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Alert Triangle & Label at Step 20 peak */}
          {currentStep >= 20 && (
            <g>
              <polygon
                points={`${getX(20)},${getY(0.58) - 8} ${getX(20) - 4.5},${getY(0.58) - 15} ${getX(20) + 4.5},${getY(0.58) - 15}`}
                fill="#F87171"
              />
              <text
                x={getX(20) - 5}
                y={getY(0.58) - 18}
                textAnchor="end"
                fill="#F87171"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ALERT
              </text>
              <circle
                cx={getX(20)}
                cy={getY(0.58)}
                r="3.5"
                fill="#F87171"
              />
              <circle
                cx={getX(20)}
                cy={getY(0.58)}
                r="2"
                fill="#2DD4BF"
              />
            </g>
          )}

          {/* ── Callout 1: 20 Benign Warmup Windows (steps 0-19) ── */}
          {currentStep >= 3 && (
            <g transform={`translate(${getX(7) - 25}, ${getY(0.24)})`}>
              <rect
                x="0"
                y="0"
                width="128"
                height="30"
                rx="5"
                fill="#131413"
                stroke="#4B5563"
                strokeWidth="1"
              />
              <text
                x="8"
                y="12"
                fill="#E5E7EB"
                fontSize="7"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                20 benign warm-up windows:
              </text>
              <text
                x="8"
                y="22"
                fill="#9CA3AF"
                fontSize="6.8"
                fontFamily="sans-serif"
              >
                every model stays under 0.05
              </text>
            </g>
          )}

          {/* ── Callout 2: Attack Detected Callout ── */}
          {attackOccurred && (
            <g transform={`translate(${getX(13) - 20}, ${getY(0.94)})`}>
              <rect
                x="0"
                y="0"
                width="145"
                height="34"
                rx="5"
                fill="#2A1616"
                stroke="#F87171"
                strokeWidth="1"
              />
              <text
                x="7"
                y="13"
                fill="#FECACA"
                fontSize="7"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                Attack: both RAMX variants cross 0.5
              </text>
              <text
                x="7"
                y="24"
                fill="#FCA5A5"
                fontSize="6.8"
                fontFamily="sans-serif"
              >
                (0.57 and 0.58). The base models miss it.
              </text>
            </g>
          )}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2 border-t border-[#1C1E1C] font-mono text-[9px] text-[#9CA3AF]">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-[2px] bg-[#64748B] inline-block" /> ARY.01 30s base
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-[2px] bg-[#3B82F6] inline-block" /> ARY.01 30s + RAMX
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-[2px] bg-[#10B981] inline-block" /> ARY 5s base
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-[2px] bg-[#2DD4BF] inline-block" /> ARY 5s + RAMX
          </span>
        </div>
      </div>

      {/* ─── Lab Target Monitoring Panel (4 Model Cards) ─────────────── */}
      <div className="mt-3.5 bg-[#0E0F0E] border border-[#222422] rounded-xl p-3.5">
        {/* Header line */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#1E201E]">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${attackOccurred ? 'bg-[#EF4444] animate-ping' : 'bg-[#10B981]'}`} />
            <span className="font-mono text-xs text-[#E5E7EB] font-medium">
              Lab target — <span className="text-[#9CA3AF]">target-server (Apache)</span>
            </span>
          </div>
          <span
            className={`font-mono text-[10px] tracking-wider uppercase font-semibold ${
              attackOccurred ? 'text-[#F87171]' : 'text-[#10B981]'
            }`}
          >
            {attackOccurred ? 'attack detected' : 'monitoring normal'}
          </span>
        </div>

        {/* 4 Model Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
          {/* Card 1: ARY.01 30s base */}
          <div className="bg-[#141614] border border-[#262826] rounded-lg p-2.5">
            <div className="font-mono text-[9px] text-[#9CA3AF] truncate">ARY.01 30s base</div>
            <div className="font-mono font-bold text-lg text-[#F5F0EB] mt-0.5">
              {latest.ary30Base.toFixed(2)}
            </div>
            <div className="font-mono text-[9px] text-[#6B7280] tracking-wider uppercase mt-0.5">
              quiet
            </div>
          </div>

          {/* Card 2: ARY.01 30s + RAMX */}
          <div
            className={`rounded-lg p-2.5 transition-colors duration-300 ${
              latest.ary30Ramx >= 0.5
                ? 'bg-[#2A1515] border border-[#F87171]'
                : 'bg-[#141614] border border-[#262826]'
            }`}
          >
            <div className="font-mono text-[9px] text-[#9CA3AF] truncate">ARY.01 30s + RAMX</div>
            <div
              className={`font-mono font-bold text-lg mt-0.5 ${
                latest.ary30Ramx >= 0.5 ? 'text-[#F87171]' : 'text-[#F5F0EB]'
              }`}
            >
              {latest.ary30Ramx.toFixed(2)}
            </div>
            <div
              className={`font-mono text-[9px] tracking-wider uppercase mt-0.5 font-bold ${
                latest.ary30Ramx >= 0.5 ? 'text-[#F87171]' : 'text-[#6B7280]'
              }`}
            >
              {latest.ary30Ramx >= 0.5 ? 'ALERT' : 'quiet'}
            </div>
          </div>

          {/* Card 3: ARY 5s base */}
          <div className="bg-[#141614] border border-[#262826] rounded-lg p-2.5">
            <div className="font-mono text-[9px] text-[#9CA3AF] truncate">ARY 5s base</div>
            <div className="font-mono font-bold text-lg text-[#F5F0EB] mt-0.5">
              {latest.ary5Base.toFixed(2)}
            </div>
            <div className="font-mono text-[9px] text-[#6B7280] tracking-wider uppercase mt-0.5">
              quiet
            </div>
          </div>

          {/* Card 4: ARY 5s + RAMX */}
          <div
            className={`rounded-lg p-2.5 transition-colors duration-300 ${
              latest.ary5Ramx >= 0.5
                ? 'bg-[#2A1515] border border-[#F87171]'
                : 'bg-[#141614] border border-[#262826]'
            }`}
          >
            <div className="font-mono text-[9px] text-[#9CA3AF] truncate">ARY 5s + RAMX</div>
            <div
              className={`font-mono font-bold text-lg mt-0.5 ${
                latest.ary5Ramx >= 0.5 ? 'text-[#F87171]' : 'text-[#F5F0EB]'
              }`}
            >
              {latest.ary5Ramx.toFixed(2)}
            </div>
            <div
              className={`font-mono text-[9px] tracking-wider uppercase mt-0.5 font-bold ${
                latest.ary5Ramx >= 0.5 ? 'text-[#F87171]' : 'text-[#6B7280]'
              }`}
            >
              {latest.ary5Ramx >= 0.5 ? 'ALERT' : 'quiet'}
            </div>
          </div>
        </div>

        {/* ─── Numbered Narrative Steps ─── */}
        <div className="mt-3.5 pt-3 border-t border-[#1C1E1C] space-y-1.5 font-mono text-[10px] md:text-[10.5px] leading-relaxed">
          <p className={currentStep >= 0 ? 'text-[#E5E7EB]' : 'text-[#4B5563]'}>
            1. Capturing traffic in 15 s windows. The first 20 are benign warm-up.
          </p>
          <p className={currentStep >= 10 ? 'text-[#E5E7EB]' : 'text-[#4B5563]'}>
            2. Window 10: still benign. Every model is under 0.05.
          </p>
          <p className={currentStep >= 20 ? 'text-[#FCA5A5]' : 'text-[#4B5563]'}>
            3. Attacker starts a cred_theft run against the target.
          </p>
          <p className={currentStep >= 20 ? 'text-[#F87171] font-semibold' : 'text-[#4B5563]'}>
            4. ARY.01 30s + RAMX reads 0.57: ALERT. ARY 5s + RAMX reads 0.58: ALERT.
          </p>
          <p className={currentStep >= 21 ? 'text-[#E5E7EB]' : 'text-[#4B5563]'}>
            5. 2 base models stay under 0.06 and miss it.
          </p>
          <p className={currentStep >= 24 ? 'text-[#C5F36B] font-bold' : 'text-[#4B5563]'}>
            6. Round over: 2 of 4 models detected the attack.
          </p>
        </div>

        {/* Disclaimer / info text */}
        <p className="mt-3 pt-2.5 border-t border-[#1C1E1C] font-mono text-[9px] text-[#6B7280] italic leading-relaxed">
          “Hack the site” replays the saved round's real traces against a mock of the lab target. This
          page never attacks anything. 15 s windows, attack at step 20.
        </p>
      </div>

      {/* ─── Bottom Section: Lab Console View ─────────────────────────── */}
      <div className="mt-3.5 border border-[#222422] rounded-xl overflow-hidden bg-[#0A0D14]">
        {/* Console Nav Bar */}
        <div className="bg-[#0F172A]/90 px-3.5 py-2 flex items-center justify-between border-b border-[#1E293B] text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-[#38BDF8]" />
            <span className="text-[#38BDF8] font-bold tracking-wider">PRISM SOC Console</span>
            <span className="text-[#64748B]">|</span>
            <span className="text-[#94A3B8]">Lab Session: #042</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
              Live Feed
            </span>
            <span className="text-[#94A3B8] text-[9px]">02:14 / 05:00</span>
          </div>
        </div>

        {/* Console Body: Split screen (Spectrogram / Forecast on left, Terminal Log on right) */}
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Left: Mini Forecast / Spectrogram view */}
          <div className="bg-[#060911] border border-[#1E293B] rounded-lg p-2.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-[#94A3B8] mb-2">
              <span className="flex items-center gap-1">
                <Activity size={10} className="text-[#C5F36B]" />
                Temporal Rollout Risk
              </span>
              <span className="text-[#38BDF8]">K=10 forward steps</span>
            </div>

            {/* Simulated mini horizon bars */}
            <div className="space-y-1.5 py-1">
              {[
                { label: 't + 15s', prob: attackOccurred ? 0.88 : 0.04 },
                { label: 't + 30s', prob: attackOccurred ? 0.92 : 0.03 },
                { label: 't + 45s', prob: attackOccurred ? 0.74 : 0.05 },
                { label: 't + 60s', prob: attackOccurred ? 0.65 : 0.02 },
              ].map((h, i) => (
                <div key={i} className="flex items-center gap-2 font-mono text-[8.5px]">
                  <span className="w-10 text-[#64748B] shrink-0">{h.label}</span>
                  <div className="flex-1 h-3 bg-[#111827] rounded overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 ${
                        h.prob > 0.5 ? 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444]' : 'bg-[#10B981]'
                      }`}
                      style={{ width: `${h.prob * 100}%` }}
                    />
                  </div>
                  <span
                    className={`w-8 text-right font-bold ${
                      h.prob > 0.5 ? 'text-[#F87171]' : 'text-[#64748B]'
                    }`}
                  >
                    {(h.prob * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[8px] font-mono text-[#64748B] text-right">
              World Model Rollout Simulator v2.1
            </div>
          </div>

          {/* Right: Live Telemetry Terminal */}
          <div className="bg-[#05070D] border border-[#1E293B] rounded-lg p-2.5 font-mono text-[8.5px] leading-relaxed text-[#94A3B8] h-32 overflow-hidden flex flex-col justify-end">
            <div className="text-[#38BDF8]">[00:00:15] Capturing on eth0 (15s sliding window)...</div>
            <div className="text-[#64748B]">[00:02:45] Scaler normalized: 292 network features.</div>
            {currentStep >= 10 && (
              <div className="text-[#10B981]">[00:03:30] Baseline calibrator: variance floor OK.</div>
            )}
            {attackOccurred ? (
              <>
                <div className="text-[#F59E0B] font-semibold">
                  [00:05:00] [!] ANOMALY: SSH brute force & cred_theft detected on Apache:80.
                </div>
                <div className="text-[#EF4444] font-bold">
                  [00:05:15] [!] MITRE T1078 (Valid Accounts) matched. RAMX Alert: 0.58.
                </div>
                <div className="text-[#C5F36B]">
                  [00:05:30] [*] Preemption Engine: Generated preventative lease revocation.
                </div>
              </>
            ) : (
              <div className="text-[#64748B] italic">[00:04:15] Infiltration probability: 0.02 (Nominal).</div>
            )}
          </div>
        </div>

        {/* Caption */}
        <div className="px-3.5 py-1.5 bg-[#080B12] border-t border-[#1E293B] text-center font-mono text-[8.5px] text-[#64748B]">
          The lab console the round was recorded in.
        </div>
      </div>
    </div>
  )
}
