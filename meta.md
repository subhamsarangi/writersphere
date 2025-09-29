## COMMANDS
### scaffold a nextjs project

npx create-next-app@latest writersphere --ts --tailwind --eslint --app --src-dir --use-npm
cd writersphere

npm install @supabase/supabase-js @supabase/ssr

### RUN PROJECT
npm run dev

### git

git remote add origin https://github.com/subhamsarangi/writersphere.git
git push -u origin main

## CONFIG

### supabase.com

writersphere0

dbpass/auth client secret: Z@a!D/pj5Q4NE7-

https://jdihqmqkajvofiawornn.supabase.co

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkaWhxbXFrYWp2b2ZpYXdvcm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjA2MTYsImV4cCI6MjA3NDczNjYxNn0.-B6cEiy0ydvKdyHJRO8tFdHUsS-7GIlwqKa-EexL0IU


### github oauth [GitHub → Settings → Developer settings → OAuth Apps]
CLIENT ID: Ov23liISILJpXHJwaBAP
CLIENT SECRET: f2f12e2a702b9c7a7ba5a15b327c17a01653e5d7

### supabase auth github [Supabase → Authentication → Providers → GitHub]
github auth callback: https://vdxdrhztikyanxycevrt.supabase.co/auth/v1/callback

----

### vercel.com URL
https://supa-minimal.vercel.app/

### supabase url [Supabase → Auth → URL Configuration]
Site URL: https://supa-minimal.vercel.app/

Redirect URLs: https://supa-minimal.vercel.app/

## OTHER STUFF

- @import "tailwindcss";

vs 
@tailwind base;
@tailwind components;
@tailwind utilities;


- hydration mismatch: A hydration mismatch happens when the **HTML rendered on the server** doesn’t exactly match the **HTML React expects on the client during hydration**, causing React to warn because the DOM and React’s virtual tree are out of sync.


## CURRENT PROJECT STATUS
Auth: GitHub OAuth via Supabase, session reflected in UI.

Frontend: Next.js App Router + Tailwind.

Infra: Supabase (auth, Postgres ready), Vercel hosting.

Security: Only public anon key is used client‑side; database tables (if you add) should use RLS policies.

## Next steps

Add a simple client component that inserts a row into public.todos and lists your own rows.

Use @supabase/ssr with server components for secure data fetching with cookies.

Add middleware to refresh sessions server‑side (when you need SSR protected routes).

Swap GitHub for magic links (signInWithOtp) to avoid setting up an OAuth provider.