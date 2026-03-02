export type ArticleStatus =
  | "draft"
  | "published"
  | "unpublished"
  | "archived"
  | "deleted";

export type StatusSfx = "publish" | "unpublish" | "archive";

export type ToastState = { message: string; kind: "success" | "error" };

export type ConfirmState = {
  open: boolean;
  title: string;
  body: string;
  confirmText: string;
  tone: "primary" | "danger";
  nextStatus: ArticleStatus;
  sfx: StatusSfx;
  toast: string;
  burst: "publish" | "archive" | null;
};

export type CategoryOpt = { id: string; name: string };

export type SubcategoryOpt = { id: string; name: string; category_id: string };

export type ArticleTagJoinRow = {
  tags: { name: unknown }[] | { name: unknown } | null;
};
