import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  MousePointer,
  ArrowRight,
  ArrowLeft,
  Hand,
  Maximize2,
  Minimize2,
  Tv,
  Camera,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

// ─── Gesture Configuration & Mappings ───
export type GestureId =
  | 'thumbs_up'
  | 'thumbs_down'
  | 'fist'
  | 'pointing'
  | 'swipe_right'
  | 'swipe_left'
  | 'pinch'

export interface GestureMeta {
  id: GestureId
  emoji: string
  name: string
  action: string
  detail: string
  category: string
}

export const GESTURES: GestureMeta[] = [
  {
    id: 'thumbs_up',
    emoji: '👍',
    name: 'Thumbs Up',
    action: 'Increase System Volume',
    detail: 'Volume +5% per step',
    category: 'Audio Control',
  },
  {
    id: 'thumbs_down',
    emoji: '👎',
    name: 'Thumbs Down',
    action: 'Decrease System Volume',
    detail: 'Volume -5% per step',
    category: 'Audio Control',
  },
  {
    id: 'fist',
    emoji: '✊',
    name: 'Closed Fist',
    action: 'Play / Pause (Spacebar)',
    detail: 'Toggles media playback',
    category: 'Media Control',
  },
  {
    id: 'pointing',
    emoji: '☝️',
    name: 'Index Pointing',
    action: 'Control Mouse Pointer',
    detail: 'Continuous cursor positioning',
    category: 'Mouse Navigation',
  },
  {
    id: 'pinch',
    emoji: '🤏',
    name: 'Index + Thumb Pinch',
    action: 'Perform Mouse Click',
    detail: 'Left-click trigger & hold',
    category: 'Mouse Action',
  },
  {
    id: 'swipe_right',
    emoji: '👉',
    name: 'Swipe Right',
    action: 'Switch to Previous Tab',
    detail: 'Ctrl + Shift + Tab shortcut',
    category: 'Tab Navigation',
  },
  {
    id: 'swipe_left',
    emoji: '👈',
    name: 'Swipe Left',
    action: 'Switch to Next Tab',
    detail: 'Ctrl + Tab shortcut',
    category: 'Tab Navigation',
  },
]

// ─── MediaPipe 21 Landmark Topology for 2D Canvas & Monitor Screen ───
// Hand connections matching MediaPipe Hands specifications
const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm transverse
  [5, 9], [9, 13], [13, 17],
]

