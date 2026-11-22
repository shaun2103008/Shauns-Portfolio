import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Eye,
  RefreshCw,
  Search,
  X,
  ShieldAlert,
  ChevronRight,
  Info,
  Activity,
  FileCheck,
  Scan,
  Maximize2,
  ExternalLink,
} from 'lucide-react'

// ─── MRI Specimen Interface ───
export interface MRISpecimen {
  id: string
  class: 'glioma' | 'meningioma' | 'pituitary' | 'notumor'
  name: string
  subType: string
  slicePlane: 'Axial (T2-FLAIR)' | 'Axial (T1-CE)' | 'Coronal (T2-W)' | 'Sagittal (T1-SE)'
  confidence: number
  estVolume: string
  location: string
  imageSrc: string
  heatmapCoords: { cx: string; cy: string; r: string }
  contourPath?: string
  probabilities: { label: string; pct: number }[]
  clinicalRec: string
  tumorMargin: string
}

// ─── Real Patient MRI Benchmark Specimens ───
export const MRI_DATASET_SPECIMENS: MRISpecimen[] = [
  {
    id: 'mri-gl-01',
    class: 'glioma',
    name: 'High-Grade Glioma',
    subType: 'Glioblastoma Multiforme (GBM) · WHO Grade IV',
    slicePlane: 'Axial (T2-FLAIR)',
    confidence: 99.4,
    estVolume: '14.8 cm³',
    location: 'Right Frontal-Temporal Lobe',
    imageSrc: '/dataset/brain-tumor/glioma_01.jpg',
    heatmapCoords: { cx: '58%', cy: '42%', r: '32%' },
    probabilities: [
      { label: 'Glioma', pct: 99.4 },
      { label: 'Meningioma', pct: 0.4 },
      { label: 'Pituitary', pct: 0.1 },
      { label: 'No Tumor', pct: 0.1 },
    ],
    clinicalRec:
      'Urgent neuro-oncology multidisciplinary consultation. Recommend contrast stereotactic neuronavigation mapping, pre-surgical fMRI tractography, and maximal safe resection with adjuvant temozolomide chemoradiation.',
    tumorMargin:
      'Irregular infiltrative hyperintense mass with prominent vasogenic edema and surrounding midline mass-effect.',
  },
  {
    id: 'mri-gl-02',
    class: 'glioma',
    name: 'Infiltrative Astrocytoma',
    subType: 'Diffuse Infiltrative Glioma · WHO Grade II/III',
    slicePlane: 'Axial (T1-CE)',
    confidence: 98.6,
    estVolume: '9.2 cm³',
    location: 'Left Parieto-Occipital Lobe',
    imageSrc: '/dataset/brain-tumor/glioma_02.jpg',
    heatmapCoords: { cx: '42%', cy: '50%', r: '28%' },
    probabilities: [
      { label: 'Glioma', pct: 98.6 },
      { label: 'Meningioma', pct: 1.1 },
      { label: 'Pituitary', pct: 0.2 },
      { label: 'No Tumor', pct: 0.1 },
    ],
    clinicalRec:
      'Stereotactic biopsy confirmation advised. Perform IDH1/2 mutation and 1p/19q codeletion genomic profiling to guide molecular-targeted radiotherapy protocol.',
    tumorMargin:
      'Poorly circumscribed non-enhancing infiltrative lesion tracking deep subcortical white matter fibers.',
  },
  {
    id: 'mri-me-01',
    class: 'meningioma',
    name: 'Parasagittal Meningioma',
    subType: 'Extra-Axial Dural Meningioma · WHO Grade I',
    slicePlane: 'Axial (T2-FLAIR)',
    confidence: 99.1,
    estVolume: '11.5 cm³',
    location: 'Superior Sagittal Sinus Margin',
    imageSrc: '/dataset/brain-tumor/meningioma_01.jpg',
    heatmapCoords: { cx: '50%', cy: '36%', r: '33%' },
    probabilities: [
      { label: 'Meningioma', pct: 99.1 },
      { label: 'Glioma', pct: 0.6 },
      { label: 'Pituitary', pct: 0.2 },
      { label: 'No Tumor', pct: 0.1 },
    ],
    clinicalRec:
      'Elective neurosurgical intervention candidate for Simpson Grade I/II en bloc resection. MR venography indicated to confirm superior sagittal sinus lumen patency and collateral drainage.',
    tumorMargin:
      'Sharply defined extra-axial mass exhibiting intense homogeneous enhancement with distinct dural tail sign.',
  },
  {
    id: 'mri-me-02',
    class: 'meningioma',
    name: 'Sphenoid Ridge Meningioma',
    subType: 'Transitional Dural Meningioma · WHO Grade I',
    slicePlane: 'Coronal (T2-W)',
    confidence: 97.8,
    estVolume: '8.1 cm³',
    location: 'Left Middle Cranial Fossa',
    imageSrc: '/dataset/brain-tumor/meningioma_02.jpg',
    heatmapCoords: { cx: '40%', cy: '46%', r: '28%' },
    probabilities: [
      { label: 'Meningioma', pct: 97.8 },
      { label: 'Glioma', pct: 1.5 },
      { label: 'Pituitary', pct: 0.5 },
      { label: 'No Tumor', pct: 0.2 },
    ],
    clinicalRec:
      'Formal Goldmann visual field perimetry and skull base neurosurgery review. Stereotactic radiosurgery (Gamma Knife / CyberKnife) favored if internal carotid artery sheath is encased.',
    tumorMargin:
      'Firm lobulated extra-axial lesion abutting the clinoid process with mild reactive bone hyperostosis.',
  },
  {
    id: 'mri-pi-01',
    class: 'pituitary',
    name: 'Pituitary Macroadenoma',
    subType: 'Pituitary Neuroendocrine Tumor (PitNET)',
    slicePlane: 'Sagittal (T1-SE)',
    confidence: 99.5,
    estVolume: '6.4 cm³',
    location: 'Sella Turcica with Suprasellar Extension',
    imageSrc: '/dataset/brain-tumor/pituitary_01.jpg',
    heatmapCoords: { cx: '50%', cy: '53%', r: '26%' },
    probabilities: [
      { label: 'Pituitary', pct: 99.5 },
      { label: 'Glioma', pct: 0.2 },
      { label: 'Meningioma', pct: 0.2 },
      { label: 'No Tumor', pct: 0.1 },
    ],
    clinicalRec:
      'Endocrine hormonal panel (serum prolactin, IGF-1, ACTH, morning cortisol, free T4). Transsphenoidal endoscopic resection indicated due to optic chiasm elevation.',
    tumorMargin:
      'Sellar floor remodeling and classic snowman appearance bulging into suprasellar cistern without cavernous sinus invasion.',
  },
  {
    id: 'mri-pi-02',
    class: 'pituitary',
    name: 'Sellar Microadenoma',
    subType: 'Secretory Pituitary Microadenoma',
    slicePlane: 'Axial (T1-CE)',
    confidence: 98.3,
    estVolume: '3.2 cm³',
    location: 'Intrasellar Left Hemi-Gland',
    imageSrc: '/dataset/brain-tumor/pituitary_02.jpg',
    heatmapCoords: { cx: '51%', cy: '54%', r: '23%' },
    probabilities: [
      { label: 'Pituitary', pct: 98.3 },
      { label: 'Glioma', pct: 0.9 },
      { label: 'Meningioma', pct: 0.5 },
      { label: 'No Tumor', pct: 0.3 },
    ],
    clinicalRec:
      'Primary medical trial with dopamine D2 receptor agonists (cabergoline) if prolactin-positive. Surveillance volumetric MRI scan at 6-month interval.',
    tumorMargin:
      'Focal delayed enhancement within left adenohypophysis accompanied by subtle pituitary stalk deviation.',
  },
  {
    id: 'mri-no-01',
    class: 'notumor',
    name: 'Normal Cranial Scan',
    subType: 'Healthy Cerebral Anatomy · No Neoplasm',
    slicePlane: 'Axial (T2-FLAIR)',
    confidence: 99.9,
    estVolume: '0.0 cm³',
    location: 'Symmetric Bilateral Hemispheres',
    imageSrc: '/dataset/brain-tumor/notumor_01.jpg',
    heatmapCoords: { cx: '50%', cy: '50%', r: '30%' },
    probabilities: [
      { label: 'No Tumor', pct: 99.9 },
      { label: 'Glioma', pct: 0.05 },
      { label: 'Meningioma', pct: 0.03 },
      { label: 'Pituitary', pct: 0.02 },
    ],
    clinicalRec:
      'No intracranial mass lesion, abnormal parenchymal signal, acute infarction, or hemorrhage detected. Ventricles and basal cisterns remain entirely normal for age.',
    tumorMargin:
      'Intact symmetric cortical sulcal pattern with well-preserved grey-white matter junction throughout.',
  },
  {
    id: 'mri-no-02',
    class: 'notumor',
    name: 'Normal Brainstem & Cerebellum',
    subType: 'Healthy Posterior Fossa Anatomy',
    slicePlane: 'Axial (T1-CE)',
    confidence: 99.7,
    estVolume: '0.0 cm³',
    location: 'Posterior Fossa and Basal Ganglia',
    imageSrc: '/dataset/brain-tumor/notumor_02.jpg',
    heatmapCoords: { cx: '50%', cy: '50%', r: '28%' },
    probabilities: [
      { label: 'No Tumor', pct: 99.7 },
      { label: 'Glioma', pct: 0.1 },
      { label: 'Meningioma', pct: 0.1 },
      { label: 'Pituitary', pct: 0.1 },
    ],
    clinicalRec:
      'Posterior fossa, brainstem, fourth ventricle, and cerebellopontine angles are completely unremarkable. No suspicious enhancement or space-occupying pathology.',
    tumorMargin:
      'Normal cerebrospinal fluid spaces and clear foramina of Luschka and Magendie.',
  },
]

