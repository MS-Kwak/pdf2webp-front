'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';
import type { SearchHit } from '@/types/viewer';

interface SearchBarProps {
  onClose: () => void;
  onNavigate: (hit: SearchHit, index: number) => void;
  onResultsChange: (hits: SearchHit[]) => void;
  currentPage: number;
}

export default function SearchBar({
  onClose,
  onNavigate,
  onResultsChange,
  currentPage,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = useSearch(debouncedQuery);
  const hits = useMemo(() => data?.hits ?? [], [data]);
  const totalHits = hits.length;

  const prevHitsRef = useRef<SearchHit[]>([]);
  useEffect(() => {
    if (prevHitsRef.current !== hits) {
      prevHitsRef.current = hits;
      onResultsChange(hits);
    }
  }, [hits, onResultsChange]);

  const hitIndex = useMemo(() => {
    if (totalHits === 0) return 0;
    const idx = hits.findIndex((h) => h.pageNumber >= currentPage);
    return idx >= 0 ? idx : 0;
  }, [totalHits, currentPage, hits]);

  const [manualHit, setManualHit] = useState<{
    query: string;
    index: number;
  } | null>(null);
  const activeHitIndex =
    manualHit && manualHit.query === debouncedQuery
      ? manualHit.index
      : hitIndex;

  const goPrev = () => {
    if (totalHits === 0) return;
    const next = (activeHitIndex - 1 + totalHits) % totalHits;
    setManualHit({ query: debouncedQuery, index: next });
    onNavigate(hits[next], next);
  };

  const goNext = () => {
    if (totalHits === 0) return;
    const next = (activeHitIndex + 1) % totalHits;
    setManualHit({ query: debouncedQuery, index: next });
    onNavigate(hits[next], next);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') {
      if (e.shiftKey) goPrev();
      else goNext();
    }
  };

  return (
    <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2">
      <Search className="h-[18px] w-[18px] shrink-0 text-zinc-600" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="텍스트 검색..."
        className="flex-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
      />

      {debouncedQuery && (
        <span className="shrink-0 text-xs font-medium text-zinc-700">
          {isFetching
            ? '검색 중...'
            : totalHits > 0
              ? `${activeHitIndex + 1} / ${totalHits}`
              : '결과 없음'}
        </span>
      )}

      <div className="flex items-center gap-0.5">
        <button
          onClick={goPrev}
          disabled={totalHits === 0}
          className="flex h-7 w-7 items-center justify-center rounded text-zinc-700 transition-colors hover:bg-zinc-200 disabled:opacity-30"
        >
          <ChevronUp className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={goNext}
          disabled={totalHits === 0}
          className="flex h-7 w-7 items-center justify-center rounded text-zinc-700 transition-colors hover:bg-zinc-200 disabled:opacity-30"
        >
          <ChevronDown className="h-[18px] w-[18px]" />
        </button>
      </div>

      <button
        onClick={onClose}
        className="flex h-7 w-7 items-center justify-center rounded text-zinc-700 transition-colors hover:bg-zinc-200"
      >
        <X className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
