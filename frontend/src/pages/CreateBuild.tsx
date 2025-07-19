import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useArmor } from "@/hooks/useArmor";
import { Loader2, Plus, X, Save } from "lucide-react";
import { ArmorSearch } from "@/components/ArmorSearch";
import { useContainers } from "@/hooks/useContainers";
import { ContainerSearch } from "@/components/ContainerSearch";
import { ArtifactSearch } from "@/components/ArtefactSearch";
import { useArtifacts } from "@/hooks/useArtefact";
import { saveBuild } from "@/api/build";
import { api } from "@/api/BaseApi";
import { toast } from "@/components/ui/use-toast";
import { useSaveBuild } from "@/hooks/useBuild"; 
import { useNavigate } from 'react-router-dom';

interface FinalStats {
  [key: string]: {
    base: number;
    bonus: number;
    total: number;
  };
}

interface Artifact {
  id: string;
  name: string;
  type: string;
  stats: { [key: string]: number };
  imageUrl: string;
}

interface Container {
  id: string;
  name: string;
  slots: number;
  bonuses: {
    internalProtection: number;
    [key: string]: number;
  };
}

interface Armor {
  id: string;
  name: string;
  type: string;
  rank: string;
  imageUrl: string;
  stats: Record<string, number>;
}

interface CreateBuildProps {
  editMode?: boolean;
  buildId?: number;
  initialData?: {
    buildName: string;
    description: string;
    selectedArmor: Armor | null;
    selectedContainer: Container | null;
    selectedArtifacts: Artifact[];
    tags: string[];
  };
  onSuccess?: () => void;
}

