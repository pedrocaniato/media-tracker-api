import { Star } from "lucide-react";
import Link from "next/link";

interface ReviewCardProps {
  media: {
    uniqueId: string;
    type: string;
    title: string;
    posterUrl: string | null;
    rating: number | null;
    review: string | null;
    updatedAt: Date | string;
  };
}

export default function ReviewCard({ media }: ReviewCardProps) {
  const date = new Date(media.updatedAt).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex gap-4 p-5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
      {/* Poster */}
      <Link 
        href={`/media/${media.uniqueId}`}
        className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-800 hover:border-zinc-600 transition-colors"
      >
        {media.posterUrl ? (
          <img
            src={media.posterUrl}
            alt={media.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700 text-[10px] uppercase font-bold text-center p-2">
            No Image
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-1">
          <Link href={`/media/${media.uniqueId}`} className="hover:underline transition-all">
            <h4 className="text-white font-medium truncate">{media.title}</h4>
          </Link>
          <span className="text-[10px] text-zinc-600 font-medium whitespace-nowrap">{date}</span>
        </div>

        {/* Rating Stars */}
        {media.rating !== null && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.floor(media.rating!) 
                  ? "fill-yellow-500 text-yellow-500" 
                  : i < media.rating! 
                  ? "fill-yellow-500/50 text-yellow-500" 
                  : "text-zinc-800"
                }
              />
            ))}
            <span className="ml-1 text-[11px] text-zinc-500 font-mono">
              {media.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Review Text */}
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-4 italic">
          "{media.review || "Sem comentário."}"
        </p>
      </div>
    </div>
  );
}
