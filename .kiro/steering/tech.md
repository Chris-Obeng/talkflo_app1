# Tech Stack

## Frontend
- **React 19** with TypeScript
- **Vite** for build tooling and development server
- **React Router DOM** for client-side routing
- **Tailwind CSS** for styling with custom theme
- **Lucide React** for icons
- **Sonner** for toast notifications

## Backend
- **Convex** as the full-stack backend platform
- **Convex Auth** for anonymous authentication
- **OpenAI** for AI text processing and transcription
- File storage handled by Convex's built-in storage

## Development Tools
- **TypeScript** with strict configuration
- **ESLint** with React hooks and refresh plugins
- **Prettier** for code formatting
- **npm-run-all** for parallel script execution

## Common Commands

### Development
```bash
npm run dev          # Start both frontend and backend in parallel
npm run dev:frontend # Start only Vite dev server
npm run dev:backend  # Start only Convex dev server
```

### Build & Deploy
```bash
npm run build        # Build for production
npm run lint         # Type check and build validation
```

## Key Dependencies
- `@convex-dev/auth` - Authentication system
- `convex` - Backend platform client
- `openai` - AI integration
- `clsx` & `tailwind-merge` - Utility-first styling
- `react-router-dom` - SPA routing