# Project Structure

## Root Directory
```
├── src/                 # Frontend React application
├── convex/             # Backend Convex functions and schema
├── .kiro/              # Kiro AI assistant configuration
├── node_modules/       # Dependencies
└── config files        # Vite, TypeScript, Tailwind, etc.
```

## Frontend Structure (`src/`)
```
src/
├── components/         # React components (organized flat)
├── lib/               # Utility functions and helpers
├── App.tsx            # Main app component with routing
├── main.tsx           # React app entry point
├── index.css          # Global styles and Tailwind imports
├── SignInForm.tsx     # Authentication component
└── SignOutButton.tsx  # Authentication component
```

## Backend Structure (`convex/`)
```
convex/
├── _generated/        # Auto-generated Convex files
├── schema.ts          # Database schema definitions
├── auth.ts           # Authentication functions
├── auth.config.ts    # Auth configuration
├── notes.ts          # Note CRUD operations
├── recordings.ts     # Audio recording functions
├── folders.ts        # Folder management
├── ai.ts             # OpenAI integration
├── storage.ts        # File storage utilities
├── http.ts           # HTTP endpoints
└── router.ts         # Custom HTTP routes
```

## Component Organization
- Components are organized flat in `src/components/`
- Each component handles a specific UI concern
- Main app logic in `TalkfloApp.tsx`
- Modal components for detailed views
- Reusable UI components for common patterns

## Path Aliases
- `@/` maps to `./src/` for cleaner imports
- Use `@/components/` for component imports
- Use `@/lib/` for utility imports

## Styling Conventions
- Tailwind CSS with custom theme in `tailwind.config.js`
- Custom colors: `primary` (#FF4500), `primary-hover`, `secondary`
- Custom spacing and border radius utilities
- Component-scoped styling with Tailwind classes