// Base landmark keyframes for the 7 gestures in normalized coordinates [0..1]
const LANDMARK_PRESETS: Record<GestureId, { x: number; y: number }[]> = {
  thumbs_up: [
    { x: 0.50, y: 0.85 }, // 0: Wrist
    // Thumb extended UP
    { x: 0.42, y: 0.70 }, { x: 0.36, y: 0.54 }, { x: 0.33, y: 0.38 }, { x: 0.32, y: 0.22 },
    // Index curled
    { x: 0.46, y: 0.58 }, { x: 0.48, y: 0.48 }, { x: 0.53, y: 0.52 }, { x: 0.55, y: 0.60 },
    // Middle curled
    { x: 0.52, y: 0.58 }, { x: 0.55, y: 0.49 }, { x: 0.60, y: 0.54 }, { x: 0.61, y: 0.62 },
    // Ring curled
    { x: 0.58, y: 0.60 }, { x: 0.61, y: 0.52 }, { x: 0.65, y: 0.57 }, { x: 0.66, y: 0.65 },
    // Pinky curled
    { x: 0.64, y: 0.64 }, { x: 0.67, y: 0.57 }, { x: 0.70, y: 0.62 }, { x: 0.70, y: 0.68 },
  ],
  thumbs_down: [
    { x: 0.50, y: 0.25 }, // 0: Wrist at top (inverted)
    // Thumb extended DOWN
    { x: 0.58, y: 0.40 }, { x: 0.64, y: 0.55 }, { x: 0.67, y: 0.70 }, { x: 0.68, y: 0.85 },
    // Index curled
    { x: 0.54, y: 0.50 }, { x: 0.52, y: 0.60 }, { x: 0.47, y: 0.56 }, { x: 0.45, y: 0.48 },
    // Middle curled
    { x: 0.48, y: 0.50 }, { x: 0.45, y: 0.59 }, { x: 0.40, y: 0.54 }, { x: 0.39, y: 0.46 },
    // Ring curled
    { x: 0.42, y: 0.48 }, { x: 0.39, y: 0.56 }, { x: 0.35, y: 0.51 }, { x: 0.34, y: 0.43 },
    // Pinky curled
    { x: 0.36, y: 0.44 }, { x: 0.33, y: 0.51 }, { x: 0.30, y: 0.46 }, { x: 0.30, y: 0.40 },
  ],
  fist: [
    { x: 0.50, y: 0.85 }, // 0: Wrist
    // Thumb wrapped over fingers
    { x: 0.42, y: 0.72 }, { x: 0.38, y: 0.62 }, { x: 0.45, y: 0.56 }, { x: 0.54, y: 0.56 },
    // Index tightly curled
    { x: 0.44, y: 0.62 }, { x: 0.43, y: 0.52 }, { x: 0.47, y: 0.55 }, { x: 0.48, y: 0.63 },
    // Middle tightly curled
    { x: 0.50, y: 0.62 }, { x: 0.50, y: 0.50 }, { x: 0.54, y: 0.54 }, { x: 0.54, y: 0.64 },
    // Ring tightly curled
    { x: 0.56, y: 0.63 }, { x: 0.57, y: 0.52 }, { x: 0.60, y: 0.56 }, { x: 0.60, y: 0.65 },
    // Pinky tightly curled
    { x: 0.62, y: 0.66 }, { x: 0.63, y: 0.56 }, { x: 0.66, y: 0.60 }, { x: 0.65, y: 0.68 },
  ],
  pointing: [
    { x: 0.50, y: 0.85 }, // 0: Wrist
    // Thumb holding middle finger
    { x: 0.42, y: 0.72 }, { x: 0.38, y: 0.64 }, { x: 0.44, y: 0.58 }, { x: 0.52, y: 0.58 },
    // Index STRAIGHT UP
    { x: 0.46, y: 0.60 }, { x: 0.46, y: 0.44 }, { x: 0.46, y: 0.30 }, { x: 0.46, y: 0.16 },
    // Middle curled
    { x: 0.52, y: 0.62 }, { x: 0.52, y: 0.52 }, { x: 0.56, y: 0.56 }, { x: 0.55, y: 0.65 },
    // Ring curled
    { x: 0.58, y: 0.64 }, { x: 0.58, y: 0.55 }, { x: 0.61, y: 0.59 }, { x: 0.60, y: 0.67 },
    // Pinky curled
    { x: 0.64, y: 0.67 }, { x: 0.64, y: 0.58 }, { x: 0.67, y: 0.63 }, { x: 0.66, y: 0.70 },
  ],
  swipe_right: [
    { x: 0.35, y: 0.80 }, // Wrist shifted left
    // Thumb curled
    { x: 0.36, y: 0.68 }, { x: 0.38, y: 0.60 }, { x: 0.44, y: 0.57 }, { x: 0.50, y: 0.58 },
    // Index POINTING RIGHT
    { x: 0.42, y: 0.56 }, { x: 0.54, y: 0.50 }, { x: 0.68, y: 0.46 }, { x: 0.82, y: 0.42 },
    // Middle curled
    { x: 0.42, y: 0.63 }, { x: 0.46, y: 0.61 }, { x: 0.50, y: 0.64 }, { x: 0.48, y: 0.70 },
    // Ring curled
    { x: 0.43, y: 0.69 }, { x: 0.46, y: 0.67 }, { x: 0.49, y: 0.70 }, { x: 0.47, y: 0.74 },
    // Pinky curled
    { x: 0.44, y: 0.74 }, { x: 0.46, y: 0.72 }, { x: 0.48, y: 0.75 }, { x: 0.46, y: 0.78 },
  ],
  swipe_left: [
    { x: 0.65, y: 0.80 }, // Wrist shifted right
    // Thumb curled
    { x: 0.64, y: 0.68 }, { x: 0.62, y: 0.60 }, { x: 0.56, y: 0.57 }, { x: 0.50, y: 0.58 },
    // Index POINTING LEFT
    { x: 0.58, y: 0.56 }, { x: 0.46, y: 0.50 }, { x: 0.32, y: 0.46 }, { x: 0.18, y: 0.42 },
    // Middle curled
    { x: 0.58, y: 0.63 }, { x: 0.54, y: 0.61 }, { x: 0.50, y: 0.64 }, { x: 0.52, y: 0.70 },
    // Ring curled
    { x: 0.57, y: 0.69 }, { x: 0.54, y: 0.67 }, { x: 0.51, y: 0.70 }, { x: 0.53, y: 0.74 },
    // Pinky curled
    { x: 0.56, y: 0.74 }, { x: 0.54, y: 0.72 }, { x: 0.52, y: 0.75 }, { x: 0.54, y: 0.78 },
  ],
  pinch: [
    { x: 0.50, y: 0.85 }, // Wrist
    // Thumb reaching to meet index tip
    { x: 0.43, y: 0.70 }, { x: 0.40, y: 0.56 }, { x: 0.44, y: 0.44 }, { x: 0.49, y: 0.36 },
    // Index curving down to meet thumb tip
    { x: 0.48, y: 0.58 }, { x: 0.49, y: 0.46 }, { x: 0.50, y: 0.39 }, { x: 0.51, y: 0.36 },
    // Middle curled
    { x: 0.54, y: 0.62 }, { x: 0.56, y: 0.52 }, { x: 0.60, y: 0.56 }, { x: 0.59, y: 0.65 },
    // Ring curled
    { x: 0.59, y: 0.64 }, { x: 0.61, y: 0.56 }, { x: 0.64, y: 0.60 }, { x: 0.63, y: 0.68 },
    // Pinky curled
    { x: 0.64, y: 0.68 }, { x: 0.66, y: 0.60 }, { x: 0.69, y: 0.64 }, { x: 0.68, y: 0.71 },
  ],
}

// ─── 3D Hand Pose Targets (Euler angles in radians for each finger joint) ───
interface HandPoseTargets {
  wrist: [number, number, number] // pitch, yaw, roll
  thumb: [number, number] // mcp curl, pip curl
  index: [number, number, number] // mcp, pip, dip curl
  middle: [number, number, number]
  ring: [number, number, number]
  pinky: [number, number, number]
  armOffset: [number, number, number] // dx, dy, dz
}

