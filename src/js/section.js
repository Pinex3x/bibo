import axios from '/node_modules/axios/dist/axios';
import './http';
import utils from './utils';
import { Swiper } from './swiper';
import {
  regionAPI,
  rankAPI,
  animeAPI,
  animeRankAPI,
  txtRankAPI,
  gcSwiperAPI,
  lessonAPI,
  informationAPI,
  imgsrc,
} from './api';

export class Section {
  constructor(selector, info) {
    this.section = document.querySelector(selector);
    this.videoSize = { width: 206, height: 116 };
    this.ob = new IntersectionObserver(
      (changes) => {
        let { isIntersecting } = changes[0];
        if (isIntersecting) {
          this.ob.unobserve(this.section);
          // 渲染骨架
          this.render(info);
          // 渲染内容
          this.renderContent(info);
        }
      },
      { threshold: [0] }
    );
    this.ob.observe(this.section);
  }
  render(info) {
    if (info.type === 'anime' || info.type === 'guochuang') {
      let str = `
        <section class="section">
          <section class="left">
            <h2 class="subarea-title"> 
              <svg class="icon">
              <use xlink:href="${imgsrc}/bibo.svg#${info.tag}"></use>
              </svg>
              <a href="https://www.bilibili.com/${
                info.tag
              }" target="_blank" class="title">${info.name}</a>
              <ul class="week">
                <li class="active" data-day="-1">最新</li>
                <li data-day="0">周一</li>
                <li data-day="1">周二</li>
                <li data-day="2">周三</li>
                <li data-day="3">周四</li>
                <li data-day="4">周五</li>
                <li data-day="5">周六</li>
                <li data-day="6">周日</li>
              </ul>
              <a href="https://www.bilibili.com/anime/timeline/" target="_blank" class="timeline">新番时间表 <i class="bilifont bili-icon_caozuo_qianwang"></i></a>
            </h2>
            <div class="animes"></div>
            </section>
            <div class="blank"></div>
            <section class="right">
              <h2 class="subarea-title">
              <span class="title">排行榜</span>
              <div class="more">
                <a href="https://www.bilibili.com/v/popular/rank/${
                  info.tag
                }" target="_blank">更多</a>
                <i class="bilifont bili-icon_caozuo_qianwang"></i>
              </div>
              </h2>
              <ul class="ranklist"></ul>
            </section>
          </section>
        <section class="section">
          <section class="left">
            <h2 class="subarea-title"> 
              <a href="https://www.bilibili.com/${
                info.tag
              }" target="_blank" class="title">${info.subtitle}</a>
              <div class="change active">
                <i class="bilifont bili-icon_caozuo_huanyihuan"></i>
                <span>换一换</span>
              </div>
              <div class="more">
                <a href="https://www.bilibili.com/${
                  info.tag
                }" target="_blank">更多</a>
                <i class="bilifont bili-icon_caozuo_qianwang"></i>
              </div>
            </h2>
            <div class="videoArea">
            <div class="videos"></div>
            </div>
          </section>
          <div class="blank"></div>
          <section class="right">
          ${
            info.type === 'anime'
              ? `<h2 class="subarea-title"><span class="title">特别推荐</span></h2>
              <div class="swiper">
              <ul></ul>
              <p class="title"></p>
              <ul class="page"></ul>
              </div>`
              : ` <h2 class="subarea-title">
                    <span class="title">排行榜</span>
                      <div class="more">
                        <a href="https://www.bilibili.com/v/popular/rank/${info.tag}" target="_blank">更多</a>
                        <i class="bilifont bili-icon_caozuo_qianwang"></i>
                      </div>
                  </h2>
                  <ul class="ranklist"></ul>`
          }
          </section>
        </section>
      </section>`;
      this.section.innerHTML = str;
    } else
      this.section.innerHTML = `
        <section class="left">
          <h2 class="subarea-title"> 
            <svg class="icon">
            <use xlink:href="${imgsrc}/bibo.svg#${info.tag}"></use>
            </svg>
            <a href="https://www.bilibili.com/v/${
              info.tag
            }" target="_blank" class="title">${info.name}</a>
            <div class="change active">
              <i class="bilifont bili-icon_caozuo_huanyihuan"></i>
              <span>换一换</span>
            </div>
            <div class="more">
              <a href="https://www.bilibili.com/v/${
                info.tag
              }" target="_blank" >更多</a>
              <i class="bilifont bili-icon_caozuo_qianwang"></i>
            </div>
          </h2>
          <div class="videoArea">
            <div class="videos"></div>
          </div>
        </section>
        <div class="blank"></div>
        <section class="right">
          <h2 class="subarea-title">
          ${
            info.type === 'lesson'
              ? '&nbsp;'
              : info.type === 'information'
              ? '资讯分区正式上线啦!'
              : `<span class="title">排行榜</span>
                    <div class="more">
                      <a href="https://www.bilibili.com/v/popular/rank/${info.tag}" target="_blank">更多</a>
                      <i class="bilifont bili-icon_caozuo_qianwang"></i>
                    </div>`
          }
          </h2>
          <ul class="ranklist"></ul>
        </section>`;
    return;
  }
  renderContent(info) {
    this.change = this.section.querySelector('.change');
    let { rid, ps = 12, season_type, type } = info;
    switch (type) {
      case 'anime':
        Promise.all([
          axios.get(animeAPI, { params: { season_type } }),
          axios.get(animeRankAPI, { params: { season_type, day: 3 } }),
          axios.get(regionAPI, {
            params: {
              rid,
              ps,
            },
          }),
          axios.get(gcSwiperAPI, { params: { position_id: 104 } }),
        ])
          .then((res) => {
            this.bindEvent(res[0].result, info);
            this.renderWeek(res[0].result.latest);
            this.renderList(res[1].result.list, type);
            this.renderVideos(res[2], type);
            this.renderSwiper(res[3]);
          })
          .catch((err) => {
            console.log('数据获取失败');
            console.log(err);
          });
        break;
      case 'guochuang':
        let list = this.section.querySelectorAll('.ranklist');
        Promise.all([
          axios.get(animeAPI, { params: { season_type } }),
          axios.get(txtRankAPI, { params: { season_type } }),
          axios.get(regionAPI, {
            params: {
              rid,
              ps,
            },
          }),
          axios.get(rankAPI, { params: { rid } }),
        ])
          .then((res) => {
            this.bindEvent(res[0].result, info);
            this.renderWeek(res[0].result.latest);
            this.renderList(res[1].data.list, 'anime', list[0]);
            this.renderVideos(res[2], type);
            this.renderList(res[3].data, 'video', list[1]);
          })
          .catch((err) => {
            console.log('数据获取失败');
            console.log(err);
          });
        break;
      case 'lesson':
        axios
          .get(lessonAPI)
          .then((res) => {
            this.bindEvent(null, info);
            this.renderVideos(res, type);
            this.renderList(null, type);
          })
          .catch((err) => {
            console.log('数据获取失败');
            console.log(err);
          });
        break;
      case 'information':
        axios
          .get(informationAPI, { params: { ps: 12, rid } })
          .then((res) => {
            this.bindEvent(null, info);
            this.renderVideos(res, type);
            this.renderList(null, type);
          })
          .catch((err) => {
            console.log('数据获取失败');
            console.log(err);
          });
        break;
      case 'movie':
        Promise.all([
          axios.get(regionAPI, {
            params: {
              rid,
              ps,
            },
          }),
          axios.get(txtRankAPI, { params: { season_type } }),
        ])
          .then((res) => {
            let list;
            if (res[1].data) {
              list = res[1].data.list || res[1].data.items || res[1].data;
            } else list = res[1].result;
            this.bindEvent(null, info);
            this.renderVideos(res[0], type);
            this.renderList(list, type);
          })
          .catch((err) => {
            console.log('数据获取失败');
            console.log(err);
          });
        break;
      default:
        Promise.all([
          axios.get(regionAPI, {
            params: {
              rid,
              ps,
            },
          }),
          axios.get(rankAPI, { params: { rid } }),
        ])
          .then((res) => {
            let list;
            if (res[1].data) {
              list = res[1].data.list || res[1].data.items || res[1].data;
            } else list = res[1].result;
            this.bindEvent(null, info);
            this.renderVideos(res[0], type);
            this.renderList(list, type);
          })
          .catch((err) => {
            console.log('数据获取失败');
            console.log(err);
          });
        break;
    }
  }
  renderVideos(data, type = 'video') {
    let videos = this.section.querySelector('.videos');
    let videoList, videoStr;
    if (type === 'information') {
      videoList = Array.from(data.data.items);
      videoStr = videoList
        .map((video) => {
          return utils.Video('mix', {
            aid: video.id,
            link: `https://www.bilibili.com/video/${video.bvid}`,
            cover: utils.handleImgUrl(video.pic || video.cover),
            title: video.title,
            play: utils.handleNumber(video.stat.view),
            like: utils.handleNumber(video.stat.like),
            time: video.duration,
            crown: '',
            up: video.author.name,
            uplink: `https://space.bilibili.com/${video.author.mid}/`,
          });
        })
        .join('');
    } else if (type === 'lesson') {
      videoList = Array.from(data.data.season);
      videoStr = videoList
        .map((video) => {
          return utils.Video('lesson', {
            link: video.link,
            cover: utils.handleImgUrl(video.pic || video.cover),
            title: video.title,
            play: utils.handleNumber(video.play),
            updateinfo: video.update_info,
          });
        })
        .join('');
    } else {
      videoList = Array.from(data.data.archives);
      videoStr = videoList
        .map((video) => {
          return utils.Video('mix', {
            aid: video.aid,
            link: `https://www.bilibili.com/video/${video.bvid}`,
            cover: utils.handleImgUrl(video.pic),
            title: video.title,
            play: utils.handleNumber(video.stat.view),
            like: utils.handleNumber(video.stat.like),
            time: video.duration,
            crown:
              video.stat.coin < 2000
                ? ''
                : video.stat.coin < 10000
                ? 'silver'
                : 'gold',
            up: video.owner.name,
            uplink: `https://space.bilibili.com/${video.owner.mid}/`,
          });
        })
        .join('');
    }
    this.change.classList.remove('active');
    videos.innerHTML = videoStr;
    utils.adjustVideos();
  }
  renderList(list, type = 'video', listEle) {
    listEle = listEle || this.section.querySelector('.ranklist');
    let rankStr;
    if (type === 'video') {
      rankStr = [...list]
        .map((video, index) => {
          return utils.RankItem('video', {
            rank: index + 1,
            link: `https://www.bilibili.com/video/${video.bvid}`,
            pic: utils.handleImgUrl(video.pic),
            title: video.title,
            score: utils.handleNumber(video.pts),
            up: video.author,
            pubdate: video.create.split(' ')[0],
            play: utils.handleNumber(video.play),
            danmaku: utils.handleNumber(video.review),
            favor: utils.handleNumber(video.favorites),
            coin: utils.handleNumber(video.coins),
          });
        })
        .join('');
    }
    if (type === 'movie' || type === 'anime') {
      rankStr = [...list]
        .map((video, index) => {
          return utils.RankItem('movie', {
            rank: index + 1,
            link: video.url,
            title: video.title,
            desc: video.new_ep.index_show || video.desc,
            play: utils.handleNumber(video.play),
            danmaku: utils.handleNumber(video.review),
            favor: utils.handleNumber(video.favorites),
            coin: utils.handleNumber(video.coins),
          });
        })
        .join('');
    }
    if (type === 'lesson') {
      rankStr = `<a href="https://www.bilibili.com/cheese/" target="blank"><img src="${utils.handleImgUrl(
        'https://i0.hdslb.com/bfs/activity-plat/static/20200714/953d0bfef678072bd11ec5fb6ff04190/nMOp2aGOf.png',
        {
          width: 320,
          height: 370,
        }
      )}"></img></a>`;
    }
    if (type === 'information') {
      rankStr = `<a href="https://www.bilibili.com/v/information/" target="_blank"><img src="${utils.handleImgUrl(
        'https://i0.hdslb.com/bfs/archive/0747d26dbbc3bbf087d47cff49e598a326b0030c.jpg',
        {
          width: 320,
          height: 400,
        }
      )}"></img></a>`;
    }
    listEle.innerHTML = rankStr;
    utils.adjustLists();
  }
  renderWeek(data) {
    let animes = this.section.querySelector('.animes');
    if (!data.length) {
      animes.innerHTML = '<span>今天没有番剧更新</span>';
      animes.classList.add('no-data');
      return;
    }
    animes.classList.remove('no-data');
    animes.innerHTML = data
      .map(
        (anime) =>
          `<div class="animecard">
            <img src="${utils.handleImgUrl(anime.square_cover)}">
            <p class="detail">
              <a href="https://www.bilibili.com/bangumi/play/ss${
                anime.seaason_id
              } target="_blank"/">${anime.title}</a>
              <a href="https://www.bilibili.com/bangumi/play/ss${
                anime.episode_id + 1
              } target="_blank"/" class='pub'>${anime.pub_index}</a>
            </p>
          </div>`
      )
      .join('');
  }
  renderSwiper(data) {
    let swiperData = data.result.map((item) => {
      return {
        link: item.link || item.blink,
        img: item.pic || item.img || item.cover,
        title: item.title,
      };
    });
    new Swiper(this.section.querySelector('.swiper'), swiperData);
  }
  bindEvent(data, info) {
    let { type, rid, ps = 12 } = info;
    let tab, tabList;
    if (data !== null) {
      tab = this.section.querySelector('.week');
      tabList = tab.querySelectorAll('li');
    }

    this.section.addEventListener('click', (e) => {
      let tar = e.target;
      // 选项卡
      if (data && e.path.includes(tab)) {
        if (tar.tagName.toLowerCase() !== 'li') return;
        let day = tar.dataset.day;
        let info;
        if (day < 0) info = data.latest;
        else info = data.timeline[day].episodes;
        tabList.forEach((item) => {
          if (item === tar) item.classList.add('active');
          else item.classList.remove('active');
        });
        this.renderWeek(info);
      }
      // 换一换
      if (e.path.includes(this.change)) {
        this.change.classList.add('active');
        let api;
        if (type === 'lesson') {
          api = lessonAPI;
          axios
            .get(api)
            .then((res) => {
              this.renderVideos(res, type);
            })
            .catch((err) => {
              console.log('数据获取失败');
              console.log(err);
            });
        } else {
          if (type === 'information') api = informationAPI;
          else api = regionAPI;
          axios
            .get(regionAPI, {
              params: {
                rid,
                ps,
              },
            })
            .then((res) => {
              this.renderVideos(res, type);
            })
            .catch((err) => {
              console.log('数据获取失败');
              console.log(err);
            });
        }
      }
    });
  }
}
