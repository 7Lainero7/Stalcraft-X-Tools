import { useQuery } from "@tanstack/react-query";
import { fetchArtifacts, Artifact } from "@/api/artefact";

export const useArtifacts = (filters = {}) => {
  return useQuery<Artifact[]>({
    queryKey: ['artifacts', filters],
    queryFn: () => fetchArtifacts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};