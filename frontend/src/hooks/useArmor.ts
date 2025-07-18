import { useQuery } from "@tanstack/react-query";
import { fetchArmor, Armor } from "@/api/Armor";

export const useArmor = () => {
  return useQuery<Armor[]>({
    queryKey: ['armor'],
    queryFn: fetchArmor,
    staleTime: 1000 * 60 * 5 // 5 минут
  });
};