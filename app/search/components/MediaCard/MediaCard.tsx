import React from "react";
import PosterSection from "./PosterSection";
import ActionButton from "./ActionButton";
import { NormalizedMedia } from "@/app/types/media";

export type MediaStatus = "VISTO" | "ASSISTINDO" | "QUERO_VER";

interface MediaCardProps {
  media: NormalizedMedia;
  status?: MediaStatus; // 🔑 vem do banco
  onMarkAsDone: (media: NormalizedMedia) => void;
  onClick?: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  media,
  status,
  onMarkAsDone,
  onClick,
}) => {
  if (!media?.title) return null;

  const isBook = media.type === "livro";
  const isDone = status === "VISTO"; // 🔥 fonte única da verdade

  return (
    <div
      onClick={onClick}
      className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group"
    >
      {/* Poster */}
      <PosterSection media={media} />

      {/* Conteúdo */}
      <div className="relative z-10 -mt-14">
        <div className="mx-3 rounded-xl bg-white p-4 shadow-lg flex flex-col h-full min-h-[160px]">
          {/* Título */}
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
            {media.title}
          </h3>

          {/* Ano */}
          <p className="text-xs text-gray-500 mb-2">
            {media.releaseYear}
          </p>

          {/* Autores (livros) */}
          {isBook && media.authors && media.authors.length > 0 && (
            <p className="text-xs text-gray-600 italic line-clamp-1 mb-3">
              {media.authors.slice(0, 2).join(", ")}
              {media.authors.length > 2 && " et al."}
            </p>
          )}

          {/* Ação */}
          <div className="mt-auto">
            <div onClick={(e) => e.stopPropagation()}>
              {isDone ? (
                <button
                  disabled
                  className="mt-2 w-full rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-white flex items-center justify-center gap-2"
                >
                  ✔ Visto
                </button>
              ) : (
                <ActionButton
                  media={media}
                  onMarkAsDone={onMarkAsDone}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCard;
