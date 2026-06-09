import type { Notice } from "../../shared/types";

export function NoticeBox({ notice }: { notice: Notice | null }) {
  if (!notice) return null;
  return <div className={`notice ${notice.success ? "success" : ""}`}>{notice.message}</div>;
}
