import { useQuery } from '@tanstack/react-query';
import type { SearchHit } from '@/types/viewer';

interface SearchResponse {
  query: string;
  hits: SearchHit[];
}

async function fetchSearch(query: string): Promise<SearchResponse> {
  if (!query.trim()) return { query: '', hits: [] };
  const res = await fetch(
    `/api/viewer/search?q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) throw new Error('검색 실패');
  return res.json();
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchSearch(query),
    enabled: query.trim().length > 0,
    placeholderData: (prev) => prev,
  });
}
