// ============================================================
// VOIX — Star Rating
// Interactive premium star rating component
// ============================================================

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Props {
  rating: number;
  onChange: (rating: number) => void;
  accentColor: string;
  size?: number;
}

export function StarRating({
  rating,
  onChange,
  accentColor,
  size = 40,
}: Props) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating);

        return (
          <motion.button
            key={star}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="relative transition-colors"
            style={{ width: size, height: size }}
          >
            <Star
              className="w-full h-full transition-all duration-200"
              style={{
                fill: isFilled ? accentColor : "transparent",
                color: isFilled ? accentColor : "currentColor",
                opacity: isFilled ? 1 : 0.3,
              }}
            />
            {isFilled && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 -z-10"
                style={{
                  background: `radial-gradient(circle, ${accentColor}30 0%, transparent 70%)`,
                  borderRadius: "50%",
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
