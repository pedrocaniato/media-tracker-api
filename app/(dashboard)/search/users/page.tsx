"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Users, SearchX, ArrowLeft } from "lucide-react";
import Link from "next/link";
import UserCard from "@/app/components/UserCard";

export default function UserSearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
      } else {
        setUsers([]);
        setHasSearched(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  async function performSearch(q: string) {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link 
            href="/search" 
            className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold">Descobrir Pessoas</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Search Input Container */}
        <div className="relative mb-12">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 size={18} className="text-zinc-500 animate-spin" />
            ) : (
              <Search size={18} className="text-zinc-500" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou @username..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all text-base placeholder:text-zinc-600"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!hasSearched && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center mb-4 text-zinc-700 border border-zinc-800">
                <Users size={32} />
              </div>
              <h2 className="text-zinc-400 font-medium mb-1">Encontre outros trackers</h2>
              <p className="text-zinc-600 text-sm max-w-xs">
                Busque pelos seus amigos para ver o que eles estão assistindo e suas reviews.
              </p>
            </div>
          )}

          {hasSearched && users.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900/30 flex items-center justify-center mb-4 text-zinc-800 border border-dashed border-zinc-800">
                <SearchX size={32} />
              </div>
              <h2 className="text-zinc-500 font-medium mb-1">Ninguém encontrado</h2>
              <p className="text-zinc-700 text-sm">
                Não encontramos usuários que correspondam a "{query}".
              </p>
            </div>
          )}

          {users.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
