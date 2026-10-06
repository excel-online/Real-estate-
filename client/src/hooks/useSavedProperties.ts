import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuth } from "./useAuth";

/** Optimistic toggle: UI updates instantly, rolls back on failure */
export function useToggleSaved(propertyId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["saved-properties"];

  const { data: savedIds = [] } = useQuery<string[]>({
    queryKey,
    queryFn: async () => (await api.get("/users/me/saved")).data.data,
    enabled: !!user, // guests simply can't save — no wasted requests
  });

  const mutation = useMutation({
    mutationFn: async () =>
      (await api.post(`/users/me/saved/${propertyId}`)).data,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<string[]>(queryKey);
      // Optimistically flip the state
      queryClient.setQueryData<string[]>(queryKey, (old = []) =>
        old.includes(propertyId) ? old.filter((id) => id !== propertyId) : [...old, propertyId]
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.previous); // rollback
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  return { isSaved: savedIds.includes(propertyId), toggle: mutation.mutate };
}
