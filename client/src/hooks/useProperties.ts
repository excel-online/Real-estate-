import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Property, PropertyFilters, PaginatedResponse } from "../types";

/** Strip empty values so URLs stay clean: { city: "", page: 2 } → "page=2" */
function buildParams(filters: PropertyFilters): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(filters)
      .filter(([, v]) => v !== "" && v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)])
  );
}

export function useProperties(filters: PropertyFilters = {}) {
  const params = buildParams({ ...filters, page: filters.page ?? 1 });

  const query = useQuery<PaginatedResponse<Property>>({
    // The queryKey IS the cache key — changing any filter busts/uses the right cache entry
    queryKey: ["properties", params],
    queryFn: async () => (await api.get("/properties", { params })).data,
    placeholderData: keepPreviousData, // smooth pagination: keep old page while new loads
    staleTime: 30_000,
  });

  return {
    properties: query.data?.data ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching, // subtle "updating…" indicator without layout shift
    error: query.error,
  };
}

export function useProperty(id: string) {
  return useQuery<Property>({
    queryKey: ["property", id],
    queryFn: async () => (await api.get(`/properties/${id}`)).data.data,
    staleTime: 60_000,
  });
}

export function useFeaturedProperties() {
  return useQuery<Property[]>({
    queryKey: ["properties", "featured"],
    queryFn: async () => (await api.get("/properties/featured")).data.data,
    staleTime: 5 * 60_000,
  });
}
