import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DifficultyBadge } from '@/components/DifficultyBadge'
import { HIKING_ROUTES } from '@/lib/data'
import { PROVINCES, DIFFICULTY_CONFIG } from '@/lib/types'
import { Search, MountainSnow, Ruler, Clock, TrendingUp } from 'lucide-react'

type DifficultyFilter = 'all' | 'easy' | 'moderate' | 'hard' | 'expert'

export function RoutesPage() {
  const [search, setSearch] = useState('')
  const [province, setProvince] = useState<string>('all')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')

  const availableProvinces = [...new Set(HIKING_ROUTES.map(r => r.province))]

  const filtered = HIKING_ROUTES.filter(route => {
    const matchSearch = search === '' ||
      route.name.includes(search) ||
      route.province.includes(search) ||
      route.city.includes(search) ||
      route.tags.some(t => t.includes(search))
    const matchProvince = province === 'all' || route.province === province
    const matchDiff = difficulty === 'all' || route.difficulty === difficulty
    return matchSearch && matchProvince && matchDiff
  })

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <MountainSnow className="h-7 w-7 text-primary" />
          全国登山路线
        </h1>
        <p className="text-muted-foreground mt-1">探索全国各地著名的登山路线，找到你的下一个目标</p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索路线名称、城市或标签..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-md border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={province}
            onChange={e => setProvince(e.target.value)}
            className="h-10 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">全部省份</option>
            {PROVINCES.filter(p => availableProvinces.includes(p)).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button
            variant={difficulty === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDifficulty('all')}
          >
            全部难度
          </Button>
          {(Object.keys(DIFFICULTY_CONFIG) as Array<keyof typeof DIFFICULTY_CONFIG>).map(key => (
            <Button
              key={key}
              variant={difficulty === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficulty(key)}
            >
              {DIFFICULTY_CONFIG[key].emoji} {DIFFICULTY_CONFIG[key].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        共找到 <span className="font-medium text-foreground">{filtered.length}</span> 条路线
      </p>

      {/* Routes grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="text-lg font-medium text-foreground">暂无匹配路线</p>
          <p className="text-sm text-muted-foreground mt-1">试试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(route => (
            <Card key={route.id} className="overflow-hidden group">
              <div className="relative h-40 overflow-hidden">
                <img
                  src={route.image}
                  alt={route.name}
                  className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-hero opacity-60" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-primary-foreground">{route.name}</h3>
                  <p className="text-xs text-primary-foreground/80">{route.province} · {route.city}</p>
                </div>
                <div className="absolute top-3 right-3">
                  <DifficultyBadge difficulty={route.difficulty} />
                </div>
              </div>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="sr-only">{route.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">{route.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                    <span>海拔 {route.elevation}m</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Ruler className="h-3.5 w-3.5 shrink-0" />
                    <span>距离 {route.distance}km</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{route.duration}</span>
                  </div>
                  <div className="text-sm font-medium text-accent">
                    +{route.points} 积分
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {route.tags.map(tag => (
                    <span key={tag} className="text-xs bg-secondary text-muted-foreground rounded-full px-2 py-0.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}