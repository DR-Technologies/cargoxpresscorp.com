---
name: Precision CMS
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#58579b'
  on-secondary: '#ffffff'
  secondary-container: '#b6b4ff'
  on-secondary-container: '#454386'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#140f54'
  on-secondary-fixed-variant: '#413f82'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  code:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 20px
  sidebar-width: 240px
---

## Brand & Style

This design system is built for power users who value speed, clarity, and deep focus. The aesthetic is a fusion of the utilitarian structure of Notion, the high-performance density of Linear, and the refined technical polish of Vercel.

The design style is **Minimalist-Professional**. It leverages vast whitespace and precise alignment to reduce cognitive load. Interaction is signaled through subtle shifts in background color and razor-sharp strokes rather than heavy shadows or vibrant gradients. The emotional response should be one of "calm control"—a quiet, reliable tool that stays out of the way of the content it manages.

## Colors

The palette is intentionally restrained to keep the focus on user content. 
- **Primary:** Electric Indigo (#4F46E5) is used sparingly for primary actions, active states, and focus indicators.
- **Neutrals:** A range of Slate and Gray tones define the hierarchy. Deep Slates (#0F172A) ensure high-contrast legibility for body text.
- **Borders:** A universal subtle border (#E2E8F0) is the primary tool for structural separation.
- **Accents:** Success, Warning, and Error states should use desaturated versions of green, amber, and red to maintain the professional "Linear-esque" sobriety.

## Typography

This design system utilizes **Inter** for its exceptional legibility at small sizes and its neutral, systematic feel. 

- **Scale:** The scale is compact. 14px is the standard body size to allow for data-dense layouts.
- **Hierarchy:** Weight is used more frequently than size to distinguish hierarchy. 
- **Tracking:** Headings use slight negative letter-spacing for a tighter, more "engineered" appearance. Labels and metadata use 12px Medium with increased tracking to ensure readability at the smallest scale.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains a fixed 240px (collapsible to an icon bar), while the main content area utilizes a fluid grid with a maximum readable width of 1200px for document editing.

- **Rhythm:** A strict 4px baseline grid ensures vertical consistency.
- **Density:** High density is preferred. Internal component padding should favor `8px` and `12px` to maximize information density without feeling cramped.
- **Margins:** Main viewports use a 24px gutter to provide breathing room against the sidebar and edges.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Low-Contrast Outlines** rather than traditional shadows.

- **The Base:** The background is white (#FFFFFF). 
- **Surfaces:** Secondary areas like sidebars and empty states use a subtle gray wash (#F8FAFC).
- **Elevated States:** Modals and dropdowns use a single, ultra-soft shadow (0px 4px 12px rgba(0,0,0,0.05)) and a crisp 1px border.
- **Interactive Depth:** Hover states are indicated by a shift to a slightly darker background (e.g., White to #F1F5F9) or a change in border color to the primary accent.

## Shapes

The shape language is "Soft" and precise.
- **Components:** Buttons, inputs, and small cards use a 0.25rem (4px) corner radius. This maintains a technical, professional feel.
- **Containers:** Larger panels or modals use 0.5rem (8px) for a slightly softer approach.
- **Icons:** Use 1.5px or 2px stroke widths with slightly rounded caps to match the typography's geometry.

## Components

- **Buttons:** Primary buttons are solid Indigo with white text. Secondary buttons use a white background with a subtle #E2E8F0 border. No gradients.
- **Input Fields:** Minimalist design with a 1px border. On focus, the border changes to Indigo with a 2px soft glow (shadow-sm). Placeholder text is #94A3B8.
- **Cards:** Used sparingly. They feature a 1px border (#E2E8F0) and no shadow. The header and body are separated by a subtle horizontal rule.
- **Accordions:** Clean, border-bottom only separation. Use a chevron-right that rotates 90 degrees. No background fills on header click.
- **Chips/Badges:** Small, 12px Medium type, with a very desaturated background (e.g., Primary 5% opacity) and no border.
- **Navigation:** The sidebar uses "Ghost" active states—a subtle gray background fill for the active item and a 2px indigo vertical line on the leftmost edge.