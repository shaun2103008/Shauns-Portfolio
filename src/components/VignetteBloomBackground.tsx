import React, { useEffect, useRef, useState } from 'react'
import { Sparkles, Orbit, Cpu, Mountain, Sun, type LucideIcon } from 'lucide-react'

export type CinematicSceneType = 'neural' | 'singularity' | 'monolith' | 'bloom'

interface VignetteBloomProps {
  className?: string
  cellSize?: number
  darkness?: number // 0 to 1, higher = darker background for readability
  animSpeed?: number
  initialScene?: CinematicSceneType
}

export default function VignetteBloomBackground({
  className = '',
  cellSize = 15,
  darkness = 0.78,
  animSpeed = 1.0,
  initialScene = 'neural',
}: VignetteBloomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeScene, setActiveScene] = useState<CinematicSceneType>(initialScene)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    let animationFrameId: number
    let isVisible = true
    let width = 0
    let height = 0

    // Offscreen buffer for procedurally painting the cinematic artworks
    const offscreen = document.createElement('canvas')
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return

    // Cell data cache
    interface GridCell {
      x: number
      y: number
      r: number
      g: number
      b: number
      lum: number
      isBeam: boolean
    }
    let gridCells: GridCell[] = []
    let cols = 0
    let rows = 0

    // ── SCENE 1: Neural Android / Cybernetic AI (Ex Machina / Blade Runner) ──
    const drawNeuralScene = (w: number, h: number, scale: number) => {
      // Dark cyberpunk moody backdrop with deep cyan-emerald mist
      const bgGrad = offCtx.createLinearGradient(0, 0, w, h)
      bgGrad.addColorStop(0, '#040605')
      bgGrad.addColorStop(0.5, '#08100C')
      bgGrad.addColorStop(1, '#030504')
      offCtx.fillStyle = bgGrad
      offCtx.fillRect(0, 0, w, h)

      const headX = w * 0.42
      const headY = h * 0.48

      // Deep atmospheric volumetric glow behind figure
      const aura = offCtx.createRadialGradient(headX, headY, 20 * scale, headX, headY, 340 * scale)
      aura.addColorStop(0, 'rgba(197, 243, 107, 0.16)')
      aura.addColorStop(0.4, 'rgba(40, 160, 120, 0.08)')
      aura.addColorStop(1, 'transparent')
      offCtx.fillStyle = aura
      offCtx.fillRect(0, 0, w, h)

      // ── Anamorphic Horizontal Lens Flare (Cyan/White Core) ──
      offCtx.save()
      const beamY = headY - 18 * scale
      const flareOriginX = headX + 32 * scale

      // Broad horizontal streak
      const streakGrad = offCtx.createLinearGradient(flareOriginX, beamY, w, beamY)
      streakGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
      streakGrad.addColorStop(0.1, 'rgba(197, 243, 107, 0.85)')
      streakGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.45)')
      streakGrad.addColorStop(0.7, 'rgba(20, 140, 180, 0.18)')
      streakGrad.addColorStop(1, 'transparent')

      offCtx.fillStyle = streakGrad
      offCtx.beginPath()
      offCtx.moveTo(flareOriginX, beamY - 14 * scale)
      offCtx.lineTo(w, beamY - 80 * scale)
      offCtx.lineTo(w, beamY + 90 * scale)
      offCtx.lineTo(flareOriginX, beamY + 14 * scale)
      offCtx.closePath()
      offCtx.fill()

      // Razor-sharp horizontal cyan-white optical streak
      const laserGrad = offCtx.createLinearGradient(0, beamY, w, beamY)
      laserGrad.addColorStop(0, 'transparent')
      laserGrad.addColorStop(0.35, 'rgba(197, 243, 107, 0.4)')
      laserGrad.addColorStop(0.44, 'rgba(255, 255, 255, 0.95)')
      laserGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.4)')
      laserGrad.addColorStop(1, 'transparent')
      offCtx.strokeStyle = laserGrad
      offCtx.lineWidth = 4 * scale
      offCtx.beginPath()
      offCtx.moveTo(0, beamY)
      offCtx.lineTo(w, beamY)
      offCtx.stroke()
      offCtx.restore()

      // ── Cybernetic Android Bust & Torso ──
      offCtx.save()
      const bodyGrad = offCtx.createLinearGradient(
        headX - 120 * scale,
        headY + 100 * scale,
        headX + 80 * scale,
        h
      )
      bodyGrad.addColorStop(0, '#1C2720')
      bodyGrad.addColorStop(0.4, '#131D17')
      bodyGrad.addColorStop(0.8, '#0B120E')
      bodyGrad.addColorStop(1, '#050806')

      offCtx.fillStyle = bodyGrad
      offCtx.beginPath()
      offCtx.moveTo(headX - 180 * scale, h)
      offCtx.bezierCurveTo(
        headX - 140 * scale,
        headY + 220 * scale,
        headX - 90 * scale,
        headY + 160 * scale,
        headX - 40 * scale,
        headY + 130 * scale
      )
      offCtx.lineTo(headX + 40 * scale, headY + 125 * scale)
      offCtx.bezierCurveTo(
        headX + 100 * scale,
        headY + 150 * scale,
        headX + 170 * scale,
        headY + 230 * scale,
        headX + 210 * scale,
        h
      )
      offCtx.closePath()
      offCtx.fill()

      // Neck & Jawline
      const neckGrad = offCtx.createLinearGradient(
        headX - 35 * scale,
        headY + 40 * scale,
        headX + 35 * scale,
        headY + 130 * scale
      )
      neckGrad.addColorStop(0, '#26382C')
      neckGrad.addColorStop(0.6, '#18261E')
      neckGrad.addColorStop(1, '#0E1712')
      offCtx.fillStyle = neckGrad
      offCtx.beginPath()
      offCtx.moveTo(headX - 35 * scale, headY + 45 * scale)
      offCtx.lineTo(headX - 45 * scale, headY + 130 * scale)
      offCtx.lineTo(headX + 38 * scale, headY + 125 * scale)
      offCtx.lineTo(headX + 28 * scale, headY + 38 * scale)
      offCtx.closePath()
      offCtx.fill()

      // Head Profile & Visor
      const headGrad = offCtx.createRadialGradient(
        headX + 15 * scale,
        headY - 10 * scale,
        10 * scale,
        headX,
        headY,
        110 * scale
      )
      headGrad.addColorStop(0, '#A7D98B')
      headGrad.addColorStop(0.3, '#5D8B4D')
      headGrad.addColorStop(0.65, '#2A3F32')
      headGrad.addColorStop(0.9, '#121D16')
      headGrad.addColorStop(1, '#080C0A')

      offCtx.fillStyle = headGrad
      offCtx.beginPath()
      offCtx.moveTo(headX - 55 * scale, headY - 30 * scale)
      offCtx.bezierCurveTo(
        headX - 45 * scale,
        headY - 95 * scale,
        headX + 10 * scale,
        headY - 90 * scale,
        headX + 35 * scale,
        headY - 50 * scale
      )
      offCtx.lineTo(headX + 48 * scale, headY - 25 * scale)
      offCtx.lineTo(headX + 68 * scale, headY - 8 * scale)
      offCtx.lineTo(headX + 48 * scale, headY + 4 * scale)
      offCtx.lineTo(headX + 54 * scale, headY + 16 * scale)
      offCtx.lineTo(headX + 46 * scale, headY + 24 * scale)
      offCtx.lineTo(headX + 50 * scale, headY + 38 * scale)
      offCtx.bezierCurveTo(
        headX + 35 * scale,
        headY + 55 * scale,
        headX - 5 * scale,
        headY + 50 * scale,
        headX - 30 * scale,
        headY + 35 * scale
      )
      offCtx.closePath()
      offCtx.fill()

      // Glowing Neural Synapse Circuits running across cranial surface
      offCtx.strokeStyle = 'rgba(197, 243, 107, 0.75)'
      offCtx.lineWidth = 1.8 * scale
      const circuits = [
        [
          [headX - 30, headY + 10],
          [headX - 10, headY + 5],
          [headX + 15, headY - 5],
          [headX + 40, headY - 18],
        ],
        [
          [headX - 40, headY - 20],
          [headX - 20, headY - 35],
          [headX + 5, headY - 45],
          [headX + 30, headY - 35],
        ],
        [
          [headX - 15, headY + 30],
          [headX + 10, headY + 25],
          [headX + 30, headY + 20],
        ],
        [
          [headX - 25, headY + 65],
          [headX - 5, headY + 80],
          [headX + 20, headY + 95],
        ],
      ]
      circuits.forEach((path) => {
        offCtx.beginPath()
        path.forEach(([px, py], idx) => {
          const rx = headX + (px - headX) * scale
          const ry = headY + (py - headY) * scale
          if (idx === 0) offCtx.moveTo(rx, ry)
          else offCtx.lineTo(rx, ry)
        })
        offCtx.stroke()
      })

      // Core Eye Visor Focal Point
      const coreLight = offCtx.createRadialGradient(
        flareOriginX,
        beamY,
        2 * scale,
        flareOriginX,
        beamY,
        28 * scale
      )
      coreLight.addColorStop(0, '#FFFFFF')
      coreLight.addColorStop(0.3, '#C5F36B')
      coreLight.addColorStop(0.7, 'rgba(56, 189, 248, 0.6)')
      coreLight.addColorStop(1, 'transparent')
      offCtx.fillStyle = coreLight
      offCtx.beginPath()
      offCtx.arc(flareOriginX, beamY, 28 * scale, 0, Math.PI * 2)
      offCtx.fill()
      offCtx.restore()
    }

    // ── SCENE 2: Cosmic Singularity / Black Hole Accretion Disk (Interstellar) ──
    const drawSingularityScene = (w: number, h: number, scale: number) => {
      // Void background with subtle cosmic dust
      const bgGrad = offCtx.createRadialGradient(w * 0.5, h * 0.5, 50, w * 0.5, h * 0.5, w * 0.75)
      bgGrad.addColorStop(0, '#0B0A12')
      bgGrad.addColorStop(0.5, '#07060A')
      bgGrad.addColorStop(1, '#030204')
      offCtx.fillStyle = bgGrad
      offCtx.fillRect(0, 0, w, h)

      const centerX = w * 0.52
      const centerY = h * 0.48
      const holeRadius = 60 * scale

      // Distant Interstellar Nebula Clouds
      offCtx.save()
      const nebula = offCtx.createRadialGradient(
        centerX + 40 * scale,
        centerY - 20 * scale,
        50 * scale,
        centerX,
        centerY,
        380 * scale
      )
      nebula.addColorStop(0, 'rgba(255, 170, 60, 0.25)')
      nebula.addColorStop(0.4, 'rgba(180, 70, 140, 0.14)')
      nebula.addColorStop(0.7, 'rgba(50, 40, 90, 0.08)')
      nebula.addColorStop(1, 'transparent')
      offCtx.fillStyle = nebula
      offCtx.fillRect(0, 0, w, h)
      offCtx.restore()

      // Upper Warped Gravitational Lensing Halo Arc
      offCtx.save()
      offCtx.beginPath()
      offCtx.ellipse(
        centerX,
        centerY - 10 * scale,
        140 * scale,
        110 * scale,
        -0.08,
        Math.PI * 0.95,
        Math.PI * 2.05
      )
      const topArcGrad = offCtx.createRadialGradient(
        centerX,
        centerY - 40 * scale,
        30 * scale,
        centerX,
        centerY - 20 * scale,
        140 * scale
      )
      topArcGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
      topArcGrad.addColorStop(0.3, 'rgba(255, 200, 90, 0.7)')
      topArcGrad.addColorStop(0.65, 'rgba(240, 110, 30, 0.35)')
      topArcGrad.addColorStop(1, 'transparent')
      offCtx.fillStyle = topArcGrad
      offCtx.fill()
      offCtx.restore()

      // Primary Horizontal Accretion Disk (Tilted Ellipse)
      offCtx.save()
      offCtx.beginPath()
      offCtx.ellipse(centerX, centerY, 260 * scale, 48 * scale, -0.15, 0, Math.PI * 2)
      const diskGrad = offCtx.createRadialGradient(
        centerX,
        centerY,
        holeRadius,
        centerX,
        centerY,
        260 * scale
      )
      diskGrad.addColorStop(0, '#FFFFFF')
      diskGrad.addColorStop(0.15, '#FFE082')
      diskGrad.addColorStop(0.4, '#FF9800')
      diskGrad.addColorStop(0.7, 'rgba(230, 81, 0, 0.45)')
      diskGrad.addColorStop(1, 'transparent')
      offCtx.fillStyle = diskGrad
      offCtx.fill()
      offCtx.restore()

      // Central Pure Black Event Horizon Void
      offCtx.save()
      offCtx.beginPath()
      offCtx.arc(centerX, centerY, holeRadius, 0, Math.PI * 2)
      offCtx.fillStyle = '#010102'
      offCtx.fill()

      // Intense White Photon Ring on Rim
      offCtx.strokeStyle = 'rgba(255, 255, 255, 0.92)'
      offCtx.lineWidth = 3.5 * scale
      offCtx.stroke()
      offCtx.restore()

      // Piercing Anamorphic Relativistic Jet Flare across Singularity
      offCtx.save()
      const jetGrad = offCtx.createLinearGradient(0, centerY, w, centerY)
      jetGrad.addColorStop(0, 'transparent')
      jetGrad.addColorStop(0.2, 'rgba(255, 160, 40, 0.2)')
      jetGrad.addColorStop(0.46, 'rgba(255, 255, 255, 0.95)')
      jetGrad.addColorStop(0.58, 'rgba(255, 200, 80, 0.7)')
      jetGrad.addColorStop(0.85, 'rgba(255, 120, 20, 0.25)')
      jetGrad.addColorStop(1, 'transparent')

      offCtx.strokeStyle = jetGrad
      offCtx.lineWidth = 3 * scale
      offCtx.beginPath()
      offCtx.moveTo(0, centerY)
      offCtx.lineTo(w, centerY)
      offCtx.stroke()
      offCtx.restore()
    }

    // ── SCENE 3: Monolith & Planetary Horizon (Dune / 2001: A Space Odyssey) ──
    const drawMonolithScene = (w: number, h: number, scale: number) => {
      // Deep twilight space backdrop
      const bgGrad = offCtx.createLinearGradient(0, 0, 0, h)
      bgGrad.addColorStop(0, '#04070B')
      bgGrad.addColorStop(0.6, '#0B141B')
      bgGrad.addColorStop(1, '#05090C')
      offCtx.fillStyle = bgGrad
      offCtx.fillRect(0, 0, w, h)

      // Colossal Celestial Crescent Planet in upper-right
      offCtx.save()
      const planetX = w * 0.74
      const planetY = h * 0.36
      const planetR = 150 * scale

      // Planet Atmospheric Backglow
      const corona = offCtx.createRadialGradient(
        planetX,
        planetY,
        planetR * 0.9,
        planetX,
        planetY,
        planetR * 1.5
      )
      corona.addColorStop(0, 'rgba(103, 232, 249, 0.45)')
      corona.addColorStop(0.35, 'rgba(56, 189, 248, 0.2)')
      corona.addColorStop(0.7, 'rgba(14, 116, 144, 0.08)')
      corona.addColorStop(1, 'transparent')
      offCtx.fillStyle = corona
      offCtx.beginPath()
      offCtx.arc(planetX, planetY, planetR * 1.5, 0, Math.PI * 2)
      offCtx.fill()

      // Planet Body (Dark Spherical Shadow)
      offCtx.beginPath()
      offCtx.arc(planetX, planetY, planetR, 0, Math.PI * 2)
      offCtx.fillStyle = '#060B10'
      offCtx.fill()

      // Luminous Rim Crescent
      offCtx.beginPath()
      offCtx.arc(planetX, planetY, planetR, -Math.PI * 0.45, Math.PI * 0.6)
      offCtx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
      offCtx.lineWidth = 4 * scale
      offCtx.shadowColor = 'rgba(103, 232, 249, 0.8)'
      offCtx.shadowBlur = 15
      offCtx.stroke()
      offCtx.restore()

      // Sweeping Desert Dune Ridge across bottom
      offCtx.save()
      const duneGrad = offCtx.createLinearGradient(0, h * 0.65, 0, h)
      duneGrad.addColorStop(0, '#1E2C33')
      duneGrad.addColorStop(0.4, '#121D24')
      duneGrad.addColorStop(1, '#060A0D')
      offCtx.fillStyle = duneGrad
      offCtx.beginPath()
      offCtx.moveTo(0, h * 0.76)
      offCtx.bezierCurveTo(w * 0.25, h * 0.68, w * 0.55, h * 0.79, w, h * 0.72)
      offCtx.lineTo(w, h)
      offCtx.lineTo(0, h)
      offCtx.closePath()
      offCtx.fill()
      offCtx.restore()

      // Sleek Brutalist Monolith Rising on the Left
      offCtx.save()
      const monoX = w * 0.32
      const monoY = h * 0.32
      const monoW = 54 * scale
      const monoH = 260 * scale

      // Monolith body
      const monoGrad = offCtx.createLinearGradient(monoX, monoY, monoX + monoW, monoY)
      monoGrad.addColorStop(0, '#090E13')
      monoGrad.addColorStop(0.6, '#18242F')
      monoGrad.addColorStop(1, '#2D3E4E')
      offCtx.fillStyle = monoGrad
      offCtx.beginPath()
      offCtx.rect(monoX, monoY, monoW, monoH)
      offCtx.fill()

      // Glowing Neon Quantum Edge on Right of Monolith
      offCtx.strokeStyle = '#C5F36B'
      offCtx.lineWidth = 2 * scale
      offCtx.beginPath()
      offCtx.moveTo(monoX + monoW, monoY)
      offCtx.lineTo(monoX + monoW, monoY + monoH)
      offCtx.stroke()

      // Horizontal Dawn Flare Rays from Planet Horizon
      const dawnFlare = offCtx.createLinearGradient(planetX, planetY, 0, planetY)
      dawnFlare.addColorStop(0, 'rgba(103, 232, 249, 0.6)')
      dawnFlare.addColorStop(0.4, 'rgba(56, 189, 248, 0.25)')
      dawnFlare.addColorStop(1, 'transparent')
      offCtx.strokeStyle = dawnFlare
      offCtx.lineWidth = 2 * scale
      offCtx.beginPath()
      offCtx.moveTo(w, planetY)
      offCtx.lineTo(0, planetY)
      offCtx.stroke()
      offCtx.restore()
    }

    // ── SCENE 4: Classic Vignette Bloom (21st.dev Golden Bust) ──
    const drawBloomScene = (w: number, h: number, scale: number) => {
      const bgGrad = offCtx.createLinearGradient(0, 0, w, h)
      bgGrad.addColorStop(0, '#080A08')
      bgGrad.addColorStop(0.5, '#0E1312')
      bgGrad.addColorStop(1, '#060706')
      offCtx.fillStyle = bgGrad
      offCtx.fillRect(0, 0, w, h)

      const headX = w * 0.44
      const headY = h * 0.46

      const ambientGlow = offCtx.createRadialGradient(
        headX,
        headY,
        20 * scale,
        headX,
        headY,
        360 * scale
      )
      ambientGlow.addColorStop(0, 'rgba(215, 155, 60, 0.22)')
      ambientGlow.addColorStop(0.5, 'rgba(120, 85, 30, 0.08)')
      ambientGlow.addColorStop(1, 'transparent')
      offCtx.fillStyle = ambientGlow
      offCtx.fillRect(0, 0, w, h)

      // Light Beam
      const beamOriginX = headX + 35 * scale
      const beamOriginY = headY - 15 * scale

      const beamGrad = offCtx.createRadialGradient(
        beamOriginX,
        beamOriginY,
        5 * scale,
        w * 0.85,
        beamOriginY,
        w * 0.6
      )
      beamGrad.addColorStop(0, 'rgba(255, 252, 240, 0.95)')
      beamGrad.addColorStop(0.12, 'rgba(255, 230, 160, 0.85)')
      beamGrad.addColorStop(0.35, 'rgba(220, 175, 90, 0.5)')
      beamGrad.addColorStop(0.65, 'rgba(150, 130, 95, 0.25)')
      beamGrad.addColorStop(1, 'transparent')

      offCtx.fillStyle = beamGrad
      offCtx.beginPath()
      offCtx.moveTo(beamOriginX, beamOriginY - 25 * scale)
      offCtx.lineTo(w, beamOriginY - 140 * scale)
      offCtx.lineTo(w, beamOriginY + 160 * scale)
      offCtx.lineTo(beamOriginX, beamOriginY + 25 * scale)
      offCtx.closePath()
      offCtx.fill()

      // Torso & Face
      const faceGrad = offCtx.createRadialGradient(
        headX + 15 * scale,
        headY - 10 * scale,
        15 * scale,
        headX,
        headY,
        110 * scale
      )
      faceGrad.addColorStop(0, '#FFE8B5')
      faceGrad.addColorStop(0.3, '#F5B85D')
      faceGrad.addColorStop(0.7, '#C97D29')
      faceGrad.addColorStop(1, '#4A2508')

      offCtx.fillStyle = faceGrad
      offCtx.beginPath()
      offCtx.arc(headX, headY, 70 * scale, 0, Math.PI * 2)
      offCtx.fill()

      const coreBloom = offCtx.createRadialGradient(
        beamOriginX,
        beamOriginY,
        2 * scale,
        beamOriginX,
        beamOriginY,
        35 * scale
      )
      coreBloom.addColorStop(0, '#FFFFFF')
      coreBloom.addColorStop(0.4, '#FFE28A')
      coreBloom.addColorStop(1, 'transparent')
      offCtx.fillStyle = coreBloom
      offCtx.beginPath()
      offCtx.arc(beamOriginX, beamOriginY, 35 * scale, 0, Math.PI * 2)
      offCtx.fill()
    }

    // ── Dispatcher for current active scene ──
    const renderBaseArtwork = (w: number, h: number) => {
      offscreen.width = w
      offscreen.height = h
      const scale = Math.min(w, h) / 700

      switch (activeScene) {
        case 'neural':
          drawNeuralScene(w, h, scale)
          break
        case 'singularity':
          drawSingularityScene(w, h, scale)
          break
        case 'monolith':
          drawMonolithScene(w, h, scale)
          break
        case 'bloom':
        default:
          drawBloomScene(w, h, scale)
          break
      }
    }

    // ── Grid Sampling ──
    const sampleGridCells = () => {
      const imgData = offCtx.getImageData(0, 0, width, height).data
      gridCells = []
      cols = Math.ceil(width / cellSize)
      rows = Math.ceil(height / cellSize)

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const startX = c * cellSize
          const startY = r * cellSize
          const sampleW = Math.min(cellSize, width - startX)
          const sampleH = Math.min(cellSize, height - startY)

          let sumR = 0
          let sumG = 0
          let sumB = 0
          let count = 0

          const stepX = Math.max(1, Math.floor(sampleW / 2))
          const stepY = Math.max(1, Math.floor(sampleH / 2))

          for (let sy = 0; sy < sampleH; sy += stepY) {
            for (let sx = 0; sx < sampleW; sx += stepX) {
              const pxIndex = ((startY + sy) * width + (startX + sx)) * 4
              sumR += imgData[pxIndex]
              sumG += imgData[pxIndex + 1]
              sumB += imgData[pxIndex + 2]
              count++
            }
          }

          const avgR = count > 0 ? sumR / count : 0
          const avgG = count > 0 ? sumG / count : 0
          const avgB = count > 0 ? sumB / count : 0
          const lum = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB

          const isBeam = lum > 150

          gridCells.push({
            x: startX,
            y: startY,
            r: avgR,
            g: avgG,
            b: avgB,
            lum,
            isBeam,
          })
        }
      }
    }

    // Handle Resize
    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      width = Math.floor(rect.width)
      height = Math.floor(rect.height)

      if (width <= 0 || height <= 0) return

      canvas.width = width
      canvas.height = height

      renderBaseArtwork(width, height)
      sampleGridCells()
    }

    handleResize()
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    visibilityObserver.observe(container)

    // ── Animation Loop ──
    const startTime = performance.now()

    const drawFrame = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(drawFrame)
      if (!isVisible || width <= 0 || height <= 0 || gridCells.length === 0) return

      const elapsed = (currentTime - startTime) * 0.001 * animSpeed

      ctx.fillStyle = '#080908'
      ctx.fillRect(0, 0, width, height)

      const tileGap = 2
      const tileRadius = 2.5
      const baseTileSize = cellSize - tileGap

      for (let i = 0; i < gridCells.length; i++) {
        const cell = gridCells[i]

        const wave1 = Math.sin(cell.x * 0.015 + cell.y * 0.01 - elapsed * 2.2) * 0.2
        const wave2 = Math.cos(cell.x * 0.008 - cell.y * 0.014 + elapsed * 1.5) * 0.12
        const waveMod = wave1 + wave2

        if (cell.lum < 4) continue

        const brightness = 12
        const contrast = 1.15
        const darkMultiplier = (1 - darkness * 0.45) * (1 + waveMod * 0.5)

        const r = Math.min(255, Math.max(0, ((cell.r - 128) * contrast + 128 + brightness) * darkMultiplier))
        const g = Math.min(255, Math.max(0, ((cell.g - 128) * contrast + 128 + brightness) * darkMultiplier))
        const b = Math.min(255, Math.max(0, ((cell.b - 128) * contrast + 128 + brightness) * darkMultiplier))

        const sizeMod = Math.max(0.7, 1 + waveMod * 0.15)
        const currentTileW = baseTileSize * sizeMod
        const currentTileH = baseTileSize * sizeMod
        const drawX = cell.x + (cellSize - currentTileW) / 2
        const drawY = cell.y + (cellSize - currentTileH) / 2

        ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`

        if (cell.isBeam) {
          ctx.save()
          ctx.shadowColor =
            activeScene === 'neural'
              ? 'rgba(197, 243, 107, 0.45)'
              : activeScene === 'monolith'
              ? 'rgba(103, 232, 249, 0.45)'
              : 'rgba(255, 200, 90, 0.45)'
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.roundRect(drawX, drawY, currentTileW, currentTileH, tileRadius)
          ctx.fill()
          ctx.restore()
        } else {
          ctx.beginPath()
          ctx.roundRect(drawX, drawY, currentTileW, currentTileH, tileRadius)
          ctx.fill()
        }
      }

      // ── Vignette Layer ──
      const maxDim = Math.max(width, height)
      const vignetteGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        maxDim * 0.15,
        width * 0.5,
        height * 0.5,
        maxDim * 0.75
      )
      vignetteGrad.addColorStop(0, 'rgba(9, 10, 9, 0.05)')
      vignetteGrad.addColorStop(0.4, 'rgba(9, 10, 9, 0.4)')
      vignetteGrad.addColorStop(0.7, 'rgba(9, 10, 9, 0.78)')
      vignetteGrad.addColorStop(1, 'rgba(9, 10, 9, 0.96)')

      ctx.fillStyle = vignetteGrad
      ctx.fillRect(0, 0, width, height)

      // Edge Fades
      const edgeTop = ctx.createLinearGradient(0, 0, 0, 140)
      edgeTop.addColorStop(0, 'rgba(9, 10, 9, 1)')
      edgeTop.addColorStop(1, 'transparent')
      ctx.fillStyle = edgeTop
      ctx.fillRect(0, 0, width, 140)

      const edgeBottom = ctx.createLinearGradient(0, height - 140, 0, height)
      edgeBottom.addColorStop(0, 'transparent')
      edgeBottom.addColorStop(1, 'rgba(9, 10, 9, 1)')
      ctx.fillStyle = edgeBottom
      ctx.fillRect(0, height - 140, width, 140)
    }

    animationFrameId = requestAnimationFrame(drawFrame)

    return () => {
      cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [activeScene, cellSize, darkness, animSpeed])

  const scenes: { id: CinematicSceneType; label: string; icon: LucideIcon }[] = [
    { id: 'neural', label: 'Neural AI', icon: Cpu },
    { id: 'singularity', label: 'Singularity', icon: Orbit },
    { id: 'monolith', label: 'Monolith', icon: Mountain },
    { id: 'bloom', label: 'Ethereal', icon: Sun },
  ]

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Interactive Cinematic Scene Switcher in bottom right */}
      <div className="absolute bottom-5 right-6 z-30 flex items-center gap-1.5 p-1 bg-black/75 backdrop-blur-md border border-[#242A24] rounded-lg text-[10px] font-mono pointer-events-auto shadow-2xl">
        <span className="text-[#8A8A8A] px-1.5 flex items-center gap-1">
          <Sparkles size={11} className="text-[#C5F36B]" />
          <span className="hidden sm:inline">Theme:</span>
        </span>
        {scenes.map((s) => {
          const Icon = s.icon
          const isActive = activeScene === s.id
          return (
            <button
              key={s.id}
              onClick={() => setActiveScene(s.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-all font-semibold ${
                isActive
                  ? 'bg-[#182418] text-[#C5F36B] border border-[#C5F36B]/60 shadow-[0_0_12px_rgba(197,243,107,0.22)]'
                  : 'text-[#8A8A8A] hover:text-[#F5F0EB] hover:bg-[#151915]'
              }`}
            >
              <Icon size={10} />
              <span>{s.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
