import { useParams, useNavigate } from "react-router-dom"; // Добавьте useNavigate
import { useQuery } from "@tanstack/react-query";
import CreateBuild from "./CreateBuild";
import { api } from "@/api/BaseApi";
import { Loader2 } from "lucide-react";

export default function EditBuildPage() {
  const { id } = useParams();
  const navigate = useNavigate(); // Добавьте этот хук
  const buildId = id ? parseInt(id) : undefined;

  const { data: build, isLoading } = useQuery({
    queryKey: ['build', id],
    queryFn: async () => {
      const response = await api.get(`/builds/${id}`);
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!build) {
    return <div>Сборка не найдена</div>;
  }

  return (
    <CreateBuild
      editMode
      buildId={buildId}
      initialData={{
        buildName: build.name,
        description: build.description,
        selectedArmor: build.armor ? {
          id: build.armor.id,
          name: build.armor.names?.[0]?.name,
          type: build.armor.class,
          rank: build.armor.rank,
          imageUrl: build.armor.iconUrl,
          stats: build.armor.stats?.reduce((acc, stat) => {
            acc[stat.statKey] = stat.value;
            return acc;
          }, {})
        } : null,
        selectedContainer: build.container ? {
          id: build.container.id,
          name: build.container.names?.[0]?.name,
          slots: 6,
          bonuses: { internalProtection: 0 },
          imageUrl: build.container.iconUrl
        } : null,
        selectedArtifacts: build.artefacts.map(a => ({
          id: a.artefact.id,
          name: a.artefact.names?.[0]?.name,
          type: a.artefact.category,
          imageUrl: a.artefact.iconUrl,
          stats: a.artefact.effects?.reduce((acc, effect) => {
            acc[effect.effectKey] = effect.maxValue;
            return acc;
          }, {})
        })),
        tags: build.buildTags.map(t => t.tag.name)
      }}
      onSuccess={() => navigate(`/build/${buildId}`)} // Теперь navigate определен
    />
  );
}