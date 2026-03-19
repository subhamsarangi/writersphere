# Implementation Plan: Landing Page Redesign

## Overview

Refactor `src/app/page.tsx` by extracting the landing view into focused section components under `src/components/landing/`, then add the Pain, Social Proof, and Final CTA sections. The auth form and all Supabase state remain untouched in `page.tsx`.

## Tasks

- [x] 1. Create the landing component directory and section component files
  - Create `src/components/landing/` directory with empty placeholder files for: `LandingView.tsx`, `HeroSection.tsx`, `PainSection.tsx`, `FeatureSection.tsx`, `SocialProofSection.tsx`, `FinalCTASection.tsx`
  - Define and export the TypeScript interfaces for each component's props (`LandingViewProps`, `HeroSectionProps`, `FinalCTASectionProps`)
  - _Requirements: 7.4 (Merriweather font), 7.2 (dark slate palette)_

- [x] 2. Implement HeroSection component
  - [x] 2.1 Build `HeroSection.tsx` with platform name, tagline, secondary copy, and two CTA buttons
    - Platform name "Writersphere" in Merriweather, 5xl–7xl, color `#D4C5B0`
    - Tagline "A sanctuary for writers who think too much" in Merriweather italic, slate-300
    - Secondary copy line addressing a core writer struggle in amber-300/90
    - "Start Writing Free" button calling `onGetStarted` prop (opens auth in sign-up mode)
    - "Explore Writing" `<Link>` to `/feed`
    - Wrap in `card-dashboard-main`, apply `animate-fade-in-up` on headline and `animation-delay-100` on CTAs
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 7.3, 7.4, 7.6_

  - [ ]* 2.2 Write unit tests for HeroSection
    - Verify "Writersphere" heading renders
    - Verify "Start Writing Free" button calls `onGetStarted`
    - Verify "Explore Writing" link points to `/feed`
    - _Requirements: 1.5, 1.6, 1.7_

- [x] 3. Implement PainSection component
  - [x] 3.1 Build `PainSection.tsx` with 4 struggle cards and a pivot statement
    - Section heading "You know the feeling." in Merriweather
    - 4 struggle cards in a 2-col grid (md+), 1-col on mobile: blank page syndrome, perfectionism, fear of judgment, overthinking
    - Each card: icon + empathetic short phrase, muted styling (slate-400 text, subtle border)
    - Pivot line "Writersphere was built for exactly this." in amber-300, centered
    - Apply `animate-fade-in-up` with staggered `animation-delay-*` classes
    - Minimum 16px font size for body copy
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.2 Write unit tests for PainSection
    - Verify all 4 struggle labels render
    - Verify pivot statement renders
    - _Requirements: 2.1, 2.3_

- [x] 4. Implement FeatureSection component
  - [x] 4.1 Build `FeatureSection.tsx` extracting the 3 existing organic SVG feature cards from `page.tsx`
    - Move the 3 existing cards (Exploration Over Performance, Structure for Overthinkers, Reflection Through Writing) into this component
    - Use existing `card-feature` CSS class with nth-child border-radius variants
    - 3-column grid at md+ breakpoint, single-column on mobile
    - Each card: icon circle, title in Merriweather (max 5 words), description (max 25 words)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 4.2 Write unit tests for FeatureSection
    - Verify all 3 feature card titles render
    - Verify grid layout classes are applied
    - _Requirements: 3.1, 3.7, 3.8_

- [x] 5. Implement SocialProofSection component
  - [x] 5.1 Build `SocialProofSection.tsx` with community signal and testimonial cards
    - Community signal headline: "Join thousands of writers finding their voice."
    - At least 2 placeholder testimonial cards (max 30 words per quote, with attribution)
    - Each card: italic Merriweather quote, quotation mark accent, attribution line
    - Use `card-feature` styling to distinguish from feature copy
    - Responsive grid: 1-col mobile, 2-col md+
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 5.2 Write unit tests for SocialProofSection
    - Verify community signal text renders
    - Verify at least 2 testimonial quotes render
    - _Requirements: 4.1, 4.4_

- [x] 6. Implement FinalCTASection component
  - [x] 6.1 Build `FinalCTASection.tsx` with motivating headline and CTA buttons
    - Headline "Your first word is waiting." in Merriweather
    - "Start Writing Free" button calling `onGetStarted` prop
    - "Explore first →" secondary link to `/feed`
    - Visually distinct background using `card-dashboard-main` treatment or subtle amber gradient border
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 6.2 Write unit tests for FinalCTASection
    - Verify headline renders
    - Verify "Start Writing Free" button calls `onGetStarted`
    - Verify "Explore first →" link points to `/feed`
    - _Requirements: 5.3, 5.4_

- [x] 7. Implement LandingView and wire all sections together
  - [x] 7.1 Build `LandingView.tsx` composing all 5 section components in order
    - Accept `onGetStarted: () => void` and `onSignIn: () => void` props
    - Render: `HeroSection` → `PainSection` → `FeatureSection` → `SocialProofSection` → `FinalCTASection`
    - Pass `onGetStarted` down to `HeroSection` and `FinalCTASection`
    - Apply `scroll-smooth` behavior for anchor navigation
    - _Requirements: 1.1, 7.1, 7.5_

  - [ ]* 7.2 Write unit tests for LandingView
    - Verify all 5 sections render
    - Verify `onGetStarted` is passed correctly to child sections
    - _Requirements: 1.1, 5.3_

- [x] 8. Refactor page.tsx to use LandingView
  - Replace the large inline landing JSX block in `HomePageContent` with `<LandingView onGetStarted={() => { setMode("sign_up"); setShowAuth(true); }} onSignIn={() => { setMode("sign_in"); setShowAuth(true); }} />`
  - Keep the auth form JSX block, `showAuth` toggle, Supabase session logic, and `?auth=true` query param handling completely unchanged
  - Verify the "Back" button in the auth form still sets `showAuth(false)` without a full page reload
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 8.1, 8.2, 8.3, 8.4_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Apply responsive layout and visual polish
  - [x] 10.1 Verify responsive breakpoints across all sections
    - Confirm 320px–1920px viewport range renders correctly
    - Confirm feature cards switch between 1-col and 3-col at 768px
    - Confirm pain cards switch between 1-col and 2-col at 768px
    - Confirm all body copy is at minimum 16px
    - _Requirements: 7.1, 3.7, 3.8, 2.5_

  - [x] 10.2 Verify font and animation application
    - Confirm Merriweather is applied to all headings and display text via `next/font/google`
    - Confirm `animate-fade-in-up` with staggered `animation-delay-*` classes are applied across sections
    - Confirm amber/warm accent colors are used for primary CTAs and emotional emphasis
    - _Requirements: 7.3, 7.4, 7.6_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The auth form JSX in `page.tsx` must not be modified — only the landing view block is replaced
- All new components are purely presentational (no data fetching, no Supabase calls)
- Existing CSS classes (`card-feature`, `card-dashboard-main`, `btn-primary`, `btn-chip`, `animate-fade-in-up`, `animation-delay-*`) should be reused as-is
