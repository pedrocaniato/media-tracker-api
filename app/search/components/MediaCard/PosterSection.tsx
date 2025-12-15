// search/components/MediaCard/PosterSection.tsx

import React from 'react';
import { Film, Tv, Book } from 'lucide-react';

interface PosterSectionProps {
  media: {
    title: string;
    type: 'filme' | 'serie' | 'livro';
    posterUrl?: string;
  };
}

const PosterSection: React.FC<PosterSectionProps> = ({ media }) => {
  const IconComponent =
    media.type === 'filme' ? Film : media.type === 'serie' ? Tv : Book;

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-t-2xl bg-neutral-900 group">
      {/* Poster */}
      <img
        src={
          media.posterUrl ||
          'https://placehold.co/400x600/6366f1/FFFFFF?text=Sem%20P%C3%B4ster'
        }
        alt={`Pôster de ${media.title}`}
        className="
          h-full w-full
          object-contain
          p-3
          transition-transform
          duration-500
          ease-out
          group-hover:scale-105
        "
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            'https://placehold.co/400x600/6366f1/FFFFFF?text=Sem%20P%C3%B4ster';
        }}
      />

      {/* Ícone do tipo */}
      <div className="absolute top-3 right-3 flex items-center justify-center rounded-full bg-indigo-600/90 backdrop-blur-md h-9 w-9 shadow-lg">
        <IconComponent className="h-5 w-5 text-white" />
      </div>
    </div>
  );
};

export default PosterSection;
