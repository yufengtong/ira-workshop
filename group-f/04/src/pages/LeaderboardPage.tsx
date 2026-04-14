import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/lib/store'
import { Trophy, Medal, TrendingUp, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const RANK_STYLES = [
  'bg-gradient-summit text-primary-foreground',
  'bg-secondary text-foreground',
  'bg-earth text-primary-foreground',
]

const RANK_ICONS = ['🥇', '🥈', '🥉']

export function LeaderboardPage() {
  const { users } = useApp()
  const sorted = [...users].sort((a, b) => b.totalPoints - a.totalPoints)
  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="h-7 w-7 text-accent" />
          积分排行榜
        </h1>
        <p className="text-muted-foreground mt-1">查看所有山友的登山积分排名</p>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
        {[1, 0, 2].map((index) => {
          const user = top3[index]
          if (!user) return null
          const isFirst = index === 0
          return (
            <div
              key={user.id}
              className={cn(
                'flex flex-col items-center',
                isFirst ? 'order-1 sm:-mt-4' : index === 1 ? 'order-0' : 'order-2'
              )}
            >
              <Card className={cn(
                'w-full text-center overflow-hidden',
                isFirst && 'ring-2 ring-accent shadow-glow'
              )}>
                <div className={cn('py-3', RANK_STYLES[index])}>
                  <span className="text-2xl">{RANK_ICONS[index]}</span>
                </div>
                <CardContent className="pt-4 pb-5">
                  <div className="text-3xl mb-2">{user.avatar}</div>
                  <p className="font-semibold text-foreground text-sm">{user.name}</p>
                  <p className="text-xl font-bold text-primary mt-1">{user.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">积分</p>
                  <div className="mt-3 flex justify-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {user.activitiesJoined}次
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3" />
                      {user.activitiesOrganized}次
                    </span>
                  </div>
                  {user.badges.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {user.badges.slice(0, 2).map(badge => (
                        <span key={badge} className="text-xs bg-secondary rounded-full px-2 py-0.5 text-muted-foreground">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Remaining users */}
      <div className="max-w-2xl mx-auto space-y-2">
        {rest.map((user, i) => (
          <Card key={user.id} className="hover:shadow-card-hover">
            <CardContent className="py-4 px-5 flex items-center gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                {i + 4}
              </div>
              <span className="text-2xl shrink-0">{user.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{user.name}</p>
                <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>{user.activitiesJoined} 次参与</span>
                  <span>{user.activitiesOrganized} 次发起</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-primary text-lg">{user.totalPoints}</p>
                <p className="text-xs text-muted-foreground">积分</p>
              </div>
              {user.badges.length > 0 && (
                <div className="hidden sm:flex gap-1 shrink-0">
                  {user.badges.slice(0, 1).map(badge => (
                    <span key={badge} className="text-xs bg-secondary rounded-full px-2 py-0.5 text-muted-foreground">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <Medal className="h-4 w-4 text-accent" />
          <span className="text-xs text-muted-foreground">
            积分通过参加不同难度的登山活动获得，难度越高积分越多
          </span>
        </div>
      </div>
    </main>
  )
}