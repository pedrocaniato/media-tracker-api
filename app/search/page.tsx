"use client";

import { useState, useEffect, useCallback } from "react";
import MediaCard from "./components/MediaCard/MediaCard";
import { Search, Loader2, XCircle } from "lucide-react";
import { NormalizedMedia } from "@/app/types/media";
import MediaActionModal from "./components/MediaActionModal/MediaActionModal";

type MediaType = "filme" | "serie" | "livro";

type SavedMediaMap = Record<
  string,
  {
    status: "VISTO" | "ASSISTINDO" | "QUERO_VER";
  }
>;

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MediaType>("filme");
  const [results, setResults] = useState<NormalizedMedia[]>([]);
  const [savedMediaMap, setSavedMediaMap] = useState<SavedMediaMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] =
    useState<NormalizedMedia | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  // 🔐 valida token
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      localStorage.removeItem("userToken");
      window.location.reload();
    }
  }, []);

  // 🔥 BUSCA MÍDIAS SALVAS DO USUÁRIO (FONTE DA VERDADE)
  useEffect(() => {
    const fetchUserMedia = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      const res = await fetch("/api/media", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      const map: SavedMediaMap = {};
      data.data.forEach((item: any) => {
        map[item.uniqueId] = {
          status: item.status,
        };
      });

      setSavedMediaMap(map);
    };

    fetchUserMedia();
  }, []);

  // ✅ MARCAR COMO VISTO (SALVA NO BACK)
  const handleMarkAsDone = useCallback((media: NormalizedMedia) => {
    setSelectedMedia(media);
    setIsModalOpen(true);
  }, []);

  const handleModalConfirm = useCallback(
    (data: { rating: number; review: string }) => {
      if (selectedMedia) {
        setSavedMediaMap((prev) => ({
          ...prev,
          [selectedMedia.uniqueId]: { status: "VISTO" },
        }));
      }
    },
    [selectedMedia]
  );

  // 🔍 BUSCA EXTERNA
  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setError(null);
      setResults([]);

      if (!query.trim()) {
        setError("Por favor, insira um termo de pesquisa válido.");
        return;
      }

      setIsLoading(true);

      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          localStorage.removeItem("userToken");
          window.location.reload();
          return;
        }

        const encodedQuery = encodeURIComponent(query);
        const url = `/api/search?query=${encodedQuery}&type=${type}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setResults(data.data || []);
        } else {
          setError(data.message || "Erro ao buscar mídia.");
        }
      } catch (err) {
        console.error("Erro de rede:", err);
        setError("Falha na conexão com o servidor.");
      } finally {
        setIsLoading(false);
      }
    },
    [query, type]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="mb-8 p-4 bg-white shadow-md rounded-xl">
        <h1 className="text-3xl font-extrabold text-indigo-700">
          Explorar Mídias
        </h1>
        <p className="text-gray-500">
          Busque filmes, séries e livros para rastrear seu consumo.
        </p>
      </header>

      {/* FORM */}
      <form
        onSubmit={handleSearch}
        className="mb-10 flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-xl shadow-lg"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar título"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4"
            required
          />
        </div>

        <select
          value={type}
          onChange={(e) => setType(e.target.value as MediaType)}
          className="w-full sm:w-48 rounded-lg border border-gray-300 py-3 px-4"
        >
          <option value="filme">Filme</option>
          <option value="serie">Série</option>
          <option value="livro">Livro</option>
        </select>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-32 rounded-lg bg-indigo-600 text-white py-3"
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {/* ERRO */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 flex gap-2">
          <XCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* LOADING */}
      {isLoading && (
        <div className="flex justify-center py-10 text-indigo-600">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          Buscando...
        </div>
      )}

      {/* RESULTADOS */}
      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map((media) => (
            <MediaCard
              key={media.uniqueId}
              media={media}
              status={savedMediaMap[media.uniqueId]?.status}
              onMarkAsDone={handleMarkAsDone}
            />
          ))}
        </div>
      )}
      {selectedMedia && (
        <MediaActionModal
          media={selectedMedia}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
};

export default SearchPage;
