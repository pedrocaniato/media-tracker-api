"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings, Pencil } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    id: string;
    username: string | null;
    name: string | null;
    bio: string | null;
    image: string | null;
    stats: {
      watched: number;
      favorites: number;
      reviews: number;
    };
  };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.userId === user.id) {
          setIsOwner(true);
        }
      } catch (e) {
        console.error("Failed to parse token");
      }
    }
  }, [user.id]);

  const displayName = user.name || user.username || "Usuário";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="relative mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
        {/* Profile Image */}
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-zinc-900 border-4 border-black ring-1 ring-zinc-800 flex-shrink-0">
            {user.image ? (
              <img
                src={user.image}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-700 bg-zinc-900">
                {initials}
              </div>
            )}
          </div>
          {isOwner && (
            <Link
              href={`/user/${user.username}/edit`}
              className="absolute bottom-1 right-1 p-2 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform md:p-3"
            >
              <Pencil size={18} />
            </Link>
          )}
        </div>

        {/* Identity & Stats */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              {user.name || user.username}
            </h1>
            <span className="text-zinc-500 font-mono text-lg font-medium self-center md:self-end mb-1">
              @{user.username}
            </span>
          </div>

          <p className="text-zinc-400 max-w-lg mb-6 leading-relaxed italic">
            {user.bio || "Sem bio ainda."}
          </p>

          {/* Stats Bar */}
          <div className="flex justify-center md:justify-start gap-8 border-t border-zinc-800/50 pt-6">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">{user.stats.watched}</span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-600">Vistos</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">{user.stats.favorites}</span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-600">Favoritos</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">{user.stats.reviews}</span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-600">Reviews</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isOwner && (
            <div className="md:self-start">
               <Link 
                href="/settings" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all text-sm font-medium"
               >
                 <Settings size={16} /> Configurações
               </Link>
            </div>
        )}
      </div>
    </div>
  );
}
