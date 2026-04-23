'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import type { PageInfo } from '@/types/viewer';

interface ThumbnailStripProps {
  pages: PageInfo[];
  currentPage: number;
  onPageSelect: (page: number) => void;
}

const THUMB_HEIGHT = 80;

export default function ThumbnailStrip({
  pages,
  currentPage,
  onPageSelect,
}: ThumbnailStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [currentPage]);

  return (
    <div className="shrink-0 border-t border-zinc-200 bg-white">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-4 py-3"
      >
        {pages.map((page, idx) => {
          const pageNum = idx + 1;
          const isActive = pageNum === currentPage;
          const thumbWidth = Math.round(
            (page.width / page.height) * THUMB_HEIGHT,
          );

          return (
            <button
              key={pageNum}
              ref={isActive ? activeRef : undefined}
              onClick={() => onPageSelect(pageNum)}
              className={`group relative shrink-0 overflow-hidden rounded transition-all ${
                isActive
                  ? 'ring-2 ring-blue-500 ring-offset-1'
                  : 'ring-1 ring-zinc-200 hover:ring-zinc-400'
              }`}
              style={{ width: thumbWidth, height: THUMB_HEIGHT }}
            >
              <Image
                src={`/output/${page.image}`}
                alt={`${pageNum}페이지`}
                width={thumbWidth}
                height={THUMB_HEIGHT}
                className="h-full w-full object-cover"
                draggable={false}
              />
              <span
                className={`absolute bottom-0 left-0 right-0 text-center text-[10px] leading-4 ${
                  isActive
                    ? 'bg-blue-500 font-semibold text-white'
                    : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
                }`}
              >
                {pageNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
