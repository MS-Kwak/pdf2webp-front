'use client';

import { useMemo } from 'react';
import type { SearchHit } from '@/types/viewer';

interface SearchHighlightsProps {
  hits: SearchHit[];
  query: string;
  currentHitIndex: number;
  pageWidth: number;
  pageHeight: number;
}

interface HighlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
  isActive: boolean;
  key: string;
}

let _canvas: HTMLCanvasElement | null = null;
function getCanvas(): HTMLCanvasElement {
  if (!_canvas) {
    _canvas = document.createElement('canvas');
  }
  return _canvas;
}

function measureText(text: string, fontSize: number): number {
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${fontSize}px "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  return ctx.measureText(text).width;
}

function calcWordRects(
  hit: SearchHit,
  query: string,
  isActive: boolean,
  pageWidth: number,
  pageHeight: number,
  hitIdx: number,
): HighlightRect[] {
  const { x, y, w, h } = hit.block;
  const content = hit.block.content;
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const rects: HighlightRect[] = [];

  if (content.length === 0 || lowerQuery.length === 0) return rects;

  const fontSize = h;
  const totalMeasured = measureText(content, fontSize);
  if (totalMeasured === 0) return rects;

  let searchFrom = 0;
  let matchIdx = 0;
  while (true) {
    const pos = lowerContent.indexOf(lowerQuery, searchFrom);
    if (pos === -1) break;

    const beforeMeasured = measureText(
      content.slice(0, pos),
      fontSize,
    );
    const matchMeasured = measureText(
      content.slice(pos, pos + query.length),
      fontSize,
    );

    const offsetRatio = beforeMeasured / totalMeasured;
    const widthRatio = matchMeasured / totalMeasured;

    rects.push({
      left: ((x + w * offsetRatio) / pageWidth) * 100,
      top: (y / pageHeight) * 100,
      width: ((w * widthRatio) / pageWidth) * 100,
      height: (h / pageHeight) * 100,
      isActive,
      key: `${hitIdx}-${matchIdx}`,
    });

    searchFrom = pos + 1;
    matchIdx++;
  }

  return rects;
}

export default function SearchHighlights({
  hits,
  query,
  currentHitIndex,
  pageWidth,
  pageHeight,
}: SearchHighlightsProps) {
  const allRects = useMemo(() => {
    if (hits.length === 0 || !query) return [];

    const rects: HighlightRect[] = [];
    hits.forEach((hit, idx) => {
      const isActive = idx === currentHitIndex;
      rects.push(
        ...calcWordRects(
          hit,
          query,
          isActive,
          pageWidth,
          pageHeight,
          idx,
        ),
      );
    });
    return rects;
  }, [hits, query, currentHitIndex, pageWidth, pageHeight]);

  if (allRects.length === 0) return null;

  const PAD_X = (3 / pageWidth) * 100;
  const PAD_Y = (1 / pageHeight) * 100;

  return (
    <>
      {allRects.map((rect) => (
        <div
          key={rect.key}
          className="absolute pointer-events-none"
          style={{
            left: `${rect.left - PAD_X}%`,
            top: `${rect.top - PAD_Y}%`,
            width: `${rect.width + PAD_X * 2}%`,
            height: `${rect.height + PAD_Y * 2}%`,
            backgroundColor: rect.isActive
              ? 'rgba(251, 146, 60, 0.45)'
              : 'rgba(250, 204, 21, 0.35)',
            border: rect.isActive
              ? '2px solid rgba(251, 146, 60, 0.9)'
              : 'none',
            borderRadius: '3px',
          }}
        />
      ))}
    </>
  );
}
