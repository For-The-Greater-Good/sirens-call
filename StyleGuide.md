# Pirate Radio Visual Styleguide

## Core Design Philosophy

This design system embodies "friendly anarchist" aesthetics—rebellious and countercultural like pirate radio, yet approachable and warm through playful characters and nostalgic charm. The style merges mid-century modern commercial illustration with underground zine culture, creating something that feels both polished and punk rock. Every design decision should reinforce this duality of professional craft and handmade authenticity.

## Visual Foundation

### Design Heritage
The aesthetic draws from 1950s-1960s commercial art, children's book illustrations, vintage screen printing, and block printing techniques. Think of it as the golden age of advertising illustration meeting DIY poster culture. The result should feel like a treasured vintage find that's been lovingly preserved but shows its age through subtle imperfections.

### Compositional Principles
- **Centered, symmetrical layouts** with badge-like or emblem formats
- **Flat, 2D quality** with no perspective or depth—everything exists on the same plane
- **Floating elements** arranged in organized clusters rather than realistic space
- **Decorative framing** using simple repeated elements like leaves or waves
- **Clear visual hierarchy** despite whimsical elements—playful but purposeful

## Color System

### Primary Palette
```css
:root {
  /* Foundation */
  --color-paper: #F4E4C1;      /* Warm aged cream, like vintage paper stock */
  --color-ink: #2D3436;        /* Soft black for outlines and primary text */
  
  /* Accent Colors */
  --color-rust: #D63031;       /* Primary red-orange, muted like terracotta */
  --color-rust-alt: #E17055;   /* Secondary rust for variations */
  --color-ocean: #00B894;      /* Teal-green, maritime inspired */
  --color-forest: #2D5F5F;     /* Deeper green for contrast */
  --color-gold: #FDCB6E;       /* Mustard yellow, never pure bright */
}
```

### Color Application Rules
Colors must appear slightly desaturated and weathered, as if sun-faded or aged through time. Never use pure, bright colors—always opt for muted variations that feel authentic to the printing era. Apply colors as flat fills without gradients, maintaining the screen-printing aesthetic. Consider adding slight registration errors between color layers, where colors intentionally misalign by 1-2 pixels to simulate authentic printing imperfections.

## Typography

### Type Characteristics
Typography should feel hand-drawn or heavily modified from standard fonts, with chunky, bold sans-serif letterforms that echo vintage poster design and letterpress printing. Letters need substantial weight and presence—think circus posters meeting protest signs. Maintain deliberately tight kerning for impact, and embrace slight irregularities in letterforms to prevent them from feeling too digital or perfect.

### Font Implementation
```css
@font-face {
  font-family: 'PosterChunk';
  src: url('/fonts/poster-chunk.woff2') format('woff2');
  font-weight: 900;
  font-style: normal;
  font-display: block; /* Load all at once like a poster unveiling */
}

.headline {
  font-family: 'PosterChunk', sans-serif;
  font-weight: 900;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  /* Add slight rotation variations for handmade feel */
  transform: rotate(-0.5deg);
}
```

## Illustration Style

### Character Design
Reduce everything to basic geometric shapes with anthropomorphic features. Characters should have dot eyes, simple curved smiles, and minimal detail while maintaining maximum personality. Apply bold, confident black outlines of varying weights (2-4px) with flat color fills and no gradients. Edge quality should suggest woodcut or linocut printing, with slight roughness that prevents perfect smoothness.

### Recurring Visual Motifs
- **Maritime Elements**: Anchors, ships, water waves, buoys, nautical flags
- **Radio/Broadcasting**: Transmission towers with geometric construction, radio dials, antennae, sound waves
- **Pirate Iconography**: Skull and crossbones, eye patches, bandanas, treasure chests
- **Commerce Symbols**: Coins, money bags, dollar signs (commenting on capitalism)
- **Food Items**: Canned goods, produce, pantry staples (grounding the rebellion in everyday life)

## Texture and Surface Effects

### Paper Texture Implementation
Every surface should have subtle grain that mimics screen printing on textured paper. This creates the tactile quality essential to the aesthetic.

```css
.textured-surface {
  background-image: 
    /* Halftone pattern overlay */
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      rgba(244, 228, 193, 0.03) 2px,
      rgba(244, 228, 193, 0.03) 4px
    ),
    /* Paper grain gradient */
    radial-gradient(
      circle at 50% 50%,
      var(--color-paper) 0%,
      #F0DCC0 100%
    );
  
  /* Subtle noise filter for authentic grain */
  filter: url('#paper-grain');
}
```

### Print Registration Effects
Simulate the slight misalignments that occur in manual printing processes:

```css
.print-layer {
  /* Each color layer slightly offset */
  --registration-offset: 0.5px;
  transform: translate(
    calc(var(--registration-offset) * var(--offset-x, 1)),
    calc(var(--registration-offset) * var(--offset-y, 1))
  );
}
```

## Astro Implementation Strategy

### Component Architecture
Structure components as reusable "printing blocks" that mirror the vintage printmaking process. Each component represents a stamp or plate that can be applied to pages.

```astro
---
// src/components/VintageBadge.astro
export interface Props {
  variant: 'buoy' | 'pirate' | 'radio';
  message: string;
  size?: 'small' | 'medium' | 'large';
  worn?: boolean; // Add extra weathering
}

const { variant, message, size = 'medium', worn = false } = Astro.props;
const randomOffset = Math.random() * 0.5 - 0.25; // Slight rotation variety
---

<div class="badge" data-variant={variant} data-worn={worn} style={`--rotation: ${randomOffset}deg`}>
  <slot />
</div>
```

