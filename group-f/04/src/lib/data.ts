import type { HikingRoute, Activity, User } from './types'

export const HIKING_ROUTES: HikingRoute[] = [
  // 北京
  { id: 'r1', name: '香山红叶古道', province: '北京', city: '北京', difficulty: 'easy', points: 20, elevation: 575, distance: 6, duration: '2-3小时', description: '香山公园内经典红叶观赏路线，秋季漫山红遍，层林尽染，是北京秋季最佳登山去处。', image: '/images/hero-mountain.png', tags: ['红叶', '古道', '公园'] },
  { id: 'r2', name: '箭扣长城穿越', province: '北京', city: '怀柔', difficulty: 'expert', points: 100, elevation: 1141, distance: 15, duration: '8-10小时', description: '箭扣长城是万里长城最险段之一，山势陡峭，城墙雄伟，是户外爱好者的经典挑战路线。', image: '/images/hero-mountain.png', tags: ['长城', '穿越', '险峻'] },
  { id: 'r3', name: '灵山主峰登顶', province: '北京', city: '门头沟', difficulty: 'hard', points: 80, elevation: 2303, distance: 12, duration: '6-8小时', description: '灵山是北京最高峰，高山草甸景观壮美，夏季山花烂漫，是北京海拔最高的登山体验。', image: '/images/hero-mountain.png', tags: ['最高峰', '草甸', '高山'] },
  // 四川
  { id: 'r4', name: '四姑娘山大峰', province: '四川', city: '阿坝', difficulty: 'hard', points: 90, elevation: 5025, distance: 18, duration: '2天', description: '四姑娘山大峰是入门级雪山攀登路线，海拔5025米，可体验高海拔登山的魅力。', image: '/images/hero-mountain.png', tags: ['雪山', '高海拔', '入门级'] },
  { id: 'r5', name: '贡嘎转山徒步', province: '四川', city: '甘孜', difficulty: 'expert', points: 120, elevation: 7556, distance: 60, duration: '7-9天', description: '贡嘎山被誉为"蜀山之王"，转山路线穿越原始森林、冰川和高山草甸，风景壮丽。', image: '/images/hero-mountain.png', tags: ['转山', '冰川', '蜀山之王'] },
  { id: 'r6', name: '青城山后山穿越', province: '四川', city: '成都', difficulty: 'moderate', points: 40, elevation: 1260, distance: 10, duration: '4-5小时', description: '青城山后山保留了更多原始自然风貌，溪涧飞瀑、林木苍翠，是成都周边经典徒步路线。', image: '/images/hero-mountain.png', tags: ['道教', '溪涧', '幽静'] },
  // 云南
  { id: 'r7', name: '哈巴雪山攀登', province: '云南', city: '迪庆', difficulty: 'expert', points: 110, elevation: 5396, distance: 20, duration: '3天', description: '哈巴雪山是云南著名的入门级技术型雪山，攀登路线成熟，可体验冰雪攀登。', image: '/images/hero-mountain.png', tags: ['雪山', '冰雪攀登', '技术型'] },
  { id: 'r8', name: '苍山洗马潭徒步', province: '云南', city: '大理', difficulty: 'moderate', points: 50, elevation: 4122, distance: 14, duration: '5-6小时', description: '苍山十九峰之巅，高山湖泊洗马潭碧蓝如镜，一路可见杜鹃花海和云海奇观。', image: '/images/hero-mountain.png', tags: ['高山湖泊', '杜鹃', '云海'] },
  // 浙江
  { id: 'r9', name: '莫干山竹海小径', province: '浙江', city: '湖州', difficulty: 'easy', points: 15, elevation: 719, distance: 5, duration: '2小时', description: '莫干山以翠竹闻名，漫步竹海小径，清风徐来，是江南最惬意的休闲徒步体验。', image: '/images/hero-mountain.png', tags: ['竹海', '休闲', '江南'] },
  { id: 'r10', name: '括苍山曙光之路', province: '浙江', city: '台州', difficulty: 'moderate', points: 45, elevation: 1382, distance: 8, duration: '4小时', description: '括苍山是浙东南第一高峰，山顶有巨大风车群，是观赏日出的绝佳去处。', image: '/images/hero-mountain.png', tags: ['日出', '风车', '浙东南'] },
  // 安徽
  { id: 'r11', name: '黄山西海大峡谷', province: '安徽', city: '黄山', difficulty: 'hard', points: 70, elevation: 1864, distance: 15, duration: '6-8小时', description: '黄山西海大峡谷被誉为"梦幻景区"，奇松怪石、云雾缭绕，是黄山最壮观的徒步路线。', image: '/images/hero-mountain.png', tags: ['奇松', '云海', '梦幻景区'] },
  { id: 'r12', name: '天柱山主峰穿越', province: '安徽', city: '安庆', difficulty: 'moderate', points: 55, elevation: 1489, distance: 12, duration: '5-6小时', description: '天柱山以"雄、奇、灵、秀"著称，花岗岩地貌独特，主峰天柱峰如擎天一柱。', image: '/images/hero-mountain.png', tags: ['花岗岩', '奇峰', '古南岳'] },
  // 湖南
  { id: 'r13', name: '衡山祝融峰朝圣', province: '湖南', city: '衡阳', difficulty: 'moderate', points: 45, elevation: 1300, distance: 10, duration: '4-5小时', description: '南岳衡山为五岳之一，祝融峰为最高峰，登顶可览湘南群山，历史文化底蕴深厚。', image: '/images/hero-mountain.png', tags: ['五岳', '朝圣', '文化'] },
  // 陕西
  { id: 'r14', name: '华山长空栈道', province: '陕西', city: '渭南', difficulty: 'expert', points: 95, elevation: 2155, distance: 13, duration: '7-9小时', description: '华山以"险"闻名天下，长空栈道悬于万仞绝壁之上，是最具挑战性的登山体验之一。', image: '/images/hero-mountain.png', tags: ['五岳', '险峻', '栈道'] },
  // 山东
  { id: 'r15', name: '泰山十八盘登顶', province: '山东', city: '泰安', difficulty: 'hard', points: 65, elevation: 1545, distance: 11, duration: '5-7小时', description: '泰山为五岳之首，十八盘是最经典的登山路段，1630级台阶直通南天门，气势磅礴。', image: '/images/hero-mountain.png', tags: ['五岳之首', '日出', '文化'] },
  // 西藏
  { id: 'r16', name: '冈仁波齐转山', province: '西藏', city: '阿里', difficulty: 'expert', points: 120, elevation: 6638, distance: 52, duration: '3天', description: '冈仁波齐是藏传佛教、印度教等多种宗教的神山，转山路线海拔5600米以上，意义非凡。', image: '/images/hero-mountain.png', tags: ['神山', '朝圣', '高海拔'] },
  // 广东
  { id: 'r17', name: '梧桐山凤凰台', province: '广东', city: '深圳', difficulty: 'moderate', points: 35, elevation: 944, distance: 8, duration: '3-4小时', description: '梧桐山是深圳最高峰，登顶可俯瞰深圳城区和大鹏湾，是珠三角地区最受欢迎的登山路线。', image: '/images/hero-mountain.png', tags: ['城市登山', '海景', '珠三角'] },
  { id: 'r18', name: '丹霞山长老峰', province: '广东', city: '韶关', difficulty: 'easy', points: 25, elevation: 409, distance: 6, duration: '2-3小时', description: '丹霞山是世界自然遗产，红色砂岩地貌举世闻名，长老峰观日出云海为一绝。', image: '/images/hero-mountain.png', tags: ['丹霞地貌', '世界遗产', '日出'] },
  // 江西
  { id: 'r19', name: '庐山三叠泉', province: '江西', city: '九江', difficulty: 'moderate', points: 40, elevation: 1474, distance: 9, duration: '4-5小时', description: '庐山三叠泉瀑布飞流直下，气势恢宏。沿途林荫蔽日，溪水潺潺，是避暑登山佳选。', image: '/images/hero-mountain.png', tags: ['瀑布', '避暑', '世界遗产'] },
  // 福建
  { id: 'r20', name: '武夷山天游峰', province: '福建', city: '南平', difficulty: 'easy', points: 20, elevation: 410, distance: 5, duration: '2小时', description: '天游峰是武夷山第一胜景，登顶可纵览九曲溪全景，碧水丹山尽收眼底。', image: '/images/hero-mountain.png', tags: ['丹霞', '九曲溪', '世界遗产'] },
]

