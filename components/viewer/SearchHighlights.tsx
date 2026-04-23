'use client';

import type { SearchHit } from '@/types/viewer';

interface SearchHighlightsProps {
  hits: SearchHit[];
  currentHitIndex: number;
  pageWidth: number;
  pageHeight: number;
}

export default function SearchHighlights({
  hits,
  currentHitIndex,
  pageWidth,
  pageHeight,
}: SearchHighlightsProps) {
  if (hits.length === 0) return null;

  return (
    <>
      {hits.map((hit, idx) => {
        const isActive = idx === currentHitIndex;
        const { x, y, w, h } = hit.block;

        return (
          <div
            key={`${hit.blockIndex}-${idx}`}
            className="absolute pointer-events-none"
            style={{
              left: `${(x / pageWidth) * 100}%`,
              top: `${(y / pageHeight) * 100}%`,
              width: `${(w / pageWidth) * 100}%`,
              height: `${(h / pageHeight) * 100}%`,
              backgroundColor: isActive
                ? 'rgba(251, 146, 60, 0.4)'
                : 'rgba(250, 204, 21, 0.3)',
              border: isActive
                ? '2px solid rgba(251, 146, 60, 0.8)'
                : 'none',
              borderRadius: '2px',
            }}
          />
        );
      })}
    </>
  );
}
