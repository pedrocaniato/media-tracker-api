import React from 'react';
import PosterSection from './PosterSection';
import ActionButton from './ActionButton';


interface NormalizedMedia {
uniqueId: string;
type: 'filme' | 'serie' | 'livro';
title: string;
releaseYear: string;
posterUrl?: string;
authors?: string[];
}


interface MediaCardProps {
media: NormalizedMedia;
onMarkAsDone?: (media: NormalizedMedia) => void;
}


const MediaCard: React.FC<MediaCardProps> = ({ media, onMarkAsDone }) => {
if (!media?.title) return null;


const isBook = media.type === 'livro';


return (
<div className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group">
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
<p className="text-xs text-gray-500 mb-2">{media.releaseYear}</p>


{/* Autores (livros) */}
{isBook && media.authors && media.authors.length > 0 && (
<p className="text-xs text-gray-600 italic line-clamp-1 mb-3">
{media.authors.slice(0, 2).join(', ')}
{media.authors.length > 2 && ' et al.'}
</p>
)}


{/* Ação */}
<div className="mt-auto">
  <ActionButton media={media} onMarkAsDone={onMarkAsDone} />
</div>
</div>
</div>
</div>
);
};


export default MediaCard;