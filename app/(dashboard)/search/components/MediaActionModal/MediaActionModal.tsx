"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import ActionBox, { ActionBoxMedia, ActionBoxState } from "@/app/components/ActionBox";

interface MediaActionModalProps {
  media: ActionBoxMedia & { title: string; posterUrl?: string | null; releaseYear?: string };
  isOpen: boolean;
  onClose: () => void;
  /** Called after the ActionBox successfully saves. */
  onConfirm?: (data: { rating: number; review: string }) => void;
  initialState?: Partial<ActionBoxState>;
}

export default function MediaActionModal({
  media,
  isOpen,
  onClose,
  onConfirm,
  initialState,
}: MediaActionModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !media) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start gap-4 p-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {media.posterUrl && (
            <img
              src={media.posterUrl}
              alt={media.title}
              className="w-16 rounded-lg object-cover flex-shrink-0"
              style={{ aspectRatio: "2/3" }}
            />
          )}
          <div className="flex-1 min-w-0 pt-1">
            <h2
              className="text-base font-semibold leading-snug"
              style={{ color: "var(--text)" }}
            >
              {media.title}
            </h2>
            {media.releaseYear && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {media.releaseYear}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md transition-colors"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "var(--text)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")
            }
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body — ActionBox inline */}
        <div className="p-5">
          <ActionBox
            media={media}
            initialState={initialState}
            inline
            onSaved={(state) => {
              onConfirm?.({ rating: state.rating ?? 0, review: state.review ?? "" });
            }}
          />
        </div>
      </div>
    </div>
  );
}
