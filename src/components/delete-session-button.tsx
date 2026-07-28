"use client";

import { useTransition } from "react";

type DeleteSessionButtonProps = {
  action: (sessionId: string) => Promise<void>;
  className: string;
  sessionId: string;
};

export function DeleteSessionButton({
  action,
  className,
  sessionId,
}: DeleteSessionButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className={className}
      type="button"
      disabled={isPending}
      onClick={() => {
        if (
          !window.confirm(
            "Delete this session and all of its saved answers and feedback?",
          )
        ) {
          return;
        }
        startTransition(() => action(sessionId));
      }}
    >
      {isPending ? "Deleting…" : "Delete session"}
    </button>
  );
}
