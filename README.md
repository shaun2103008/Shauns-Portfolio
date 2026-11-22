# Shaun Stephen Banis — Portfolio

Personal portfolio website for Shaun Stephen Banis, AI/ML Engineer.

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

## Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel (Free)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select the repository
4. Vercel auto-detects the config from `vercel.json`
5. Deploy — it's free!

## Add Your Resume PDF

Place your `resume.pdf` file in the `public/` folder. The "Download Resume" button links to `/resume.pdf`.

## Customization

All personal data is in `src/data/`:
- `personal.ts` — name, bio, contact info
- `projects.ts` — featured and additional projects
- `skills.ts` — technical skills by category

