"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

export default function RatingStars({
  value,
  onChange,
  readonly = false,
}: RatingStarsProps) {
  const stars = Array.from({ length: 5 });

  const handleChange = (val: number) => {
    if (readonly) return;
    onChange?.(val);
  };

  return (
    <div className="flex gap-1">
      {stars.map((_, index) => {
        const full = index + 1;
        const half = index + 0.5;

        return (
          <div key={index} className="relative flex">
            {/* meia estrela */}
            <Star
              onClick={() => handleChange(half)}
              className={`h-7 w-7 ${
                readonly ? "cursor-default" : "cursor-pointer"
              } ${
                value >= half
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              } absolute left-0`}
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />

            {/* estrela cheia */}
            <Star
              onClick={() => handleChange(full)}
              className={`h-7 w-7 ${
                readonly ? "cursor-default" : "cursor-pointer"
              } ${
                value >= full
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
