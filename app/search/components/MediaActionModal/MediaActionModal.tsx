"use client";

import { X } from "lucide-react";
import RatingStars from "./RatingStars";
import { useState } from "react";
import { NormalizedMedia } from "@/app/types/media";

interface MediaActionModalProps {
  media: NormalizedMedia | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { rating: number; review: string }) => void;
}

export default function MediaActionModal({
  media,
  isOpen,
  onClose,
  onConfirm,
}: MediaActionModalProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  if (!isOpen || !media) return null;

  const handleConfirm = async () => {
    const token = localStorage.getItem("userToken");
    if (!token || !media) return;

    await fetch("/api/media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uniqueId: media.uniqueId,
        type: media.type,
        title: media.title,
        posterUrl: media.posterUrl,
        releaseYear: media.releaseYear
          ? Number(media.releaseYear)
          : null,
        status: "VISTO",
        rating,
        review,
      }),
    });

    onConfirm({ rating, review });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 relative">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
        >
          <X />
        </button>

        {/* Header */}
        <div className="flex gap-4 mb-6">
          <img
            src={media.posterUrl}
            alt={media.title}
            className="h-32 w-24 rounded-lg object-cover"
          />

          <div>
            <h2 className="text-xl font-semibold">{media.title}</h2>
            <p className="text-sm text-gray-500">{media.releaseYear}</p>
          </div>
        </div>

        {/* Avaliação */}
        <div className="mb-4">
          <p className="mb-2 font-medium">Sua nota</p>
          <RatingStars value={rating} onChange={setRating} />
        </div>

        {/* Review */}
        <div className="mb-6">
          <p className="mb-2 font-medium">Sua avaliação</p>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="O que você achou?"
            className="w-full resize-none rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
          />
        </div>

        {/* Ações */}
        <button
          disabled={rating === 0}
          onClick={handleConfirm}
          className={`w-full rounded-lg py-3 font-semibold text-white transition ${rating === 0
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
            }`}
        >
          Confirmar como visto
        </button>
      </div>
    </div>
  );
}
