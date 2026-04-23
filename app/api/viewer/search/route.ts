import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Manifest, PageTexts } from '@/types/viewer';
import type { SearchHit } from '@/types/viewer';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'output');

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json({ query: '', hits: [] });
  }

  try {
    const manifestRaw = await fs.readFile(
      path.join(OUTPUT_DIR, 'manifest.json'),
      'utf-8',
    );
    const manifest: Manifest = JSON.parse(manifestRaw);
    const lowerQuery = query.toLowerCase();
    const hits: SearchHit[] = [];

    const readPromises = manifest.pages.map(async (page, idx) => {
      const textRaw = await fs.readFile(
        path.join(OUTPUT_DIR, page.text),
        'utf-8',
      );
      const pageTexts: PageTexts = JSON.parse(textRaw);
      const pageHits: SearchHit[] = [];

      pageTexts.texts.forEach((block, blockIndex) => {
        if (block.content.toLowerCase().includes(lowerQuery)) {
          pageHits.push({
            pageNumber: idx + 1,
            blockIndex,
            block,
          });
        }
      });

      return pageHits;
    });

    const results = await Promise.all(readPromises);
    results.forEach((pageHits) => hits.push(...pageHits));

    return NextResponse.json({ query, hits });
  } catch {
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 },
    );
  }
}
