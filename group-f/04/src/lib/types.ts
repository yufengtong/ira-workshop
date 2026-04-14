export interface HikingRoute {
  id: string
  name: string
  province: string
  city: string
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert'
  points: number
  elevation: number
  distance: number
  duration: string
  description: string
  image: string
  tags: string[]
}

export interface Activity {
  id: string
  title: string
  routeId: string
  routeName: string
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert'
  points: number
  date: string
  maxParticipants: number
  currentParticipants: number
  participants: string[]
  organizer: string
  organizerAvatar: string
  description: string
  status: 'upcoming' | 'ongoing' | 'completed'
  province: string
  city: string
}

export interface User {
  id: string
  name: string
  avatar: string
  totalPoints: number
  activitiesJoined: number
  activitiesOrganized: number
  rank: number
  badges: string[]
}

export const DIFFICULTY_CONFIG = {
  easy: { label: '休闲', color: 'bg-forest-light', textColor: 'text-primary-foreground', points: '10-30', emoji: '🌿' },
  moderate: { label: '中等', color: 'bg-accent', textColor: 'text-primary-foreground', points: '30-60', emoji: '⛰️' },
  hard: { label: '困难', color: 'bg-earth', textColor: 'text-primary-foreground', points: '60-90', emoji: '🏔️' },
  expert: { label: '专家', color: 'bg-destructive', textColor: 'text-destructive-foreground', points: '90-120', emoji: '🗻' },
} as const

export const PROVINCES = [
  '北京', '天津', '河北', '山西', '内蒙古',
  '辽宁', '吉林', '黑龙江', '上海', '江苏',
  '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '广西',
  '海南', '重庆', '四川', '贵州', '云南',
  '西藏', '陕西', '甘肃', '青海', '宁夏',
  '新疆', '台湾', '香港', '澳门',
] as const