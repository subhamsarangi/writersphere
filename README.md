<div align="center">

# ✍️ Writersphere

**A modern, elegant content management platform for writers**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure)

</div>

---

## 🌟 Features

### Content Management
- **Rich Markdown Editor** - Write with a powerful, intuitive markdown editor
- **Article Status Management** - Draft, publish, unpublish, archive with visual status indicators
- **Category & Subcategory System** - Organize content hierarchically
- **Tag Management** - Flexible tagging system for content discovery
- **Image Support** - Upload and manage images for articles and categories

### User Experience
- **Dark/Light Theme Toggle** - Isolated theme control for article reading
- **Responsive Design** - Mobile-first approach with adaptive layouts
- **SEO-Friendly** - Optimized article pages for search engines
- **Poetry Mode** - Special formatting for poetry content
- **Smooth Animations** - Polished UI with wave boundaries and transitions

### Dashboard
- **Article Management** - Filter by status, category, subcategory
- **Category Management** - Create, edit, and organize categories
- **Subcategory Management** - Nested content organization
- **Tag Management** - Create and manage content tags
- **Status Indicators** - Color-coded badges with icons:
  - 🟢 Published (green with checkmark)
  - 🔵 Draft (blue with edit icon)
  - 🟡 Unpublished (yellow with crossed circle)
  - ⚫ Archived (gray with archive box)

### Technical Features
- **Real-time Updates** - Powered by Supabase real-time capabilities
- **Connection Monitoring** - Automatic detection of network issues
- **Mobile Navigation** - Floating back button on mobile devices
- **Type Safety** - Full TypeScript implementation

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15.5 with App Router |
| **Language** | TypeScript 5.0 |
| **Styling** | Tailwind CSS 4.0 |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Markdown** | @uiw/react-md-editor |
| **Icons** | Font Awesome |
| **Hosting** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/writersphere.git
   cd writersphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
writersphere/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── articles/          # Public article pages
│   │   ├── dashboard/         # Admin dashboard
│   │   │   ├── articles/     # Article management
│   │   │   ├── categories/   # Category management
│   │   │   ├── subcategories/# Subcategory management
│   │   │   ├── tags/         # Tag management
│   │   │   └── write/        # Article editor
│   │   ├── feed/             # Article feed
│   │   └── profile/          # User profile
│   ├── components/            # React components
│   │   ├── article-editor/   # Article editor components
│   │   ├── ArticleEditor.tsx
│   │   ├── CategoryForm.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   └── ...
│   └── lib/                   # Utilities and helpers
│       ├── supabaseClient.ts
│       └── useSupabaseErrorDetection.ts
├── public/                    # Static assets
└── ...config files
```

---

## 🎨 Key Features Explained

### Article Editor
The article editor provides a rich markdown editing experience with:
- Live preview
- Syntax highlighting
- Image upload support
- Auto-save functionality
- Status management
- Category and tag assignment

### Theme System
Articles support isolated theme toggling:
- Readers can choose dark or light mode
- Theme preference is saved per session
- Doesn't affect the rest of the application

### Status Management
Articles flow through different states:
1. **Draft** - Work in progress
2. **Published** - Live and visible to readers
3. **Unpublished** - Hidden from public view
4. **Archived** - Stored for reference

---

## 🔒 Database Schema

The application uses Supabase with the following main tables:
- `articles` - Article content and metadata
- `categories` - Top-level content categories
- `subcategories` - Nested categories
- `tags` - Content tags
- `article_tags` - Many-to-many relationship

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is private and not licensed for public use.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Font Awesome](https://fontawesome.com/)

---

<div align="center">

**Made with ❤️ for writers**

</div>
