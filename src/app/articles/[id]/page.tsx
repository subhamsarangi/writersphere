import { generateArticleMetadata } from "./metadata";
import ArticlePageClient from "./ArticlePageClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return generateArticleMetadata(id);
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  return <ArticlePageClient params={params} />;
}