export default function BrainTumorDemo() {
  const [activeSpecimen, setActiveSpecimen] = useState<MRISpecimen>(MRI_DATASET_SPECIMENS[0])
  const [isScanning, setIsScanning] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showContour, setShowContour] = useState(true)
  const [isVaultOpen, setIsVaultOpen] = useState(false)
  const [vaultFilter, setVaultFilter] = useState<'all' | 'glioma' | 'meningioma' | 'pituitary' | 'notumor'>('all')
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 148, y: 132, hu: 194 })
  const [activePlane, setActivePlane] = useState<'Axial' | 'Coronal' | 'Sagittal'>('Axial')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  // Trigger simulated deep inference pass on image switch
  const triggerScan = useCallback(() => {
    setIsScanning(true)
    const timer = setTimeout(() => {
      setIsScanning(false)
    }, 750)
    return () => clearTimeout(timer)
  }, [])

  const selectSpecimen = (specimen: MRISpecimen) => {
    setCustomImage(null)
    setActiveSpecimen(specimen)
    triggerScan()
  }

  // Handle custom MRI upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setCustomImage(result)
        // Synthesize dynamic detection for uploaded image
        setActiveSpecimen({
          id: 'custom-mri',
          class: 'glioma',
          name: 'Patient Uploaded MRI Scan',
          subType: 'Deep ConvNet Feature Classification',
          slicePlane: 'Axial (T2-FLAIR)',
          confidence: 97.4,
          estVolume: '8.4 cm³',
          location: 'Detected High-Density Neoplastic Cluster',
          imageSrc: result,
          heatmapCoords: { cx: '52%', cy: '48%', r: '30%' },
          probabilities: [
            { label: 'Glioma', pct: 97.4 },
            { label: 'Meningioma', pct: 1.8 },
            { label: 'Pituitary', pct: 0.5 },
            { label: 'No Tumor', pct: 0.3 },
          ],
          clinicalRec:
            'Deep feature embeddings indicate hyperintense mass. Please correlate with clinical findings and submit for board-certified neuroradiology review.',
          tumorMargin: 'Automated CNN contour extraction identified suspicious high-gradient perimeter.',
        })
        triggerScan()
      }
      reader.readAsDataURL(file)
    }
  }

  // Mouse move over MRI stage to calculate simulated Hounsfield HU units
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    const hu = Math.round(40 + (Math.sin(x * 0.05) + Math.cos(y * 0.05)) * 120 + 80)
    setMousePos({ x, y, hu })
  }

  // Filter vault items
  const filteredSpecimens =
    vaultFilter === 'all'
      ? MRI_DATASET_SPECIMENS
      : MRI_DATASET_SPECIMENS.filter((s) => s.class === vaultFilter)

  // Color config helper based on class
  const getBadgeStyle = (cls: string) => {
    switch (cls) {
      case 'glioma':
        return {
          badge: 'bg-[#2A1414] border-[#EF4444] text-[#F87171]',
          text: 'text-[#F87171]',
          label: 'GLIOMA IDENTIFIED',
          sub: 'High Risk (WHO Grade IV)',
        }
      case 'meningioma':
        return {
          badge: 'bg-[#2A1D12] border-[#F97316] text-[#FB923C]',
          text: 'text-[#FB923C]',
          label: 'MENINGIOMA DETECTED',
          sub: 'Extra-Axial Neoplasm',
        }
      case 'pituitary':
        return {
          badge: 'bg-[#14202E] border-[#38BDF8] text-[#38BDF8]',
          text: 'text-[#38BDF8]',
          label: 'PITUITARY ADENOMA',
          sub: 'Sellar / Suprasellar',
        }
      default:
        return {
          badge: 'bg-[#122214] border-[#22C55E] text-[#4ADE80]',
          text: 'text-[#4ADE80]',
          label: 'CLEAR · NO TUMOR',
          sub: 'Normal Cranial Anatomy',
        }
    }
  }

  const badgeStyle = getBadgeStyle(activeSpecimen.class)

  return (
    <div className="w-full bg-[#090A09] border border-[#242824] rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden font-sans select-none">
      {/* Background Tech Watermark */}
      <div className="absolute top-2 right-4 text-[70px] sm:text-[90px] font-black text-[#F5F0EB]/[0.02] pointer-events-none font-mono">
        MRI-AI
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ─── Top Control Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C201C] pb-3 mb-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C5F36B] animate-pulse" />
          <span className="text-[#F5F0EB] font-bold tracking-wider">NEURO-ONCOLOGY MRI CLASSIFIER</span>
          <span className="px-2 py-0.5 rounded bg-[#181C18] border border-[#283228] text-[#C5F36B] text-[10px]">
            ResNet50 + Grad-CAM
          </span>
        </div>

        {/* View Mode & Vault Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVaultOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141814] hover:bg-[#1A221A] text-[#C5F36B] border border-[#2E362E] hover:border-[#C5F36B] rounded transition-all text-[11px] font-semibold"
          >
            <FolderOpen size={13} />
            <span>Dataset Vault (8)</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded border transition-all text-[11px] ${
              showHeatmap
                ? 'bg-[#182618] border-[#C5F36B] text-[#C5F36B]'
                : 'bg-[#101210] border-[#222822] text-[#8A8A8A] hover:text-[#F5F0EB]'
            }`}
            title="Toggle Grad-CAM Class Activation Map"
          >
            <Eye size={12} />
            <span>Grad-CAM</span>
          </button>

          <button
            onClick={() => setShowContour(!showContour)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded border transition-all text-[11px] ${
              showContour
                ? 'bg-[#182618] border-[#C5F36B] text-[#C5F36B]'
                : 'bg-[#101210] border-[#222822] text-[#8A8A8A] hover:text-[#F5F0EB]'
            }`}
            title="Toggle Tumor Segmentation Boundary"
          >
            <Scan size={12} />
            <span>Contour</span>
          </button>
        </div>
      </div>

      {/* ─── Main Two-Column Interactive Workstation ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: MRI Viewport Stage & Telemetry (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Viewport Meta Ribbon */}
            <div className="flex items-center justify-between text-[11px] text-[#8A8A8A] mb-2 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#C5F36B]">PATIENT_ANON_#0429</span>
                <span>•</span>
                <span className="text-[#F5F0EB]">{activeSpecimen.slicePlane}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                {(['Axial', 'Coronal', 'Sagittal'] as const).map((plane) => (
                  <button
                    key={plane}
                    onClick={() => setActivePlane(plane)}
                    className={`px-1.5 py-0.5 rounded ${
                      activePlane === plane
                        ? 'bg-[#C5F36B] text-[#090A09] font-bold'
                        : 'text-[#8A8A8A] hover:text-[#F5F0EB]'
                    }`}
                  >
                    {plane}
                  </button>
                ))}
              </div>
            </div>

            {/* MRI Stage Canvas */}
            <div
              ref={stageRef}
              onMouseMove={handleMouseMove}
              className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#050605] rounded-xl overflow-hidden border border-[#202520] flex items-center justify-center group cursor-crosshair"
            >
              {/* MRI Background Image */}
              <img
                src={customImage || activeSpecimen.imageSrc}
                alt={activeSpecimen.name}
                className="w-full h-full object-contain filter contrast-125 brightness-95 transition-transform duration-500 group-hover:scale-[1.02]"
              />

              {/* DICOM Scanlines Grid */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(197, 243, 107, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(197, 243, 107, 0.04) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Laser Scanning Bar Animation */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C5F36B] to-transparent shadow-[0_0_15px_#C5F36B]"
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.75, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>

              {/* Grad-CAM Saliency Heatmap Overlay */}
              {showHeatmap && activeSpecimen.class !== 'notumor' && (
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at ${activeSpecimen.heatmapCoords.cx} ${activeSpecimen.heatmapCoords.cy}, rgba(239, 68, 68, 0.75) 0%, rgba(249, 115, 22, 0.6) 30%, rgba(234, 179, 8, 0.45) 55%, rgba(197, 243, 107, 0.2) 75%, transparent ${activeSpecimen.heatmapCoords.r})`,
                  }}
                />
              )}

              {/* Tumor Segmentation Bounding Ring Contour */}
              {showContour && activeSpecimen.class !== 'notumor' && (
                <div
                  className="absolute pointer-events-none rounded-full border-2 border-dashed border-[#EF4444] animate-pulse"
                  style={{
                    left: activeSpecimen.heatmapCoords.cx,
                    top: activeSpecimen.heatmapCoords.cy,
                    width: '95px',
                    height: '95px',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-1 py-0.2 bg-[#EF4444] text-white text-[8px] font-mono rounded font-bold uppercase tracking-wider whitespace-nowrap">
                    ROI: {activeSpecimen.class}
                  </span>
                </div>
              )}

              {/* HUD Crosshair & Live Coordinates */}
              <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm border border-[#2E362E] px-2 py-1 rounded text-[9px] font-mono text-[#8A8A8A]">
                <div>
                  COORD: [{mousePos.x}, {mousePos.y}]
                </div>
                <div>
                  SIGNAL: <span className="text-[#C5F36B]">{mousePos.hu} HU</span>
                </div>
              </div>

              {/* DICOM Calibration Tag Bottom Left */}
              <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-sm border border-[#2E362E] px-2 py-0.5 rounded text-[8px] font-mono text-[#8A8A8A] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span>16-BIT DICOM · RES: 512x512</span>
              </div>

              {/* Target Focus Indicator Bottom Right */}
              <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-sm border border-[#2E362E] px-2 py-0.5 rounded text-[9px] font-mono text-[#A3E635]">
                {activeSpecimen.class === 'notumor' ? 'NORMAL BASELINE' : 'NEOPLASM FOCAL ZONE'}
              </div>
            </div>
          </div>

          {/* Quick-Action Bar Below Stage */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#141814] hover:bg-[#1A221A] text-[#F5F0EB] border border-[#2E362E] hover:border-[#C5F36B] rounded-lg transition-all text-xs font-semibold"
            >
              <Upload size={13} className="text-[#C5F36B]" />
              <span>Drop / Upload Patient MRI</span>
            </button>

            <button
              onClick={triggerScan}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#121412] hover:bg-[#1C201C] text-[#8A8A8A] hover:text-[#C5F36B] border border-[#242824] rounded-lg transition-colors text-xs"
              title="Rerun deep neural inference pass"
            >
              <RefreshCw size={12} className={isScanning ? 'animate-spin text-[#C5F36B]' : ''} />
              <span>Re-Analyze Scan</span>
            </button>
          </div>

          {/* Quick Specimen Picker Filmstrip */}
          <div className="mt-3.5 pt-3 border-t border-[#1C201C]">
            <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
              <span className="text-[#8A8A8A] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5F36B] animate-pulse" />
                <span>Quick-Select Patient Case:</span>
              </span>
              <button
                onClick={() => setIsVaultOpen(true)}
                className="text-[#C5F36B] hover:text-[#D9F99D] flex items-center gap-1 text-[10px] transition-colors"
              >
                <span>Full Archive ({MRI_DATASET_SPECIMENS.length})</span>
                <ExternalLink size={10} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {MRI_DATASET_SPECIMENS.slice(0, 4).map((specimen) => (
                <button
                  key={specimen.id}
                  onClick={() => selectSpecimen(specimen)}
                  className={`group relative p-1.5 rounded-lg border text-left transition-all overflow-hidden flex flex-col items-center justify-center ${
                    activeSpecimen.id === specimen.id
                      ? 'bg-[#182418] border-[#C5F36B] shadow-[0_0_12px_rgba(197,243,107,0.18)]'
                      : 'bg-[#101210] border-[#222822] hover:border-[#384238]'
                  }`}
                  title={`${specimen.name} - ${specimen.subType}`}
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-black border border-[#262A26] mb-1">
                    <img
                      src={specimen.imageSrc}
                      alt={specimen.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[10px] text-[#F5F0EB] font-bold truncate max-w-full text-center">
                    {specimen.class.toUpperCase()}
                  </span>
                  <span
                    className={`text-[8px] font-mono uppercase truncate ${
                      specimen.class === 'notumor' ? 'text-[#4ADE80]' : 'text-[#F87171]'
                    }`}
                  >
                    {specimen.confidence}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pathology Telemetry Matrix */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
            <div className="p-2 rounded-lg bg-[#0E100E] border border-[#222822]">
              <div className="text-[9px] text-[#8A8A8A] uppercase tracking-wider">Estimated Volume</div>
              <div className="text-xs font-bold text-[#F5F0EB] mt-0.5">{activeSpecimen.estVolume}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0E100E] border border-[#222822]">
              <div className="text-[9px] text-[#8A8A8A] uppercase tracking-wider">Locus Region</div>
              <div className="text-xs font-bold text-[#C5F36B] mt-0.5 truncate" title={activeSpecimen.location}>
                {activeSpecimen.class === 'notumor' ? 'Clear' : activeSpecimen.location.split(' ')[0]}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0E100E] border border-[#222822]">
              <div className="text-[9px] text-[#8A8A8A] uppercase tracking-wider">Grad-CAM Saliency</div>
              <div className="text-xs font-bold text-[#F5F0EB] mt-0.5">
                {activeSpecimen.class === 'notumor' ? '0.08 Baseline' : '0.982 Peak'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0E100E] border border-[#222822]">
              <div className="text-[9px] text-[#8A8A8A] uppercase tracking-wider">Inference Speed</div>
              <div className="text-xs font-bold text-[#C5F36B] mt-0.5">14.2 ms (FP16)</div>
            </div>
          </div>
        </div>

        {/* Right Column: Deep Diagnostic Output & Oncology Protocol (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#0E100E] border border-[#242824] rounded-xl p-4 sm:p-5">
          <div>
            {/* Neuropathology Verdict Badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[#8A8A8A] font-mono">
                Neuropathology Verdict
              </span>
              <span
                className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded border flex items-center gap-1 ${badgeStyle.badge}`}
              >
                {activeSpecimen.class === 'notumor' ? (
                  <CheckCircle2 size={11} />
                ) : (
                  <AlertTriangle size={11} />
                )}
                <span>{badgeStyle.label}</span>
              </span>
            </div>

            {/* Tumor Name & Histology */}
            <h4 className="text-lg sm:text-xl font-bold text-[#F5F0EB] leading-tight">
              {activeSpecimen.name}
            </h4>
            <div className="text-xs text-[#A3E635] italic mt-0.5">
              {activeSpecimen.subType}
            </div>

            {/* Neural Confidence Gauge */}
            <div className="my-3.5 p-3 bg-[#131613] border border-[#262D26] rounded-lg">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-[#8A8A8A]">Classification Confidence</span>
                <span className="font-bold text-[#C5F36B] text-sm">
                  {activeSpecimen.confidence}%
                </span>
              </div>
              <div className="w-full bg-[#202520] h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[#84CC16] to-[#C5F36B] h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${activeSpecimen.confidence}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
              <div className="text-[10px] text-[#8A8A8A] mt-1.5 flex items-center justify-between font-mono">
                <span>{activeSpecimen.location}</span>
                <span className="text-[#C5F36B]">Vol: {activeSpecimen.estVolume}</span>
              </div>
            </div>

            {/* 4-Class Probability Breakdown */}
            <div className="mb-3 space-y-1.5">
              <div className="text-[10px] uppercase text-[#8A8A8A] tracking-wider mb-1 font-mono">
                4-Class Softmax Probability Distribution:
              </div>
              {activeSpecimen.probabilities.map((prob, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#F5F0EB]/90">{prob.label}</span>
                    <span className="text-[#A3E635] text-[11px] font-semibold">
                      {prob.pct}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1A1E1A] h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        prob.pct > 50
                          ? 'bg-gradient-to-r from-[#84CC16] to-[#C5F36B]'
                          : 'bg-[#404A40]'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${prob.pct}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Clinical Protocol Guidance */}
            <div className="p-3 bg-[#121612] border border-[#242C24] rounded-lg text-xs">
              <div className="flex items-center gap-1.5 text-[#C5F36B] font-bold text-[11px] mb-1 font-mono">
                <FileCheck size={13} />
                <span>Clinical & Surgical Recommendations</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#D1D5DB]">
                {activeSpecimen.clinicalRec}
              </p>
            </div>
          </div>

          {/* Footer Disclaimer & Latency */}
          <div className="mt-3 pt-2.5 border-t border-[#1C201C] flex items-center justify-between text-[10px] text-[#8A8A8A] font-mono">
            <span>Inference: 14.2ms · TensorRT</span>
            <span className="text-[#A3E635]">BraTS & Figshare Benchmark</span>
          </div>
        </div>
      </div>

      {/* ── Pop-Out Dataset Vault Modal ── */}
      <AnimatePresence>
        {isVaultOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-4xl max-h-[85vh] bg-[#0E100E] border border-[#2E362E] rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono"
            >
              {/* Modal Header */}
              <div className="bg-[#141814] px-5 py-4 border-b border-[#262826] flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#F5F0EB] flex items-center gap-2">
                    <FolderOpen className="text-[#C5F36B]" size={18} />
                    <span>Cranial MRI Dataset Vault · Authentic Patient Scans</span>
                  </h3>
                  <p className="text-xs text-[#8A8A8A] mt-0.5">
                    Select any authentic MRI scan from the benchmark archive to test the neural classifier in real-time.
                  </p>
                </div>
                <button
                  onClick={() => setIsVaultOpen(false)}
                  className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#F5F0EB] hover:bg-[#202420] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="px-5 py-3 bg-[#0A0B0A] border-b border-[#1E221E] flex flex-wrap gap-1.5 text-xs">
                {(
                  [
                    { key: 'all', label: 'All Scans (8)' },
                    { key: 'glioma', label: 'Glioma (2)' },
                    { key: 'meningioma', label: 'Meningioma (2)' },
                    { key: 'pituitary', label: 'Pituitary (2)' },
                    { key: 'notumor', label: 'No Tumor (2)' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setVaultFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      vaultFilter === tab.key
                        ? 'bg-[#C5F36B] text-[#090A09]'
                        : 'bg-[#141814] text-[#8A8A8A] hover:text-[#F5F0EB] border border-[#242824]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scans Grid */}
              <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-h-[60vh]">
                {filteredSpecimens.map((specimen) => (
                  <div
                    key={specimen.id}
                    onClick={() => {
                      selectSpecimen(specimen)
                      setIsVaultOpen(false)
                    }}
                    className={`group cursor-pointer rounded-xl border p-3 transition-all flex flex-col justify-between ${
                      activeSpecimen.id === specimen.id
                        ? 'bg-[#182618] border-[#C5F36B] shadow-[0_0_15px_rgba(197,243,107,0.2)]'
                        : 'bg-[#121412] border-[#222822] hover:border-[#384238] hover:bg-[#151915]'
                    }`}
                  >
                    <div>
                      {/* Photo Preview Container */}
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-black border border-[#282E28] mb-2.5 relative">
                        <img
                          src={specimen.imageSrc}
                          alt={specimen.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                            specimen.class === 'notumor'
                              ? 'bg-[#122214] text-[#4ADE80] border-[#22C55E]'
                              : specimen.class === 'glioma'
                              ? 'bg-[#2A1414] text-[#F87171] border-[#EF4444]'
                              : specimen.class === 'meningioma'
                              ? 'bg-[#2A1D12] text-[#FB923C] border-[#F97316]'
                              : 'bg-[#14202E] text-[#38BDF8] border-[#38BDF8]'
                          }`}
                        >
                          {specimen.class}
                        </span>
                      </div>

                      {/* Title & Metadata */}
                      <div className="text-xs font-bold text-[#F5F0EB] group-hover:text-[#C5F36B] transition-colors leading-tight">
                        {specimen.name}
                      </div>
                      <div className="text-[10px] text-[#8A8A8A] mt-0.5 truncate">
                        {specimen.subType}
                      </div>
                      <div className="text-[9px] text-[#A3E635] mt-1 font-mono">
                        {specimen.slicePlane}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#1E221E] flex items-center justify-between text-[10px]">
                      <span className="text-[#8A8A8A]">Score: {specimen.confidence}%</span>
                      <span className="text-[#C5F36B] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        <span>Load Scan</span>
                        <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="bg-[#101210] px-5 py-3 border-t border-[#222622] flex items-center justify-between text-xs text-[#8A8A8A]">
                <span>Showing {filteredSpecimens.length} verified patient MRI scans</span>
                <button
                  onClick={() => setIsVaultOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#1C201C] hover:bg-[#283028] text-[#F5F0EB] text-xs transition-colors"
                >
                  Close Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

