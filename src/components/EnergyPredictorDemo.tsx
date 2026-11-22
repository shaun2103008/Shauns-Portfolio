import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun,
  Wind,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Activity,
  CloudSun,
  CheckCircle2,
  TrendingUp,
  Cpu,
} from 'lucide-react'

// ─── Scenario Data Generation based on DTU SOLETE 15-month dataset ───
export interface HourlyDataPoint {
  hour: number // 0 to 23
  timeStr: string // "00:00", "01:00", ...
  ghi: number // W/m^2 (Global Horizontal Irradiance)
  windSpeed: number // m/s
  temp: number // deg C
  solarYield: number // kW
  windYield: number // kW
  hybridEnsemble: number // kW (Hybrid Voting Ensemble)
  rfYield: number // kW (Random Forest)
  xgbYield: number // kW (XGBoost)
  lgbYield: number // kW (LightGBM)
}

export type ScenarioPreset = 'summer_clear' | 'wind_storm' | 'cloudy_spring' | 'custom'

// Physics & empirical regression model aligned with DTU SOLETE benchmarks
function calculateYields(ghi: number, windSpeed: number, temp: number, hour: number) {
  // 1. Solar calculation with diurnal curve & thermal derating
  const isDaylight = hour >= 6 && hour <= 19
  let solarBase = 0
  if (isDaylight && ghi > 0) {
    // Thermal coefficient: -0.4%/deg C above 25C
    const thermalDerating = Math.max(0.82, 1 - 0.004 * (temp - 25))
    // Empirical solar conversion for a 5kW rated residential/small-commercial array
    solarBase = Math.min(5.2, (ghi / 1000) * 5.0 * thermalDerating)
  }

  // 2. Wind calculation with turbine power curve
  // Cut-in: 3.0 m/s, Rated: 12.0 m/s (5kW rated), Cut-out: 25.0 m/s
  let windBase = 0
  if (windSpeed >= 3.0 && windSpeed <= 25.0) {
    if (windSpeed >= 12.0) {
      windBase = 5.0
    } else {
      // Cubic progression between cut-in and rated
      const vNorm = (Math.pow(windSpeed, 3) - Math.pow(3.0, 3)) / (Math.pow(12.0, 3) - Math.pow(3.0, 3))
      windBase = Math.max(0, Math.min(5.0, 5.0 * vNorm))
    }
  }

  // 3. Multi-model ensemble simulation with trained model variance
  const solarRounded = Number(solarBase.toFixed(2))
  const windRounded = Number(windBase.toFixed(2))
  const trueHybrid = solarBase + windBase

  // Slight model variances (DTU SOLETE ensemble weights: RF=0.35, XGB=0.35, LGB=0.30)
  const rf = Number(Math.max(0, trueHybrid + (Math.sin(hour * 1.3) * 0.04 - 0.02)).toFixed(2))
  const xgb = Number(Math.max(0, trueHybrid + (Math.cos(hour * 0.9) * 0.03 + 0.01)).toFixed(2))
  const lgb = Number(Math.max(0, trueHybrid + (Math.sin(hour * 0.6) * 0.03 - 0.01)).toFixed(2))
  const ensemble = Number((rf * 0.35 + xgb * 0.35 + lgb * 0.3).toFixed(2))

  return {
    solarYield: solarRounded,
    windYield: windRounded,
    hybridEnsemble: ensemble,
    rfYield: rf,
    xgbYield: xgb,
    lgbYield: lgb,
  }
}