export default function CreateBuild({ 
  editMode = false, 
  buildId, // Получаем id как пропс
  initialData, 
  onSuccess 
}: CreateBuildProps) {
  const { data: armorList = [], isLoading, error } = useArmor();
  const { data: containerList, isLoading: isLoadingContainers, error: containerError } = useContainers();
  const { data: artifactList, isLoading: isLoadingArtifacts, error: artifactError } = useArtifacts();
  
  const [buildName, setBuildName] = useState(initialData?.buildName || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(initialData?.selectedContainer || null);
  const [selectedArmor, setSelectedArmor] = useState<Armor | null>(initialData?.selectedArmor || null);
  const [selectedArtifacts, setSelectedArtifacts] = useState<Artifact[]>(initialData?.selectedArtifacts || []);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const navigate = useNavigate();
  

  const addArtifact = useCallback((artifact: Artifact) => {
    if (selectedContainer && selectedArtifacts.length < selectedContainer.slots) {
      setSelectedArtifacts(prev => [...prev, artifact]);
    }
  }, [selectedContainer, selectedArtifacts.length]);

  const removeArtifact = useCallback((index: number) => {
    setSelectedArtifacts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  }, [newTag, tags]);

  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  }, []);

  const roundNumber = useCallback((num: number): number => {
    return Math.round(num * 10) / 10;
  }, []);

  const calculateStats = useCallback(() => {
    const stats = {};

    // Базовые значения
    stats.health = { base: 100, bonus: 0, total: 100 };
    stats['Скорость передвижения'] = { base: 100, bonus: 0, total: 100 };

    // Добавляем характеристики брони
    if (selectedArmor) {
      Object.entries(selectedArmor.stats || {}).forEach(([stat, value]) => {
        stats[stat] = { base: value, bonus: 0, total: value };
      });
    }

    // Добавляем бонусы артефактов
    selectedArtifacts.forEach(art => {
      Object.entries(art.stats || {}).forEach(([stat, value]) => {
        if (!stats[stat]) {
          stats[stat] = { base: 0, bonus: value, total: value };
        } else {
          stats[stat].bonus += value;
          stats[stat].total += value;
        }
      });
    });

    // Округляем значения
    Object.keys(stats).forEach(stat => {
      stats[stat] = {
        base: roundNumber(stats[stat].base),
        bonus: roundNumber(stats[stat].bonus),
        total: roundNumber(stats[stat].total)
      };
    });

    return stats;
  }, [selectedArmor, selectedArtifacts]);

  const finalStats = calculateStats();

  const { mutate: saveBuildMutation, isPending: isSaving } = useSaveBuild();

  const prepareStatsForBackend = (stats: FinalStats) => {
    const result: Record<string, { base: number; bonus: number; total: number }> = {};
    
    Object.entries(stats).forEach(([key, value]) => {
      result[key] = {
        base: value.base,
        bonus: value.bonus,
        total: value.total
      };
    });

    return result;
  };

  const handleSaveBuild = useCallback(async () => {
    try {
      // Валидация
      if (!buildName.trim()) throw new Error("Введите название сборки");
      if (!selectedArmor?.id) throw new Error("Выберите броню");
      if (!selectedContainer?.id) throw new Error("Выберите контейнер");
      if (!selectedArtifacts.length) throw new Error("Добавьте хотя бы один артефакт");

      const buildData = {
        name: buildName,
        description: description || null,
        armorId: selectedArmor.id,
        containerId: selectedContainer.id,
        artefactIds: selectedArtifacts.map(a => a.id),
        tags: tags || []
        // totalStats убрано
      };

      if (editMode && buildId) {
        await api.put(`/builds/${buildId}`, buildData);
        toast({ title: "Сборка обновлена" });
        onSuccess?.(); // Вот здесь вызывается колбэк
      } else {
        const response = await api.post('/builds', buildData);
        navigate(`/build/${response.data.id}`);
        toast({ title: "Сборка создана" });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Ошибка",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    }
  }, [buildName, description, selectedArmor, selectedContainer, 
      selectedArtifacts, tags, editMode, buildId, onSuccess]);

  if (isLoading || isLoadingContainers || isLoadingArtifacts) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Загрузка данных...</span>
      </div>
    );
  }

  if (error || containerError || artifactError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive">Ошибка загрузки данных</h2>
          <p className="text-muted-foreground mt-2">
            {error?.message || containerError?.message || artifactError?.message || 'Неизвестная ошибка'}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
        {editMode ? "Редактировать сборку" : "Создать сборку"}
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Название сборки</Label>
                <Input
                  id="name"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  placeholder="Введите название..."
                />
              </div>
              
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Описание сборки..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Броня</Label>
                  <ArmorSearch
                    armors={armorList || []}
                    selectedArmor={selectedArmor}
                    onSelect={setSelectedArmor}
                    className="mb-4"
                  />
                </div>
                
                <div>
                  <Label>Контейнер</Label>
                  <ContainerSearch
                    containers={containerList || []}
                    selectedContainer={selectedContainer}
                    onSelect={setSelectedContainer}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Теги</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Добавить тег..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>
                Артефакты 
                {selectedContainer && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({selectedArtifacts.length}/{selectedContainer.slots})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedContainer ? (
                <>
                  <div className="grid grid-cols-3 gap-4 p-2">
                    {Array.from({ length: selectedContainer.slots }).map((_, index) => (
                      <div
                        key={index}
                        className="aspect-square relative rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors overflow-hidden group"
                      >
                        {selectedArtifacts[index] ? (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center p-1">
                              <img
                                src={selectedArtifacts[index].imageUrl || '/default-artifact.png'}
                                alt={selectedArtifacts[index].name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/default-artifact.png';
                                }}
                              />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                              <div className="text-xs font-medium text-white truncate text-center">
                                {selectedArtifacts[index].name}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-1 right-1 h-7 w-7 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeArtifact(index);
                              }}
                            >
                              <X className="h-4 w-4 text-white" />
                            </Button>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Plus className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label>Доступные артефакты</Label>
                    <ArtifactSearch
                      artifacts={artifactList || []}
                      selectedArtifact={null}
                      onSelect={addArtifact}
                    />
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Сначала выберите контейнер
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle>Финальные характеристики</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(finalStats).length > 0 ? (
                <div className="grid grid-cols-1 gap-3 overflow-y-auto">
                  {/* Приведенная живучесть - показываем первой если есть */}
                  {finalStats.effectiveHealth && (
                    <div key="effectiveHealth" className="flex flex-col p-2 rounded bg-primary/10">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Приведённая живучесть</span>
                        <span className="font-bold text-primary">
                          {finalStats.effectiveHealth.total.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>База: {finalStats.effectiveHealth.base.toFixed(1)}</span>
                        <span>Бонус: +{finalStats.effectiveHealth.bonus.toFixed(1)}</span>
                      </div>
                    </div>
                  )}

                  {/* Остальные характеристики */}
                  {Object.entries(finalStats)
                    .filter(([key]) => 
                      key !== 'effectiveHealth' && 
                      key !== 'durability' && 
                      key !== 'weight'
                    )
                    .map(([stat, { base, bonus, total }]) => (
                      <div key={stat} className="flex flex-col p-2 rounded bg-muted/30">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {stat === 'bulletResistance' ? 'Пулестойкость' : stat}
                          </span>
                          <span className="font-bold text-primary">
                            {total.toFixed(1)}
                          </span>
                        </div>
                        {(base !== 0 || bonus !== 0) && (
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>База: {base.toFixed(1)}</span>
                            <span>Бонус: {bonus > 0 ? '+' : ''}{bonus.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  Характеристики появятся после выбора экипировки
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
      <Button 
      onClick={handleSaveBuild}
      disabled={
        !buildName.trim() || 
        !selectedContainer || 
        !selectedArmor || 
        selectedArtifacts.length === 0 || 
        isSaving
      }
      className="gap-2"
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {isSaving ? "Сохранение..." : "Сохранить сборку"}
    </Button>
    </div>
    </div>
  );
}