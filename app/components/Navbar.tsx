"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useSearch } from "@/app/context/SearchContext";
import { User, LogOut, Search as SearchIcon, Film, X } from "lucide-react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  children?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const { query, setQuery, handleSearch, clearSearch } = useSearch();
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 w-full px-6 sm:px-10"
      style={{
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #27272a", // zinc-800
      }}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-16 gap-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-8 flex-1">
          <Link href="/search" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <Film size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="text-sm font-bold tracking-tight hidden lg:block">
              MEDIA TRACKER
            </span>
          </Link>

          {/* Search bar - available globally */}
          <form
            onSubmit={handleSearch}
            className="flex-1 flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-150 max-w-md bg-zinc-900/50 border border-zinc-800 focus-within:border-indigo-500/50"
          >
            <SearchIcon size={14} strokeWidth={1.5} className="text-zinc-500 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar filmes, séries..."
              className="flex-1 bg-transparent outline-none text-sm text-zinc-200 placeholder:text-zinc-600"
            />
            {query && (
              <button type="button" onClick={clearSearch}>
                <X size={13} strokeWidth={1.5} className="text-zinc-500 hover:text-zinc-300" />
              </button>
            )}
            <button type="submit" className="hidden" />
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          {/* Slot for page-specific controls (like media type toggle) */}
          <div className="hidden md:flex">
            {children}
          </div>

          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full skeleton" />
              <div className="w-20 h-4 skeleton hidden sm:block" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/user/${user.username || user.id}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity p-1 rounded-full sm:rounded-lg sm:px-2 sm:py-1 sm:bg-zinc-900/50 sm:border sm:border-zinc-800"
              >
                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden shrink-0">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user.username || user.id}&background=6366f1&color=fff`} 
                    alt={user.username || "perfil"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-medium text-zinc-300 hidden sm:block">
                  {user.username || "Completar Perfil"}
                </span>
              </Link>
              
              <button
                onClick={logout}
                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
