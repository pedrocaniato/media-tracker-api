"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

type MediaType = "filme" | "serie" | "livro";

interface SearchContextType {
  query: string;
  setQuery: (q: string) => void;
  type: MediaType;
  setType: (t: MediaType) => void;
  handleSearch: (e?: React.FormEvent) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MediaType>("filme");
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    // Se não estiver na página de busca, navega para lá
    if (pathname !== "/search") {
      router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    }
  }, [query, type, pathname, router]);

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <SearchContext.Provider value={{ query, setQuery, type, setType, handleSearch, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch deve ser usado dentro de um SearchProvider");
  }
  return context;
};
