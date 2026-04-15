"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/app/context/SearchContext";
import {
  Search,
  Loader2,
  Film,
  Tv,
  BookOpen,
  TrendingUp,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { NormalizedMedia } from "@/app/types/media";
import MediaActionModal from "./components/MediaActionModal/MediaActionModal";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type MediaType = "filme" | "serie" | "livro";
type SavedMediaMap = Record<string, { status: "VISTO" | "ASSISTINDO" | "QUERO_VER" }>;
type SectionKey = "now_playing" | "trending" | "tv_popular";

interface SectionData {
  title: string;
  label: string;
  icon: React.ReactNode;
  sectionKey: SectionKey;
  items: NormalizedMedia[];
  loading: boolean;
}

const MEDIA_TYPES: { value: MediaType; label: string; icon: React.ReactNode }[] = [
  { value: "filme", label: "Filmes", icon: <Film size={14} strokeWidth={1.5} /> },
  { value: "serie", label: "Séries", icon: <Tv size={14} strokeWidth={1.5} /> },
  { value: "livro", label: "Livros", icon: <BookOpen size={14} strokeWidth={1.5} /> },
];

const SUGGESTIONS: Record<MediaType, string[]> = {
  filme: ["Inception", "Duna", "Oppenheimer", "Parasite", "Interstellar"],
  serie: ["The Bear", "Severance", "Succession", "Dark", "Breaking Bad"],
  livro: ["Sapiens", "Dune", "1984", "O Hobbit", "Shogun"],
};

const INITIAL_SECTIONS: SectionData[] = [
  {
    title: "Em Cartaz",
    label: "Lançamentos",
    icon: <Clock size={14} strokeWidth={1.5} />,
    sectionKey: "now_playing",
    items: [],
    loading: true,
  },
  {
    title: "Em Alta essa Semana",
    label: "Trending",
    icon: <TrendingUp size={14} strokeWidth={1.5} />,
    sectionKey: "trending",
    items: [],
    loading: true,
  },
  {
    title: "Séries Populares",
    label: "Séries",
    icon: <Star size={14} strokeWidth={1.5} />,
    sectionKey: "tv_popular",
    items: [],
    loading: true,
  },
];

// ─────────────────────────────────────────────
// HORIZONTAL SCROLLER
// ─────────────────────────────────────────────
function HorizontalScroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "left" ? -560 : 560, behavior: "smooth" });
  };

  return (
    <div className="relative group/scroll">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        aria-label="Rolar para a esquerda"
        className="
          absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
          flex items-center justify-center w-8 h-8 rounded-full
          opacity-0 group-hover/scroll:opacity-100
          transition-opacity duration-200
        "
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>

      <div
        ref={ref}
        className="no-scrollbar flex gap-3 overflow-x-auto pb-1"
      >
        {children}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        aria-label="Rolar para a direita"
        className="
          absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
          flex items-center justify-center w-8 h-8 rounded-full
          opacity-0 group-hover/scroll:opacity-100
          transition-opacity duration-200
        "
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPACT POSTER CARD (seções horizontais)
// ─────────────────────────────────────────────
interface CompactCardProps {
  media: NormalizedMedia;
  status?: "VISTO" | "ASSISTINDO" | "QUERO_VER";
  onMarkAsDone: (media: NormalizedMedia) => void;
}

function CompactCard({ media, status, onMarkAsDone }: CompactCardProps) {
  const router = useRouter();
  const isDone = status === "VISTO";
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="group/card flex-shrink-0 w-32 sm:w-36 cursor-pointer"
      onClick={() => router.push(`/media/${media.uniqueId}`)}
    >
      {/* Poster */}
      <div
        className="relative w-full rounded-lg overflow-hidden transition-all duration-200"
        style={{
          aspectRatio: "2/3",
          border: "1px solid var(--border)",
        }}
      >
        <img
          src={
            !imgError && media.posterUrl
              ? media.posterUrl
              : "https://placehold.co/240x360/111113/3f3f46?text=Sem+Pôster"
          }
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
          onError={() => setImgError(true)}
        />

        {/* Done badge */}
        {isDone && (
          <div
            className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full"
            style={{ background: "var(--success)", color: "#fff" }}
          >
            <CheckCircle2 size={13} strokeWidth={2.5} />
          </div>
        )}

        {/* Hover overlay with action */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
          style={{ background: "linear-gradient(0deg, rgba(9,9,11,0.88) 0%, transparent 50%)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {!isDone ? (
            <button
              onClick={() => onMarkAsDone(media)}
              className="w-full py-1.5 rounded-md text-[11px] font-medium transition-colors duration-150"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
              }}
            >
              Marcar visto
            </button>
          ) : (
            <span
              className="w-full py-1.5 rounded-md text-[11px] font-medium text-center"
              style={{ background: "var(--bg-active)", color: "var(--text-muted)" }}
            >
              ✓ Visto
            </span>
          )}
        </div>
      </div>

      {/* Text below */}
      <div className="mt-2 px-0.5">
        <p
          className="text-xs font-medium leading-snug line-clamp-2"
          style={{ color: "var(--text)" }}
        >
          {media.title}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
          {media.releaseYear}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SEARCH RESULT CARD (grid de resultados)
// ─────────────────────────────────────────────
interface SearchCardProps {
  media: NormalizedMedia;
  status?: "VISTO" | "ASSISTINDO" | "QUERO_VER";
  onMarkAsDone: (media: NormalizedMedia) => void;
}

function SearchCard({ media, status, onMarkAsDone }: SearchCardProps) {
  const router = useRouter();
  const isDone = status === "VISTO";
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="group/card flex flex-col cursor-pointer"
      onClick={() => router.push(`/media/${media.uniqueId}`)}
    >
      {/* Poster */}
      <div
        className="relative w-full rounded-lg overflow-hidden transition-all duration-200 group-hover/card:border-[var(--accent)]"
        style={{ aspectRatio: "2/3", border: "1px solid var(--border)" }}
      >
        <img
          src={
            !imgError && media.posterUrl
              ? media.posterUrl
              : "https://placehold.co/240x360/111113/3f3f46?text=Sem+Pôster"
          }
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
          onError={() => setImgError(true)}
        />
        {isDone && (
          <div
            className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full"
            style={{ background: "var(--success)", color: "#fff" }}
          >
            <CheckCircle2 size={13} strokeWidth={2.5} />
          </div>
        )}
        <div
          className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200"
          style={{ background: "linear-gradient(0deg, rgba(9,9,11,0.88) 0%, transparent 55%)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {!isDone ? (
            <button
              onClick={() => onMarkAsDone(media)}
              className="w-full py-1.5 rounded-md text-[11px] font-medium transition-colors"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              Marcar visto
            </button>
          ) : (
            <span
              className="w-full py-1.5 rounded-md text-[11px] font-medium text-center"
              style={{ background: "var(--bg-active)", color: "var(--text-muted)" }}
            >
              ✓ Visto
            </span>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="mt-2 px-0.5">
        <p className="text-xs font-medium leading-snug line-clamp-2" style={{ color: "var(--text)" }}>
          {media.title}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
          {media.releaseYear}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SKELETON ROW
// ─────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-32 sm:w-36">
          <div className="skeleton rounded-lg" style={{ aspectRatio: "2/3" }} />
          <div className="skeleton mt-2 h-3 w-4/5 rounded" style={{ marginTop: 8 }} />
          <div className="skeleton h-2.5 w-1/2 rounded" style={{ marginTop: 4 }} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
function SectionHeader({
  icon,
  label,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
}) {
  return (
    <div className="flex items-baseline gap-3 mb-5">
      <div className="flex items-center gap-1.5">
        <span style={{ color: "var(--text-muted)" }}>{icon}</span>
        <span
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </span>
      </div>
      <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
        {title}
      </h2>
      <div
        className="flex-1 h-px"
        style={{ background: "var(--border-subtle)" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

const SearchPage = () => {
  const { query, setQuery, type, setType, handleSearch: triggerGlobalSearch } = useSearch();
  const [results, setResults] = useState<NormalizedMedia[]>([]);
  const [savedMediaMap, setSavedMediaMap] = useState<SavedMediaMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<NormalizedMedia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sections, setSections] = useState<SectionData[]>(INITIAL_SECTIONS);
  const router = useRouter();

  // Validate token
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      localStorage.removeItem("userToken");
      window.location.reload();
    }
  }, []);

  // Fetch user's saved media map
  useEffect(() => {
    const fetchUserMedia = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;
      const res = await fetch("/api/media", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const map: SavedMediaMap = {};
      data.data.forEach((item: any) => {
        map[item.uniqueId] = { status: item.status };
      });
      setSavedMediaMap(map);
    };
    fetchUserMedia();
  }, []);

  // Fetch trending sections
  useEffect(() => {
    const fetchSection = async (sectionKey: SectionKey, index: number) => {
      try {
        const res = await fetch(`/api/trending?section=${sectionKey}`);
        if (!res.ok) return;
        const data = await res.json();
        setSections((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], items: data.data ?? [], loading: false };
          return next;
        });
      } catch {
        setSections((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], loading: false };
          return next;
        });
      }
    };
    INITIAL_SECTIONS.forEach((s, i) => fetchSection(s.sectionKey, i));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsDone = useCallback((media: NormalizedMedia) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  }, []);

  const handleConfirmModal = async (
    media: NormalizedMedia,
    data: { rating: number; review: string }
  ) => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    await fetch("/api/media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uniqueId: media.uniqueId,
        type: media.type,
        title: media.title,
        posterUrl: media.posterUrl,
        releaseYear: media.releaseYear ? Number(media.releaseYear) : null,
        status: "VISTO",
        rating: data.rating,
        review: data.review,
      }),
    });
    setSavedMediaMap((prev) => ({
      ...prev,
      [media.uniqueId]: { status: "VISTO" },
    }));
    setIsModalOpen(false);
  };

  const runSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setHasSearched(false);
        return;
      }
      setError(null);
      setIsLoading(true);
      setHasSearched(true);
      setResults([]);
      try {
        const token = localStorage.getItem("userToken");
        if (!token) { window.location.reload(); return; }
        const res = await fetch(
          `/api/search?query=${encodeURIComponent(searchQuery)}&type=${type}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (res.ok) setResults(json.data ?? []);
        else setError(json.message ?? "Erro ao buscar mídia.");
      } catch {
        setError("Falha na conexão.");
      } finally {
        setIsLoading(false);
      }
    },
    [type]
  );

  // Sync with global query
  useEffect(() => {
    if (query) {
      runSearch(query);
    } else {
      setHasSearched(false);
      setResults([]);
    }
  }, [query, runSearch]);

  const handleSuggestion = (s: string) => {
    setQuery(s);
  };

  const clearSearch = () => {
    setQuery("");
  };

  // ──────────────────────────────────────────
  //  RENDER
  // ──────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* ═══ CONTENT ═══ */}
      <main className="max-w-screen-xl mx-auto px-6 sm:px-10 py-10">
        
        {/* ── Type toggle ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <h1 className="text-sm font-semibold tracking-tight uppercase opacity-50">Explorar catálogo</h1>
          </div>

          <div
            className="flex items-center rounded-lg p-0.5 gap-0.5 bg-zinc-900/50 border border-zinc-800"
          >
            {MEDIA_TYPES.map((mt) => (
              <button
                key={mt.value}
                onClick={() => setType(mt.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                style={
                  type === mt.value
                    ? { background: "var(--bg-active)", color: "var(--text)", border: "1px solid var(--border)" }
                    : { background: "transparent", color: "var(--text-muted)", border: "1px solid transparent" }
                }
              >
                {mt.icon}
                {mt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── SEARCH RESULTS VIEW ── */}
        {hasSearched ? (
          <section>
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-baseline gap-3">
                <span
                  className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--text-muted)" }}
                >
                  Resultados
                </span>
                <h2 className="text-base font-semibold" style={{ color: "var(--text)" }}>
                  &ldquo;{query}&rdquo;
                </h2>
                {!isLoading && results.length > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {results.length}
                  </span>
                )}
              </div>
              <button
                onClick={clearSearch}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={13} strokeWidth={1.5} />
                Limpar
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-lg mb-6 text-sm"
                style={{
                  background: "var(--error-subtle)",
                  border: "1px solid color-mix(in srgb, var(--error) 30%, transparent)",
                  color: "var(--error)",
                }}
              >
                <AlertCircle size={15} strokeWidth={1.5} />
                {error}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={24} strokeWidth={1.5} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>Buscando...</span>
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Search size={28} strokeWidth={1} style={{ color: "var(--text-faint)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Nenhum resultado para &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  Tente um termo diferente ou outra categoria.
                </p>
              </div>
            )}

            {/* Grid */}
            {!isLoading && results.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
                {results.map((media) => (
                  <SearchCard
                    key={media.uniqueId}
                    media={media}
                    status={savedMediaMap[media.uniqueId]?.status}
                    onMarkAsDone={handleMarkAsDone}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* ── DISCOVER VIEW (default) ── */
          <>
            {/* Suggestions */}
            <div className="flex flex-wrap items-center gap-2 mb-12">
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                Tente:
              </span>
              {SUGGESTIONS[type].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="px-3 py-1 rounded-md text-xs transition-colors duration-150"
                  style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Trending sections */}
            {sections.map((section) => (
              <section key={section.sectionKey} className="mb-12">
                <SectionHeader
                  icon={section.icon}
                  label={section.label}
                  title={section.title}
                />
                {section.loading ? (
                  <SkeletonRow />
                ) : section.items.length > 0 ? (
                  <HorizontalScroller>
                    {section.items.map((media) => (
                      <CompactCard
                        key={media.uniqueId}
                        media={media}
                        status={savedMediaMap[media.uniqueId]?.status}
                        onMarkAsDone={handleMarkAsDone}
                      />
                    ))}
                  </HorizontalScroller>
                ) : (
                  <p className="text-sm py-4" style={{ color: "var(--text-faint)" }}>
                    Não foi possível carregar esta seção.
                  </p>
                )}
              </section>
            ))}
          </>
        )}
      </main>

      {/* ═══ MODAL ═══ */}
      {selectedMedia && (
        <MediaActionModal
          media={selectedMedia}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={(data) => {
            if (selectedMedia) handleConfirmModal(selectedMedia, data);
          }}
        />
      )}
    </div>
  );
};

export default SearchPage;
