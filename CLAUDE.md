# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Sirens Call is the public-facing website for the For The Greater Good (FTGG) organization. It's an Astro-based static site with a vintage pirate/maritime theme, providing information about the food security data aggregation mission and showcasing the HAARRRvest interactive map.

## Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev                  # Runs on http://localhost:4321

# Build for production
npm run build               # Outputs to ./dist/

# Preview production build
npm run preview
```

### Docker Development
```bash
# Development with Docker Compose
docker compose up dev       # Starts dev server on port 4321

# Production with Docker Compose  
docker compose up prod      # Starts Nginx server on port 8080

# Build production Docker image
docker build -t sirens-call .
```

## Project Structure

### Key Directories
- `src/pages/` - Astro page components (routes)
- `src/components/` - Reusable UI components
  - `vintage/` - Vintage-themed components (badges, print blocks, etc.)
- `src/layouts/` - Page layout templates
- `src/styles/` - Global CSS and vintage design system
- `public/` - Static assets served directly
- `dist/` - Production build output (git-ignored)

### Technology Stack
- **Framework**: Astro (static site generator)
- **Styling**: Tailwind CSS v4 + Custom vintage CSS design system
- **Deployment**: Docker + Nginx for production
- **Node Version**: 20 (Alpine in Docker)

## Architecture

### Component Architecture
The site uses Astro components (`.astro` files) with a vintage/maritime theme system:

1. **BaseLayout** - Main layout wrapper with navigation and footer
2. **Vintage Components** - Themed UI elements:
   - `VintageBadge` - Decorative badges with icons
   - `PrintBlock` - Newspaper-style content blocks
   - `RadioDialNav` - Radio dial-themed navigation
   - `MapEmbed` - HAARRRvest map integration

### Styling System
- Global styles in `src/styles/global.css` (imports Tailwind and vintage.css)
- Vintage design tokens for colors, typography, spacing
- Component-scoped styles within `.astro` files
- Print-inspired effects and textures

### Pages
- `/` - Homepage with mission, stats, map, and technology overview
- `/about` - Organization background and principles
- `/technology` - Technical architecture details

## Development Patterns

### Adding New Pages
1. Create `.astro` file in `src/pages/`
2. Use `BaseLayout` for consistent structure
3. Import and use vintage components for theming
4. Follow existing component style patterns

### Component Guidelines
- Keep vintage/maritime theme consistent
- Use design tokens from vintage.css
- Prefer Astro components over framework components
- Add component-scoped styles within `<style>` tags

### Static Assets
- Place images in `public/images/`
- Reference as `/images/filename.ext` in components
- Favicon and logos already configured

## Deployment

### Local Production Build
```bash
npm run build
npm run preview
```

### Docker Production
```bash
docker compose up prod
```

The Nginx configuration (`nginx.conf`) handles:
- Static file serving with caching
- Security headers
- Gzip compression
- SPA routing fallback

## Integration Points

### HAARRRvest Map
The `MapEmbed` component integrates the food location map from the HAARRRvest project via iframe embedding.

### External Links
- GitHub organization: https://github.com/For-The-Greater-Good
- Related projects linked in navigation

## Important Notes

1. **Pure Static Site** - No server-side rendering or API routes
2. **Vintage Theme** - Maintain pirate/maritime/newspaper aesthetic
3. **Mobile Responsive** - All components must work on mobile
4. **Public Domain** - All code released without restrictions
5. **No Analytics** - No tracking or personal data collection