// Generate 24 hours of synthetic telemetry for each preset
function generateScenarioData(preset: ScenarioPreset): HourlyDataPoint[] {
  const points: HourlyDataPoint[] = []

  for (let h = 0; h < 24; h++) {
    const timeStr = `${h.toString().padStart(2, '0')}:00`
    let ghi = 0
    let windSpeed = 0
    let temp = 20

    if (preset === 'summer_clear') {
      // High solar peak, moderate afternoon wind breeze
      temp = 22 + Math.sin(((h - 8) / 14) * Math.PI) * 9 // 22C to 31C
      if (h >= 6 && h <= 19) {
        const solarElevation = Math.sin(((h - 6) / 13) * Math.PI)
        ghi = Math.round(920 * Math.pow(solarElevation, 1.15))
      }
      // Wind dips in morning, rises in evening (coastal breeze)
      windSpeed = Number((4.2 + Math.sin(((h - 12) / 12) * Math.PI) * 3.6).toFixed(1))
    } else if (preset === 'wind_storm') {
      // Overcast autumn storm: heavy winds, very low diffuse solar
      temp = 14 + Math.sin((h / 24) * Math.PI * 2) * 2 // 12C to 16C
      if (h >= 7 && h <= 18) {
        ghi = Math.round(130 * Math.sin(((h - 7) / 11) * Math.PI)) // max ~130 W/m^2
      }
      // Gale wind gusts 13-17 m/s
      windSpeed = Number((14.2 + Math.sin(h * 0.8) * 2.6).toFixed(1))
    } else if (preset === 'cloudy_spring') {
      // Intermittent cloud cover, moderate variable wind
      temp = 18 + Math.sin(((h - 7) / 14) * Math.PI) * 5
      if (h >= 6 && h <= 19) {
        const clearGhi = 740 * Math.sin(((h - 6) / 13) * Math.PI)
        // Cloud occlusion factor
        const cloudDip = 0.4 + 0.5 * Math.abs(Math.sin(h * 1.5))
        ghi = Math.round(clearGhi * cloudDip)
      }
      windSpeed = Number((7.0 + Math.sin(h * 1.1) * 2.8).toFixed(1))
    } else {
      // Custom default base
      temp = 24
      if (h >= 6 && h <= 19) {
        ghi = Math.round(650 * Math.sin(((h - 6) / 13) * Math.PI))
      }
      windSpeed = 6.5
    }

    const yields = calculateYields(ghi, windSpeed, temp, h)

    points.push({
      hour: h,
      timeStr,
      ghi,
      windSpeed,
      temp: Number(temp.toFixed(1)),
      ...yields,
    })
  }

  return points
}

