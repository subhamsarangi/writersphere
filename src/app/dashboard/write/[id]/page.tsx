"use client";

import ArticleEditor from "../../../../components/ArticleEditor";

export default function WriteByIdPage({ params }: { params: { id: string } }) {
  return <ArticleEditor articleId={params.id} />;
}
