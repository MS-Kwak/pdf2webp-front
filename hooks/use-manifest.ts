import { useQuery } from '@tanstack/react-query';
import type { Manifest } from '@/types/viewer';

async function fetchManifest(): Promise<Manifest> {
  const res = await fetch('/api/viewer');
  if (!res.ok) throw new Error('manifest 로딩 실패');
  return res.json();
}

export function useManifest() {
  return useQuery({
    queryKey: ['manifest'],
    queryFn: fetchManifest,
  });
}
