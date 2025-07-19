import { useState, useRef, useEffect } from "react";
import { Heart, Search, Filter, Star, Shield, Zap, Eye, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/BaseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "lodash";

interface Build {
  id: number;
  name: string;
  
  user: {
    username: string;
  };
  likesCount: number;
  isLiked: boolean;
  isFavorite: boolean;
  armor: {
    names: { name: string }[];
    class: string;
    rank: string;
  };
  container: {
    names: { name: string }[];
    slots: number;
  };
  artefacts: {
    artefact: {
      id: string;
    };
  }[];
  description: string;
  buildTags: {
    tag: {
      name: string;
    };
  }[];
}

export default function Builds() {
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"likesCount" | "name" | "createdAt">("likesCount");
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Стабильный debounce с useRef
  const debouncedSearch = useRef(
    debounce((value: string) => {
      setSearchTerm(value);
      setPage(1); // Сброс на первую страницу при новом поиске
    }, 500)
  ).current;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
  };

  // Очистка debounce при размонтировании
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  // Автофокус на поиск
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Получение сборок с фильтрацией
  const { 
    data: builds = [], 
    isLoading, 
    isFetching,
    error
  } = useQuery({
    queryKey: ['builds', page, searchTerm, sortBy, selectedTag],
    queryFn: async () => {
      const response = await api.get('/builds', {
        params: {
          page,
          search: searchTerm,
          sort: sortBy,
          order: 'desc',
          limit: 10,
          tag: selectedTag
        }
      });
      return response.data;
    },
    keepPreviousData: true // Плавный переход между страницами
  });

  // Получение популярных тегов
  const { data: popularTags = [] } = useQuery({
    queryKey: ['popularTags'],
    queryFn: async () => {
      const response = await api.get('/tags/popular');
      return response.data.map((tag: { name: string }) => tag.name);
    }
  });

  // Мутация для лайков с оптимистичным обновлением
  const likeMutation = useMutation({
    mutationFn: (id: number) => api.post(`/builds/${id}/like`),
    onMutate: async (id) => {
      await queryClient.cancelQueries(['builds']);
      
      // Сохраняем предыдущее состояние
      const previousBuilds = queryClient.getQueryData<Build[]>(['builds']) || [];
      
      // Оптимистичное обновление
      queryClient.setQueryData(['builds'], (old: Build[] = []) => 
        old.map(build => 
          build.id === id 
            ? { 
                ...build, 
                likesCount: build.likesCount + 1,
                isLiked: true // Добавляем флаг лайка
              } 
            : build
        )
      );

      return { previousBuilds };
    },
    onError: (err, id, context) => {
      // Откатываем при ошибке
      queryClient.setQueryData(['builds'], context?.previousBuilds);
      toast({
        title: "Ошибка",
        description: "Не удалось поставить лайк",
        variant: "destructive"
      });
    },
    onSettled: () => {
      // Всегда перепроверяем данные
      queryClient.invalidateQueries(['builds']);
    }
  });

  // Мутация для избранного
  const favoriteMutation = useMutation({
  mutationFn: (id: number) => api.post(`/builds/${id}/favorite`),
  onMutate: async (id) => {
    await queryClient.cancelQueries(['builds']);
    
    const previousBuilds = queryClient.getQueryData<Build[]>(['builds']) || [];
    
    queryClient.setQueryData(['builds'], (old: Build[] = []) => 
      old.map(build => 
        build.id === id 
          ? { ...build, isFavorite: !build.isFavorite }
          : build
      )
    );

    return { previousBuilds };
  },
  onError: (err, id, context) => {
    queryClient.setQueryData(['builds'], context?.previousBuilds);
    toast({
      title: "Ошибка",
      description: "Не удалось обновить избранное",
      variant: "destructive"
    });
  },
  onSuccess: () => {
    toast({
      title: "Избранное обновлено",
    });
  },
  onSettled: () => {
    queryClient.invalidateQueries(['builds']);
  }
});

  const handleLike = (id: number) => {
    const currentBuilds = queryClient.getQueryData<Build[]>(['builds']) || [];
    const build = currentBuilds.find(b => b.id === id);
    
    if (build?.isLiked) {
      toast({ title: "Вы уже лайкнули эту сборку" });
      return;
    }
    
    likeMutation.mutate(id);
  };
  const handleFavorite = (id: number) => favoriteMutation.mutate(id);
  const viewBuild = (id: number) => navigate(`/build/${id}`);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Сборки артефактов
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={searchInputRef}
              value={inputValue}
              onChange={handleSearchChange}
              placeholder="Поиск по названию, автору или тегам..."
              className="pl-10"
            />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Сортировка
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("likesCount")}>
                  По лайкам
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  По названию
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("createdAt")}>
                  По дате
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gradient-card border-border">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Ошибка загрузки</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Неизвестная ошибка"}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {builds.map((build) => (
              <Card key={build.id} className="bg-gradient-card border-border hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{build.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">by {build.user.username}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFavorite(build.id)}
                      className={build.isFavorite ? "text-red-500" : "text-muted-foreground"}
                    >
                      <Heart className={`h-4 w-4 ${build.isFavorite ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 flex flex-col flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {build.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span>{build.armor?.names[0]?.name || 'Броня не указана'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span>{build.container?.names[0]?.name || 'Контейнер не указан'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Артефактов: {build.artefacts.length}</span>
                    </div>
                  </div>
                  <div className="flex-grow"></div>
                  <div className="flex flex-wrap gap-1">
                    {build.buildTags.map(({ tag }) => (
                      <Badge 
                        key={tag.name} 
                        variant="secondary"
                        onClick={() => setSelectedTag(tag.name)}
                        className="text-xs cursor-pointer hover:bg-secondary/80"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(build.id)}
                      className="gap-2"
                    >
                      <Star className={`h-4 w-4 ${build.likesCount > 0 ? "text-yellow-500 fill-yellow-500" : ""}`} />
                      {build.likesCount}
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewBuild(build.id)}
                    className="mt-auto w-full gap-2" /* mt-auto для прижатия к низу */
                  >
                    <Eye className="h-4 w-4" />
                    Подробнее
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {builds.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchTerm || selectedTag 
                  ? "Ничего не найдено. Попробуйте изменить параметры поиска." 
                  : "Пока нет сборок. Будьте первым!"}
              </p>
            </div>
          )}

          {builds.length > 0 && (
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Button>
              <span className="flex items-center px-4 text-muted-foreground">
                Страница {page}
              </span>
              <Button 
                variant="outline" 
                disabled={builds.length < 10}
                onClick={() => setPage(p => p + 1)}
                className="gap-2"
              >
                Вперед
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}