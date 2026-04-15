"use client";

import { useState } from "react";
import Tabs from "@/app/components/Tabs";
import ReviewCard from "@/app/components/ReviewCard";
import Link from "next/link";
import { Star, LayoutGrid, Heart, Bookmark, MessageSquare, Plus } from "lucide-react";

interface ProfileContentProps {
  media: any[];
}

export default function ProfileContent({ media }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState("watched");

  const watched = media.filter((m) => m.status === "VISTO");
  const favorites = media.filter((m) => m.isFavorite);
  const watchlist = media.filter((m) => m.status === "QUERO_VER");
  const reviews = media.filter((m) => m.review);

  const tabs = [
    { id: "watched", label: "Vistos", count: watched.length },
    { id: "favorites", label: "Favoritos", count: favorites.length },
    { id: "watchlist", label: "Watchlist", count: watchlist.length },
    { id: "reviews", label: "Reviews", count: reviews.length },
  ];

  const renderGrid = (items: any[]) => {
    if (items.length === 0) return <EmptyState tab={activeTab} />;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link
            key={item.uniqueId}
            href={`/media/${item.uniqueId}`}
            className="group relative block aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
          >
            {item.posterUrl ? (
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                <span className="text-zinc-500 font-bold text-xs uppercase tracking-tighter">
                  {item.title}
                </span>
              </div>
            )}

            {/* Rating Badge */}
            {item.rating && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                <Star size={10} className="fill-yellow-500 text-yellow-500" />
                <span className="text-[10px] font-bold text-white tabular-nums">
                  {item.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-[10px] font-medium truncate">{item.title}</p>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderReviews = (items: any[]) => {
    if (items.length === 0) return <EmptyState tab="reviews" />;

    return (
      <div className="max-w-3xl flex flex-col gap-4">
        {items.map((item) => (
          <ReviewCard key={item.id} media={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="min-h-[400px]">
        {activeTab === "watched" && renderGrid(watched)}
        {activeTab === "favorites" && renderGrid(favorites)}
        {activeTab === "watchlist" && renderGrid(watchlist)}
        {activeTab === "reviews" && renderReviews(reviews)}
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  const config: Record<string, { icon: any; title: string; desc: string }> = {
    watched: {
      icon: <LayoutGrid size={40} />,
      title: "Nada visto ainda",
      desc: "Comece a rastrear seus filmes e séries favoritos para vê-los aqui.",
    },
    favorites: {
      icon: <Heart size={40} />,
      title: "Sem favoritos",
      desc: "Dê um coração para as mídias que você mais amou.",
    },
    watchlist: {
      icon: <Bookmark size={40} />,
      title: "Watchlist vazia",
      desc: "Salve o que você quer ver depois para nunca mais esquecer.",
    },
    reviews: {
      icon: <MessageSquare size={40} />,
      title: "Nenhuma review",
      desc: "Escreva suas impressões sobre o que você assistiu.",
    },
  };

  const { icon, title, desc } = config[tab] || config.watched;

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center text-zinc-500 animate-in fade-in zoom-in duration-500">
      <div className="mb-4 text-zinc-800">{icon}</div>
      <h3 className="text-zinc-400 font-semibold mb-2">{title}</h3>
      <p className="text-sm max-w-xs mb-8">{desc}</p>
      <Link
        href="/search"
        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm font-medium hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
      >
        <Plus size={16} className="text-zinc-500 group-hover:text-white transition-colors" />
        Descobrir mídias
      </Link>
    </div>
  );
}
