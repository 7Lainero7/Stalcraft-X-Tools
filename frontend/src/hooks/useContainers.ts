import { useQuery } from "@tanstack/react-query";
import { fetchContainers } from "@/api/container";

export const useContainers = () => {
  return useQuery({
    queryKey: ['containers'],
    queryFn: fetchContainers,
    staleTime: 1000 * 60 * 5,
  });
};