const AVATARS = [
  '🧑‍🦰', '👩‍🦱', '🧔', '👩', '🧑', '👨‍🦳', '👩‍🦰', '🧑‍🦲',
]

export const MOCK_USERS: User[] = [
  { id: 'u1', name: '山野老狼', avatar: AVATARS[0], totalPoints: 1280, activitiesJoined: 42, activitiesOrganized: 15, rank: 1, badges: ['🏔️ 雪山征服者', '⭐ 活动达人', '🔥 百日登山'] },
  { id: 'u2', name: '云端行者', avatar: AVATARS[1], totalPoints: 960, activitiesJoined: 35, activitiesOrganized: 8, rank: 2, badges: ['⛰️ 五岳完登', '🌟 热心领队'] },
  { id: 'u3', name: '风中追峰', avatar: AVATARS[2], totalPoints: 845, activitiesJoined: 28, activitiesOrganized: 12, rank: 3, badges: ['🗻 高海拔先锋', '📸 最佳摄影'] },
  { id: 'u4', name: '林间漫步', avatar: AVATARS[3], totalPoints: 720, activitiesJoined: 31, activitiesOrganized: 5, rank: 4, badges: ['🌿 环保先锋'] },
  { id: 'u5', name: '峰回路转', avatar: AVATARS[4], totalPoints: 680, activitiesJoined: 25, activitiesOrganized: 10, rank: 5, badges: ['🏕️ 露营大师'] },
  { id: 'u6', name: '登顶者', avatar: AVATARS[5], totalPoints: 590, activitiesJoined: 20, activitiesOrganized: 3, rank: 6, badges: ['🎒 装备专家'] },
  { id: 'u7', name: '晨曦探路', avatar: AVATARS[6], totalPoints: 520, activitiesJoined: 18, activitiesOrganized: 7, rank: 7, badges: ['🌅 日出猎人'] },
  { id: 'u8', name: '绿野仙踪', avatar: AVATARS[7], totalPoints: 460, activitiesJoined: 16, activitiesOrganized: 2, rank: 8, badges: ['🌲 森林守护者'] },
  { id: 'u9', name: '岩上飞鹰', avatar: AVATARS[0], totalPoints: 410, activitiesJoined: 14, activitiesOrganized: 6, rank: 9, badges: ['🧗 攀岩达人'] },
  { id: 'u10', name: '溪谷幽兰', avatar: AVATARS[1], totalPoints: 380, activitiesJoined: 13, activitiesOrganized: 1, rank: 10, badges: ['💐 花卉专家'] },
]

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 'a1', title: '周末香山赏秋', routeId: 'r1', routeName: '香山红叶古道', difficulty: 'easy', points: 20, date: '2026-04-20', maxParticipants: 20, currentParticipants: 14, participants: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u1', 'u2', 'u3', 'u4'], organizer: '山野老狼', organizerAvatar: AVATARS[0], description: '一起去香山看红叶，休闲登山，适合所有水平的山友。集合地点：香山公园东门。', status: 'upcoming', province: '北京', city: '北京' },
  { id: 'a2', title: '箭扣长城重装穿越', routeId: 'r2', routeName: '箭扣长城穿越', difficulty: 'expert', points: 100, date: '2026-05-01', maxParticipants: 8, currentParticipants: 5, participants: ['u1', 'u3', 'u5', 'u6', 'u9'], organizer: '风中追峰', organizerAvatar: AVATARS[2], description: '五一假期箭扣长城穿越，西大墙至正北楼段。要求有长城穿越经验，自备重装装备。', status: 'upcoming', province: '北京', city: '怀柔' },
  { id: 'a3', title: '四姑娘山大峰攀登', routeId: 'r4', routeName: '四姑娘山大峰', difficulty: 'hard', points: 90, date: '2026-05-15', maxParticipants: 12, currentParticipants: 7, participants: ['u1', 'u2', 'u3', 'u5', 'u7', 'u9', 'u6'], organizer: '云端行者', organizerAvatar: AVATARS[1], description: '五月四姑娘山大峰攀登计划，3天行程。需要有高海拔徒步经验，提供专业向导。', status: 'upcoming', province: '四川', city: '阿坝' },
  { id: 'a4', title: '青城山后山一日游', routeId: 'r6', routeName: '青城山后山穿越', difficulty: 'moderate', points: 40, date: '2026-04-19', maxParticipants: 15, currentParticipants: 11, participants: ['u2', 'u4', 'u6', 'u7', 'u8', 'u10', 'u1', 'u3', 'u5', 'u9', 'u2'], organizer: '林间漫步', organizerAvatar: AVATARS[3], description: '周末青城山后山穿越，感受道教名山的清幽。全程约10公里，适合有一定基础的山友。', status: 'upcoming', province: '四川', city: '成都' },
  { id: 'a5', title: '黄山西海大峡谷深度游', routeId: 'r11', routeName: '黄山西海大峡谷', difficulty: 'hard', points: 70, date: '2026-04-26', maxParticipants: 10, currentParticipants: 8, participants: ['u1', 'u2', 'u3', 'u4', 'u5', 'u7', 'u8', 'u9'], organizer: '峰回路转', organizerAvatar: AVATARS[4], description: '黄山西海大峡谷两日深度游，含日出观赏。住山顶帐篷，体验最美黄山。', status: 'upcoming', province: '安徽', city: '黄山' },
  { id: 'a6', title: '泰山夜爬看日出', routeId: 'r15', routeName: '泰山十八盘登顶', difficulty: 'hard', points: 65, date: '2026-04-18', maxParticipants: 25, currentParticipants: 22, participants: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u1', 'u2'], organizer: '晨曦探路', organizerAvatar: AVATARS[6], description: '经典泰山夜爬，凌晨2点出发，登顶观日出。团队统一行动，互相照应。', status: 'upcoming', province: '山东', city: '泰安' },
  { id: 'a7', title: '莫干山亲子徒步', routeId: 'r9', routeName: '莫干山竹海小径', difficulty: 'easy', points: 15, date: '2026-04-21', maxParticipants: 30, currentParticipants: 18, participants: ['u2', 'u4', 'u6', 'u8', 'u10', 'u1', 'u3', 'u5', 'u7', 'u9', 'u2', 'u4', 'u6', 'u8', 'u10', 'u1', 'u3', 'u5'], organizer: '绿野仙踪', organizerAvatar: AVATARS[7], description: '适合亲子参加的莫干山徒步活动，竹海间漫步，享受自然。活动包含自然教育环节。', status: 'upcoming', province: '浙江', city: '湖州' },
  { id: 'a8', title: '华山西峰挑战', routeId: 'r14', routeName: '华山长空栈道', difficulty: 'expert', points: 95, date: '2026-05-10', maxParticipants: 6, currentParticipants: 3, participants: ['u1', 'u3', 'u9'], organizer: '岩上飞鹰', organizerAvatar: AVATARS[0], description: '华山西峰攀登+长空栈道体验。仅限有丰富登山经验者参加，需自备安全装备。', status: 'upcoming', province: '陕西', city: '渭南' },
]