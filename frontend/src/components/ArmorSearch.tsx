import { useState } from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Armor } from '@/api/Armor';

export function ArmorSearch({ 
  armors = [], 
  selectedArmor, 
  onSelect, 
  className 
}: {
  armors?: Armor[];
  selectedArmor: Armor | null;
  onSelect: (armor: Armor | null) => void;
  className?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    rank: '',
    type: '',
  });

  // Фильтрация брони с защитой от undefined
  const filteredArmor = armors.filter(armor => {
    const name = armor.name?.toLowerCase() || '';
    const type = armor.type || '';
    const rank = armor.rank || '';
    const search = searchTerm.toLowerCase();
    
    // Проверка соответствия поиску и фильтрам
    const matchesSearch = name.includes(search);
    const matchesRank = filters.rank ? rank === filters.rank : true;
    const matchesType = filters.type ? type === filters.type : true;
    
    return matchesSearch && matchesRank && matchesType;
  });

  return (
    <div className={className}>
      <Select
        value={selectedArmor?.id || ""}
        onValueChange={(id) => {
          const foundArmor = armors.find(a => a.id === id);
          onSelect(foundArmor || null);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите броню">
            {selectedArmor ? (
              <div className="flex items-center gap-2">
                {selectedArmor.imageUrl && (
                  <img
                    src={selectedArmor.imageUrl}
                    alt={selectedArmor.name || 'Броня'}
                    className="w-8 h-8 object-cover rounded"
                  />
                )}
                <span>{selectedArmor.name || 'Без названия'}</span>
              </div>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="p-0">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск брони..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {filteredArmor.length > 0 ? (
              filteredArmor.map(armor => (
                <SelectItem key={armor.id} value={armor.id} className="py-2">
                  <div className="flex items-center gap-3">
                    {armor.imageUrl && (
                      <img
                        src={armor.imageUrl}
                        alt={armor.name || 'Броня'}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <div className="font-medium">{armor.name || 'Без названия'}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{type || 'Не указан'}</Badge>
                        <Badge variant="secondary">{rank || 'Не указан'}</Badge>
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {armors.length === 0 ? 'Нет доступной брони' : 'Ничего не найдено'}
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}