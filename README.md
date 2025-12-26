**Project: Writersphere (Writing Management Website)**


Here are the  **Features**  i wanted:

- User authentication (sign up/login using email pass or google) as writers or reader only

- Create/list/search/edit/delete category/subcategory [name, desc, img, status] are specific to a writer account

- Create/list/search/edit/delete tags [name, status] which are are specific to a writer account

- Create/list/search/edit/edit-status/delete  posts (POST types: article, prose, essay, others) for writer users. NB: A post can be created as draft without tags or subcategory but before publishing it must be linked to one at subcategory least.

- Markdown editor with option to insert images and turn any youtube link into a video preview block.

- Author subscription for any authenticated. batch email sending once a day for all new posts of subscribed writers of the last 24 hours

- User profile (a section to show what is read)

- Writer profile (published writings, privates, drafts, trashed)

- public article browing (searching by text from article title or body only; filter by type, category, subcategory only; sort by date only)

**Requirements:** Easy content management, SEO-friendly article pages,

**Tech Stack:**

- **Frontend:** Next.js 14+ with TypeScript and Tailwind CSS

- **Backend/Database:** Supabase (PostgreSQL, auth, real-time APIs)

- **Hosting:** Vercel (free tier)
