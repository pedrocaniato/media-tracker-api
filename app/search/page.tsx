// NOVO CÓDIGO para /search/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
// Importação do componente MediaCard da nova pasta
import MediaCard from "./components/MediaCard/MediaCard"; 
import { Search, Loader2, XCircle } from "lucide-react"; 
import { NormalizedMedia } from '@/app/types/media';

type MediaType = "filme" | "serie" | "livro";

// --- Componente Principal: SearchPage ---

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MediaType>("filme");
  const [results, setResults] = useState<NormalizedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("userToken")) {
      localStorage.removeItem("userToken");
      window.location.reload();
    }
  }, []); 

  const handleMarkAsDone = useCallback((media: NormalizedMedia) => {
    console.log(
      `Preparando para salvar a mídia: ${media.title} (${media.uniqueId})`
    ); 
  }, []); 

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
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setResults(data.data || []);
        } else {
          setError(
            data.message || `Erro ao buscar mídia. Código: ${response.status}`
          );
          if (response.status === 401) {
            setError(
              "Sessão expirada ou inválida. Redirecionando para login..."
            );
            localStorage.removeItem("userToken");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Erro de rede/servidor:", err);
        setError("Falha na conexão. Verifique o servidor de backend.");
      } finally {
        setIsLoading(false);
      }
    },
    [query, type]
  ); 

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <header className="mb-8 p-4 bg-white shadow-md rounded-xl">
        <h1 className="text-3xl font-extrabold text-indigo-700">Explorar Mídias</h1>
        <p className="text-gray-500">Busque filmes, séries e livros para rastrear seu consumo.</p>
      </header>
      
      {/* Formulário de Busca */}
      <form
        onSubmit={handleSearch}
        className="mb-10 flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-xl shadow-lg"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar título (ex: Harry Potter, Matrix)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150 ease-in-out"
            required
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MediaType)}
          className="w-full sm:w-48 rounded-lg border border-gray-300 py-3 px-4 text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150 ease-in-out bg-white"
        >
          <option value="filme">Filme</option> 
          <option value="serie">Série</option> 
          <option value="livro">Livro</option> 
        </select>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className={`w-full sm:w-32 flex items-center justify-center rounded-lg py-3 font-semibold text-white transition duration-200 shadow-md 
              ${isLoading || !query.trim()
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg"
            }`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Search className="h-5 w-5 mr-2" />
          )}
          Buscar
        </button>
      </form>
      
      {/* Exibição de Status (Erro ou Loading) */}
      {error && (
        <div className="flex items-center justify-center gap-2 mb-6 rounded-lg bg-red-100 p-4 text-red-700 shadow-inner">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center py-10 text-indigo-600">
          <Loader2 className="h-10 w-10 animate-spin mr-3" />
          <span className="text-xl font-medium">Buscando {type}s...</span>
        </div>
      )}
      
      {/* Exibição de Resultados */}
      {!isLoading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map((media) => (
            <MediaCard
              key={media.uniqueId}
              media={media}
              onMarkAsDone={handleMarkAsDone}
            />
          ))}
        </div>
      )}
      
      {/* Sem Resultados / Sem Busca */}
      {!isLoading && !error && query.trim() && results.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">Nenhum resultado encontrado para &#34;{query}&#34;.</p>
          <p className="text-sm">Tente refinar a sua pesquisa ou mudar o tipo de mídia.</p>
        </div>
      )}
      {!isLoading && !query.trim() && !error && results.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">Comece a buscar para encontrar filmes, séries e livros.</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;