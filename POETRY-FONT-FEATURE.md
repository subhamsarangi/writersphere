# Poetry Font Feature

## Overview
When an article has the "poetry" tag, the content automatically switches to use the Avenir font (or a similar system font fallback) for a more elegant reading experience.

## How It Works

### Client-Side Detection
- The feature detects if "poetry" tag is present in the article's tags (case-insensitive)
- No database changes required - all logic is handled on the client side
- Applies automatically in both the editor and the published article view

### Where It Applies

1. **Article Editor** (`src/components/ArticleEditor.tsx`)
   - When you add the "poetry" tag, the markdown editor and preview automatically switch to Avenir font
   - Works in both edit and preview modes

2. **Published Article Page** (`src/app/articles/[id]/page.tsx`)
   - Fetches article tags and applies the poetry font if the tag is present
   - Readers see the same elegant font as the author intended

## Implementation Details

### CSS Classes
- `.poetry-content` - Applied to the container when poetry tag is detected
- `.font-avenir` - Font family class with system font fallbacks

### Font Fallback Chain
Since Avenir is a commercial font, the implementation uses system fonts that closely match Avenir's aesthetic:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
```

### Files Modified
1. `src/app/globals.css` - Added poetry font styles
2. `src/components/article-editor/ArticleContentEditor.tsx` - Added tag detection and class application
3. `src/components/ArticleEditor.tsx` - Pass tags to content editor
4. `src/app/articles/[id]/page.tsx` - Fetch tags and apply poetry class
5. `public/fonts/avenir.css` - Font face declarations (placeholder for actual font files)

## Adding Actual Avenir Font Files

If you have licensed Avenir font files, add them to `public/fonts/`:
- `Avenir-Book.woff2` / `Avenir-Book.woff` (Regular weight)
- `Avenir-Medium.woff2` / `Avenir-Medium.woff` (Medium weight)
- `Avenir-Heavy.woff2` / `Avenir-Heavy.woff` (Bold weight)

The CSS is already configured to use these files if they exist.

## Usage

1. Create or edit an article
2. Add the tag "poetry" (case doesn't matter: "Poetry", "POETRY", "poetry" all work)
3. The font automatically changes to Avenir/system font
4. Remove the "poetry" tag to revert to the default font

## Styling Details

The poetry font includes:
- Slightly increased letter-spacing (0.01em) for better readability
- Increased line-height (1.8) for poetry formatting
- Applied to all markdown elements within the content area
