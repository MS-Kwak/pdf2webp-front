'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useManifest } from '@/hooks/use-manifest';
import { Loader2, ChevronLeft, ChevronRight, List, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import TocSidebar from './TocSidebar';

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

export default function PDFViewer() {
  const { data: manifest, isLoading, error } = useManifest();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const mainRef = useRef<HTMLElement>(null);

  const goToPage = useCallback(
    (page: number) => {
      if (!manifest) return;
      const clamped = Math.max(1, Math.min(page, manifest.totalPages));
      setCurrentPage(clamped);
      setPageInput(String(clamped));
    },
    [manifest]
  );

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const zoomIn = () => setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX));
  const zoomOut = () => setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN));
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
        <div className="flex items-center gap-2">
          {hasToc && (
            <button
              onClick={() => setIsTocOpen((v) => !v)}
              className={`flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 ${
                isTocOpen ? 'bg-zinc-100' : ''
              }`}
              title="목차"
            >
              <List className="h-4 w-4" />
            </button>
          )}
          <span className="text-sm font-medium text-zinc-700">PDF 뷰어</span>
        </div>

        {/* 네비게이션 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={isFirst}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1 text-sm text-zinc-600">
            <input
              type="text"
              inputMode="numeric"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={handlePageInputKeyDown}
              onBlur={handlePageInputBlur}
              className="w-12 rounded border border-zinc-300 px-2 py-1 text-center text-sm focus:border-zinc-500 focus:outline-none"
            />
            <span>/ {manifest.totalPages}</span>
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={isLast}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* 줌 컨트롤 */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={zoom <= ZOOM_MIN}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="축소"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <button
            onClick={zoomReset}
            className="min-w-12 rounded px-1 py-1 text-center text-xs text-zinc-600 hover:bg-zinc-100"
            title="원래 크기"
          >
            {zoomPercent}%
          </button>

          <button
            onClick={zoomIn}
            disabled={zoom >= ZOOM_MAX}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="확대"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            onClick={zoomReset}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-zinc-100"
            title="초기화"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

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
          </div>
        </main>
      </div>
    </div>
  );
}
