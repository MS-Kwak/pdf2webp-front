// --- 황형 변환 결과물 데이터 구조 ---

/** manifest.json 내 개별 페이지 정보 */
export interface PageInfo {
  image: string; // "pages/page_001.webp"
  text: string; // "pages/page_001.json"
  width: number; // 1200
  height: number; // 1698
}

/** manifest.json 목차 항목 (실제 작업 시 황형이 채워줄 예정) */
export interface TocItem {
  title: string;
  page: number;
}

/** manifest.json 전체 구조 */
export interface Manifest {
  totalPages: number;
  toc: TocItem[];
  pages: PageInfo[];
}

/** page_XXX.json 내 개별 텍스트 블록 */
export interface TextBlock {
  content: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** page_XXX.json 전체 구조 */
export interface PageTexts {
  texts: TextBlock[];
}

// --- 뷰어 상태 관리용 타입 ---

export interface ViewerState {
  currentPage: number;
  totalPages: number;
  zoom: number;
  isTocOpen: boolean;
  isSearchOpen: boolean;
}

export interface SearchHit {
  pageNumber: number;
  blockIndex: number;
  block: TextBlock;
}

export interface SearchResult {
  query: string;
  hits: SearchHit[];
  currentHitIndex: number;
}
