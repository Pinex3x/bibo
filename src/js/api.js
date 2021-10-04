const rcmdAPI = 'https://api.bilibili.com/x/web-interface/index/top/rcmd';
const regionAPI = 'https://api.bilibili.com/x/web-interface/dynamic/region';
const rankAPI = 'https://api.bilibili.com/x/web-interface/ranking/region';
const liveAPI =
  'https://api.live.bilibili.com/xlive/web-interface/v1/webMain/getList?platform=web';
const changeAPI =
  'https://api.live.bilibili.com/xlive/web-interface/v1/webMain/getMoreRecList?platform=web';
const preAPI = 'http://api.bilibili.com/pvideo';
const danmuAPI = 'http://api.bilibili.com/x/v2/dm/ajax';
const followAPI = '/living-follow.json';
// const followAPI = 'https://api.live.bilibili.com/relation/v1/feed/feed_list?pagesize=6&page=1';
const animeAPI = 'https://api.bilibili.com/pgc/web/timeline/v2'; // season_type=1 番剧 4 国创
const animeRankAPI = 'https://api.bilibili.com/pgc/web/rank/list'; // season_type=1&day=3
const txtRankAPI = 'https://api.bilibili.com/pgc/season/rank/web/list'; // season_type=4 国创 season_type=3 纪录片 season_type=2 电影
const gcSwiperAPI = 'https://api.bilibili.com/pgc/operation/api/slideshow'; // ?position_id=104
const lessonAPI = 'https://api.bilibili.com/pugv/app/web/floor/switch'; // ?load_type=1
const informationAPI = 'https://api.bilibili.com/x/web-interface/information'; // ?ps=12&rid=202
const columnAPI = 'https://api.bilibili.com/x/article/recommends'; // ?ps=8
const columnRankAPI = 'https://api.bilibili.com/x/article/rank/list'; // ?cid=3
// POST
const mangaAPI =
  'https://manga.bilibili.com/twirp/comic.v1.Comic/GetRecommendComics'; // type: 1, page_size: 12, page_num: 1
const mangaRankAPI = 'https://manga.bilibili.com/twirp/comic.v1.Comic/HomeFans'; // "type": 1, "last_month_offset": 0 / "last_month_offset": 0
const mangaHotAPI = 'https://manga.bilibili.com/twirp/comic.v1.Comic/HomeHot'; // type: 2

const imgsrc = './src/img';
const imgsrcol = 'https://pinewe.oss-cn-shanghai.aliyuncs.com/pic_bed/img';

export {
  rcmdAPI,
  regionAPI,
  rankAPI,
  liveAPI,
  changeAPI,
  preAPI,
  danmuAPI,
  followAPI,
  mangaAPI,
  animeAPI,
  animeRankAPI,
  txtRankAPI,
  gcSwiperAPI,
  lessonAPI,
  informationAPI,
  columnAPI,
  columnRankAPI,
  mangaRankAPI,
  mangaHotAPI,
  imgsrc,
  imgsrcol,
};
