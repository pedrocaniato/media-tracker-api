"use client";

import { useState } from "react";
import { Eye, EyeOff, Heart, Star, Loader2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ActionBoxState {
  status: "VISTO" | "ASSISTINDO" | "QUERO_VER" | null;
  rating: number | null; // 0.5 – 5.0 in 0.5 steps
  review: string | null;
  isFavorite: boolean;
}

export interface ActionBoxMedia {
  uniqueId: string;
  type: string;
  title: string;
  posterUrl?: string | null;
  releaseYear?: string | number | null;
}

interface ActionBoxProps {
  media: ActionBoxMedia;
  initialState?: Partial<ActionBoxState>;
  /** Called after every successful save. */
  onSaved?: (state: ActionBoxState) => void;
  /** If true the box is rendered inline (no card wrapper). */
  inline?: boolean;
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
// Supports half-stars (0.5 step). Click left-half → half star, right → full.

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (readonly || !onChange) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    const selected = isLeftHalf ? index + 0.5 : index + 1;
    // Click same value again → clear
    onChange(value === selected ? 0 : selected);
  };

  const handleHover = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (readonly) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    setHovered(isLeftHalf ? index + 0.5 : index + 1);
  };

  return (
    <div
      className="flex gap-0.5"
      onMouseLeave={() => setHovered(null)}
      title={value > 0 ? `${value} estrelas` : "Sem nota"}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const full = display >= i + 1;
        const half = !full && display >= i + 0.5;

        return (
          <div
            key={i}
            className={`relative ${readonly ? "cursor-default" : "cursor-pointer"}`}
            style={{ width: 20, height: 20 }}
            onClick={(e) => handleClick(e, i)}
            onMouseMove={(e) => handleHover(e, i)}
          >
            {/* base (empty) */}
            <Star
              size={20}
              strokeWidth={1.5}
              style={{ color: "var(--text-faint)", position: "absolute", inset: 0 }}
            />
            {/* half fill */}
            {(half || full) && (
              <Star
                size={20}
                strokeWidth={1.5}
                style={{
                  color: "#f59e0b",
                  fill: "#f59e0b",
                  position: "absolute",
                  inset: 0,
                  clipPath: full ? "none" : "inset(0 50% 0 0)",
                }}
              />
            )}
          </div>
        );
      })}
      {value > 0 && (
        <span
          className="ml-1.5 text-xs self-center tabular-nums"
          style={{ color: "var(--text-muted)" }}
        >
          {value % 1 === 0 ? `${value}.0` : value}
        </span>
      )}
    </div>
  );
}

// ─── Action Box ───────────────────────────────────────────────────────────────

export default function ActionBox({
  media,
  initialState = {},
  onSaved,
  inline = false,
}: ActionBoxProps) {
  const [status, setStatus] = useState<ActionBoxState["status"]>(
    initialState.status ?? null
  );
  const [rating, setRating] = useState<number>(initialState.rating ?? 0);
  const [review, setReview] = useState<string>(initialState.review ?? "");
  const [isFavorite, setIsFavorite] = useState<boolean>(initialState.isFavorite ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watched = status === "VISTO";

  // Persist to /api/media (upsert)
  const save = async (overrides: Partial<ActionBoxState> = {}) => {
    setSaving(true);
    setError(null);

    const finalStatus = overrides.status !== undefined ? overrides.status : status;
    const finalRating = overrides.rating !== undefined ? overrides.rating : rating;
    const finalReview = overrides.review !== undefined ? overrides.review : review;

    // We need a status even when only rating/review changes — default to VISTO
    const statusToSend = finalStatus ?? ((finalRating ?? 0) > 0 ? "VISTO" : "QUERO_VER");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
      if (!token) throw new Error("Não autenticado.");

      const res = await fetch("/api/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uniqueId: media.uniqueId,
          type: media.type,
          title: media.title,
          posterUrl: media.posterUrl ?? null,
          releaseYear: media.releaseYear ? Number(media.releaseYear) : null,
          status: statusToSend,
          rating: (finalRating ?? 0) > 0 ? finalRating : null,
          review: (finalReview ?? "").trim() || null,
          isFavorite: overrides.isFavorite !== undefined ? overrides.isFavorite : isFavorite,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message ?? "Erro ao salvar.");
      }

      // Flash "Salvo"
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);

      const nextState: ActionBoxState = {
        status: statusToSend as ActionBoxState["status"],
        rating: (finalRating ?? 0) > 0 ? finalRating : null,
        review: (finalReview ?? "").trim() || null,
        isFavorite: overrides.isFavorite !== undefined ? overrides.isFavorite : isFavorite,
      };
      onSaved?.(nextState);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  };

  const toggleWatched = () => {
    const next = watched ? null : "VISTO";
    setStatus(next as ActionBoxState["status"]);
    save({ status: next as ActionBoxState["status"] });
  };

  const toggleLiked = () => {
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);
    save({ isFavorite: nextFavorite });
  };

  const handleRatingChange = (v: number) => {
    setRating(v);
    if (v > 0 && !watched) {
      setStatus("VISTO");
      save({ rating: v, status: "VISTO" });
    } else {
      save({ rating: v });
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    save({});
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const box = (
    <div
      className="flex flex-col gap-5"
      style={
        inline
          ? {}
          : {
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "20px",
            }
      }
    >
      {/* ── Row: Watched + Like ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleWatched}
          disabled={saving}
          title={watched ? "Remover de visto" : "Marcar como visto"}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50"
          style={
            watched
              ? {
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  border: "1px solid transparent",
                }
              : {
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }
          }
          onMouseEnter={(e) => {
            if (!watched)
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            if (!watched)
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          }}
        >
          {watched ? (
            <Eye size={15} strokeWidth={1.5} />
          ) : (
            <EyeOff size={15} strokeWidth={1.5} />
          )}
          {watched ? "Visto" : "Marcar visto"}
        </button>

        <button
          onClick={toggleLiked}
          disabled={saving}
          title={isFavorite ? "Remover like" : "Curtir"}
          className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 disabled:opacity-50"
          style={
            isFavorite
              ? {
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "#ef4444",
                }
              : {
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }
          }
          onMouseEnter={(e) => {
            if (!isFavorite) {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "rgba(239,68,68,0.4)";
              b.style.color = "#ef4444";
            }
          }}
          onMouseLeave={(e) => {
            if (!isFavorite) {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.borderColor = "var(--border)";
              b.style.color = "var(--text-muted)";
            }
          }}
        >
          <Heart size={15} strokeWidth={1.5} fill={isFavorite ? "#ef4444" : "none"} />
        </button>
      </div>

      {/* ── Rating ── */}
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Sua nota
        </p>
        <StarRating value={rating} onChange={handleRatingChange} />
      </div>

      {/* ── Review ── */}
      <form onSubmit={handleSubmitReview}>
        <p
          className="text-[11px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Review
        </p>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="O que você achou?"
          rows={4}
          className="w-full resize-none rounded-lg text-sm outline-none transition-all duration-150 placeholder-[var(--text-faint)]"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "10px 12px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        />

        {/* Error */}
        {error && (
          <p className="mt-2 text-xs" style={{ color: "var(--error)" }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving || !review.trim()}
          className="mt-3 w-full py-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-40"
          style={{
            background: "var(--bg-active)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={13} className="animate-spin" /> Salvando...
            </span>
          ) : saved ? (
            "✓ Salvo"
          ) : (
            "Salvar review"
          )}
        </button>
      </form>
    </div>
  );

  return box;
}
