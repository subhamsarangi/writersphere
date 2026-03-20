import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function generateArticleMetadata(id: string): Promise<Metadata> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.rpc("get_published_article_with_author", {
    p_id: id,
  });

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return {
      title: "Article — Writersphere",
      description: "Read this article on Writersphere.",
    };
  }

  const article = data[0] as {
    title?: string;
    body_md?: string;
    primary_image_url?: string;
    author_name?: string;
    published_at?: string;
  };

  const title = article.title || "Article";
  const description = article.body_md?.replace(/[#*`>\-_\[\]]/g, "").slice(0, 160) || "Read this article on Writersphere.";
  const image = article.primary_image_url || "https://cdn.openworldregister.com/opengraph-img.png";
  const url = `https://write.openworldregister.com/articles/${id}`;

  return {
    title: `${title} — Writersphere`,
    description,
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
      ...(article.published_at ? { publishedTime: article.published_at } : {}),
      ...(article.author_name ? { authors: [article.author_name] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
