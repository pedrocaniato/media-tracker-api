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
  const isBook = media.type === "livro";

  const handleMarkAsDone = () => {
    onMarkAsDone?.(media);
  };

  return (
    <button
      onClick={() => onMarkAsDone?.(media)}
      disabled={done}
      className={`
        w-full rounded-xl px-3 py-2 text-sm font-semibold
        transition-all duration-200
        ${done
          ? "bg-emerald-500 text-white cursor-default"
          : "border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
        }
      `}
    >
      {done
        ? "✔ Visto"
        : `Marcar como ${isBook ? "Lido" : "Visto"}`}
    </button>
  );
};

export default ActionButton;
