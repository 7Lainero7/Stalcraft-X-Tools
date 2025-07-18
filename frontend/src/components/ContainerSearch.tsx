// src/components/ContainerSearch.tsx
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/api/container";
import { useState } from "react";

interface ContainerSearchProps {
  containers: Container[];
  selectedContainer: Container | null;
  onSelect: (container: Container | null) => void;
  className?: string;
}

export function ContainerSearch({ 
  containers, 
  selectedContainer, 
  onSelect, 
  className 
}: ContainerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    rank: '',
    class: '',
  });

  const filteredContainers = containers.filter(container => 
    container.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!filters.rank || container.rank === filters.rank) &&
    (!filters.class || container.class === filters.class)
  );

  return (
    <div className={className}>
      <Select
        value={selectedContainer?.id || ""}
        onValueChange={(value) => {
          const container = filteredContainers.find(c => c.id === value);
          onSelect(container || null);
        }}
      >
        <SelectTrigger className="flex items-center gap-2">
          <SelectValue placeholder="Выберите контейнер">
            {selectedContainer && (
              <div className="flex items-center gap-2">
                <span>{selectedContainer.name}</span>
                <Badge variant="outline">{selectedContainer.slots} слотов</Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="p-0">
          <div className="space-y-2 p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {filteredContainers.length > 0 ? (
              filteredContainers.map((container) => (
                <SelectItem key={container.id} value={container.id} className="py-2">
                    {container.imageUrl && (
                    <img 
                        src={container.imageUrl} 
                        alt={container.name}
                        className="w-10 h-10 object-contain rounded-sm"
                        />
                    )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{container.name}</span>
                    <Badge variant="outline">{container.slots} слотов</Badge>
                    <Badge variant="secondary">{container.rank} ранг</Badge>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                Ничего не найдено
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}