const POSE_TARGETS: Record<GestureId, HandPoseTargets> = {
  thumbs_up: {
    wrist: [-0.25, 0.0, -0.2],
    thumb: [-0.75, -0.1], // Extended up & abducted
    index: [1.6, 1.7, 1.4], // Curled
    middle: [1.65, 1.75, 1.45],
    ring: [1.65, 1.75, 1.45],
    pinky: [1.6, 1.7, 1.4],
    armOffset: [0, 0.08, 0],
  },
  thumbs_down: {
    wrist: [-0.2, 0.0, 2.85], // Inverted forearm/wrist!
    thumb: [-0.85, -0.15], // Pointing down
    index: [1.6, 1.7, 1.4],
    middle: [1.65, 1.75, 1.45],
    ring: [1.65, 1.75, 1.45],
    pinky: [1.6, 1.7, 1.4],
    armOffset: [0, -0.06, 0],
  },
  fist: {
    wrist: [-0.1, 0.0, 0.0],
    thumb: [1.2, 1.35], // Wrapped tightly over knuckles
    index: [1.7, 1.7, 1.4],
    middle: [1.75, 1.75, 1.45],
    ring: [1.75, 1.75, 1.45],
    pinky: [1.7, 1.7, 1.4],
    armOffset: [0, 0, 0],
  },
  pointing: {
    wrist: [-0.15, 0.0, 0.0],
    thumb: [1.2, 1.2],
    index: [0.05, 0.0, 0.0], // Fully extended straight
    middle: [1.65, 1.7, 1.4],
    ring: [1.65, 1.7, 1.4],
    pinky: [1.6, 1.7, 1.4],
    armOffset: [0, 0.05, 0.06],
  },
  swipe_right: {
    wrist: [-0.1, 0.55, -0.3], // Angled rightward
    thumb: [1.1, 1.2],
    index: [0.1, 0.05, 0.0], // Extended pointing right
    middle: [1.65, 1.7, 1.4],
    ring: [1.65, 1.7, 1.4],
    pinky: [1.6, 1.7, 1.4],
    armOffset: [0.12, 0.02, 0.04],
  },
  swipe_left: {
    wrist: [-0.1, -0.55, 0.3], // Angled leftward
    thumb: [1.1, 1.2],
    index: [0.1, 0.05, 0.0], // Extended pointing left
    middle: [1.65, 1.7, 1.4],
    ring: [1.65, 1.7, 1.4],
    pinky: [1.6, 1.7, 1.4],
    armOffset: [-0.12, 0.02, 0.04],
  },
  pinch: {
    wrist: [-0.1, 0.0, 0.0],
    thumb: [0.65, 0.55], // Curved inward
    index: [0.85, 0.95, 0.75], // Curved down to touch thumb tip
    middle: [1.4, 1.5, 1.2], // Semi-curled
    ring: [1.5, 1.6, 1.3],
    pinky: [1.5, 1.6, 1.3],
    armOffset: [0, 0.04, 0.05],
  },
}

