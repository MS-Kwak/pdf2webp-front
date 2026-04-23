import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Manifest, PageTexts } from '@/types/viewer';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'output');

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ num: string }> },
) {
  const { num } = await params;
  const pageNum = parseInt(num, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return NextResponse.json(
      { error: '유효하지 않은 페이지 번호입니다' },
      { status: 400 },
    );
  }

  try {
    const manifestRaw = await fs.readFile(
      path.join(OUTPUT_DIR, 'manifest.json'),
      'utf-8',
    );
    const manifest: Manifest = JSON.parse(manifestRaw);

    if (pageNum > manifest.totalPages) {
      return NextResponse.json(
        {
          error: `페이지 범위 초과 (총 ${manifest.totalPages}페이지)`,
        },
        { status: 404 },
      );
    }

    const page = manifest.pages[pageNum - 1];
    const textRaw = await fs.readFile(
      path.join(OUTPUT_DIR, page.text),
      'utf-8',
    );
    const pageTexts: PageTexts = JSON.parse(textRaw);

    return NextResponse.json({
      pageNumber: pageNum,
      width: page.width,
      height: page.height,
      ...pageTexts,
    });
  } catch {
    return NextResponse.json(
      { error: '페이지 텍스트 데이터를 찾을 수 없습니다' },
      { status: 404 },
    );
  }
}
