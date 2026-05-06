"use client";
import { useState } from "react";
import { ReportModal } from "@/components/ReportModal";

export function ReportButton({
  targetType,
  targetId,
  disabled = false,
}: {
  targetType: "post" | "user" | "media" | "reply";
  targetId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={disabled ? "自分の投稿は通報できません" : "通報する"}
        aria-label="通報"
        className={`flex items-center rounded-full px-3 py-1.5 text-base whitespace-nowrap text-sumi/70 transition hover:bg-red-50 hover:text-red-600 ${
          disabled ? "opacity-30 cursor-not-allowed" : ""
        }`}
      >
        <span aria-hidden>🚩</span>
      </button>
      {open && (
        <ReportModal
          targetType={targetType}
          targetId={targetId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
