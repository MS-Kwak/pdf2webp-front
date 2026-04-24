'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useManifest } from '@/hooks/use-manifest';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  List,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
} from 'lucide-react';
import TocSidebar from './TocSidebar';
import SearchBar from './SearchBar';
import SearchHighlights from './SearchHighlights';
import ThumbnailStrip from './ThumbnailStrip';
import type { SearchHit } from '@/types/viewer';

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

export default function PDFViewer() {
  const { data: manifest, isLoading, error } = useManifest();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchHits, setSearchHits] = useState<SearchHit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentHitIndex, setCurrentHitIndex] = useState(-1);
  const mainRef = useRef<HTMLElement>(null);

  const goToPage = useCallback(
    (page: number) => {
      if (!manifest) return;
      const clamped = Math.max(
        1,
        Math.min(page, manifest.totalPages),
      );
      setCurrentPage(clamped);
      setPageInput(String(clamped));
    },
    [manifest],
  );

  const handlePageInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter') {
      const num = parseInt(pageInput, 10);
      if (!isNaN(num)) goToPage(num);
    }
  };

  const handlePageInputBlur = () => {
    const num = parseInt(pageInput, 10);
    if (!isNaN(num)) goToPage(num);
    else setPageInput(String(currentPage));
  };

  const handleSearchNavigate = useCallback(
    (hit: SearchHit, index: number) => {
      goToPage(hit.pageNumber);
      setCurrentHitIndex(index);
    },
    [goToPage],
  );

  const handleSearchResultsChange = useCallback(
    (hits: SearchHit[], query: string) => {
      setSearchHits(hits);
      setSearchQuery(query);
      setCurrentHitIndex(hits.length > 0 ? 0 : -1);
    },
    [],
  );

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchHits([]);
    setSearchQuery('');
    setCurrentHitIndex(-1);
  };

  const zoomIn = () =>
    setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX));
  const zoomOut = () =>
    setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN));
  const zoomReset = () => setZoom(1);
  const zoomPercent = Math.round(zoom * 100);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !manifest) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">문서를 불러올 수 없습니다</p>
      </div>
    );
  }

  const page = manifest.pages[currentPage - 1];
  const imageUrl = `/output/${page.image}`;
  const isFirst = currentPage === 1;
  const isLast = currentPage === manifest.totalPages;
  const hasToc = manifest.toc.length > 0;

  return (
    <div className="flex h-screen flex-col bg-zinc-100">
      {/* 상단 툴바 */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4">
        <div className="flex items-center gap-1">
          {hasToc && (
            <button
              onClick={() => setIsTocOpen((v) => !v)}
              className={`flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-zinc-200 ${
                isTocOpen
                  ? 'bg-zinc-200 text-zinc-900'
                  : 'text-zinc-700'
              }`}
              title="목차"
            >
              <List className="h-[18px] w-[18px]" />
            </button>
          )}
          <span className="text-sm font-semibold text-zinc-900">
            PDF 뷰어
          </span>
          <button
            onClick={() => setIsSearchOpen((v) => !v)}
            className={`flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-zinc-200 ${
              isSearchOpen
                ? 'bg-zinc-200 text-zinc-900'
                : 'text-zinc-700'
            }`}
            title="검색 (Ctrl+F)"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* 네비게이션 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={isFirst}
            className="flex h-8 w-8 items-center justify-center rounded text-zinc-700 transition-colors hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1.5 text-sm text-zinc-800">
            <input
              type="text"
              inputMode="numeric"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={handlePageInputKeyDown}
              onBlur={handlePageInputBlur}
              className="w-12 rounded border border-zinc-300 bg-zinc-50 px-2 py-1 text-center text-sm font-medium text-zinc-900 focus:border-zinc-500 focus:outline-none"
            />
            <span className="font-medium">
              / {manifest.totalPages}
            </span>
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={isLast}
            className="flex h-8 w-8 items-center justify-center rounded text-zinc-700 transition-colors hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* 줌 컨트롤 */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={zoom <= ZOOM_MIN}
            className="flex h-8 w-8 items-center justify-center rounded text-zinc-700 transition-colors hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="축소"
          >
            <ZoomOut className="h-[18px] w-[18px]" />
          </button>

          <button
            onClick={zoomReset}
            className="min-w-12 rounded px-1.5 py-1 text-center text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-200"
            title="원래 크기"
          >
            {zoomPercent}%
          </button>

          <button
            onClick={zoomIn}
            disabled={zoom >= ZOOM_MAX}
            className="flex h-8 w-8 items-center justify-center rounded text-zinc-700 transition-colors hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="확대"
          >
            <ZoomIn className="h-[18px] w-[18px]" />
          </button>

          <button
            onClick={zoomReset}
            className="flex h-8 w-8 items-center justify-center rounded text-zinc-700 transition-colors hover:bg-zinc-200"
            title="초기화"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 검색바 */}
      {isSearchOpen && (
        <SearchBar
          onClose={handleSearchClose}
          onNavigate={handleSearchNavigate}
          onResultsChange={handleSearchResultsChange}
          currentPage={currentPage}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* 목차 사이드바 */}
        {hasToc && isTocOpen && (
          <TocSidebar
            toc={manifest.toc}
            currentPage={currentPage}
            onPageSelect={(p) => {
              goToPage(p);
              setIsTocOpen(false);
            }}
            onClose={() => setIsTocOpen(false)}
          />
        )}

        {/* 페이지 이미지 영역 */}
        <main
          ref={mainRef}
          className="flex flex-1 items-start justify-center overflow-auto p-4"
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              if (e.deltaY < 0) zoomIn();
              else zoomOut();
            }
          }}
        >
          <div
            className="relative shadow-lg transition-transform duration-150 origin-top"
            style={{
              width: page.width * zoom,
              aspectRatio: `${page.width} / ${page.height}`,
            }}
          >
            <Image
              src={imageUrl}
              alt={`${currentPage}페이지`}
              width={page.width}
              height={page.height}
              className="h-auto w-full"
              draggable={false}
              priority
            />
            <SearchHighlights
              hits={searchHits.filter(
                (h) => h.pageNumber === currentPage,
              )}
              query={searchQuery}
              currentHitIndex={
                searchHits[currentHitIndex]?.pageNumber ===
                currentPage
                  ? searchHits
                      .filter((h) => h.pageNumber === currentPage)
                      .findIndex(
                        (h) =>
                          h.blockIndex ===
                          searchHits[currentHitIndex]?.blockIndex,
                      )
                  : -1
              }
              pageWidth={page.width}
              pageHeight={page.height}
            />
          </div>
        </main>
      </div>

      {/* 하단 썸네일 스트립 */}
      <ThumbnailStrip
        pages={manifest.pages}
        currentPage={currentPage}
        onPageSelect={goToPage}
      />
    </div>
  );
}
