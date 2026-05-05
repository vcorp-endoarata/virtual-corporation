"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingText?: React.ReactNode;
  className?: string;
  spinner?: boolean;
};

/**
 * Server Action 用 submit ボタン。
 * - pending 中は disabled + スピナー表示
 * - クリック時に scale 縮小で押下感を出す
 * - aria-busy で支援技術にも状態を伝える
 */
export function SubmitButton({
  children,
  pendingText,
  className = "",
  spinner = true,
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className} relative transition-[transform,background-color,color,opacity] active:scale-[0.98] disabled:cursor-wait disabled:opacity-75`}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {pending && spinner && <Spinner />}
        {pending && pendingText !== undefined ? pendingText : children}
      </span>
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
