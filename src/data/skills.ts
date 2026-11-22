export interface SkillCategory {
  name: string
  tag: string
  skills: string[]
}

export const skillCategories: SkillCategory[] = [
  {
    name: 'Programming',
    tag: 'LANG',
    skills: ['Python', 'JavaScript', 'SQL'],
  },
  {
    name: 'Machine Learning',
    tag: 'ML/DL',
    skills: [
      'TensorFlow', 'PyTorch', 'Scikit-learn', 'XGBoost',
      'LightGBM', 'Random Forest', 'Ensemble Learning', 'Feature Engineering',
    ],
  },
  {
    name: 'Artificial Intelligence',
    tag: 'AI',
    skills: [
      'Large Language Models', 'Generative AI', 'RAG', 'Embeddings',
      'Vector Databases', 'Transformer Architectures', 'AI Agents',
    ],
  },
  {
    name: 'Computer Vision',
    tag: 'CV',
    skills: ['OpenCV', 'MediaPipe', 'YOLO', 'Image Classification', 'Object Detection'],
  },
  {
    name: 'Backend & Web',
    tag: 'WEB',
    skills: ['Flask', 'FastAPI', 'Streamlit', 'Next.js', 'React', 'REST APIs'],
  },
  {
    name: 'Tools & Infrastructure',
    tag: 'INFRA',
    skills: ['Git', 'GitHub', 'Docker', 'VS Code', 'Google Colab', 'NVIDIA CUDA'],
  },
]

