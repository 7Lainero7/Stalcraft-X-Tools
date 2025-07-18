import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Heart, Star, Shield, Zap, Copy, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Artifact {
  id: string
  name: string
  type: string
  stats: Record<string, number>
}

interface Build {
  id: string
  name: string
  author: string
  likes: number
  favorite: boolean
  containerType: string
  artifacts: Artifact[]
  effectiveHealth: number
  description: string
  tags: string[]
  armorType: string
  createdAt: string
  stats: Record<string, number>
}

// Мок данные сборки
const mockBuild: Build = {
  id: "1",
  name: "Танковая сборка",
  author: "PlayerOne",
  likes: 42,
  favorite: false,
  containerType: "Промышленный контейнер",
  artifacts: [
    { id: "1", name: "Медвежий коготь", type: "Защитный", stats: { "Защита": 15, "Здоровье": 25 } },
    { id: "2", name: "Чешуя мутанта", type: "Защитный", stats: { "Защита": 20, "Регенерация": 5 } },
    { id: "3", name: "Костный панцирь", type: "Защитный", stats: { "Защита": 18, "Сопротивление": 12 } },
    { id: "4", name: "Железная кожа", type: "Защитный", stats: { "Защита": 22, "Выносливость": 8 } },
  ],
  effectiveHealth: 150.5,
  description: "Максимальная защита для рейдов высокого уровня. Отлично подходит для танкования урона в групповых активностях.",
  tags: ["танк", "защита", "рейд"],
  armorType: "Тяжелая броня",
  createdAt: "2024-01-15",
  stats: {
    "Эффективное здоровье": 150.5,
    "Защита": 75,
    "Сопротивление аномалиям": 45,
    "Скорость передвижения": -15,
    "Выносливость": 120,
    "Регенерация": 15,
    "Сопротивление радиации": 35,
    "Грузоподъемность": 85,
    "Точность": 5,
    "Урон в ближнем бою": 10
  }
}

export default function BuildDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [build] = useState<Build>(mockBuild)
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorite, setIsFavorite] = useState(build.favorite)

  const handleClone = () => {
    // Перенаправляем на страницу создания с параметрами сборки
    navigate("/create", { state: { clonedBuild: build } })
    toast({
      title: "Сборка клонирована",
      description: "Вы можете редактировать клонированную сборку",
    })
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    toast({
      title: isLiked ? "Лайк убран" : "Лайк поставлен",
      description: `Сборка "${build.name}"`,
    })
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "Убрано из избранного" : "Добавлено в избранное",
      description: `Сборка "${build.name}"`,
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Хедер */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
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
            onClick={handleFavorite}
            className={isFavorite ? "text-gaming-red border-gaming-red" : ""}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "В избранном" : "В избранное"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className={isLiked ? "text-gaming-orange border-gaming-orange" : ""}
          >
            <Star className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
            {build.likes + (isLiked ? 1 : 0)}
          </Button>
          <Button
            onClick={handleClone}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Клонировать
          </Button>
        </div>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - Информация о сборке */}
        <div className="lg:col-span-2 space-y-6">
          {/* Описание */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">Описание</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{build.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {build.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Броня и контейнер */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">Экипировка</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gaming-blue" />
                  <div>
                    <p className="font-medium text-foreground">Броня</p>
                    <p className="text-sm text-muted-foreground">{build.armorType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gaming-orange" />
                  <div>
                    <p className="font-medium text-foreground">Контейнер</p>
                    <p className="text-sm text-muted-foreground">{build.containerType}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Артефакты */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">
                Артефакты ({build.artifacts.length}/6)
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {build.artifacts.map((artifact) => (
                  <Card key={artifact.id} className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground mb-2">{artifact.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{artifact.type}</p>
                      <div className="space-y-1">
                        {Object.entries(artifact.stats).map(([stat, value]) => (
                          <div key={stat} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{stat}:</span>
                            <span className="text-foreground font-medium">
                              {value > 0 ? "+" : ""}{value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка - Характеристики */}
        <div className="space-y-6">
          <Card className="bg-gradient-card border-border sticky top-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">Характеристики</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(build.stats).map(([stat, value], index) => (
                <div key={stat}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{stat}</span>
                    <span className={`font-medium ${
                      value > 0 ? "text-gaming-green" : 
                      value < 0 ? "text-gaming-red" : "text-foreground"
                    }`}>
                      {value > 0 && stat !== "Эффективное здоровье" ? "+" : ""}{value}
                      {stat === "Скорость передвижения" && "%"}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Информация о популярности */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">Статистика</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gaming-orange" />
                  <span className="text-sm text-muted-foreground">Лайки</span>
                </div>
                <span className="font-medium text-foreground">{build.likes + (isLiked ? 1 : 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gaming-blue" />
                  <span className="text-sm text-muted-foreground">Клонирований</span>
                </div>
                <span className="font-medium text-foreground">23</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-gaming-red" />
                  <span className="text-sm text-muted-foreground">В избранном</span>
                </div>
                <span className="font-medium text-foreground">15</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}