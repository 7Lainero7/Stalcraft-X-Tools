import { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Artifact } from "@/api/Artifact";
import { debounce } from 'lodash';

export function ArtifactSearch({ artifacts, selectedArtifact, onSelect, className }: {
  artifacts: Artifact[];
  selectedArtifact: Artifact | null;
  onSelect: (artifact: Artifact | null) => void;
  className?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    stat: 'all',
  });
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Дебаунс для поиска (задержка 500мс)
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setIsTyping(false);
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsTyping(true);
    debouncedSearch(e.target.value);
  };

  // Получаем все уникальные характеристики
  const allStats = Array.from(
    new Set(artifacts.flatMap(a => Object.keys(a.stats || {})))
  ).filter(Boolean).sort();

  // Фильтрация артефактов
  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filters.category === 'all' || artifact.category === filters.category;
    const matchesType = filters.type === 'all' || artifact.type === filters.type;
    const matchesStat = filters.stat === 'all' || 
      (artifact.stats && filters.stat in artifact.stats);

    return matchesSearch && matchesCategory && matchesType && matchesStat;
  });

  // Округление чисел до 0.1
  const roundNumber = (num: number) => {
    return Math.round(num * 10) / 10;
  };

  return (
    <div className={className}>
      <Select
        value={selectedArtifact?.id || ""}
        onValueChange={(id) => {
          onSelect(artifacts.find(a => a.id === id) || null);
        }}
        // Добавляем эти пропсы
        onOpenChange={(open) => {
          if (!open && isTyping) {
            // Не закрываем, если пользователь печатает
            setTimeout(() => {
              const trigger = document.querySelector('.artifacts-select-trigger');
              if (trigger) (trigger as HTMLElement).click();
            }, 0);
          }
        }}
      >
        <SelectTrigger className="artifacts-select-trigger">
          <SelectValue placeholder="Выберите артефакт">
            {selectedArtifact && (
              <div className="flex items-center gap-2">
                {selectedArtifact.imageUrl && (
                  <img
                    src={selectedArtifact.imageUrl}
                    alt={selectedArtifact.name}
                    className="w-8 h-8 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-artifact.png';
                    }}
                  />
                )}
                <span>{selectedArtifact.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent 
          className="p-0"
          // Предотвращаем автоматическое закрытие
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.remove-artifact-btn')) {
              e.preventDefault();
            }
          }}
        >
          <div className="p-2 border-b space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Поиск артефактов..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {isTyping && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  Ввод...
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Select 
                onValueChange={(value) => setFilters({...filters, type: value})}
                value={filters.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  {Array.from(new Set(artifacts.map(a => a.type)))
                    .filter(Boolean)
                    .map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select 
                onValueChange={(value) => setFilters({...filters, stat: value})}
                value={filters.stat}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Характеристика" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все характеристики</SelectItem>
                  {allStats.map(stat => (
                    <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {!isTyping && filteredArtifacts.length > 0 ? (
              filteredArtifacts.map(artifact => (
                <SelectItem key={artifact.id} value={artifact.id} className="py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <img
                        src={artifact.imageUrl || '/default-artifact.png'}
                        alt={artifact.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-artifact.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{artifact.name}</div>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge variant="outline">{artifact.type}</Badge>
                        {artifact.category && <Badge variant="secondary">{artifact.category}</Badge>}
                      </div>
                      {artifact.stats && Object.keys(artifact.stats).length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                          {Object.entries(artifact.stats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between">
                              <span className="truncate">{stat}:</span>
                              <span className="font-medium ml-2">{roundNumber(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {isTyping ? "Завершите ввод для поиска..." : "Артефакты не найдены"}
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}