export default function GestureControlDemo() {
  const [activeGesture, setActiveGesture] = useState<GestureId>('thumbs_up')
  const [volume, setVolume] = useState<number>(75)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<number>(1) // 0: Terminal, 1: Gesture_CV.py, 2: GitHub
  const [clickRipple, setClickRipple] = useState<boolean>(false)
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [showMonitorOverlay, setShowMonitorOverlay] = useState<boolean>(false)

  const threeContainerRef = useRef<HTMLDivElement | null>(null)
  const monitorCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Current interpolated landmark positions for smooth 60fps morphing
  const currentLandmarksRef = useRef<{ x: number; y: number }[]>(
    LANDMARK_PRESETS['thumbs_up'].map((p) => ({ ...p }))
  )

  // ─── Handle Gesture Selection & Action Triggers ───
  const selectGesture = useCallback((id: GestureId) => {
    setActiveGesture(id)

    // Execute application-level feedback matching Python project actions
    if (id === 'thumbs_up') {
      setVolume((v) => Math.min(100, v + 5))
    } else if (id === 'thumbs_down') {
      setVolume((v) => Math.max(0, v - 5))
    } else if (id === 'fist') {
      setIsPlaying((p) => !p)
    } else if (id === 'pointing') {
      setMousePos({
        x: 40 + Math.random() * 25,
        y: 35 + Math.random() * 30,
      })
    } else if (id === 'pinch') {
      setClickRipple(true)
      setTimeout(() => setClickRipple(false), 550)
    } else if (id === 'swipe_right') {
      setActiveTab((t) => (t === 0 ? 2 : t - 1))
    } else if (id === 'swipe_left') {
      setActiveTab((t) => (t === 2 ? 0 : t + 1))
    }
  }, [])

  // ─── Monitor Canvas 2D Renderer (Live Webcam + MediaPipe Skeleton) ───
  useEffect(() => {
    let animId: number
    const canvas = monitorCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = performance.now()

    const renderMonitor = (now: number) => {
      animId = requestAnimationFrame(renderMonitor)
      const dt = Math.min(0.08, (now - lastTime) / 1000)
      lastTime = now

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Background simulated dark webcam feed
      ctx.fillStyle = '#080908'
      ctx.fillRect(0, 0, w, h)

      // Grid / camera sensor lines
      ctx.strokeStyle = 'rgba(197, 243, 107, 0.04)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Smooth landmark interpolation (lerp towards target keyframe)
      const targetPreset = LANDMARK_PRESETS[activeGesture]
      const current = currentLandmarksRef.current
      const lerpSpeed = 12 * dt

      for (let i = 0; i < 21; i++) {
        current[i].x += (targetPreset[i].x - current[i].x) * lerpSpeed
        current[i].y += (targetPreset[i].y - current[i].y) * lerpSpeed
      }

      // Draw skeleton connection lines
      ctx.strokeStyle = '#C5F36B'
      ctx.lineWidth = 2.2
      ctx.shadowColor = '#C5F36B'
      ctx.shadowBlur = 8

      for (const [a, b] of HAND_CONNECTIONS) {
        const ptA = current[a]
        const ptB = current[b]
        ctx.beginPath()
        ctx.moveTo(ptA.x * w, ptA.y * h)
        ctx.lineTo(ptB.x * w, ptB.y * h)
        ctx.stroke()
      }

      // Draw 21 landmark nodes
      ctx.shadowBlur = 10
      for (let i = 0; i < 21; i++) {
        const pt = current[i]
        const px = pt.x * w
        const py = pt.y * h

        // Fingertip nodes (4, 8, 12, 16, 20) are slightly larger
        const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20
        const radius = isTip ? 4.2 : 2.8

        ctx.fillStyle = isTip ? '#E4FFA8' : '#C5F36B'
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.shadowBlur = 0 // Reset shadow

      // Bounding box with detection confidence
      const minX = Math.min(...current.map((p) => p.x)) * w - 16
      const maxX = Math.max(...current.map((p) => p.x)) * w + 16
      const minY = Math.min(...current.map((p) => p.y)) * h - 16
      const maxY = Math.max(...current.map((p) => p.y)) * h + 16

      ctx.strokeStyle = 'rgba(197, 243, 107, 0.45)'
      ctx.lineWidth = 1.2
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY)

      // Corner accent brackets on bounding box
      const cornerLen = 10
      ctx.strokeStyle = '#C5F36B'
      ctx.lineWidth = 2.2
      // Top-left
      ctx.beginPath()
      ctx.moveTo(minX, minY + cornerLen)
      ctx.lineTo(minX, minY)
      ctx.lineTo(minX + cornerLen, minY)
      ctx.stroke()
      // Top-right
      ctx.beginPath()
      ctx.moveTo(maxX - cornerLen, minY)
      ctx.lineTo(maxX, minY)
      ctx.lineTo(maxX, minY + cornerLen)
      ctx.stroke()
      // Bottom-left
      ctx.beginPath()
      ctx.moveTo(minX, maxY - cornerLen)
      ctx.lineTo(minX, maxY)
      ctx.lineTo(minX + cornerLen, maxY)
      ctx.stroke()
      // Bottom-right
      ctx.beginPath()
      ctx.moveTo(maxX - cornerLen, maxY)
      ctx.lineTo(maxX, maxY)
      ctx.lineTo(maxX, maxY - cornerLen)
      ctx.stroke()

      // Detection Tag Header
      ctx.fillStyle = '#C5F36B'
      ctx.font = 'bold 10px monospace'
      ctx.fillText(`HAND 0: 98.4% CONF`, minX, Math.max(16, minY - 6))
    }

    animId = requestAnimationFrame(renderMonitor)
    return () => cancelAnimationFrame(animId)
  }, [activeGesture])

  // ─── Three.js 3D Character & Desk Scene ───
  useEffect(() => {
    const container = threeContainerRef.current
    if (!container) return

    // Scene & Camera
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x080908)
    scene.fog = new THREE.FogExp2(0x080908, 0.18)

    const width = container.clientWidth
    const height = container.clientHeight
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50)
    // Isometric over-the-shoulder angle (matches Image 2)
    camera.position.set(-1.45, 1.55, 2.3)
    camera.lookAt(0.12, 1.15, 0.3)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // ─── Materials ───
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x141614,
      roughness: 0.45,
      metalness: 0.25,
    })
    const monitorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c1a,
      roughness: 0.3,
      metalness: 0.6,
    })
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0x0a100d,
    })
    const hoodieMat = new THREE.MeshStandardMaterial({
      color: 0x141816,
      roughness: 0.88,
      metalness: 0.05,
    })
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdca382,
      roughness: 0.52,
      metalness: 0.1,
    })
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x181512,
      roughness: 0.9,
    })
    const neonGreenMat = new THREE.MeshBasicMaterial({
      color: 0xc5f36b,
    })

    // ─── Lighting ───
    // Soft ambient blue
    const ambientLight = new THREE.AmbientLight(0x0e141a, 1.2)
    scene.add(ambientLight)

    // Ambient Neon Green Tube Light (vertical fixture behind desk)
    const neonTubeLight = new THREE.PointLight(0xc5f36b, 3.8, 6.0)
    neonTubeLight.position.set(-0.9, 1.7, -0.6)
    scene.add(neonTubeLight)

    // Glowing Neon Tube Mesh on Back Wall
    const tubeGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.4, 16)
    const tubeMesh = new THREE.Mesh(tubeGeo, neonGreenMat)
    tubeMesh.position.set(-0.9, 1.7, -0.65)
    scene.add(tubeMesh)

    // Monitor screen fill light onto person
    const monitorLight = new THREE.PointLight(0x60a5fa, 2.2, 3.5)
    monitorLight.position.set(0.2, 1.25, 0.4)
    scene.add(monitorLight)

    // Hand rim light
    const handLight = new THREE.PointLight(0xc5f36b, 1.8, 2.5)
    handLight.position.set(0.25, 1.45, 0.9)
    scene.add(handLight)

    // ─── Desk & Monitor Setup ───
    // Desk Top
    const deskGeo = new THREE.BoxGeometry(2.4, 0.06, 1.1)
    const desk = new THREE.Mesh(deskGeo, deskMat)
    desk.position.set(0.1, 0.72, 0.2)
    desk.receiveShadow = true
    scene.add(desk)

    // Monitor Frame
    const monitorGroup = new THREE.Group()
    monitorGroup.position.set(0.18, 1.22, 0.2)
    monitorGroup.rotation.y = -0.15

    const bezelGeo = new THREE.BoxGeometry(1.08, 0.64, 0.04)
    const bezel = new THREE.Mesh(bezelGeo, monitorMat)
    monitorGroup.add(bezel)

    // Screen
    const screenGeo = new THREE.PlaneGeometry(1.02, 0.58)
    const screen = new THREE.Mesh(screenGeo, screenMat)
    screen.position.z = 0.022
    monitorGroup.add(screen)

    // Monitor Stand
    const standNeckGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.42, 16)
    const standNeck = new THREE.Mesh(standNeckGeo, monitorMat)
    standNeck.position.set(0, -0.26, -0.08)
    monitorGroup.add(standNeck)

    const standBaseGeo = new THREE.CylinderGeometry(0.16, 0.17, 0.02, 24)
    const standBase = new THREE.Mesh(standBaseGeo, monitorMat)
    standBase.position.set(0, -0.46, -0.05)
    monitorGroup.add(standBase)

    // Webcam Unit on top of monitor
    const camGeo = new THREE.BoxGeometry(0.14, 0.045, 0.045)
    const webcam = new THREE.Mesh(camGeo, monitorMat)
    webcam.position.set(0, 0.34, 0.01)
    monitorGroup.add(webcam)

    const lensGeo = new THREE.SphereGeometry(0.012, 16, 16)
    const lens = new THREE.Mesh(lensGeo, neonGreenMat)
    lens.position.set(0, 0.34, 0.035)
    monitorGroup.add(lens)

    scene.add(monitorGroup)

    // Keyboard & Mouse
    const kbGeo = new THREE.BoxGeometry(0.42, 0.016, 0.14)
    const kb = new THREE.Mesh(kbGeo, monitorMat)
    kb.position.set(0.1, 0.76, 0.55)
    kb.rotation.y = -0.1
    scene.add(kb)

    const mouseGeo = new THREE.BoxGeometry(0.065, 0.025, 0.1)
    const mouse = new THREE.Mesh(mouseGeo, monitorMat)
    mouse.position.set(0.42, 0.76, 0.55)
    mouse.rotation.y = -0.08
    scene.add(mouse)

    // ─── Person & Chair ───
    const personGroup = new THREE.Group()
    personGroup.position.set(-0.25, 0.0, 1.1)

    // Ergonomic Chair Back
    const chairBackGeo = new THREE.BoxGeometry(0.52, 0.72, 0.08)
    const chairBack = new THREE.Mesh(chairBackGeo, monitorMat)
    chairBack.position.set(0, 0.95, -0.12)
    chairBack.rotation.x = 0.08
    personGroup.add(chairBack)

    // Headrest
    const headrestGeo = new THREE.BoxGeometry(0.28, 0.14, 0.06)
    const headrest = new THREE.Mesh(headrestGeo, monitorMat)
    headrest.position.set(0, 1.4, -0.17)
    personGroup.add(headrest)

    // Character Torso (Dark Hoodie)
    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.65, 16)
    const torso = new THREE.Mesh(torsoGeo, hoodieMat)
    torso.position.set(0, 0.92, 0.02)
    personGroup.add(torso)

    // Hood / Neck
    const hoodGeo = new THREE.SphereGeometry(0.18, 16, 16)
    const hood = new THREE.Mesh(hoodGeo, hoodieMat)
    hood.position.set(0, 1.25, -0.05)
    personGroup.add(hood)

    // Head
    const headGeo = new THREE.SphereGeometry(0.15, 24, 24)
    const head = new THREE.Mesh(headGeo, skinMat)
    head.position.set(0, 1.34, 0.02)
    personGroup.add(head)

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.16, 24, 24)
    const hair = new THREE.Mesh(hairGeo, hairMat)
    hair.position.set(0, 1.38, -0.02)
    hair.scale.set(1.02, 1.05, 1.08)
    personGroup.add(hair)

    // Left Arm resting on desk
    const lUpperArmGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.36, 12)
    const lUpperArm = new THREE.Mesh(lUpperArmGeo, hoodieMat)
    lUpperArm.position.set(-0.28, 0.94, 0.08)
    lUpperArm.rotation.set(0.4, 0, 0.2)
    personGroup.add(lUpperArm)

    const lForearmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.34, 12)
    const lForearm = new THREE.Mesh(lForearmGeo, hoodieMat)
    lForearm.position.set(-0.24, 0.78, 0.32)
    lForearm.rotation.set(1.4, 0, -0.3)
    personGroup.add(lForearm)

    // ─── Right Articulated Arm & Hand Rig ───
    const rShoulder = new THREE.Group()
    rShoulder.position.set(0.26, 1.12, 0.05)

    const rUpperArmGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.38, 14)
    const rUpperArm = new THREE.Mesh(rUpperArmGeo, hoodieMat)
    rUpperArm.position.y = -0.16
    rShoulder.add(rUpperArm)

    const rElbow = new THREE.Group()
    rElbow.position.y = -0.34
    rShoulder.add(rElbow)

    const rForearmGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.36, 14)
    const rForearm = new THREE.Mesh(rForearmGeo, hoodieMat)
    rForearm.position.y = -0.16
    rElbow.add(rForearm)

    // Wrist / Hand Root
    const wrist = new THREE.Group()
    wrist.position.y = -0.34
    rElbow.add(wrist)

    // Palm Mesh
    const palmGeo = new THREE.BoxGeometry(0.12, 0.14, 0.045)
    const palm = new THREE.Mesh(palmGeo, skinMat)
    palm.position.y = -0.07
    wrist.add(palm)

    // Build the 5 Fingers with Hierarchical Joints (MCP -> PIP -> DIP)
    const makeFinger = (len: number, thickness: number, xOff: number) => {
      const mcp = new THREE.Group()
      mcp.position.set(xOff, -0.14, 0)

      const p1Geo = new THREE.CylinderGeometry(thickness, thickness * 0.9, len * 0.42, 10)
      const p1 = new THREE.Mesh(p1Geo, skinMat)
      p1.position.y = -len * 0.21
      mcp.add(p1)

      const pip = new THREE.Group()
      pip.position.y = -len * 0.42
      mcp.add(pip)

      const p2Geo = new THREE.CylinderGeometry(thickness * 0.9, thickness * 0.8, len * 0.33, 10)
      const p2 = new THREE.Mesh(p2Geo, skinMat)
      p2.position.y = -len * 0.165
      pip.add(p2)

      const dip = new THREE.Group()
      dip.position.y = -len * 0.33
      pip.add(dip)

      const p3Geo = new THREE.CylinderGeometry(thickness * 0.8, thickness * 0.65, len * 0.25, 10)
      const p3 = new THREE.Mesh(p3Geo, skinMat)
      p3.position.y = -len * 0.125
      dip.add(p3)

      // Fingertip tracker dot (glowing MediaPipe style)
      const tipGeo = new THREE.SphereGeometry(thickness * 0.65, 8, 8)
      const tip = new THREE.Mesh(tipGeo, neonGreenMat)
      tip.position.y = -len * 0.25
      dip.add(tip)

      return { mcp, pip, dip }
    }

    // Thumb (wider angle, 2 main segments)
    const thumbRoot = new THREE.Group()
    thumbRoot.position.set(0.065, -0.06, 0.015)
    wrist.add(thumbRoot)

    const thumbP1Geo = new THREE.CylinderGeometry(0.022, 0.019, 0.065, 10)
    const thumbP1 = new THREE.Mesh(thumbP1Geo, skinMat)
    thumbP1.position.set(0.025, -0.03, 0)
    thumbP1.rotation.z = -0.55
    thumbRoot.add(thumbP1)

    const thumbPip = new THREE.Group()
    thumbPip.position.set(0.048, -0.06, 0)
    thumbRoot.add(thumbPip)

    const thumbP2Geo = new THREE.CylinderGeometry(0.019, 0.015, 0.055, 10)
    const thumbP2 = new THREE.Mesh(thumbP2Geo, skinMat)
    thumbP2.position.y = -0.028
    thumbPip.add(thumbP2)

    const thumbTipGeo = new THREE.SphereGeometry(0.015, 8, 8)
    const thumbTip = new THREE.Mesh(thumbTipGeo, neonGreenMat)
    thumbTip.position.y = -0.055
    thumbPip.add(thumbTip)

    // 4 Fingers
    const indexFinger = makeFinger(0.12, 0.018, 0.04)
    const middleFinger = makeFinger(0.13, 0.019, 0.013)
    const ringFinger = makeFinger(0.118, 0.018, -0.014)
    const pinkyFinger = makeFinger(0.098, 0.016, -0.04)

    wrist.add(indexFinger.mcp)
    wrist.add(middleFinger.mcp)
    wrist.add(ringFinger.mcp)
    wrist.add(pinkyFinger.mcp)

    personGroup.add(rShoulder)
    scene.add(personGroup)

    // Position the raised right arm initially towards the webcam
    rShoulder.rotation.set(-1.15, 0.35, -0.45)
    rElbow.rotation.set(0.7, 0.1, 0.25)
    wrist.rotation.set(0.2, 0.0, 0.0)

    // ─── Render Loop with Smooth Joint Lerping ───
    let reqId: number
    let clock = new THREE.Clock()

    const animate = () => {
      reqId = requestAnimationFrame(animate)
      const delta = Math.min(0.06, clock.getDelta())
      const time = clock.getElapsedTime()

      // Target poses for active gesture
      const target = POSE_TARGETS[activeGesture]
      const lerpFactor = delta * 9.5

      // Natural idle breathing on torso & subtle hand sway
      const idleSway = Math.sin(time * 1.8) * 0.012
      personGroup.position.y = Math.sin(time * 1.2) * 0.005

      // Base arm posture
      rShoulder.rotation.x = THREE.MathUtils.lerp(rShoulder.rotation.x, -1.25 + target.armOffset[1], lerpFactor)
      rShoulder.rotation.y = THREE.MathUtils.lerp(rShoulder.rotation.y, 0.35 + target.armOffset[0], lerpFactor)

      // Wrist
      wrist.rotation.x = THREE.MathUtils.lerp(wrist.rotation.x, target.wrist[0] + idleSway, lerpFactor)
      wrist.rotation.y = THREE.MathUtils.lerp(wrist.rotation.y, target.wrist[1], lerpFactor)
      wrist.rotation.z = THREE.MathUtils.lerp(wrist.rotation.z, target.wrist[2], lerpFactor)

      // Thumb
      thumbRoot.rotation.z = THREE.MathUtils.lerp(thumbRoot.rotation.z, target.thumb[0], lerpFactor)
      thumbPip.rotation.x = THREE.MathUtils.lerp(thumbPip.rotation.x, target.thumb[1], lerpFactor)

      // Index
      indexFinger.mcp.rotation.x = THREE.MathUtils.lerp(indexFinger.mcp.rotation.x, target.index[0], lerpFactor)
      indexFinger.pip.rotation.x = THREE.MathUtils.lerp(indexFinger.pip.rotation.x, target.index[1], lerpFactor)
      indexFinger.dip.rotation.x = THREE.MathUtils.lerp(indexFinger.dip.rotation.x, target.index[2], lerpFactor)

      // Middle
      middleFinger.mcp.rotation.x = THREE.MathUtils.lerp(middleFinger.mcp.rotation.x, target.middle[0], lerpFactor)
      middleFinger.pip.rotation.x = THREE.MathUtils.lerp(middleFinger.pip.rotation.x, target.middle[1], lerpFactor)
      middleFinger.dip.rotation.x = THREE.MathUtils.lerp(middleFinger.dip.rotation.x, target.middle[2], lerpFactor)

      // Ring
      ringFinger.mcp.rotation.x = THREE.MathUtils.lerp(ringFinger.mcp.rotation.x, target.ring[0], lerpFactor)
      ringFinger.pip.rotation.x = THREE.MathUtils.lerp(ringFinger.pip.rotation.x, target.ring[1], lerpFactor)
      ringFinger.dip.rotation.x = THREE.MathUtils.lerp(ringFinger.dip.rotation.x, target.ring[2], lerpFactor)

      // Pinky
      pinkyFinger.mcp.rotation.x = THREE.MathUtils.lerp(pinkyFinger.mcp.rotation.x, target.pinky[0], lerpFactor)
      pinkyFinger.pip.rotation.x = THREE.MathUtils.lerp(pinkyFinger.pip.rotation.x, target.pinky[1], lerpFactor)
      pinkyFinger.dip.rotation.x = THREE.MathUtils.lerp(pinkyFinger.dip.rotation.x, target.pinky[2], lerpFactor)

      // Swipe gestures animated oscillation
      if (activeGesture === 'swipe_right' || activeGesture === 'swipe_left') {
        const sweepSpeed = 4.5
        const sweepAmp = activeGesture === 'swipe_right' ? 0.08 : -0.08
        rElbow.position.x = Math.sin(time * sweepSpeed) * sweepAmp
      } else {
        rElbow.position.x = THREE.MathUtils.lerp(rElbow.position.x, 0, lerpFactor)
      }

      renderer.render(scene, camera)
    }

    reqId = requestAnimationFrame(animate)

    // Resize handler
    const onResize = () => {
      if (!container) return
      const newW = container.clientWidth
      const newH = container.clientHeight
      camera.aspect = newW / newH
      camera.updateProjectionMatrix()
      renderer.setSize(newW, newH)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [activeGesture])

  const currentMeta = useMemo(() => {
    return GESTURES.find((g) => g.id === activeGesture) || GESTURES[0]
  }, [activeGesture])

  return (
    <div className="w-full bg-[#090A09] border border-[#262826] rounded-2xl overflow-hidden font-mono shadow-2xl transition-all">
      {/* ── Top Header Bar ── */}
      <div className="bg-[#121412] border-b border-[#262826] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5F36B] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C5F36B]" />
          </span>
          <span className="text-[#F5F0EB] font-bold tracking-wider text-[11px] uppercase">
            3D GESTURE RECOGNITION LAB · MEDIAPIPE + OPENCV
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#8A8A8A] hidden sm:inline-block">Inference:</span>
          <span className="bg-[#1C201C] text-[#C5F36B] border border-[#2E362E] px-2.5 py-0.5 rounded font-bold">
            PyAutoGUI Native Loop
          </span>
          <button
            onClick={() => setShowMonitorOverlay((v) => !v)}
            className="flex items-center gap-1 bg-[#181B18] hover:bg-[#222722] text-[#A3E635] border border-[#2E362E] px-2.5 py-1 rounded transition-colors text-[10px]"
            title="Toggle Monitor Screen Inspector"
          >
            {showMonitorOverlay ? <Minimize2 size={12} /> : <Tv size={12} />}
            <span>{showMonitorOverlay ? '3D View' : 'Monitor Screen'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Viewport Area (3D Workstation OR Monitor Screen) ── */}
      <div className="relative w-full h-[340px] sm:h-[400px] bg-[#070807] overflow-hidden">
        {/* 3D Three.js Character Scene */}
        <div
          ref={threeContainerRef}
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            showMonitorOverlay ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />

        {/* Ambient Overlay: Monitor Screen HUD */}
        <div
          className={`absolute inset-0 p-4 sm:p-6 transition-all duration-300 ${
            showMonitorOverlay
              ? 'opacity-100 z-20 pointer-events-auto bg-[#070807]/95 backdrop-blur-md'
              : 'pointer-events-none'
          }`}
        >
          <div className="w-full h-full border border-[#2E362E] rounded-xl bg-[#0C0E0C]/90 overflow-hidden flex flex-col shadow-2xl">
            {/* Monitor Header */}
            <div className="bg-[#141814] px-3.5 py-2 border-b border-[#262826] flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                </div>
                <span className="text-[#F5F0EB] font-bold text-xs ml-1 flex items-center gap-1.5">
                  <Camera size={12} className="text-[#C5F36B]" />
                  Gesture Control v2.4 · Real-Time Feed
                </span>
              </div>
              <span className="text-[10px] text-[#A3E635] bg-[#1A221A] px-2 py-0.5 rounded border border-[#2E362E]">
                ● 60 FPS · 0.98 Conf
              </span>
            </div>

            {/* Split Monitor Screen: Webcam skeleton + Action feedback */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#262826] overflow-hidden">
              {/* Left Column: 21-Landmark Webcam Canvas */}
              <div className="relative p-3 flex items-center justify-center bg-[#070807]">
                <canvas
                  ref={monitorCanvasRef}
                  width={320}
                  height={240}
                  className="w-full max-w-[280px] h-auto border border-[#262826] rounded-lg shadow-inner"
                />
                <div className="absolute top-4 left-5 text-[9px] text-[#8A8A8A] uppercase tracking-wider bg-[#0C0E0C]/80 px-2 py-0.5 rounded">
                  21 MediaPipe Landmarks
                </div>
              </div>

              {/* Right Column: Live System Action Response */}
              <div className="p-4 sm:p-5 flex flex-col justify-between bg-[#0B0D0B] text-xs">
                {/* Active Gesture Detection Banner */}
                <div>
                  <div className="text-[10px] text-[#8A8A8A] uppercase tracking-wider">
                    Detected Pattern
                  </div>
                  <div className="text-lg font-bold text-[#C5F36B] flex items-center gap-2 mt-1">
                    <span>{currentMeta.emoji}</span>
                    <span>{currentMeta.name}</span>
                  </div>
                  <div className="text-xs text-[#F5F0EB]/85 mt-0.5">{currentMeta.action}</div>
                </div>

                {/* Dynamic System Action Feedback Widget */}
                <div className="my-3 p-3.5 bg-[#121512] border border-[#2A312A] rounded-xl">
                  {/* Volume Control State */}
                  {(activeGesture === 'thumbs_up' || activeGesture === 'thumbs_down') && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#F5F0EB] mb-2">
                        <span className="flex items-center gap-2">
                          {volume === 0 ? (
                            <VolumeX className="text-[#EF4444]" size={16} />
                          ) : (
                            <Volume2 className="text-[#C5F36B]" size={16} />
                          )}
                          <span className="font-bold">System Volume</span>
                        </span>
                        <span className="text-sm font-bold text-[#C5F36B]">{volume}%</span>
                      </div>
                      <div className="w-full bg-[#202520] h-2.5 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-[#A3E635] to-[#C5F36B] h-full rounded-full"
                          animate={{ width: `${volume}%` }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                      </div>
                      {/* Audio waveform equalizer bars */}
                      <div className="flex items-end gap-1 mt-3 h-6 justify-center">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <motion.span
                            key={i}
                            animate={{
                              height: volume > 0 ? [4, 12 + ((i * 7) % 14), 6] : 2,
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.6 + (i % 5) * 0.1,
                              ease: 'easeInOut',
                            }}
                            className="w-1 bg-[#C5F36B] rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Play / Pause Fist State */}
                  {activeGesture === 'fist' && (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1C241C] text-[#C5F36B] border border-[#2E362E] mb-2">
                        {isPlaying ? <Play size={22} /> : <Pause size={22} />}
                      </div>
                      <div className="font-bold text-sm text-[#F5F0EB]">
                        {isPlaying ? 'Playback Resumed' : 'Playback Paused'}
                      </div>
                      <div className="text-[10px] text-[#A3E635] mt-1">
                        Spacebar Action Triggered via PyAutoGUI
                      </div>
                    </div>
                  )}

                  {/* Pointing & Pinch Mouse Navigation */}
                  {(activeGesture === 'pointing' || activeGesture === 'pinch') && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#8A8A8A] mb-1.5">
                        <span className="flex items-center gap-1.5 text-[#F5F0EB]">
                          <MousePointer size={14} className="text-[#C5F36B]" />
                          <span>Virtual Cursor</span>
                        </span>
                        <span className="text-[10px] text-[#A3E635]">
                          X: {Math.round(mousePos.x * 19.2)} Y: {Math.round(mousePos.y * 10.8)}
                        </span>
                      </div>
                      {/* Virtual Desktop Arena */}
                      <div className="relative w-full h-20 bg-[#070907] border border-[#222722] rounded-lg overflow-hidden">
                        <motion.div
                          className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2"
                          animate={{ left: `${mousePos.x}%`, top: `${mousePos.y}%` }}
                          transition={{ type: 'spring', damping: 20 }}
                        >
                          <MousePointer className="text-[#C5F36B] drop-shadow-[0_0_8px_rgba(197,243,107,0.8)]" size={16} />
                          {clickRipple && (
                            <span className="absolute -inset-2 rounded-full border-2 border-[#C5F36B] animate-ping" />
                          )}
                        </motion.div>
                      </div>
                      <div className="text-[10px] text-center mt-1.5 text-[#8A8A8A]">
                        {activeGesture === 'pinch'
                          ? '⚡ Mouse Left Click Triggered!'
                          : 'Smooth Cursor Tracking Active'}
                      </div>
                    </div>
                  )}

                  {/* Swipe Left / Right Tab Switching */}
                  {(activeGesture === 'swipe_right' || activeGesture === 'swipe_left') && (
                    <div>
                      <div className="text-xs text-[#8A8A8A] mb-2 flex items-center justify-between">
                        <span>Browser Tabs Navigation</span>
                        <span className="text-[#C5F36B] font-bold">
                          {activeGesture === 'swipe_right' ? 'Previous Tab ◄' : 'Next Tab ►'}
                        </span>
                      </div>
                      <div className="flex gap-1.5 text-[10px]">
                        {['1: Terminal', '2: Gesture_CV.py', '3: GitHub'].map((tab, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 py-1.5 px-2 rounded text-center transition-all ${
                              activeTab === idx
                                ? 'bg-[#C5F36B] text-[#090A09] font-bold shadow-md'
                                : 'bg-[#181D18] text-[#8A8A8A] border border-[#262826]'
                            }`}
                          >
                            {tab}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-[#8A8A8A] flex items-center justify-between">
                  <span>Latency: 14.2ms</span>
                  <span className="text-[#C5F36B] flex items-center gap-1">
                    <CheckCircle2 size={11} /> PyAutoGUI Linked
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Monitor PIP Badge in 3D Mode */}
        {!showMonitorOverlay && (
          <div className="absolute top-3 right-3 z-10 bg-[#0C0E0C]/85 border border-[#2E362E] backdrop-blur-md px-3 py-2 rounded-lg text-xs flex items-center gap-2.5">
            <span className="text-base">{currentMeta.emoji}</span>
            <div>
              <div className="text-[11px] font-bold text-[#C5F36B]">{currentMeta.name}</div>
              <div className="text-[9px] text-[#8A8A8A]">{currentMeta.action}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Interactive Gesture Cards Grid (Below 3D Scene) ── */}
      <div className="p-3 sm:p-4 bg-[#0E100E] border-t border-[#262826]">
        <div className="flex items-center justify-between text-[11px] text-[#8A8A8A] mb-2.5 px-1">
          <span className="font-bold text-[#F5F0EB] uppercase tracking-wider text-[10px]">
            SELECT GESTURE TO ANIMATE 3D CHARACTER & MONITOR:
          </span>
          <span className="text-[10px] text-[#A3E635]">7 Active Mappings</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {GESTURES.map((g) => {
            const isSelected = activeGesture === g.id
            return (
              <button
                key={g.id}
                onClick={() => selectGesture(g.id)}
                className={`group relative p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#182018] border-[#C5F36B] shadow-[0_0_16px_rgba(197,243,107,0.22)] ring-1 ring-[#C5F36B]'
                    : 'bg-[#121412] border-[#242824] hover:border-[#384238] hover:bg-[#161916]'
                }`}
              >
                <div>
                  <div className="text-xl sm:text-2xl mb-1 transition-transform group-hover:scale-110">
                    {g.emoji}
                  </div>
                  <div
                    className={`font-bold text-[11px] leading-tight ${
                      isSelected ? 'text-[#C5F36B]' : 'text-[#F5F0EB]'
                    }`}
                  >
                    {g.name}
                  </div>
                </div>

                <div className="text-[9px] text-[#8A8A8A] mt-2 border-t border-[#242824] pt-1.5 leading-tight">
                  {g.action}
                </div>

                {isSelected && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#C5F36B] shadow-[0_0_6px_#C5F36B]" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

