import type { City } from '@/types';

export const CITIES: City[] = [
  {
    id: 'beijing',
    name: '北京',
    country: '中国',
    lat: 39.9042,
    lon: 116.4074,
    landmarks: [
      { name: '故宫', description: '红墙金瓦的皇家宫殿，六百年历史沉淀，宏伟壮丽' },
      { name: '长城', description: '蜿蜒于群山之巅的古老城墙，气势磅礴' },
      { name: '天坛', description: '蓝色琉璃瓦圆形祭坛，庄严肃穆的皇家祭祀场所' },
      { name: '798艺术区', description: '工业风现代艺术园区，涂鸦墙和画廊林立' },
      { name: '颐和园', description: '皇家园林，昆明湖畔十七孔桥，古典与自然完美融合' },
      { name: '南锣鼓巷', description: '老北京胡同文化，灰砖青瓦间感受京城烟火气' },
    ],
  },
  {
    id: 'shanghai',
    name: '上海',
    country: '中国',
    lat: 31.2304,
    lon: 121.4737,
    landmarks: [
      { name: '外滩', description: '黄浦江畔万国建筑群，浦东摩天楼天际线尽收眼底' },
      { name: '豫园', description: '江南古典园林，亭台楼阁曲径通幽' },
      { name: '陆家嘴', description: '摩天大楼林立，东方明珠与上海中心交相辉映' },
      { name: '新天地', description: '石库门风格时尚街区，中西合璧的优雅氛围' },
      { name: '武康路', description: '梧桐树下法式洋房，浪漫文艺的上海小马路' },
      { name: '迪士尼乐园', description: '梦幻童话城堡，充满魔法与欢乐的奇妙世界' },
    ],
  },
  {
    id: 'guangzhou',
    name: '广州',
    country: '中国',
    lat: 23.1291,
    lon: 113.2644,
    landmarks: [
      { name: '广州塔', description: '小蛮腰地标建筑，珠江夜景璀璨夺目' },
      { name: '沙面', description: '欧陆风情建筑群，绿树成荫的浪漫小岛' },
      { name: '陈家祠', description: '岭南建筑艺术明珠，精美绝伦的木雕砖雕' },
      { name: '白云山', description: '南粤名山，登高望远俯瞰羊城全景' },
      { name: '永庆坊', description: '西关风情老街，非遗文化与现代创意的碰撞' },
    ],
  },
  {
    id: 'chengdu',
    name: '成都',
    country: '中国',
    lat: 30.5728,
    lon: 104.0668,
    landmarks: [
      { name: '宽窄巷子', description: '清代古街巷，青砖黛瓦间品味慢生活' },
      { name: '锦里', description: '三国文化古街，红灯笼映照下的蜀汉风情' },
      { name: '大熊猫基地', description: '竹林深处的熊猫乐园，与国宝亲密接触' },
      { name: '都江堰', description: '千年水利工程，青山绿水间的古人智慧' },
      { name: '太古里', description: '现代与传统碰撞的时尚地标，潮流达人聚集地' },
    ],
  },
  {
    id: 'hangzhou',
    name: '杭州',
    country: '中国',
    lat: 30.2741,
    lon: 120.1551,
    landmarks: [
      { name: '西湖', description: '断桥残雪苏堤春晓，江南诗意尽在湖光山色中' },
      { name: '灵隐寺', description: '千年古刹隐于山林，禅意悠远的佛国净土' },
      { name: '龙井茶园', description: '翠绿茶园层层叠叠，茶香四溢的自然画卷' },
      { name: '南宋御街', description: '南宋风韵步行街，白墙黑瓦的江南建筑群' },
      { name: '西溪湿地', description: '城市中的自然绿洲，芦苇荡中小舟轻泛' },
    ],
  },
  {
    id: 'shenzhen',
    name: '深圳',
    country: '中国',
    lat: 22.5431,
    lon: 114.0579,
    landmarks: [
      { name: '深圳湾公园', description: '海滨绿道，面朝大海的现代都市休闲地' },
      { name: '华侨城创意园', description: '文艺创意园区，工业遗迹中绽放艺术之花' },
      { name: '世界之窗', description: '世界名胜微缩景观，一日看遍全球风情' },
      { name: '大鹏所城', description: '明清海防古城，海风中的历史沧桑' },
    ],
  },
  {
    id: 'tokyo',
    name: '东京',
    country: '日本',
    lat: 35.6762,
    lon: 139.6503,
    landmarks: [
      { name: '浅草寺', description: '朱红雷门与五重塔，东京最古寺庙的和风雅韵' },
      { name: '涩谷十字路口', description: '世界最繁忙路口，霓虹闪烁的都市脉搏' },
      { name: '明治神宫', description: '都市森林中的宁静神宫，参天古木环绕' },
      { name: '目黑川', description: '樱花隧道下的浪漫步道，春日粉雪纷飞' },
      { name: '银座', description: '东京奢华购物区，精致橱窗与建筑美学' },
    ],
  },
  {
    id: 'paris',
    name: '巴黎',
    country: '法国',
    lat: 48.8566,
    lon: 2.3522,
    landmarks: [
      { name: '埃菲尔铁塔', description: '巴黎地标，塞纳河畔的铁艺浪漫' },
      { name: '卢浮宫', description: '玻璃金字塔与古典宫殿的完美融合' },
      { name: '蒙马特高地', description: '圣心教堂下的艺术街区，画家与街头艺人' },
      { name: '塞纳河畔', description: '河岸书摊与古老桥梁，巴黎的流动盛宴' },
    ],
  },
  {
    id: 'new-york',
    name: '纽约',
    country: '美国',
    lat: 40.7128,
    lon: -74.006,
    landmarks: [
      { name: '中央公园', description: '曼哈顿的绿色心脏，摩天楼环绕的静谧' },
      { name: '布鲁克林大桥', description: '哥特式石塔悬索桥，纽约天际线最佳观赏点' },
      { name: '时代广场', description: '霓虹闪烁的十字路口，世界中心的繁华' },
      { name: 'SoHo', description: '铸铁建筑群与精品店，纽约最时髦的街区' },
    ],
  },
];

export function getCityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export function getCityByName(name: string): City | undefined {
  return CITIES.find((c) => c.name === name);
}

export function getDefaultCity(): City {
  return CITIES[0];
}
