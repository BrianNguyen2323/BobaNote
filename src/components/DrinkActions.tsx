"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteDrinkAction } from "@/app/(app)/drinks/actions";
import { accentButtonClass, pillButtonClass } from "@/components/log/Field";

const linkClass = `${pillButtonClass} inline-flex items-center`;

/** Edit, Log again, and a two-step Delete. A successful delete revalidates /history, so the card unmounts. */
export function DrinkActions({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteDrinkAction(id);
      if (!result.ok) {
        setError(result.message);
        setConfirming(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {confirming ? (
          <>
            <button type="button" onClick={remove} disabled={pending} className={`${accentButtonClass} min-h-11 py-2.5`}>
              {pending ? "Deleting..." : "Confirm"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={pending} className={pillButtonClass}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <Link href={`/drinks/${id}/edit`} className={linkClass}>
              Edit
            </Link>
            <Link href={`/?from=${id}`} className={linkClass}>
              Log again
            </Link>
            <button type="button" onClick={() => setConfirming(true)} className={`${pillButtonClass} text-danger`}>
              Delete
            </button>
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
