Awesome—let’s get Writersphere running locally first. We’ll keep it lean: create a Next.js 15 + Tailwind app, wire up Supabase (cloud, so you don’t have to install Docker), and confirm auth works. You only have VS Code and Node 22.9, so I’ll assume no Git/Docker/etc.

# Step 0 — Quick installs (2 minutes)

These aren’t strictly required, but they make life easier:

* **Git (optional):** [https://git-scm.com/downloads](https://git-scm.com/downloads)
* **VS Code extensions (optional):** “ESLint”, “Tailwind CSS IntelliSense”

# Step 1 — Scaffold the app

Open **PowerShell** (or Terminal) in the folder where you want the project.

```powershell
npx create-next-app@latest writersphere --ts --tailwind
# When prompted:
# ✔ Would you like to use App Router?  → Yes
# ✔ Would you like to use Turbopack?   → Your call (either is fine)
# ✔ Import alias?                      → @/*
```

Jump in and run it:

```powershell
cd writersphere
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) — you should see the Next.js starter.

# Step 2 — Add Supabase client

We’ll use Supabase cloud (free) so you don’t need Docker locally.

Install the SDK:

```powershell
npm i @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
```

Create `lib/supabaseClient.ts`:

```ts
// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

# Step 3 — Create a Supabase project (free)
Supabase settings for **Dev (local)** vs **Prod**

Use **two Supabase projects**: one for local/dev and one for production. This keeps behavior clean and safe.

## Dev project (used with `npm run dev`)

1. **Authentication → Providers → Email**

   * **Enable email provider**: ON
   * **Email confirmations** (a.k.a. “Confirm email before sign-in”): **OFF** ✅

     > This makes sign-ups active immediately with email+password.
2. **Authentication → URL Configuration**

   * **Site URL**: `http://localhost:3000`
   * **Redirect URLs**: add `http://localhost:3000/*`
3. **Project Settings → API**

   * Copy **Project URL** and **anon public key** into your `.env.local`:

     ```
     NEXT_PUBLIC_SUPABASE_URL=...dev-url...
     NEXT_PUBLIC_SUPABASE_ANON_KEY=...dev-anon...
     ```

## Prod project (used on Vercel)

1. **Authentication → Providers → Email**

   * **Enable email provider**: ON
   * **Email confirmations**: **ON** ✅

     > Users must click the confirmation link before they can sign in.
2. **Authentication → URL Configuration**

   * **Site URL**: `https://<your-vercel-domain>`
   * **Redirect URLs**: add `https://<your-vercel-domain>/*`
3. **Authentication → Templates → Confirm signup**

   * Customize the email (from name, subject, body). Leave the default confirm link placeholder intact.
4. **Project Settings → API**

   * Put **URL** and **anon** in Vercel Project → **Settings → Environment Variables**:

     * `NEXT_PUBLIC_SUPABASE_URL`
     * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * Redeploy.

> That’s it: locally you’ll get instant activation with email+password; in production, signups require clicking the confirmation email.

If you want, I can also wire a minimal `/auth/callback` route later, but for plain email+password this setup works fine.


# Step 5 — Minimal auth page to verify everything


### app/page.tsx

```ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type Mode = "sign_in" | "sign_up";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign_up"); // default to sign up per your flow
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // If already signed in, go to dashboard
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace("/dashboard");
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      if (mode === "sign_up") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          if (error.message?.toLowerCase().includes("already")) {
            setErr("This email is already registered. Switching to sign in.");
            setMode("sign_in");
          } else {
            setErr(error.message);
          }
          return;
        }
        // If email confirmations are OFF (dev), session will be present and the auth listener will redirect.
        if (data.session) {
          setMsg("Signed up! Redirecting…");
          return;
        }
        // If confirmations are ON (prod), show instruction
        setMsg("Check your inbox to confirm your email before signing in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setErr(error.message);
          return;
        }
        setMsg("Signed in! Redirecting…");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white text-gray-900 p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-2">Writersphere</h1>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("sign_up")}
            className={`px-3 py-2 rounded border ${mode === "sign_up" ? "bg-gray-900 text-white" : "bg-white"}`}
          >
            Sign up
          </button>
          <button
            onClick={() => setMode("sign_in")}
            className={`px-3 py-2 rounded border ${mode === "sign_in" ? "bg-gray-900 text-white" : "bg-white"}`}
          >
            Sign in
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-gray-900 text-white py-2 disabled:opacity-60"
          >
            {loading ? (mode === "sign_up" ? "Creating account…" : "Signing in…") : (mode === "sign_up" ? "Create account" : "Sign in")}
          </button>
        </form>

        {msg && <p className="mt-3 text-sm text-green-700" aria-live="polite">{msg}</p>}
        {err && <p className="mt-3 text-sm text-red-700" aria-live="polite">{err}</p>}
      </div>
    </main>
  );
}

```

> Note: The import path `../lib/supabaseClient` works because `app/` and `lib/` are siblings.


### app/globals.css

add it

```css
:root { color-scheme: light; }
input, textarea, select { color: rgb(17 24 39); background-color: #fff; }
input::placeholder, textarea::placeholder { color: #6b7280; }
```

### app/dashboard/page.tsx

```ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/");
        return;
      }
      setEmail(data.user.email ?? null);
    })();
  }, [router]);

  return (
    <main className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2">Signed in as <span className="font-medium">{email}</span></p>
        <button
          className="mt-4 border rounded px-3 py-2"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/");
          }}
        >
          Sign out
        </button>
      </div>
    </main>
  );
}

```


# Step 6 — Run and test

```powershell
npm run dev
```

* Go to **[http://localhost:3000](http://localhost:3000)**
* Try **Sign up** with your email (you’ll get a magic link from Supabase).
* After clicking the link, you should land back at your local app as an authenticated user.

# That’s it — you’re running locally ✅

You now have:

* Next.js 15 + TypeScript + Tailwind
* Supabase wired via environment variables
* Working email auth using Supabase’s hosted emails

---

## What’s next (when you’re ready)

I won’t do these yet, but here’s the path I’ll take next when you say “go”:

1. **Project structure & routing** for Writersphere (public browsing, writer dashboard).
2. **Supabase schema** (users, profiles, posts, tags, categories, subscriptions).
3. **Auth flows** (server-side session via `@supabase/ssr`, RLS policies).
4. **Markdown editor** with image uploads (to Supabase Storage) + auto YouTube preview.
5. **Search & filters** (Full Text Search on posts, type/category/subcategory filters).
6. **Email digests** (daily cron with Supabase Edge Functions for “last 24h” posts).
7. **SEO** (dynamic metadata, sitemaps, OpenGraph images).
8. **Deploy** (Vercel + Supabase free tiers).

If anything in the steps above trips you up (e.g., email link not redirecting, env vars not loading), tell me what you see and I’ll fix it fast.


----

-- 1) An enum for status (optional; you can use TEXT instead)
create type status_t as enum ('active','inactive');

-- 2) Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  writer_id uuid not null,                            -- owner
  name text not null,
  description text,
  image_url text,
  status status_t not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Subcategories
create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  writer_id uuid not null,                            -- owner (duplicated for RLS convenience)
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  status status_t not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Helpful indexes
create index on public.categories (writer_id);
create index on public.categories using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,'')));

create index on public.subcategories (writer_id);
create index on public.subcategories (category_id);
create index on public.subcategories using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,'')));

-- 5) Row Level Security
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;

-- RLS policies (assumes auth.users.id = writer_id and user_metadata.role = 'writer')
create policy "writers_can_select_own_categories"
on public.categories for select
using (auth.uid() = writer_id);

create policy "writers_can_manage_own_categories"
on public.categories for all
using (auth.uid() = writer_id)
with check (auth.uid() = writer_id);

create policy "writers_can_select_own_subcategories"
on public.subcategories for select
using (auth.uid() = writer_id);

create policy "writers_can_manage_own_subcategories"
on public.subcategories for all
using (auth.uid() = writer_id)
with check (auth.uid() = writer_id);
