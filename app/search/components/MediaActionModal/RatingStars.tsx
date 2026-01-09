"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RatingStars({ value, onChange }: RatingStarsProps) {
  const stars = Array.from({ length: 5 });

  return (
    <div className="flex gap-1">
      {stars.map((_, index) => {
        const full = index + 1;
        const half = index + 0.5;

        return (
          <div key={index} className="relative flex">
            {/* meia estrela */}
            <Star
              onClick={() => onChange(half)}
              className={`h-7 w-7 cursor-pointer ${
                value >= half ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              } absolute left-0`}
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />

            {/* estrela cheia */}
            <Star
              onClick={() => onChange(full)}
              className={`h-7 w-7 cursor-pointer ${
                value >= full ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
