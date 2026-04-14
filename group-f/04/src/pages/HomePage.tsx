import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ActivityCard } from '@/components/ActivityCard'
import { useApp } from '@/lib/store'
import { ArrowRight, Mountain, Compass, Trophy, Map } from 'lucide-react'

const STATS = [
  { label: '活跃路线', value: '20+', icon: Map },
  { label: '社区成员', value: '1,200+', icon: Mountain },
  { label: '活动总数', value: '350+', icon: Compass },
  { label: '累计积分', value: '86,000+', icon: Trophy },
]

export function HomePage() {
  const { activities } = useApp()
  const hotActivities = activities.slice(0, 4)

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-mountain.png"
            alt="壮丽山景"
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="container relative z-10 py-24 sm:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary-foreground leading-tight tracking-tight">
              山行 · 与志同道合的人
              <br />一起征服每座山峰
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/80 max-w-lg">
              发布或加入登山活动，挑战不同难度路线，积累积分成为登山达人。探索全国各地著名登山路线，找到你的下一个目的地。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/activities">
                <Button variant="summit" size="lg">
                  浏览活动
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/routes">
                <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground">
                  探索路线
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(stat => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Hot Activities */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">热门活动</h2>
            <p className="text-sm text-muted-foreground mt-1">近期最受欢迎的登山活动</p>
          </div>
          <Link to="/activities">
            <Button variant="ghost" className="text-primary">
              查看全部
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {hotActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-forest">
        <div className="container py-16 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground">准备好出发了吗？</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-md mx-auto">
            发起你的第一个登山活动，邀请山友一起出发
          </p>
          <Link to="/create" className="mt-6 inline-block">
            <Button variant="summit" size="lg">
              发布活动
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}