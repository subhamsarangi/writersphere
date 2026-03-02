# Article Editor Components

This directory contains the refactored Article Editor components, broken down from the original monolithic `ArticleEditor.tsx` file.

## Structure

### Core Components

- **ArticleEditorHeader.tsx** - Top bar with title input, save status, preview/theme toggles, status dropdown, and save button
- **ArticleMetadata.tsx** - Category, subcategory, and tags input section
- **ArticleContentEditor.tsx** - Markdown editor with preview mode
- **ArticleDangerZone.tsx** - Delete article section

### UI Components

- **Toast.tsx** - Success/error toast notifications
- **ConfirmModal.tsx** - Confirmation dialog for status changes
- **CelebrateBurst.tsx** - Visual celebration effect for publish/archive actions

### Utilities

- **types.ts** - TypeScript type definitions
- **utils.ts** - Utility functions (status helpers, formatting, audio effects)
- **useLocalTheme.ts** - Custom hook for theme management

### Main Component

- **ArticleEditor2.tsx** - Main orchestrator component that uses all the above

## Usage

The new refactored component can be used as a drop-in replacement:

```tsx
import ArticleEditor from "@/components/ArticleEditor2";

<ArticleEditor articleId={id} />
```

## Benefits of Refactoring

1. **Maintainability** - Each component has a single responsibility
2. **Testability** - Smaller components are easier to test in isolation
3. **Reusability** - Components can be reused in other contexts
4. **Readability** - Easier to understand and navigate the codebase
5. **Performance** - Potential for better memoization and optimization

## Migration

To migrate from the old ArticleEditor:

1. Update imports to use `ArticleEditor2`
2. Test thoroughly to ensure all functionality works
3. Once verified, rename `ArticleEditor2.tsx` to `ArticleEditor.tsx`
4. Delete the old `ArticleEditor.tsx` file

## Component Responsibilities

### ArticleEditorHeader
- Title input with auto-focus for drafts
- Save status display (saved/unsaved/autosaved)
- Timestamp display (created, updated, published, etc.)
- Preview/Edit toggle button
- Dark/Light theme toggle
- Status dropdown (draft/published/unpublished/archived)
- Manual save button

### ArticleMetadata
- Category selection (required for publishing)
- Subcategory selection (optional, depends on category)
- Tags input with minimum 2 tags requirement
- Tag count display

### ArticleContentEditor
- Markdown editor (edit mode)
- Markdown preview (preview mode)
- Auto-height adjustment

### ArticleDangerZone
- Delete article button
- Warning messages about permanent deletion
- Disabled state during save/delete operations
