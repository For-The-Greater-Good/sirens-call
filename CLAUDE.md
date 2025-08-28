# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Sirens Call contains two separate Astro-based websites for the For The Greater Good (FTGG) organization:
- **front-page**: Main pirate-themed public website (www.for-the-gg.org) with vintage maritime aesthetic
- **docs-site**: Technical documentation using Starlight (docs.for-the-gg.org)

## Commands

### Front Page Development
```bash
cd front-page
npm install
npm run dev                 # http://localhost:4321
npm run build               # Production build to ./dist/
npm run preview             # Preview production build
```

### Documentation Site Development
```bash
cd docs-site
npm install
npm run dev                 # http://localhost:4321
npm run build               # Production build to ./dist/
npm run preview             # Preview production build
```

### Docker Development
```bash
# Start both development servers with hot reload
docker compose --profile dev up
# front-page: http://localhost:4321
# docs-site: http://localhost:4322

# Production containers (nginx)
docker compose up front-page-prod docs-site-prod -d

# Full production with Cloudflare tunnel
export CLOUDFLARE_TUNNEL_TOKEN=your-token
docker compose up -d
```

## Project Structure

```
sirens-call/
├── front-page/             # Main website (pirate theme)
│   ├── src/
│   │   ├── pages/         # Route components with i18n support
│   │   ├── components/    # UI components including vintage/
│   │   ├── layouts/       # Page templates
│   │   ├── styles/        # global.css, vintage.css
│   │   └── i18n/          # Internationalization config
│   └── public/            # Static assets
├── docs-site/              # Documentation (Starlight)
│   ├── src/
│   │   ├── content/       # MDX documentation files
│   │   └── styles/        # docs.css customizations
│   └── public/            # Static assets
└── .docker/               # Shared Docker configs
    ├── Dockerfile         # Multi-stage build for both sites
    └── nginx.conf         # Production server config
```

### Technology Stack
- **Framework**: Astro 5.13+ (both sites)
- **Documentation**: Starlight (docs-site)
- **Styling**: Tailwind CSS v4 (front-page), custom vintage design system
- **i18n**: Multiple locales including pirate speak (front-page)
- **Deployment**: Docker + Nginx + Cloudflare Tunnels
- **Node Version**: 20 (Alpine in Docker)

## Architecture

### Front Page Components
The front-page uses vintage/maritime themed Astro components:
- **BaseLayout**: Main layout with Navigation and Footer
- **Vintage Components** (`src/components/vintage/`):
  - `VintageBadge`: Decorative badges with icons
  - `PrintBlock`: Newspaper-style content blocks
  - `RadioWave`: Animated transmission effects
- **Interactive Elements**:
  - `RadioDialNav`: Radio dial-themed navigation
  - `VibeSelector`: Theme/vibe switcher
  - `FrequencyTuner`: Interactive radio tuner
  - `MapEmbed`: HAARRRvest map integration
- **i18n Support**: LanguageSwitcher with pirate speak option

### Docs Site Components
Documentation uses Starlight with custom components:
- **Starlight Extensions** (`src/components/starlight/`):
  - Custom footer, hero, sidebar, search components
- **MDX Content** with collapsible sections plugin
- **Structured documentation** for API, scrapers, architecture

### Styling System
- **Front Page**: Vintage design system (see StyleGuide.md)
  - Custom CSS variables for weathered colors
  - Print-inspired typography and textures
  - Radio/maritime visual motifs
- **Docs Site**: Starlight theme with custom overrides

### Internationalization
Front-page supports multiple locales:
- `en`: English (default)
- `es`: Spanish
- `pirate`: Pirate speak
- `corp`: Corporate speak
- Routing: `[lang]` prefix for non-default locales

## Development Patterns

### Working with Front Page
- Follow vintage design principles from StyleGuide.md
- Maintain centered, badge-like compositions
- Use weathered colors and print effects
- Test all locales when adding content

### Working with Docs Site
- Write documentation in MDX format
- Place in appropriate `src/content/docs/` subdirectory
- Follow existing sidebar structure in astro.config.mjs
- Use collapsible sections for lengthy content

### Docker Build Process
The shared Dockerfile uses build args to determine which site to build:
```dockerfile
ARG APP_NAME=front-page  # or docs-site
```

## Testing
Currently no test framework configured. When adding tests:
- Consider Vitest for unit tests (Astro compatible)
- Playwright for E2E testing
- Maintain visual consistency with manual testing

## Important Notes

1. **Two Separate Sites** - front-page and docs-site are independent
2. **Vintage Theme** - Maintain pirate/maritime aesthetic on front-page
3. **Documentation Standards** - Keep docs technical and clear
4. **Mobile Responsive** - Test both sites on mobile
5. **Public Domain** - All code released without restrictions
6. **No Analytics** - No tracking or personal data collection
7. **Production Routing** - Cloudflare tunnels handle domain routing