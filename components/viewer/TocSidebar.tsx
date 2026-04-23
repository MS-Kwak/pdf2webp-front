'use client';

import { X } from 'lucide-react';
import type { TocItem } from '@/types/viewer';

interface TocSidebarProps {
  toc: TocItem[];
  currentPage: number;
  onPageSelect: (page: number) => void;
  onClose: () => void;
}

export default function TocSidebar({
  toc,
  currentPage,
  onPageSelect,
  onClose,
}: TocSidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-12 items-center justify-between border-b border-zinc-200 px-4">
        <span className="text-sm font-medium text-zinc-700">
          목차
        </span>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-100"
        >
          <X className="h-4 w-4 text-zinc-500" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {toc.map((item, idx) => {
          const isActive =
            currentPage >= item.page &&
            (idx === toc.length - 1 ||
              currentPage < toc[idx + 1].page);

          return (
            <button
              key={`${item.page}-${idx}`}
              onClick={() => onPageSelect(item.page)}
              className={`flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-100 font-medium text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <span className="shrink-0 text-xs text-zinc-400 pt-0.5">
                {item.page}
              </span>
              <span className="leading-snug">{item.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
