# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

**Linting and formatting:**
```bash
npm run lint      # ESLint with auto-fix
npm run format    # Prettier formatting
```

## Architecture Overview

This is a Vue 3 fantasy sports application built with Vite, featuring:

### Core Stack
- **Vue 3** with Composition API
- **Vite** for build tooling and development
- **Vue Router** for client-side routing
- **Pinia** for state management with persistence
- **TypeScript** (partial) - mixed JS/TS codebase

### UI Frameworks
The application uses multiple UI frameworks:
- **Ant Design Vue** (primary UI components)
- **PrimeVue** (additional components)
- **Bootstrap** and **Bootstrap Vue 3**
- **Inkline** for additional UI components

### State Management
- **Pinia stores** with persistence via `pinia-plugin-persist`
- Key stores: `leaguesStore`, `userStore`, `themeStore`, `cacheStore`
- All stores use localStorage for persistence

### Data Visualization
- **D3.js** for custom charts and visualizations
- **Chart.js** with annotation plugin
- **@antv/g2plot** for additional charting

### Key Architectural Patterns
- **Component-based architecture** - All pages are Vue components in `/components`
- **Route-based navigation** with complex URL patterns containing multiple parameters
- **Theme system** with dark/light mode support and system preference detection
- **API integration** via Axios with environment-based URLs (`VITE_API_URL`)

### File Structure Conventions
- Components serve as both views and reusable components
- Stores follow domain-based organization (leagues, user, theme, cache)
- Utils contain shared helper functions
- Assets organized by type (logos, site screenshots, icons)

### Environment & Deployment
- **Netlify** deployment with SPA redirect configuration
- Environment variables prefixed with `VITE_`
- Google Analytics integration via `vue-gtag`

### Development Notes
- Uses `@` alias for src directory imports
- Mixed component structure (some in `/components`, some in `/views`)
- Router uses lazy loading for all routes
- Theme state persists across sessions and respects system preferences