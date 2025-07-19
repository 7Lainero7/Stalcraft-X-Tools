import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, Shield, Zap, Copy, Edit, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/api/BaseApi";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface Artifact {
  id: string;
  name: string;
  type: string;
  iconUrl?: string;
  stats?: Record<string, number>;
}

interface Equipment {
  id: string;
  name: string;
  iconUrl?: string;
  stats?: Record<string, number>;
}

interface Build {
  id: number;
  name: string;
  user: {
    id: number;
    username: string;
  };
  likesCount: number;
  viewsCount: number;
  armor: Equipment;
  container: Equipment;
  artefacts: {
    artefact: Artifact;
    slot: number;
  }[];
  description: string;
  buildTags: {
    tag: {
      name: string;
    };
  }[];
  createdAt: string;
  isFavorite?: boolean;
  isLiked?: boolean;
}

interface StatValue {
  base: number;
  bonus: number;
  total: number;
}

interface FinalStats {
  [key: string]: {
    base: number;
    bonus: number;
    total: number;
  };
}


export default function BuildDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Получение данных сборки
  const { data: build, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['build', id],
    queryFn: async () => {
      const response = await api.get(`/builds/${id}`);
      return response.data;
    }
  });

  // Проверка, является ли текущий пользователь владельцем
  const isOwner = user?.id === build?.user?.id;

  // Мутации
  const likeMutation = useMutation({
    mutationFn: () => api.post(`/builds/${id}/like`),
    onSuccess: () => {
      // Убираем локальное состояние и полагаемся на refetch
      refetch();
    }
  });

  const favoriteMutation = useMutation({
    mutationFn: () => api.post(`/builds/${id}/favorite`),
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      refetch();
      toast({
        title: isFavorite ? "Убрано из избранного" : "Добавлено в избранное",
      });
    }
  });

  const cloneMutation = useMutation({
    mutationFn: () => api.post(`/builds/${id}/clone`),
    onSuccess: (data) => {
      navigate(`/build/${data.data.id}`);
      toast({
        title: "Сборка склонирована",
        description: "Вы можете редактировать свою копию",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/builds/${id}`),
    onSuccess: () => {
      toast({
        title: "Сборка удалена",
      });
      navigate('/');
    }
  });

  // Функция для округления чисел
  const roundNumber = (num: number): number => {
    return Math.round((num || 0) * 10) / 10;
  };

  // Расчет итоговых характеристик
  const calculateStats = useCallback((): FinalStats => {
    const stats: FinalStats = {};

    // Базовые значения
    stats['Здоровье'] = { base: 100, bonus: 0, total: 100 };
    stats['Скорость передвижения'] = { base: 100, bonus: 0, total: 100 };

    // Добавляем характеристики брони
    if (build?.armor?.stats) {
      build.armor.stats.forEach(stat => {
        const value = stat.value || 0;
        stats[stat.statKey] = { 
          base: value, 
          bonus: 0, 
          total: value 
        };
      });
    }

    // Добавляем бонусы артефактов
    build?.artefacts?.forEach(({ artefact }) => {
      artefact.effects?.forEach(effect => {
        const statKey = effect.effectKey;
        const value = effect.maxValue || effect.minValue || 0;
        
        if (!stats[statKey]) {
          stats[statKey] = { 
            base: 0, 
            bonus: value, 
            total: value 
          };
        } else {
          stats[statKey].bonus += value;
          stats[statKey].total += value;
        }
      });
    });

    // Округляем значения и фильтруем NaN
    const roundedStats: FinalStats = {};
    
    Object.keys(stats).forEach(stat => {
      const base = roundNumber(stats[stat].base);
      const bonus = roundNumber(stats[stat].bonus);
      const total = roundNumber(stats[stat].total);

      // Добавляем только если хотя бы одно значение не NaN
      if (!isNaN(base)) {  // Исправлено: добавлена закрывающая скобка
        roundedStats[stat] = { base, bonus, total };
      }
    });

    return roundedStats;
  }, [build]);

  const finalStats = calculateStats();

  const handleEdit = () => navigate(`/build/${id}/edit`);
  const handleClone = () => cloneMutation.mutate();
  const handleLike = () => likeMutation.mutate();
  const handleFavorite = () => favoriteMutation.mutate();
  const handleDelete = () => deleteMutation.mutate();

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorPage error={error} />;
  if (!build) return <NotFoundPage />;

  // Форматирование данных для отображения
  const formattedBuild = {
  ...build,
  author: build.user?.username || 'Неизвестный автор',
  likes: build.likesCount || 0,
  armor: {
    id: build.armor?.id,
    name: build.armor?.names?.[0]?.name || 'Неизвестно',
    iconUrl: build.armor?.iconUrl,
    stats: build.armor?.stats?.reduce((acc, stat) => {
      acc[stat.statKey] = stat.value;
      return acc;
    }, {} as Record<string, number>) || {}
  },
  container: {
    id: build.container?.id,
    name: build.container?.names?.[0]?.name || 'Неизвестно',
    iconUrl: build.container?.iconUrl
  },
  artifacts: build.artefacts
    ?.sort((a, b) => a.slot - b.slot)
    .map(item => ({
      id: item.artefact.id,
      name: item.artefact.names?.[0]?.name || 'Неизвестный артефакт',
      type: item.artefact.category || 'Неизвестный тип',
      iconUrl: item.artefact.iconUrl,
      stats: item.artefact.effects?.reduce((acc, effect) => {
        acc[effect.effectKey] = effect.maxValue; // Используем maxValue или можно среднее
        return acc;
      }, {} as Record<string, number>) || {}
    })) || [],
  tags: build.buildTags?.map(tag => tag.tag.name) || []
};

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Хедер с кнопками действий */}
      <Header 
        build={formattedBuild}
        isOwner={isOwner}
        isFavorite={isFavorite}
        isLiked={isLiked}
        likesCount={formattedBuild.likes + (isLiked ? 1 : 0)}
        onBack={() => navigate(-1)}
        onEdit={handleEdit}
        onClone={handleClone}
        onLike={handleLike}
        onFavorite={handleFavorite}
        onDelete={() => setIsDeleteDialogOpen(true)}
        isMutating={likeMutation.isLoading || favoriteMutation.isLoading || cloneMutation.isLoading}
      />

      {/* Диалог подтверждения удаления */}
      <DeleteDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isLoading}
      />

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка */}
        <div className="lg:col-span-2 space-y-6">
          <DescriptionCard 
            description={formattedBuild.description} 
            tags={formattedBuild.tags} 
          />
          
          <EquipmentCard 
            armor={formattedBuild.armor} 
            container={formattedBuild.container} 
          />
          
          <ArtifactsCard artifacts={formattedBuild.artifacts} />
        </div>

        {/* Правая колонка */}
        <div className="space-y-6">
          <StatsCard stats={finalStats} />
        </div>
      </div>
    </div>
  );
}

// Компоненты для разделения логики

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

function ErrorPage({ error }: { error: unknown }) {
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-6xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Ошибка загрузки сборки</h2>
      <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
      <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
    </div>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-6xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">Сборка не найдена</h2>
      <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
    </div>
  );
}

function Header({
  build,
  isOwner,
  isFavorite,
  isLiked,
  likesCount,
  onBack,
  onEdit,
  onClone,
  onLike,
  onFavorite,
  onDelete,
  isMutating
}: {
  build: { name: string; author: string; createdAt: string };
  isOwner: boolean;
  isFavorite: boolean;
  isLiked: boolean;
  likesCount: number;
  onBack: () => void;
  onEdit: () => void;
  onClone: () => void;
  onLike: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  isMutating: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="flex-1">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {build.name}
        </h1>
        <p className="text-muted-foreground">
          Автор: <span className="text-foreground font-medium">{build.author}</span> • 
          Создано: {new Date(build.createdAt).toLocaleDateString('ru-RU')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onFavorite}
          disabled={isMutating}
          className={isFavorite ? "text-gaming-red border-gaming-red" : ""}
        >
          <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
          {isFavorite ? "В избранном" : "В избранное"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onLike}
          disabled={isMutating}
          className={isLiked ? "text-gaming-orange border-gaming-orange" : ""}
        >
          <Star className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
          {likesCount}
        </Button>
        
        {isOwner ? (
          <>
            <Button onClick={onEdit} className="gap-2" disabled={isMutating}>
              <Edit className="h-4 w-4" />
              Редактировать
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDelete} 
              className="gap-2"
              disabled={isMutating}
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>
          </>
        ) : (
          <Button 
            onClick={onClone} 
            className="gap-2"
            disabled={isMutating}
          >
            <Copy className="h-4 w-4" />
            Клонировать
          </Button>
        )}
      </div>
    </div>
  );
}

function DeleteDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удаление сборки</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить эту сборку? Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Удаление..." : "Удалить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DescriptionCard({ description, tags }: { description: string; tags: string[] }) {
  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">Описание</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EquipmentCard({ armor, container }: { armor: Equipment; container: Equipment }) {
  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">Экипировка</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-card/50">
            {armor.iconUrl && (
                <img 
                  src={armor.iconUrl} 
                  alt={armor.name}
                  className="w-16 h-16 object-contain"
                />
              )}
            <div>
              <p className="font-medium text-foreground">Броня</p>
              <p className="text-sm text-muted-foreground">{armor.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-card/50">
            {container.iconUrl && (
              <img 
                  src={container.iconUrl} 
                  alt={container.name}
                  className="w-16 h-16 object-contain"
                />
            )}
            <div>
              <p className="font-medium text-foreground">Контейнер</p>
              <p className="text-sm text-muted-foreground">{container.name}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ArtifactsCard({ artifacts }: { artifacts: Artifact[] }) {
  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">
          Артефакты ({artifacts.length}/6)
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artifacts.map((artifact) => (
            <Card key={artifact.id} className="bg-card/50 border-border/50">
              <CardContent className="p-4 flex gap-4">
                {artifact.iconUrl && (
                  <img 
                    src={artifact.iconUrl} 
                    alt={artifact.name}
                    className="w-16 h-16 object-contain"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-foreground mb-2">{artifact.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{artifact.type}</p>
                  <div className="space-y-1">
                    {artifact.stats && Object.entries(artifact.stats).map(([stat, value]) => (
                      <div key={stat} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{stat}:</span>
                        <span className="text-foreground font-medium">
                          {value > 0 ? "+" : ""}{value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsCard({ stats }: { stats: Record<string, StatValue> }) {
  return (
    <Card className="bg-gradient-card border-border sticky top-6">
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">Характеристики</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(stats).map(([stat, values]) => (
          <div key={stat}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{stat}</span>
              <span className={`font-medium ${
                values.total > 0 ? "text-gaming-green" : 
                values.total < 0 ? "text-gaming-red" : "text-foreground"
              }`}>
                {values.total > 0 ? "+" : ""}{values.total}
              </span>
            </div>
            <Separator className="my-3" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}