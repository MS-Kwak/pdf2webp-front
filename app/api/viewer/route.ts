import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Manifest } from '@/types/viewer';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'output');

export async function GET() {
  try {
    const raw = await fs.readFile(
      path.join(OUTPUT_DIR, 'manifest.json'),
      'utf-8',
    );
    const manifest: Manifest = JSON.parse(raw);
    return NextResponse.json(manifest);
  } catch {
    return NextResponse.json(
      { error: 'manifest.json을 찾을 수 없습니다' },
      { status: 404 },
    );
  }
}
