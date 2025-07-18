import { useState } from "react"
import { Heart, Search, Filter, Star, Shield, Zap, Copy, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Build {
  id: string
  name: string
  author: string
  likes: number
  favorite: boolean
  containerType: string
  artifacts: number
  effectiveHealth: number
  description: string
  tags: string[]
}

const mockBuilds: Build[] = [
  {
    id: "1",
    name: "Танковая сборка",
    author: "PlayerOne",
    likes: 42,
    favorite: false,
    containerType: "Промышленный контейнер",
    artifacts: 6,
    effectiveHealth: 150.5,
    description: "Максимальная защита для рейдов",
    tags: ["танк", "защита", "рейд"]
  },
  {
    id: "2", 
    name: "Скоростная сборка",
    author: "SpeedRunner",
    likes: 28,
    favorite: true,
    containerType: "Легкий контейнер",
    artifacts: 4,
    effectiveHealth: 85.2,
    description: "Быстрое передвижение по зонам",
    tags: ["скорость", "исследование"]
  },
  {
    id: "3",
    name: "Универсальная сборка",
    author: "Stalker2024",
    likes: 67,
    favorite: false,
    containerType: "Средний контейнер", 
    artifacts: 5,
    effectiveHealth: 120.8,
    description: "Баланс между защитой и маневренностью",
    tags: ["универсал", "баланс"]
  }
]

export default function Builds() {
  const [builds, setBuilds] = useState<Build[]>(mockBuilds)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"likes" | "name" | "effectiveHealth">("likes")
  const navigate = useNavigate()
  const { toast } = useToast()

  const toggleFavorite = (id: string) => {
    setBuilds(builds.map(build => 
      build.id === id ? { ...build, favorite: !build.favorite } : build
    ))
  }

  const toggleLike = (id: string) => {
    setBuilds(builds.map(build => 
      build.id === id ? { ...build, likes: build.likes + 1 } : build
    ))
  }

  const cloneBuild = (build: Build) => {
    navigate("/create", { state: { clonedBuild: build } })
    toast({
      title: "Сборка клонирована",
      description: `Сборка "${build.name}" открыта для редактирования`,
    })
  }

  const viewBuild = (id: string) => {
    navigate(`/build/${id}`)
  }

  const filteredBuilds = builds
    .filter(build => 
      build.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      build.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      build.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return b.likes - a.likes
        case "name":
          return a.name.localeCompare(b.name)
        case "effectiveHealth":
          return b.effectiveHealth - a.effectiveHealth
        default:
          return 0
      }
    })

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Сборки артефактов
        </h1>
        
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск сборок..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Сортировка
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("likes")}>
                По лайкам
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                По названию
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("effectiveHealth")}>
                По эффективному здоровью
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuilds.map((build) => (
          <Card key={build.id} className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{build.name}</h3>
                  <p className="text-sm text-muted-foreground">by {build.author}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(build.id)}
                  className={build.favorite ? "text-gaming-red" : "text-muted-foreground"}
                >
                  <Heart className={`h-4 w-4 ${build.favorite ? "fill-current" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{build.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gaming-blue" />
                  <span className="text-foreground">{build.effectiveHealth}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-gaming-orange" />
                  <span className="text-foreground">{build.artifacts} артефактов</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {build.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">{build.containerType}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(build.id)}
                    className="gap-2 text-muted-foreground hover:text-primary"
                  >
                    <Star className="h-4 w-4" />
                    {build.likes}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewBuild(build.id)}
                  className="flex-1 gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Просмотр
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cloneBuild(build)}
                  className="flex-1 gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Клонировать
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredBuilds.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Сборки не найдены</p>
        </div>
      )}
    </div>
  )
}