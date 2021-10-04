import axios from '/node_modules/axios/dist/axios';
import './http';
import utils from './utils';
import { mangaAPI, mangaRankAPI, mangaHotAPI, imgsrc } from './api';
export class Manga {
  constructor(selector, info) {
    this.section = document.querySelector(selector);
    this.query = {
      recommend: (page) =>
        axios.post(mangaAPI, {
          type: 1,
          page_size: 16,
          page_num: page,
        }),
      free: () => axios.post(mangaAPI, { data: { type: 1 } }),
    };
    this.page = 1;
    this.ob = new IntersectionObserver(
      (changes) => {
        let { isIntersecting } = changes[0];
        if (isIntersecting) {
          this.ob.unobserve(this.section);
          // 渲染骨架
          this.render(info);
          // 渲染内容
          Promise.all([
            this.query.recommend(1),
            axios.post(mangaRankAPI, {
              type: 1,
              last_month_offset: 0,
            }),
            axios.post(mangaRankAPI, {
              last_month_offset: 0,
            }),
            axios.post(mangaHotAPI, { type: 2 }),
          ])
            .then((res) => {
              this.recommend = res[0].data.comics;
              this.renderMangas(this.recommend);
              this.renderLists(
                res[1].data.comics,
                res[2].data.comics,
                res[3].data
              );
              this.bindEvent(info);
            })
            .catch((err) => {
              console.log('数据获取失败');
              console.log(err);
            });
        }
      },
      { threshold: [0] }
    );
    this.ob.observe(this.section);
  }
  render(info) {
    this.section.innerHTML = `
        <section class="left">
          <h2 class="subarea-title"> 
            <svg class="icon">
            <use xlink:href="${imgsrc}/bibo.svg#${info.tag}"></use>
            </svg>
            <a href="https://manga.bilibili.com/" class="title">${info.name}</a>
            <ul class="tab">
              <li class="active" data-type="recommend"><span>人气推荐</span></li>
              <li data-type="free"><span>免费漫画推荐</span></li>
              <li>下载APP</li>
            </ul>
            <div class="change active">
              <i class="bilifont bili-icon_caozuo_huanyihuan"></i>
              <span>换一换</span>
            </div>
            <div class="more">
              <a href="https://manga.bilibili.com/">更多</a>
              <i class="bilifont bili-icon_caozuo_qianwang"></i>
            </div>
          </h2>
          <div class="mangas"></div>
        </section>
        <div class="blank"></div>
        <section class="right">
          <h2 class="subarea-title">
            <span class="title">排行榜</span>
            <ul class="tab">
              <li class="active" data-type="hots"><span>月票</span></li>
              <li data-type="free"><span>应援</span></li>
              <li data-type="uping"><span>飙升</span></li>
            </ul>
            <div class="more">
              <a href="https://www.bilibili.com/v/popular/rank/${info.tag}" target="_blank">更多</a>
              <i class="bilifont bili-icon_caozuo_qianwang"></i>
            </div>
          </h2>
          <div class="listBox">
            <ul class="lists"></ul>
          </div>
        </section>`;
    this.change = this.section.querySelector('.change');
  }
  renderMangas(data) {
    let mangaBox = this.section.querySelector('.mangas');
    mangaBox.innerHTML = data
      .map((manga) =>
        utils.Manga({
          link: `https://manga.bilibili.com/detail/mc${manga.comic_id}`,
          cover: manga.vertical_cover,
          title: manga.title,
          tag: manga.styles[0].name || manga.styles[0],
        })
      )
      .join('');
    this.change.classList.remove('active');
    utils.adjustMangas();
  }
  renderLists(tops, fans, uping) {
    let listBox = this.section.querySelector('.listBox');
    let lists = listBox.querySelector('.lists');
    let size = getComputedStyle(listBox);
    let str = '';
    [tops, fans, uping].forEach((list) => {
      str += `
      <ul class="ranklist" style="height:${parseFloat(size.height)}px">
      ${list
        .map((manga, index) =>
          utils.RankItem('manga', {
            rank: index + 1,
            title: manga.title,
            cover: manga.vertical_cover,
            tag: manga.styles[0].name || manga.styles[0],
            update: manga.last_short_title,
            link: `https://manga.bilibili.com/detail/mc${manga.comic_id}`,
          })
        )
        .join('')}
      </ul>`;
    });
    lists.innerHTML = str;
    lists.style.width = 3 * parseFloat(size.width) + 'px';
    utils.adjustLists();
  }
  bindEvent() {
    let mainTab = this.section.querySelector('.left .tab');
    let mainTabList = mainTab.querySelectorAll('li');
    let rightTab = this.section.querySelector('.right .tab');
    let rightTabList = rightTab.querySelectorAll('li');
    let listBox = this.section.querySelector('.lists');
    let list = listBox.querySelector('.ranklist');
    let width = parseFloat(getComputedStyle(list).width);
    let type = 'recommend';
    this.section.addEventListener('click', (e) => {
      // 选项卡 推荐
      let tar = e.target;
      if (e.path.includes(mainTab)) {
        if (tar.tagName.toLowerCase() === 'span') tar = tar.parentElement;
        type = tar.dataset.type;
        if (!type) return;
        if (!this[type])
          this.query[type]().then((res) => {
            this[type] = res.data.comics || res.data;
            this.renderMangas(this[type]);
          });
        else this.renderMangas(this[type]);
        mainTabList.forEach((item) => {
          if (item === tar) item.classList.add('active');
          else item.classList.remove('active');
        });
      }
      // 选项卡 排行
      if (e.path.includes(rightTab)) {
        if (tar.tagName.toLowerCase() === 'span') tar = tar.parentElement;
        let i = [].indexOf.call(rightTabList, tar);
        listBox.style.transform = `translateX(${-i * width}px)`;
        rightTabList.forEach((item) => {
          if (item === tar) item.classList.add('active');
          else item.classList.remove('active');
        });
      }
      // 换一换
      if (e.path.includes(this.change)) {
        this.change.classList.add('active');
        this.page = (this.page % 10) + 1;
        if (type)
          this.query[type](this.page)
            .then((res) => {
              this[type] = res.data.comics || res.data;
              this.renderMangas(this[type]);
            })
            .catch((err) => {
              console.log('数据获取失败');
              console.log(err);
            });
      }
    });
  }
}
