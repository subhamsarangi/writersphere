# Requirements Document

## Introduction

Writersphere is a writing platform targeting aspiring writers who struggle to start writing due to fear, perfectionism, overthinking, and blank-page syndrome. The landing page is the primary conversion surface — it must emotionally resonate with this audience, communicate the platform's value clearly, and motivate visitors to sign up or explore. The existing page has a basic hero, 3 feature cards, and an auth form toggle. This spec covers redesigning and enhancing that landing page to be modern, emotionally compelling, and conversion-focused, while preserving the existing auth flow and Next.js/Tailwind/dark-theme stack.

## Glossary

- **Landing_Page**: The unauthenticated view rendered at the root route (`/`) when no session is present
- **Hero_Section**: The primary above-the-fold area containing the headline, subheadline, and primary CTAs
- **Pain_Section**: A section that names and validates the specific struggles of the target audience (fear, perfectionism, blank-page syndrome, overthinking)
- **Feature_Section**: A section presenting the platform's core value propositions as distinct cards or blocks
- **Social_Proof_Section**: A section containing testimonials, quotes, or community signals that build trust
- **CTA**: Call-to-action — a button or link prompting the visitor to sign up or explore
- **Auth_Form**: The existing sign-in/sign-up form toggled by the "Get Started" CTA
- **Visitor**: An unauthenticated user viewing the Landing_Page
- **Writer**: A user who has signed up with the "writer" role
- **System**: The Writersphere Next.js frontend application

## Requirements

### Requirement 1: Hero Section

**User Story:** As a wannabe writer who struggles to start, I want to immediately feel understood and welcomed when I land on the page, so that I feel motivated to explore further rather than bouncing.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a Hero_Section as the first visible content above the fold on all screen sizes (mobile, tablet, desktop).
2. THE Hero_Section SHALL display the platform name "Writersphere" as the primary heading using the Merriweather serif font.
3. THE Hero_Section SHALL display the tagline "A sanctuary for writers who think too much" as a subheading beneath the platform name.
4. THE Hero_Section SHALL display a secondary line of copy that directly addresses a core writer struggle (e.g., blank page, perfectionism, or fear of starting).
5. THE Hero_Section SHALL display a primary CTA button labeled "Start Writing Free" that, when clicked, opens the Auth_Form in sign-up mode.
6. THE Hero_Section SHALL display a secondary CTA button labeled "Explore Writing" that links to the `/feed` route.
7. WHEN a Visitor clicks the primary CTA button, THE System SHALL display the Auth_Form with the sign-up tab pre-selected.
8. THE Hero_Section SHALL use the existing dark slate background (slate-950) with amber/warm accent colors for the headline or accent elements, consistent with the existing color palette.

---

### Requirement 2: Pain Section (Emotional Resonance)

**User Story:** As a wannabe writer paralyzed by self-doubt, I want the page to name my specific struggles, so that I feel seen and trust that this platform was built for me.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a Pain_Section below the Hero_Section that names at least 4 distinct writer struggles: blank page syndrome, perfectionism, fear of judgment, and overthinking.
2. THE Pain_Section SHALL present each struggle as a short, empathetic phrase or label (e.g., "The blank page stares back. You stare back. Nobody wins.").
3. THE Pain_Section SHALL include a transitional statement that pivots from the pain to the platform's solution (e.g., "Writersphere was built for exactly this.").
4. THE Pain_Section SHALL use visual styling (e.g., muted text, subtle icons, or typographic emphasis) that conveys empathy rather than alarm.
5. THE Pain_Section SHALL be readable on mobile screens with a minimum font size of 16px for body copy.

---

### Requirement 3: Feature Section

**User Story:** As a prospective user evaluating the platform, I want to understand what specific features help me write, so that I can decide whether to sign up.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a Feature_Section containing at least 3 feature cards below the Pain_Section.
2. EACH feature card SHALL display an icon, a short title (max 5 words), and a description (max 25 words).
3. THE Feature_Section SHALL include a card for the "no-pressure writing environment" value proposition.
4. THE Feature_Section SHALL include a card for the "organization and structure" value proposition (categories, tags).
5. THE Feature_Section SHALL include a card for the "writing analytics and reflection" value proposition.
6. THE Feature_Section SHALL use the existing `card-feature` CSS class and organic/rounded card shapes consistent with the current design.
7. WHEN the viewport width is 768px or greater, THE Feature_Section SHALL display feature cards in a 3-column grid layout.
8. WHEN the viewport width is less than 768px, THE Feature_Section SHALL display feature cards in a single-column stacked layout.

