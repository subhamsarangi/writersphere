"use client";

import { useParams } from "next/navigation";
import ArticleEditor from "../../../../components/ArticleEditor";

export default function WriteByIdPage() {
  const params = useParams<{ id: string }>();
  return <ArticleEditor articleId={params.id} />;
}
