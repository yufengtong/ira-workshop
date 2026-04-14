import { useState } from 'react'
import { ActivityCard } from '@/components/ActivityCard'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/store'
import { DIFFICULTY_CONFIG } from '@/lib/types'
import { Search } from 'lucide-react'

type DifficultyFilter = 'all' | 'easy' | 'moderate' | 'hard' | 'expert'

export function ActivitiesPage() {
  const { activities } = useApp()
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')

  const filtered = activities.filter(a => {
    const matchSearch = search === '' ||
      a.title.includes(search) ||
      a.routeName.includes(search) ||
      a.province.includes(search)
    const matchDiff = difficulty === 'all' || a.difficulty === difficulty
    return matchSearch && matchDiff
  })

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">登山活动</h1>
        <p className="text-muted-foreground mt-1">发现并加入附近的登山活动</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索活动、路线或城市..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-md border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button
            variant={difficulty === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDifficulty('all')}
          >
            全部
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

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🏔️</p>
          <p className="text-lg font-medium text-foreground">暂无匹配活动</p>
          <p className="text-sm text-muted-foreground mt-1">试试调整筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </main>
  )
}