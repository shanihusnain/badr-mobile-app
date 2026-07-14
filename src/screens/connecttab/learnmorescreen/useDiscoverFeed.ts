import { useCallback, useEffect, useRef, useState } from "react";
import {
  DISCOVER_PAGE_SIZE,
  fetchDiscoverPage,
  type DiscoverCategoryFilter,
  type DiscoverContentItem,
} from "./mockData";

const SEARCH_DEBOUNCE_MS = 300;

type UseDiscoverFeedResult = {
  items: DiscoverContentItem[];
  category: DiscoverCategoryFilter;
  setCategory: (category: DiscoverCategoryFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
};

export function useDiscoverFeed(): UseDiscoverFeedResult {
  const [category, setCategoryState] =
    useState<DiscoverCategoryFilter>("all");
  const [searchQuery, setSearchQueryState] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState<DiscoverContentItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const requestIdRef = useRef(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const loadPage = useCallback(
    async (
      nextPage: number,
      nextCategory: DiscoverCategoryFilter,
      nextQuery: string,
      replace: boolean,
    ) => {
      if (loadingRef.current && !replace) return;

      const requestId = ++requestIdRef.current;
      loadingRef.current = true;

      if (replace) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const result = await fetchDiscoverPage({
          page: nextPage,
          pageSize: DISCOVER_PAGE_SIZE,
          category: nextCategory,
          query: nextQuery,
        });

        if (requestId !== requestIdRef.current) return;

        setItems((current) =>
          replace ? result.items : [...current, ...result.items],
        );
        setPage(result.page);
        setHasMore(result.hasMore);
      } finally {
        if (requestId === requestIdRef.current) {
          loadingRef.current = false;
          setIsInitialLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void loadPage(1, category, debouncedQuery, true);
  }, [category, debouncedQuery, loadPage]);

  const setCategory = useCallback((next: DiscoverCategoryFilter) => {
    setCategoryState(next);
    setItems([]);
    setHasMore(true);
    setPage(1);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    setPage(1);
    setHasMore(true);
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current || isInitialLoading) return;
    void loadPage(page + 1, category, debouncedQuery, false);
  }, [category, debouncedQuery, hasMore, isInitialLoading, loadPage, page]);

  const refresh = useCallback(() => {
    void loadPage(1, category, debouncedQuery, true);
  }, [category, debouncedQuery, loadPage]);

  return {
    items,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    isInitialLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  };
}
