"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type CastMember = {
  id: number;
  name: string;
  character: string;
  profileUrl: string | null;
};

type PublicMedia = {
  uniqueId: string;
  type: string;
  title: string;
  releaseYear: number;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  cast: CastMember[];
};

export default function MediaDetailsPage() {
  const params = useParams<{ id: string }>();
  const mediaId = decodeURIComponent(params.id);

  const [media, setMedia] = useState<PublicMedia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mediaId) return;

    async function loadMedia() {
      try {
        const [source, type, id] = mediaId.split(":");

        const res = await fetch(
          `/api/public/media/${source}/${type}/${id}`
        );

        if (!res.ok) throw new Error("Erro ao buscar mídia");

        const data = await res.json();
        setMedia(data.media);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMedia();
  }, [mediaId]);

  if (loading) {
    return <div className="p-10 text-white">Carregando...</div>;
  }

  if (!media) {
    return <div className="p-10 text-red-400">Mídia não encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">

      {/* BACKDROP */}
      <div
        className="h-[420px] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${media.backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="relative z-10 -mt-40 max-w-7xl mx-auto px-6 grid grid-cols-[260px_1fr_280px] gap-10">

        {/* POSTER */}
        <div>
          <img
            src={media.posterUrl}
            alt={media.title}
            className="w-full rounded-xl shadow-2xl"
          />
        </div>

        {/* CONTEÚDO CENTRAL */}
        <div>
          <h1 className="text-4xl font-bold">{media.title}</h1>
          <p className="text-neutral-400 mt-1">
            {media.releaseYear} • {media.type}
          </p>

          <p className="mt-6 text-neutral-300 leading-relaxed max-w-2xl">
            {media.overview}
          </p>

          {/* CAST */}
          {media.cast && media.cast.length > 0 && (
            <div className="mt-14">
              <h2 className="text-2xl font-semibold mb-6">
                Elenco principal
              </h2>

              <div className="flex flex-wrap gap-3">
                {media.cast.map((actor) => (
                  <button
                    key={actor.id}
                    className="bg-neutral-800 hover:bg-neutral-700 transition px-4 py-2 rounded-lg text-sm"
                  >
                    {actor.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR DIREITA */}
        <div className="bg-neutral-900 rounded-xl p-6 h-fit space-y-6 shadow-xl border border-neutral-800 sticky top-28">

          {/* Rating médio fake por enquanto */}
          <div>
            <p className="text-sm text-neutral-400">Rating médio</p>
            <div className="text-3xl font-bold">4.3 ★</div>
          </div>

          {/* Curtido */}
          <button className="w-full bg-neutral-800 hover:bg-neutral-700 transition py-3 rounded-lg">
            ❤️ Curtir
          </button>

          {/* Visto */}
          <button className="w-full bg-neutral-800 hover:bg-neutral-700 transition py-3 rounded-lg">
            👁 Marcar como visto
          </button>

          {/* Avaliação */}
          <div>
            <p className="text-sm text-neutral-400 mb-2">
              Sua nota
            </p>
            <div className="flex gap-2 text-2xl cursor-pointer">
              {"★★★★★".split("").map((_, i) => (
                <span
                  key={i}
                  className="hover:text-yellow-400 transition"
                >
                  ★
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
