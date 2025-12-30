That warning is from Next’s ESLint rule `@next/next/no-img-element`. It’s basically saying: **prefer `next/image` over raw `<img>`** so Next can optimize/resize/lazy-load images and improve LCP.

## Fix: replace `<img>` with `next/image`

### Before

```tsx
<img src={row.image_url ?? ""} alt={row.name} className="..." />
```

### After

```tsx
import Image from "next/image";

// ...

<Image
  src={row.image_url ?? "/placeholder.png"} // MUST NOT BE EMPTY
  alt={row.name ?? "Category image"}
  width={64}           // SET YOUR DESIRED SIZE
  height={64}
  className="..."      // TAILWIND OK
  // OPTIONAL: IF THIS IS ABOVE-THE-FOLD
  // priority
/>
```

### Important gotchas (so you don’t hit new errors)

1. **`src` cannot be `""`** for `<Image />`. Use a placeholder fallback.
2. If `image_url` is an **external URL** (Supabase public URL), you must allow the domain in `next.config.*`:

```js
// next.config.js (OR next.config.mjs)
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "<YOUR-SUPABASE-PROJECT-REF>.supabase.co", // EDIT THIS
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
```

If you don’t want to hardcode the project ref, you can also allow the hostname only (still needs to match).

3. If you’re rendering variable sizes, set `width/height` + optionally `sizes` for responsive layout.

---

## If you want to silence the warning without changing code

Not recommended, but possible:

```tsx
/* eslint-disable @next/next/no-img-element */
<img ... />
/* eslint-enable @next/next/no-img-element */
```

(or disable the rule in `.eslintrc`)

---

If you paste the snippet from `./src/app/dashboard/subcategories/page.tsx` around line ~143 (the `<img>` usage), I’ll rewrite that exact block to `next/image` with the right width/height and a clean fallback.