### Layout Strategy
Think of layouts as different plates in a printing press, layered to create the final result:

```astro
---
// src/layouts/BaseLayout.astro
// This is your "paper" layer
---
<html>
  <body class="paper-texture">
    <!-- First plate: background texture -->
    <div class="print-plate-1">
      <!-- Second plate: main content -->
      <main class="print-plate-2">
        <slot />
      </main>
    </div>
  </body>
</html>
```

### Progressive Enhancement Philosophy
Static by default, interactive only when necessary. Use Astro's partial hydration strategically—most elements should feel like printed posters, with interactivity added surgically for radio dials or navigation elements.

```astro
<!-- Only hydrate interactive elements when visible -->
<RadioTuner client:visible />

<!-- Static elements need no JavaScript -->
<VintageBadge variant="pirate" message="FOR THE GREATER GOOD" />
```

### Build-Time Variations
Generate subtle differences during build to create unique "prints":

```javascript
// astro.config.mjs
export default defineConfig({
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            $print-variation: ${Math.random()};
            $ink-density: #{90 + Math.random() * 10}%;
          `
        }
      }
    }
  }
});
```

## Animation Guidelines

### When to Animate
Animation should be minimal and purposeful, enhancing the pirate radio theme without destroying the printed poster illusion. Reserve movement for radio-specific elements like transmission waves, dial tuning, or ship bobbing on waves. Most elements should remain static, like a poster on a wall.

### Animation Character
```css
.radio-wave {
  animation: transmit 2s ease-in-out infinite;
  animation-delay: calc(var(--wave-index) * 0.2s);
}

@keyframes transmit {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}
```

## Interactive Elements

### Hover States
Hover effects should feel mechanical and tactile, like pressing a button on an old radio:

```css
.interactive-element:hover {
  /* Slight depression effect */
  transform: translateY(2px);
  box-shadow: 
    inset 0 2px 4px rgba(45, 52, 54, 0.2),
    0 1px 0 var(--color-paper);
  
  /* Color shift simulating wear */
  filter: brightness(0.95);
}
```

### Focus States
Maintain accessibility while preserving aesthetic:

```css
.interactive-element:focus-visible {
  outline: 3px dashed var(--color-rust);
  outline-offset: 4px;
  /* No smooth transitions—instant like a stamp */
  transition: none;
}
```

## Responsive Design Approach

### Breakpoint Philosophy
Design mobile-first, treating small screens like handheld flyers and larger screens like full posters. Maintain the centered, badge-like composition across all sizes rather than reflowing into different layouts.

```css
.badge-container {
  width: min(100%, 40rem);
  margin-inline: auto;
  
  /* Scale entire compositions rather than reflow */
  @media (max-width: 640px) {
    transform: scale(0.85);
  }
}
```

## Accessibility Considerations

### Contrast Requirements
While maintaining the vintage aesthetic, ensure WCAG AA compliance. The muted colors work well for this—the weathered look actually improves readability by reducing harsh contrasts that can cause eye strain.

### Screen Reader Support
Use semantic HTML that mirrors the visual hierarchy. The clear, poster-like organization translates well to linear reading order. Provide alternative text that captures both the content and the playful character of illustrations.

## Performance Optimization

### Asset Strategy
- Store texture files in `/public/textures/` for consistent access
- Use WebP for photographic textures with PNG fallbacks
- Inline small SVG illustrations directly in components
- Lazy-load decorative elements below the fold

### CSS Architecture
```css
/* Critical styles for immediate paint */
.critical-styles {
  background-color: var(--color-paper);
  color: var(--color-ink);
  font-family: sans-serif; /* Fallback before custom font loads */
}

/* Enhancement styles can load async */
.enhanced-styles {
  background-image: url('/textures/paper-grain.webp');
  font-family: 'PosterChunk', sans-serif;
}
```

## Content Guidelines

### Voice and Tone
Write copy that embeds the pirate radio spirit—slightly subversive but ultimately positive. Use maritime and radio metaphors naturally throughout the content. Keep language accessible and informal, avoiding corporate speak. Embrace wordplay and puns when appropriate to the playful aesthetic.

### Microcopy Examples
- **Navigation**: "Tune In" instead of "Learn More"
- **Errors**: "Signal Lost" instead of "404 Error"
- **Loading**: "Adjusting Frequency..." instead of "Loading..."
- **CTAs**: "Broadcast Your Message" instead of "Contact Us"

## Quality Checklist

Before considering any component complete, verify these essential qualities:

- [ ] Colors appear weathered and muted, never pure or bright
- [ ] Edges have subtle roughness suggesting hand-printing
- [ ] Text has slight irregularities preventing digital perfection
- [ ] Composition centers around a badge-like focal point
- [ ] Paper texture visible but not overwhelming
- [ ] Any animation enhances rather than dominates
- [ ] Component works without JavaScript
- [ ] Accessible contrast ratios maintained
- [ ] Loading performance remains instant
- [ ] The result feels both professional and handmade

## Implementation Priority

1. **Foundation**: Establish color system, typography, and base textures
2. **Components**: Build reusable badges, stamps, and emblem structures
3. **Layouts**: Create print-plate inspired page templates
4. **Enhancements**: Add selective interactivity and animation
5. **Polish**: Apply registration errors, wear effects, and final weathering

Remember that this aesthetic succeeds through restraint and intentionality. Every imperfection should feel purposeful, every roughness deliberate. The goal isn't to create something that looks old, but something that feels authentic—as if it has a story to tell about broadcasting truth from international waters, one transmission at a time.