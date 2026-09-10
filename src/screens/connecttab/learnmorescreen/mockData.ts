export type DiscoverContentType = "article" | "podcast" | "video";

export type DiscoverCategoryFilter = "all" | DiscoverContentType;

export type DiscoverContentItem = {
  id: string;
  title: string;
  thumbnail: string;
  type: DiscoverContentType;
};

export const DISCOVER_CATEGORIES: {
  id: DiscoverCategoryFilter;
  label: string;
}[] = [
  { id: "all", label: "ALL" },
  { id: "article", label: "ARTICLES" },
  { id: "podcast", label: "PODCASTS" },
  { id: "video", label: "VIDEOS" },
];

export const DISCOVER_PAGE_SIZE = 10;

const ARTICLE_THUMB =
  "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600";
const PODCAST_THUMB =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600";
const VIDEO_THUMB =
  "https://images.unsplash.com/photo-1564769662533-4f00a87b9756?w=600";

/** Full mock catalog — swap for API responses later. */
const MOCK_DISCOVER_CATALOG: DiscoverContentItem[] = Array.from(
  { length: 36 },
  (_, index) => {
    const type: DiscoverContentType =
      index % 3 === 0 ? "article" : index % 3 === 1 ? "podcast" : "video";

    const titles: Record<DiscoverContentType, string> = {
      article: "Mastering the Art: Balancing Parenting, Work & Ibadat Goals",
      podcast:
        "The Islamic Stance on Cutting Family Ties With Nouman Ali Khan",
      video: "Building meaningful connections through shared faith",
    };

    const thumbnails: Record<DiscoverContentType, string> = {
      article: ARTICLE_THUMB,
      podcast: PODCAST_THUMB,
      video: VIDEO_THUMB,
    };

    return {
      id: `discover-${index + 1}`,
      title: titles[type],
      thumbnail: thumbnails[type],
      type,
    };
  },
);

export type DiscoverPageResult = {
  items: DiscoverContentItem[];
  page: number;
  hasMore: boolean;
  total: number;
};

/**
 * Mock paginated fetch. Replace with a real API call later —
 * keep the same signature so the screen/hook stay unchanged.
 */
export async function fetchDiscoverPage(params: {
  page: number;
  pageSize?: number;
  category: DiscoverCategoryFilter;
  query?: string;
}): Promise<DiscoverPageResult> {
  const pageSize = params.pageSize ?? DISCOVER_PAGE_SIZE;
  const page = Math.max(1, params.page);
  const normalizedQuery = params.query?.trim().toLowerCase() ?? "";

  let filtered =
    params.category === "all"
      ? MOCK_DISCOVER_CATALOG
      : MOCK_DISCOVER_CATALOG.filter((item) => item.type === params.category);

  if (normalizedQuery) {
    filtered = filtered.filter((item) =>
      item.title.toLowerCase().includes(normalizedQuery),
    );
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filtered.slice(start, end);

  // Simulate network latency for realistic pagination UX.
  await new Promise((resolve) => setTimeout(resolve, 350));

  return {
    items,
    page,
    hasMore: end < filtered.length,
    total: filtered.length,
  };
}

export function getDiscoverTypeLabel(type: DiscoverContentType): string {
  if (type === "video") return "VIDEO";
  if (type === "podcast") return "PODCAST";
  return "ARTICLE";
}
