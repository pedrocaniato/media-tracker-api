import React from 'react';
import { Eye, Check } from 'lucide-react';
import { NormalizedMedia } from '@/app/types/media';

interface ActionButtonProps {
  media: NormalizedMedia;
  onMarkAsDone?: (media: NormalizedMedia) => void;
  done?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  media,
  onMarkAsDone,
  done = false,
}) => {
  const isBook = media.type === 'livro';

  const handleMarkAsDone = () => {
    onMarkAsDone?.(media);
  };

  return (
    <button
      onClick={handleMarkAsDone}
      className={`
        group mt-2 flex w-full items-center justify-center gap-2
        rounded-xl px-3 py-2 text-sm font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50
        ${
          done
            ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600'
            : 'border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white shadow-sm'
        }
      `}
      aria-label={done ? 'Concluído' : `Marcar como ${isBook ? 'lido' : 'visto'}`}
    >
      {done ? (
        <Check className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
      )}

      <span className="whitespace-nowrap">
        {done ? 'Concluído' : `Marcar como ${isBook ? 'Lido' : 'Visto'}`}
      </span>
    </button>
  );
};

export default ActionButton;
