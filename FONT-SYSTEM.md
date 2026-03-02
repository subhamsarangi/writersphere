# Font System

## Overview
Writersphere uses a thoughtful font system designed to enhance the reading and writing experience for different types of content.

## Font Choices

### 1. Merriweather (Default for All Writing)
**Font:** Merriweather (Google Fonts - Free & Open Source)  
**Usage:** All article content, editor, and published articles  
**Why Merriweather?**
- Designed specifically for screen reading
- Excellent readability for long-form content
- Beautiful serif font that feels professional and literary
- Open source and free to use
- Works perfectly for essays, articles, and general writing

**Characteristics:**
- Line height: 1.75 (comfortable reading)
- Letter spacing: 0.002em (subtle spacing)
- Serif style with elegant proportions
- Multiple weights available (300, 400, 700)

### 2. Avenir-Style Font (Poetry Tag)
**Font:** System font stack (Avenir-like)  
**Usage:** Articles tagged with "poetry"  
**Fallback Chain:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`

**Why System Fonts for Poetry?**
- Clean, modern sans-serif aesthetic
- Better for short-form, line-based content
- Wider letter spacing for poetic rhythm
- Automatically uses the best font available on each device

**Characteristics:**
- Line height: 1.8 (extra breathing room for poetry)
- Letter spacing: 0.01em (more spacious)
- Sans-serif style for contemporary feel

## Implementation

### Google Fonts Integration
Merriweather is loaded via Google Fonts in `src/app/layout.tsx`:
```html
<link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet" />
```

### CSS Classes
- `.prose` - Applied to all article content, uses Merriweather
- `.poetry-content` - Applied when "poetry" tag is detected, overrides with system fonts
- `.wmde-markdown` - Markdown editor content styling

### Where Fonts Apply

#### Editor View
- **Title input:** System UI font (clean, functional)
- **Markdown editor:** Merriweather (default) or Avenir-style (with poetry tag)
- **Preview mode:** Same as published view

#### Published Article View
- **Title:** System UI font (bold, clear)
- **Metadata:** System UI font (small, functional)
- **Content:** Merriweather (default) or Avenir-style (with poetry tag)

## Font Loading Strategy

### Performance
- `rel="preconnect"` for Google Fonts domains (faster loading)
- `font-display: swap` (text visible immediately, font swaps in when loaded)
- Only loads weights actually used (300, 400, 700)

### Fallbacks
Both font systems have robust fallback chains:
- **Merriweather:** Falls back to Georgia, then generic serif
- **Poetry fonts:** Falls back through system fonts to Arial

## Customization

### Changing the Default Font
To use a different font for general writing, update:
1. `src/app/layout.tsx` - Change Google Fonts link
2. `src/app/globals.css` - Update `.prose` font-family

### Changing the Poetry Font
To use actual Avenir font files:
1. Add font files to `public/fonts/`
2. Update `public/fonts/avenir.css` with correct paths
3. Import in `src/app/layout.tsx`

### Adding More Tag-Based Fonts
Follow the poetry pattern:
1. Detect tag in `ArticleContentEditor.tsx`
2. Apply conditional class
3. Add CSS rules in `globals.css`

## Typography Scale

### Merriweather Weights Used
- **300 (Light):** Blockquotes, subtle emphasis
- **400 (Regular):** Body text, paragraphs
- **700 (Bold):** Headings, strong emphasis

### Line Heights
- **Body text:** 1.75 (comfortable reading)
- **Poetry:** 1.8 (extra space for line breaks)
- **Headings:** 1.3 (tighter, more impactful)

## Browser Support
- Modern browsers: Full support with web fonts
- Older browsers: Graceful degradation to system fonts
- No JavaScript required: Pure CSS implementation