---

### Requirement 4: Social Proof / Trust Section

**User Story:** As a hesitant visitor unsure whether to sign up, I want to see that other writers like me have found value here, so that I feel safe enough to try.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a Social_Proof_Section containing at least 2 short testimonial quotes or writer personas.
2. EACH testimonial SHALL include a short quote (max 30 words) and an attributed writer persona name or description (e.g., "— A first-time blogger").
3. THE Social_Proof_Section SHALL use a visual treatment (e.g., quotation marks, italic text, or a distinct card style) that distinguishes testimonials from feature copy.
4. THE Social_Proof_Section SHALL include a community signal such as a member count or a phrase like "Join thousands of writers finding their voice."
5. IF real testimonial data is unavailable, THEN THE System SHALL display placeholder testimonials that authentically represent the target audience's struggles and outcomes.

---

### Requirement 5: Final CTA Section

**User Story:** As a Visitor who has scrolled through the page and feels convinced, I want a clear final invitation to join, so that I can take action without scrolling back to the top.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a final CTA section at the bottom of the content, above the footer.
2. THE final CTA section SHALL display a motivating headline (e.g., "Your first word is waiting.").
3. THE final CTA section SHALL display a primary CTA button labeled "Start Writing Free" that opens the Auth_Form in sign-up mode.
4. THE final CTA section SHALL display a secondary link labeled "Explore first →" that navigates to `/feed`.
5. THE final CTA section SHALL use a visually distinct background treatment (e.g., a subtle gradient or border) to signal it as a section boundary.

---

### Requirement 6: Auth Form Integration

**User Story:** As a Visitor ready to sign up, I want the sign-up form to appear inline on the same page without a full navigation, so that I don't lose context and can easily go back.

#### Acceptance Criteria

1. WHEN the Auth_Form is displayed, THE System SHALL preserve the existing sign-in/sign-up tab toggle behavior.
2. THE Auth_Form SHALL display a "Back" button that, when clicked, returns the Visitor to the Landing_Page view without a full page reload.
3. THE Auth_Form SHALL display the existing role selection (writer/reader) during sign-up.
4. WHEN a Visitor successfully signs up as a Writer, THE System SHALL redirect the Writer to `/dashboard`.
5. WHEN a Visitor successfully signs in, THE System SHALL redirect the user to the route appropriate for their role (`/dashboard` for writers, `/feed` for readers).
6. IF the URL contains the query parameter `auth=true`, THEN THE System SHALL display the Auth_Form automatically on page load.

---

### Requirement 7: Responsive Layout and Visual Design

**User Story:** As a Visitor on any device, I want the landing page to look polished and intentional, so that I trust the platform is well-crafted.

#### Acceptance Criteria

1. THE Landing_Page SHALL be fully responsive across viewport widths from 320px to 1920px.
2. THE Landing_Page SHALL use the existing dark slate color palette (slate-950 background, slate-50 text) as the base theme.
3. THE Landing_Page SHALL use amber/warm accent colors for primary CTAs and emotional emphasis elements.
4. THE Landing_Page SHALL use the Merriweather serif font (loaded via `next/font/google`) for headings and display text.
5. THE Landing_Page SHALL use smooth scroll behavior when navigating between sections via anchor links.
6. THE Landing_Page SHALL display section transitions using the existing `animate-fade-in-up` CSS animation class with staggered delays.
7. WHEN a Visitor loads the Landing_Page, THE System SHALL display the Hero_Section content within 100ms of the page becoming interactive (no layout shift from font loading).
8. THE Landing_Page SHALL maintain a minimum contrast ratio of 4.5:1 between text and background colors for all body copy.

---

### Requirement 8: Navigation and Footer

**User Story:** As a Visitor, I want consistent navigation and footer elements, so that I can orient myself and access key links without confusion.

#### Acceptance Criteria

1. THE Landing_Page SHALL display the existing Navbar component at the top of the page.
2. THE Landing_Page SHALL display the existing Footer component at the bottom of the page.
3. THE Navbar SHALL display the Writersphere brand name/logo linking to the root route.
4. WHEN a Visitor is unauthenticated, THE Navbar SHALL display a "Sign In" or "Get Started" link that opens the Auth_Form.