export default function EnergyPredictorDemo() {
  const [preset, setPreset] = useState<ScenarioPreset>('summer_clear')
  const [currentHour, setCurrentHour] = useState<number>(13) // Start at solar peak noon
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<'ensemble' | 'rf' | 'xgb' | 'lgb'>('ensemble')

  // Custom slider values when in 'custom' preset
  const [customGhi, setCustomGhi] = useState<number>(750)
  const [customWind, setCustomWind] = useState<number>(8.2)
  const [customTemp, setCustomTemp] = useState<number>(26)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Dataset generation
  const dataset = useMemo(() => {
    if (preset === 'custom') {
      // For custom, compute 24h where current hour has the exact slider values
      const base = generateScenarioData('custom')
      base[currentHour] = {
        hour: currentHour,
        timeStr: `${currentHour.toString().padStart(2, '0')}:00`,
        ghi: customGhi,
        windSpeed: customWind,
        temp: customTemp,
        ...calculateYields(customGhi, customWind, customTemp, currentHour),
      }
      return base
    }
    return generateScenarioData(preset)
  }, [preset, customGhi, customWind, customTemp, currentHour])

  const activePoint = dataset[currentHour] || dataset[0]

  // Playback timer
  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const startPlayback = useCallback(() => {
    stopPlayback()
    setIsPlaying(true)
    timerRef.current = setInterval(() => {
      setCurrentHour((prev) => (prev + 1) % 24)
    }, 450)
  }, [stopPlayback])

  useEffect(() => {
    return () => stopPlayback()
  }, [stopPlayback])

  // SVG Chart Geometry
  const chartWidth = 540
  const chartHeight = 170
  const padding = { top: 16, right: 18, bottom: 26, left: 34 }
  const innerW = chartWidth - padding.left - padding.right
  const innerH = chartHeight - padding.top - padding.bottom

  const maxKw = 10.5 // scale limit

  const getX = (hour: number) => padding.left + (hour / 23) * innerW
  const getY = (val: number) => padding.top + innerH - (Math.min(maxKw, Math.max(0, val)) / maxKw) * innerH

  // Generate SVG path strings
  const solarPath = useMemo(() => {
    return dataset
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.hour).toFixed(1)} ${getY(d.solarYield).toFixed(1)}`)
      .join(' ')
  }, [dataset])

  const solarAreaPath = useMemo(() => {
    const bottom = padding.top + innerH
    return `${solarPath} L ${getX(23)} ${bottom} L ${getX(0)} ${bottom} Z`
  }, [solarPath])

  const windPath = useMemo(() => {
    return dataset
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.hour).toFixed(1)} ${getY(d.windYield).toFixed(1)}`)
      .join(' ')
  }, [dataset])

  const hybridPath = useMemo(() => {
    return dataset
      .map((d, i) => {
        const val =
          selectedModel === 'ensemble'
            ? d.hybridEnsemble
            : selectedModel === 'rf'
            ? d.rfYield
            : selectedModel === 'xgb'
            ? d.xgbYield
            : d.lgbYield
        return `${i === 0 ? 'M' : 'L'} ${getX(d.hour).toFixed(1)} ${getY(val).toFixed(1)}`
      })
      .join(' ')
  }, [dataset, selectedModel])

  // Summary Metrics
  const solarRatio =
    activePoint.hybridEnsemble > 0
      ? Math.round((activePoint.solarYield / (activePoint.solarYield + activePoint.windYield || 1)) * 100)
      : 0
  const windRatio = 100 - solarRatio

  return (
    <div className="w-full bg-[#0E0F0E] border border-[#262826] rounded-xl overflow-hidden font-mono shadow-2xl transition-all">
      {/* ── Top Bar: Header & Status ── */}
      <div className="bg-[#141614] border-b border-[#262826] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5F36B] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5F36B]" />
          </span>
          <span className="text-[#F5F0EB] font-bold tracking-wider text-[11px] uppercase">
            DTU SOLETE · 24H YIELD FORECAST
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-[#1C1F1C] border border-[#323632] text-[#A3E635] px-2 py-0.5 rounded">
            R² 0.9227
          </span>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 bg-[#090A09] border border-[#262826] p-1 rounded-md text-[10px]">
          <button
            onClick={() => {
              stopPlayback()
              setPreset('summer_clear')
            }}
            className={`px-2 py-1 rounded transition-colors ${
              preset === 'summer_clear'
                ? 'bg-[#C5F36B] text-[#090A09] font-bold'
                : 'text-[#8A8A8A] hover:text-[#F5F0EB]'
            }`}
            title="High Solar / Moderate Wind"
          >
            ☀️ Clear
          </button>
          <button
            onClick={() => {
              stopPlayback()
              setPreset('wind_storm')
            }}
            className={`px-2 py-1 rounded transition-colors ${
              preset === 'wind_storm'
                ? 'bg-[#C5F36B] text-[#090A09] font-bold'
                : 'text-[#8A8A8A] hover:text-[#F5F0EB]'
            }`}
            title="Gale Wind / Overcast"
          >
            💨 Gale
          </button>
          <button
            onClick={() => {
              stopPlayback()
              setPreset('cloudy_spring')
            }}
            className={`px-2 py-1 rounded transition-colors ${
              preset === 'cloudy_spring'
                ? 'bg-[#C5F36B] text-[#090A09] font-bold'
                : 'text-[#8A8A8A] hover:text-[#F5F0EB]'
            }`}
            title="Intermittent Cloud Dynamics"
          >
            ⛅ Spring
          </button>
          <button
            onClick={() => {
              stopPlayback()
              setPreset('custom')
            }}
            className={`px-2 py-1 rounded transition-colors ${
              preset === 'custom'
                ? 'bg-[#C5F36B] text-[#090A09] font-bold'
                : 'text-[#8A8A8A] hover:text-[#F5F0EB]'
            }`}
            title="Interactive Manual Sliders"
          >
            <Sliders className="w-3 h-3 inline-block" />
          </button>
        </div>
      </div>

      {/* ── Main Chart Canvas ── */}
      <div className="relative p-4 pb-2 bg-[#0A0B0A]">
        {/* SVG Defs for Gradients */}
        <svg className="w-full h-auto overflow-visible select-none" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <defs>
            <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="hybridStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#A3E635" />
              <stop offset="100%" stopColor="#C5F36B" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 2.5, 5.0, 7.5, 10.0].map((level) => {
            const y = getY(level)
            return (
              <g key={level}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#262826"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#5A5A5A"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {level.toFixed(1)}k
                </text>
              </g>
            )
          })}

          {/* Horizon time markers */}
          {[0, 4, 8, 12, 16, 20, 23].map((h) => {
            const x = getX(h)
            return (
              <g key={h}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + innerH}
                  stroke="#1B1D1B"
                  strokeWidth="0.6"
                />
                <text
                  x={x}
                  y={padding.top + innerH + 14}
                  textAnchor="middle"
                  fill="#737373"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {h.toString().padStart(2, '0')}h
                </text>
              </g>
            )
          })}

          {/* Shaded Area Fills */}
          <path d={solarAreaPath} fill="url(#solarGradient)" />

          {/* Solar Yield Curve */}
          <path d={solarPath} fill="none" stroke="#F59E0B" strokeWidth="1.6" strokeOpacity="0.8" />

          {/* Wind Yield Curve */}
          <path d={windPath} fill="none" stroke="#2DD4BF" strokeWidth="1.6" strokeOpacity="0.75" />

          {/* Hybrid Ensemble Curve */}
          <path
            d={hybridPath}
            fill="none"
            stroke="url(#hybridStroke)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Hour Scrubber Cursor */}
          <g transform={`translate(${getX(currentHour)}, 0)`}>
            <line
              x1="0"
              y1={padding.top}
              x2="0"
              y2={padding.top + innerH}
              stroke="#C5F36B"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            {/* Active dots */}
            <circle cy={getY(activePoint.solarYield)} r="3.2" fill="#F59E0B" />
            <circle cy={getY(activePoint.windYield)} r="3.2" fill="#2DD4BF" />
            <circle
              cy={getY(
                selectedModel === 'ensemble'
                  ? activePoint.hybridEnsemble
                  : selectedModel === 'rf'
                  ? activePoint.rfYield
                  : selectedModel === 'xgb'
                  ? activePoint.xgbYield
                  : activePoint.lgbYield
              )}
              r="4.5"
              fill="#C5F36B"
              stroke="#090A09"
              strokeWidth="1.5"
            />
          </g>
        </svg>

        {/* Legend Overlay */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] mt-1 px-2 text-[#8A8A8A]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#F59E0B] inline-block rounded-full" />
              <span className="text-[#F5F0EB]/90">Solar ({activePoint.solarYield} kW)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#2DD4BF] inline-block rounded-full" />
              <span className="text-[#F5F0EB]/90">Wind ({activePoint.windYield} kW)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-[#C5F36B] inline-block rounded-full" />
              <span className="text-[#C5F36B] font-semibold">
                Hybrid Ensemble ({activePoint.hybridEnsemble} kW)
              </span>
            </span>
          </div>

          <div className="text-[10px] text-[#A3E635] flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>Horizon: {activePoint.timeStr}</span>
          </div>
        </div>
      </div>

      {/* ── Playback Controls & Scrubber ── */}
      <div className="px-4 py-2 bg-[#121312] border-t border-b border-[#262826] flex items-center gap-3">
        <button
          onClick={() => (isPlaying ? stopPlayback() : startPlayback())}
          className="px-3 py-1.5 rounded bg-[#1F221F] border border-[#323632] hover:border-[#C5F36B] text-[#C5F36B] transition-colors flex items-center gap-1.5 text-xs font-semibold"
          aria-label={isPlaying ? 'Pause simulation' : 'Play 24-hour simulation'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Pause' : 'Play 24h'}</span>
        </button>

        <button
          onClick={() => {
            stopPlayback()
            setCurrentHour(12)
          }}
          className="p-1.5 rounded bg-[#1F221F] border border-[#323632] text-[#8A8A8A] hover:text-[#F5F0EB] transition-colors"
          title="Reset to Midday (12:00)"
          aria-label="Reset simulation to midday"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Hour scrubber slider */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-[10px] text-[#5A5A5A] min-w-[28px]">00h</span>
          <input
            type="range"
            min={0}
            max={23}
            value={currentHour}
            onChange={(e) => {
              stopPlayback()
              setCurrentHour(parseInt(e.target.value))
            }}
            className="w-full accent-[#C5F36B] cursor-pointer h-1.5 bg-[#262826] rounded-lg"
            aria-label="Hour of day scrubber"
          />
          <span className="text-[10px] text-[#5A5A5A] min-w-[28px]">23h</span>
        </div>

        <span className="text-xs font-bold text-[#F5F0EB] bg-[#1A1D1A] px-2.5 py-1 rounded border border-[#323632]">
          {activePoint.timeStr}
        </span>
      </div>

      {/* ── Custom Tuning Sliders (Visible in 'custom' preset) ── */}
      <AnimatePresence>
        {preset === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-[#101210] border-b border-[#262826] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
          >
            <div>
              <div className="flex justify-between text-[11px] text-[#8A8A8A] mb-1">
                <span>Solar Irradiance (GHI)</span>
                <span className="text-[#F59E0B] font-bold">{customGhi} W/m²</span>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={25}
                value={customGhi}
                onChange={(e) => setCustomGhi(parseInt(e.target.value))}
                className="w-full accent-[#F59E0B] cursor-pointer h-1 bg-[#262826] rounded"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-[#8A8A8A] mb-1">
                <span>Wind Speed (Hub 10m)</span>
                <span className="text-[#2DD4BF] font-bold">{customWind} m/s</span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                step={0.5}
                value={customWind}
                onChange={(e) => setCustomWind(parseFloat(e.target.value))}
                className="w-full accent-[#2DD4BF] cursor-pointer h-1 bg-[#262826] rounded"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-[#8A8A8A] mb-1">
                <span>Ambient Temp (Thermal)</span>
                <span className="text-[#A3E635] font-bold">{customTemp}°C</span>
              </div>
              <input
                type="range"
                min={-5}
                max={40}
                step={1}
                value={customTemp}
                onChange={(e) => setCustomTemp(parseInt(e.target.value))}
                className="w-full accent-[#A3E635] cursor-pointer h-1 bg-[#262826] rounded"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Telemetry Grid: Model Inferences & Complementarity ── */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* Total Hybrid Yield */}
        <div className="bg-[#141614] border border-[#2D312D] p-3 rounded-lg col-span-2 sm:col-span-1">
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider flex items-center justify-between">
            <span>Ensemble Yield</span>
            <Zap className="w-3 h-3 text-[#C5F36B]" />
          </div>
          <div className="text-2xl font-bold text-[#C5F36B] mt-1">
            {activePoint.hybridEnsemble} <span className="text-xs font-normal text-[#8A8A8A]">kW</span>
          </div>
          <div className="text-[10px] text-[#8A8A8A] mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#A3E635]" />
            <span>Optimal Grid Dispatch</span>
          </div>
        </div>

        {/* Solar Generation */}
        <div className="bg-[#141614] border border-[#2D312D] p-3 rounded-lg">
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider flex items-center justify-between">
            <span>Solar Yield</span>
            <Sun className="w-3 h-3 text-[#F59E0B]" />
          </div>
          <div className="text-xl font-bold text-[#F59E0B] mt-1">
            {activePoint.solarYield} <span className="text-xs font-normal text-[#8A8A8A]">kW</span>
          </div>
          <div className="text-[10px] text-[#8A8A8A] mt-1">{activePoint.ghi} W/m² GHI</div>
        </div>

        {/* Wind Generation */}
        <div className="bg-[#141614] border border-[#2D312D] p-3 rounded-lg">
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider flex items-center justify-between">
            <span>Wind Yield</span>
            <Wind className="w-3 h-3 text-[#2DD4BF]" />
          </div>
          <div className="text-xl font-bold text-[#2DD4BF] mt-1">
            {activePoint.windYield} <span className="text-xs font-normal text-[#8A8A8A]">kW</span>
          </div>
          <div className="text-[10px] text-[#8A8A8A] mt-1">{activePoint.windSpeed} m/s velocity</div>
        </div>

        {/* Complementarity Ratio */}
        <div className="bg-[#141614] border border-[#2D312D] p-3 rounded-lg col-span-2 sm:col-span-1">
          <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider flex items-center justify-between">
            <span>Energy Mix</span>
            <TrendingUp className="w-3 h-3 text-[#A3E635]" />
          </div>
          <div className="flex items-center gap-1 mt-2">
            <div className="h-2 rounded-l bg-[#F59E0B]" style={{ width: `${solarRatio}%` }} />
            <div className="h-2 rounded-r bg-[#2DD4BF]" style={{ width: `${windRatio}%` }} />
          </div>
          <div className="text-[10px] text-[#8A8A8A] mt-1.5 flex justify-between">
            <span>☀️ {solarRatio}%</span>
            <span>💨 {windRatio}%</span>
          </div>
        </div>
      </div>

      {/* ── Multi-Model Voting Ensemble Inspector ── */}
      <div className="px-4 pb-4 pt-1 border-t border-[#1F211F]">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8A8A8A] mb-2">
          <div className="flex items-center gap-1.5 text-[#F5F0EB]">
            <Cpu className="w-3.5 h-3.5 text-[#C5F36B]" />
            <span className="font-semibold text-[11px]">Ensemble Model Consensus</span>
          </div>
          <span className="text-[10px] text-[#5A5A5A]">DTU SOLETE Holdout Validation</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
          <button
            onClick={() => setSelectedModel('ensemble')}
            className={`p-2 rounded border transition-all ${
              selectedModel === 'ensemble'
                ? 'bg-[#1D211D] border-[#C5F36B] text-[#C5F36B]'
                : 'bg-[#121412] border-[#262826] text-[#8A8A8A] hover:text-[#F5F0EB]'
            }`}
          >
            <div className="font-bold">Voting Ensemble</div>
            <div className="text-xs font-mono font-bold mt-0.5">{activePoint.hybridEnsemble} kW</div>
            <div className="text-[9px] text-[#A3E635] mt-0.5">R² 0.9227</div>
          </button>

          <button
            onClick={() => setSelectedModel('rf')}
            className={`p-2 rounded border transition-all ${
              selectedModel === 'rf'
                ? 'bg-[#1D211D] border-[#C5F36B] text-[#C5F36B]'
                : 'bg-[#121412] border-[#262826] text-[#8A8A8A] hover:text-[#F5F0EB]'
            }`}
          >
            <div className="font-bold">Random Forest</div>
            <div className="text-xs font-mono font-bold mt-0.5">{activePoint.rfYield} kW</div>
            <div className="text-[9px] text-[#8A8A8A] mt-0.5">R² 0.9092</div>
          </button>

          <button
            onClick={() => setSelectedModel('xgb')}
            className={`p-2 rounded border transition-all ${
              selectedModel === 'xgb'
                ? 'bg-[#1D211D] border-[#C5F36B] text-[#C5F36B]'
                : 'bg-[#121412] border-[#262826] text-[#8A8A8A] hover:text-[#F5F0EB]'
            }`}
          >
            <div className="font-bold">XGBoost</div>
            <div className="text-xs font-mono font-bold mt-0.5">{activePoint.xgbYield} kW</div>
            <div className="text-[9px] text-[#8A8A8A] mt-0.5">R² 0.9184</div>
          </button>

          <button
            onClick={() => setSelectedModel('lgb')}
            className={`p-2 rounded border transition-all ${
              selectedModel === 'lgb'
                ? 'bg-[#1D211D] border-[#C5F36B] text-[#C5F36B]'
                : 'bg-[#121412] border-[#262826] text-[#8A8A8A] hover:text-[#F5F0EB]'
            }`}
          >
            <div className="font-bold">LightGBM</div>
            <div className="text-xs font-mono font-bold mt-0.5">{activePoint.lgbYield} kW</div>
            <div className="text-[9px] text-[#8A8A8A] mt-0.5">R² 0.9150</div>
          </button>
        </div>
      </div>
    </div>
  )
}

