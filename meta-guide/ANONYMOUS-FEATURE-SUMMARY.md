# Anonymous Publishing Feature - Complete Summary

## Overview
This feature allows users to publish articles without revealing their identity. Users can later reveal their identity by changing the status from "anonymous" to "published".

## What Was Changed

### 1. Frontend Changes (✅ Complete)

#### Type Definitions
- **File**: `src/components/article-editor/types.ts`
- Added "anonymous" to the `ArticleStatus` type

#### Utility Functions
- **File**: `src/components/article-editor/utils.ts`
- Added "anonymous" status label
- Updated metadata requirements to include anonymous status
- Added status transition messages for:
  - Publishing anonymously
  - Revealing identity (anonymous → published)
  - Archiving anonymous articles
  - Making anonymous articles private

#### UI Components
- **File**: `src/components/article-editor/ArticleEditorHeader.tsx`
- Added anonymous option to status dropdown
- Used purple color scheme with user/mask icon
- Added `anonymousAt` prop and timestamp display
- Shows "Anonymous: [timestamp]" in article metadata

#### Main Editor
- **File**: `src/components/ArticleEditor.tsx`
- Added `anonymousAt` state management
- Updated database queries to include `anonymous_at` field
- Updated save logic to handle anonymous status
- Updated metadata validation to include anonymous status

### 2. Database Changes (⚠️ Needs to be Applied)

#### Migration File
- **File**: `meta-guide/migration-add-anonymous-status.sql`
- Adds `anonymous_at` column to articles table
- Updates status constraint to include "anonymous"
- Updates trigger to enforce 2+ tags for anonymous articles
- Creates/updates RPC functions for public article display

#### Key Database Functions Updated
1. **`get_published_article_with_author(uuid)`**
   - Returns single article with conditional author display
   - Shows "Anonymous" for anonymous articles
   - Shows actual author for published articles

2. **`get_feed_articles(limit, offset)`**
   - Returns paginated feed of public articles
   - Includes both published and anonymous articles
   - Handles author name display based on status

### 3. Public Pages (✅ Already Compatible)

#### Feed Page
- **File**: `src/app/feed/page.tsx`
- Uses `get_published_articles_feed` RPC function
- Will automatically show anonymous articles once DB is updated
- Author name will display as "Anonymous" for anonymous articles

#### Article View Page
- **File**: `src/app/articles/[id]/page.tsx`
- Uses `get_published_article_with_author` RPC function
- Will automatically handle anonymous articles once DB is updated
- Shows "By Anonymous" for anonymous articles

## How to Complete the Setup

### Step 1: Apply Database Migration
Run the SQL migration in your Supabase dashboard:
```bash
# See: meta-guide/ANONYMOUS-STATUS-MIGRATION.md for detailed instructions
```

### Step 2: Test the Feature
1. Create or edit an article
2. Add category and at least 2 tags
3. Select "Anonymous" from the status dropdown
4. Confirm the action
5. Verify the article appears in the feed as "Anonymous"
6. Change status to "Published" to reveal identity

## User Flow

### Publishing Anonymously
1. User writes an article
2. User adds required metadata (category + 2 tags)
3. User selects "Anonymous" from status dropdown
4. Confirmation modal explains:
   - Article will be public but identity hidden
   - Can reveal identity later by changing to Published
5. User confirms
6. Article is published anonymously
7. Toast notification: "Published anonymously ✨"

### Revealing Identity
1. User opens their anonymous article
2. User selects "Published" from status dropdown
3. Confirmation modal explains:
   - Article will now show their name as author
4. User confirms
5. Status changes to published
6. Toast notification: "Identity revealed"

## Visual Design

### Status Indicator
- **Color**: Purple (text-purple-400)
- **Icon**: User icon with mask effect
- **Label**: "Anonymous"

### Status Dropdown Order
1. Draft (blue)
2. Published (green)
3. **Anonymous (purple)** ← New
4. Unpublished (yellow)
5. Archived (gray)

## Database Schema

### Articles Table - New Column
```sql
anonymous_at timestamptz NULL
```

### Status Values
```sql
CHECK (status IN ('draft', 'published', 'anonymous', 'unpublished', 'archived', 'deleted'))
```

### Trigger Logic
- Enforces minimum 2 tags for: published, anonymous, unpublished, archived
- Same validation as published articles

## Security & Privacy

### What's Hidden
- Author name in public feed
- Author name in article view
- Author profile link (if implemented)

### What's NOT Hidden
- Article content
- Tags and categories
- Publish timestamp
- Article ID

### Database Level
- Writer ID is still stored in the database
- Writers can see their own anonymous articles in dashboard
- RLS policies remain unchanged
- Only public display functions hide the author

## Testing Checklist

- [ ] Apply database migration
- [ ] Create new article and publish anonymously
- [ ] Verify article appears in feed as "Anonymous"
- [ ] Verify article view shows "By Anonymous"
- [ ] Change anonymous article to published
- [ ] Verify author name now appears
- [ ] Test with less than 2 tags (should fail)
- [ ] Test without category (should fail)
- [ ] Verify timestamps are recorded correctly

## Files Modified

### Frontend (8 files)
1. `src/components/article-editor/types.ts`
2. `src/components/article-editor/utils.ts`
3. `src/components/article-editor/ArticleEditorHeader.tsx`
4. `src/components/ArticleEditor.tsx`

### Documentation (3 files)
5. `meta-guide/migration-add-anonymous-status.sql` (new)
6. `meta-guide/ANONYMOUS-STATUS-MIGRATION.md` (new)
7. `meta-guide/ANONYMOUS-FEATURE-SUMMARY.md` (new - this file)

### Database (needs manual application)
- Run migration SQL in Supabase dashboard

## Notes

- Anonymous articles count toward the same feed as published articles
- Search functionality works the same for anonymous articles
- Tags and categories are still visible on anonymous articles
- Writers can edit their anonymous articles normally
- Changing from anonymous to published is intentionally easy (one click)
- No option to go back from published to anonymous (prevents abuse)

## Future Enhancements (Optional)

- Add analytics to track anonymous vs published article views
- Add option to schedule identity reveal
- Add "Anonymous" badge on article cards in feed
- Add filter to show only anonymous or only published articles
- Add notification when someone views your anonymous article
