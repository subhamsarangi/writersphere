"use client";

import { use } from "react";
import ArticleEditor from "../../../../components/ArticleEditor";

export default function WriteByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ArticleEditor articleId={id} />;
}
