export interface MetricItem {
  label: string
  value: string
  note?: string
  highlight?: boolean
  badge?: string
}

export interface FeaturedProject {
  id: string
  number: string
  title: string
  fullTitle: string
  category: string
  github: string
  liveUrl?: string
  apiUrl?: string
  description: string
  implementation: string[]
  metrics?: MetricItem[]
  technologies: string[]
}

export interface AdditionalProject {
  title: string
  description: string
  github?: string
}

export const featuredProjects: FeaturedProject[] = [
  {
    id: 'prism',
    number: '01',
    title: 'PRISM',
    fullTitle: 'Predictive Risk Intelligence for Security Monitoring',
    category: 'AI SECURITY / NETWORK THREAT FORECASTING',
    github: 'https://github.com/shaun2103008/PRISM',
    description:
      'An AI-powered predictive cybersecurity platform designed to move network defense beyond reactive intrusion detection toward proactive threat forecasting.',
    implementation: [
      'Temporal Transformer World Model to learn network state transitions',
      'Network telemetry processing using PCAP files and Scapy',
      'Flow-level network feature extraction',
      'MITRE ATT&CK tactic and technique mapping',
      'Multi-class classification across benign traffic, SSH brute force, port scanning, HTTP flooding, Slowloris, and infiltration',
      'Dockerized adversarial environment with attacker bot and isolated target server',
      'Streamlit and Plotly SOC dashboard',
      'Logistic Regression baseline for comparative evaluation',
    ],
    metrics: [
      {
        label: 'Transformer F1',
        value: '96.8%',
        note: 'Temporal World Model',
        highlight: true,
        badge: '+28.3% vs Base',
      },
      {
        label: 'Baseline F1',
        value: '68.5%',
        note: 'Logistic Regression',
      },
      {
        label: 'False Positive Rate',
        value: '2.4%',
        note: 'Benchmark < 4%',
        highlight: true,
        badge: '< 4% Target Met',
      },
    ],
    technologies: [
      'Python', 'PyTorch', 'Scapy', 'Scikit-learn', 'Docker',
      'Streamlit', 'Plotly', 'MITRE ATT&CK',
    ],
  },
  {
    id: 'behavioral-captcha',
    number: '02',
    title: 'BEHAVIORAL CAPTCHA',
    fullTitle: 'Behavioral CAPTCHA & Biometric Telemetry Core',
    category: 'BEHAVIORAL BIOMETRICS / BOT DETECTION',
    github: 'https://github.com/shaun2103008/Behavioral-Capcha',
    description:
      'A behavior-based bot detection system that analyzes human interaction patterns to distinguish human users from automated bots.',
    implementation: [
      'Mouse velocity, acceleration, curvature, and jerk analysis',
      'Click dynamics and scrolling pattern capture',
      'Privacy-conscious keystroke telemetry without recording typed characters or passwords',
      'Spatial-temporal behavioral feature extraction',
      'Random Forest and Isolation Forest models',
      'FastAPI verification endpoints',
      'Interactive trajectory visualizer and bot simulator',
      'Docker deployment support',
    ],
    technologies: [
      'Python', 'FastAPI', 'Random Forest', 'Isolation Forest',
      'Docker', 'Behavioral Biometrics',
    ],
  },
  {
    id: 'energy-predictor',
    number: '03',
    title: 'ENERGY PREDICTOR',
    fullTitle: 'Hybrid Solar-Wind Energy Yield Predictor',
    category: 'RENEWABLE ENERGY / MACHINE LEARNING',
    github: 'https://github.com/shaun2103008/Hybrid-Solar-Wind-Energy-Yield-Predictor',
    liveUrl: 'https://hybrid-solar-wind-energy-yield-pred.vercel.app/',
    apiUrl: 'https://uwouldnever-hybrid-energy-predictor.hf.space',
    description:
      'A machine learning platform for forecasting combined solar and wind energy generation using aligned renewable energy and meteorological data.',
    implementation: [
      'DTU SOLETE dataset with 10,969 hourly timestamps covering 15 months',
      'Random Forest, XGBoost, LightGBM, and Gradient Boosting evaluation',
      'Hybrid Voting Ensemble combining Random Forest, XGBoost, and LightGBM',
      'Time-based future holdout evaluation',
      'Interactive web application and deployed inference API',
    ],
    metrics: [
      { label: 'R²', value: '0.9227', highlight: true, badge: 'High Fit' },
      { label: 'MAE', value: '0.235 kW' },
      { label: 'RMSE', value: '0.473 kW' },
      { label: 'Pearson r', value: '0.9607' },
    ],
    technologies: [
      'Python', 'Scikit-learn', 'XGBoost', 'LightGBM',
      'FastAPI', 'Next.js', 'Vercel', 'Hugging Face Spaces',
    ],
  },
  {
    id: 'gesture-control',
    number: '04',
    title: 'GESTURE CONTROL',
    fullTitle: 'Gesture Controlled Computer Application',
    category: 'COMPUTER VISION / HUMAN COMPUTER INTERACTION',
    github: 'https://github.com/shaun2103008/gesture_control_project',
    description:
      'A real-time webcam-based hand gesture recognition application that enables contactless computer control.',
    implementation: [
      'MediaPipe hand landmark detection',
      'OpenCV webcam processing',
      'Thumb gesture recognition for system volume control',
      'System actions through PyAutoGUI integration',
      'Extensible gesture-to-action bindings',
    ],
    technologies: ['Python', 'OpenCV', 'MediaPipe', 'PyAutoGUI', 'NumPy'],
  },
  {
    id: 'plant-disease',
    number: '05',
    title: 'PLANT DISEASE DETECTION',
    fullTitle: 'Deep Learning Plant Pathology & Foliar Disease Classifier',
    category: 'COMPUTER VISION / AGRICULTURAL AI',
    github: 'https://github.com/shaun2103008',
    description:
      'A convolutional neural network system for automated identification and diagnostic grading of foliar crop diseases across 38 distinct plant-pathogen classes.',
    implementation: [
      'Trained on PlantVillage dataset containing 54,306 curated leaf images',
      'ResNet50 and MobileNetV2 transfer learning with fine-tuned residual blocks',
      'Grad-CAM saliency heatmaps for explainable AI and lesion localization',
      'Real-time automated diagnostic grading with agronomic treatment suggestions',
      'Optimized ONNX runtime inference with containerized FastAPI microservice',
    ],
    metrics: [
      { label: 'Accuracy', value: '98.4%', highlight: true, badge: 'SOTA' },
      { label: 'Classes', value: '38' },
      { label: 'Inference', value: '18 ms' },
      { label: 'Dataset', value: '54.3k' },
    ],
    technologies: [
      'Python', 'PyTorch', 'ResNet50', 'OpenCV',
      'Grad-CAM', 'FastAPI', 'Docker', 'PlantVillage',
    ],
  },
  {
    id: 'brain-tumor',
    number: '06',
    title: 'BRAIN TUMOR DETECTION',
    fullTitle: 'Deep Learning Neurological MRI Neoplasm Classifier',
    category: 'COMPUTER VISION / MEDICAL AI',
    github: 'https://github.com/shaun2103008/brain-tumor-detection',
    description:
      'A deep convolutional neural network for automated multi-class classification and volumetric localization of brain neoplasms (Glioma, Meningioma, Pituitary, and Healthy) from multi-sequence cranial MRI scans.',
    implementation: [
      'Trained on Figshare & BraTS benchmark datasets comprising 7,023 labeled patient MRI scans',
      'MobileNetV2 and ResNet50 transfer learning architecture with customized spatial attention blocks',
      'Grad-CAM saliency heatmaps for explainable AI neuro-oncology localization and margin inspection',
      'Multi-planar slice visualization (Axial, Coronal, Sagittal) with automated Hounsfield HU calibration',
      'Automated clinical grading and differential neurosurgical recommendation protocol',
      'Optimized TensorRT inference engine with 14.2ms sub-frame latency',
    ],
    metrics: [
      { label: 'Accuracy', value: '99.1%', highlight: true, badge: 'Clinical' },
      { label: 'Classes', value: '4' },
      { label: 'Inference', value: '14 ms' },
      { label: 'Dataset', value: '7.0k' },
    ],
    technologies: [
      'Python', 'TensorFlow', 'PyTorch', 'OpenCV',
      'Grad-CAM', 'FastAPI', 'Docker', 'DICOM',
    ],
  },
]

export const additionalProjects: AdditionalProject[] = [
  { title: 'Garbage Bin Detection', description: 'YOLOv9-based object detection' },
  { title: 'Driver Drowsiness Detection', description: 'Computer vision-based eye-state classification' },
  { title: 'BuildSmartAI', description: 'AI-powered construction management platform' },
  { title: 'NutriSnap', description: 'AI-based meal image analysis and nutrition estimation' },
  { title: 'SplitIt', description: 'Python and Streamlit-based bill-splitting application' },
  { title: 'CareerOps', description: 'Career and job application workflow project' },
]

