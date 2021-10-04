import axios from '/node_modules/axios/dist/axios';
import './http';
import utils from './utils';
import { Swiper } from './swiper';
import { changeAPI, followAPI, imgsrc } from './api';

export class Live {
  constructor(selector, url, styles) {
    this.live = document.querySelector(selector);
    this.size = { width: 44, height: 44 };
    this.ob = new IntersectionObserver(
      (changes) => {
        let { isIntersecting } = changes[0];
        if (isIntersecting) {
          this.render();
          axios
            .get(url)
            .then((res) => {
              this.render(res.data, styles);
              this.bindEvent(res.data);
              this.ob.unobserve(this.live);
            })
            .catch((err) => {
              console.log('数据获取失败');
              console.log(err);
            });
        }
      },
      { threshold: [0] }
    );
    this.ob.observe(this.live);
  }
  render(data, styles) {
    styles = {
      coverW: 206,
      coverH: 116,
      imgQ: 100,
      imgF: 'webp',
      videoW: 206,
      videoH: 194,
      ...styles,
    };
    // 渲染骨架
    if (!data) {
      this.live.innerHTML = `
        <section class="left">
          <h2 class="subarea-title"> 
            <svg class="icon">
              <use xlink:href="${imgsrc}/bibo.svg#live"></use>
            </svg>
            <a href="https://live.bilibili.com" class="title">正在直播</a>
            <span class="description">当前共有 <span></span> 个在线直播</span>
            <div class="change active">
            <i class="bilifont bili-icon_caozuo_huanyihuan"></i>
            <span>换一换</span>
            </div>
            <div class="more">
              <a href='https://live.bilibili.com'>更多</a>
              <i class="bilifont bili-icon_caozuo_qianwang"></i>
            </div>
          </h2>
          <div class="videoArea">
            <div class="videos"></div>
          </div>
        </section>
        <div class="blank"></div>
        <section class="right">
          <ul class="tab-bar">
          <li data-name="rank">直播排行</li>
          <li data-name="following">关注的主播</li>
          <li data-name="recommend" class="active">为你推荐</li>
          </ul>
         <ul class="tab-content">
          <li class="rank" data-name="rank">
              <ul class="live-list"></ul>
            </li>
            <li class="following active" data-name="following">
            </li>
            <li class="recommend active" data-name="recommend">
              <div class="swiper" id="live-swiper">
                <ul></ul>
                <p class="title"></p>
                <ul class="page"></ul>
              </div>
            </li>
          </ul>
        </section>`;
      return;
    }
    // 渲染内容
    this.living = this.live.querySelector('.description span');
    this.change = this.live.querySelector('.change');
    this.recommend = this.live.querySelector('.videos');
    this.rank = this.live.querySelector('.live-list');
    this.living.innerText = data.online_total;
    this.change.classList.remove('active');
    // 直播推荐
    this.recommend.innerHTML = this.liveRecommend(data.recommend_room_list);
    // 排行榜
    this.rank.innerHTML = this.liveRank(data.ranking_list);
    utils.adjustVideos();
  }

  bindEvent(data) {
    // 轮播图
    let swiperData = data.preview_banner_list.map((item) => {
      return { link: item.link, img: item.pic, title: item.title };
    });
    new Swiper('#live-swiper', swiperData);
    // 选项卡
    let tabBar = this.live.querySelector('.tab-bar');
    let tabList = Array.from(tabBar.querySelectorAll('li'));
    let tabContents = this.live.querySelectorAll('.tab-content li');
    this.live.addEventListener('click', (e) => {
      if (e.path.includes(this.change)) {
        // 换一换
        this.change.classList.add('active');
        axios.get(changeAPI).then((res) => {
          this.recommend.innerHTML = this.liveRecommend(
            res.data.recommend_room_list
          );
          utils.adjustVideos();
          this.change.classList.remove('active');
        });
      }
      if (e.path.includes(tabBar)) {
        if (e.target.tagName.toUpperCase() !== 'LI') return;
        let name = e.target.dataset.name;
        tabList.forEach((item) => {
          if (item === e.target) item.classList.add('active');
          else item.classList.remove('active');
        });
        tabContents.forEach((tabContent) => {
          if (tabContent.dataset.name === name)
            tabContent.classList.add('active');
          else tabContent.classList.remove('active');
        });
        // 关注列表 (API 需要登录认证)
        if (name === 'following')
          axios.get(followAPI).then((data) => {
            let followlist = this.live.querySelector('.following');
            let list = Array.from(data.data.list);
            let followStr = list
              .map((video) => {
                return utils.LiveList('follow', {
                  link: `${video.link}`,
                  title: video.title,
                  up: video.uname,
                  avatar: utils.handleImgUrl(video.face, this.size),
                  watching: utils.handleNumber(video.online),
                });
              })
              .join('');
            followlist.innerHTML = `<ul class="live-list">${followStr}</ul>`;
          });
      }
    });
    // 直播预览
    this.live.addEventListener('mouseover', (e) => {
      let tar = e.target;
      if (tar.tagName.toLowerCase() === 'img') {
        let url = tar.getAttribute('data-url');
        if (!url) return;
        let img = new Image();
        img.onload = () => {
          tar.src = url;
          tar.style.opacity = 1;
        };
        img.src = url;
      }
    });
  }
  liveRecommend = (list) => {
    return Array.from(list)
      .map((video) => {
        return utils.Video('live', {
          link: `https://live.bilibili.com${video.link}`,
          cover: utils.handleImgUrl(video.cover),
          title: video.title,
          up: video.uname,
          upavatar: utils.handleImgUrl(video.face),
          keyframe: utils.handleImgUrl(video.keyframe),
          tag: video.area_v2_name,
          verified: video.verify.type,
          watching: utils.handleNumber(video.online),
        });
      })
      .join('');
  };
  liveRank = (rank) => {
    return Array.from(rank)
      .map((video, index) => {
        return utils.LiveList('rank', {
          link: `${video.link}`,
          title: video.title,
          up: video.uname,
          avatar: utils.handleImgUrl(video.face, this.size),
          watching: utils.handleNumber(video.online),
          rank: index + 1,
        });
      })
      .join('');
  };
  liveFollow = (follow) => {};
}
