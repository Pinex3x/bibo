import axios from '/node_modules/axios/dist/axios';
import './http';
import utils from './utils';
import { columnAPI, columnRankAPI, imgsrc } from './api';

export class Column {
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
    this.section.innerHTML = `
      <section class="left">
        <h2 class="subarea-title"> 
          <svg class="icon">
          <use xlink:href="${imgsrc}/bibo.svg#${info.tag}"></use>
          </svg>
          <a href="https://www.bilibili.com/read/home/" target="_blank" class="title">${info.name}</a>
          <div class="change active">
            <i class="bilifont bili-icon_caozuo_huanyihuan"></i>
            <span>换一换</span>
          </div>
          <div class="more">
            <a href="https://www.bilibili.com/read/home/" target="_blank">更多</a>
            <i class="bilifont bili-icon_caozuo_qianwang"></i>
          </div>
        </h2>
        <div class="columns"></div>
      </section>
      <div class="blank"></div>
      <section class="right">
        <h2 class="subarea-title">
          <span class="title">排行榜</span>
          <div class="more">
              <a href="https://www.bilibili.com/read/ranking" target="_blank">更多</a>
              <i class="bilifont bili-icon_caozuo_qianwang"></i>
          </div>
        </h2>
        <ul class="ranklist"></ul>
      </section>`;
    this.change = this.section.querySelector('.change');
  }
  renderContent(info) {
    let { ps = 13, cid } = info;
    Promise.all([
      axios.get(columnAPI, { params: { ps } }),
      axios.get(columnRankAPI, { params: { cid } }),
    ])
      .then((res) => {
        this.bindEvent(info);
        this.renderColumns(res[0].data);
        this.renderList(res[1].data);
      })
      .catch((err) => {
        console.log('数据获取失败');
        console.log(err);
      });
  }
  renderColumns(data) {
    let columns = this.section.querySelector('.columns');
    columns.innerHTML = data
      .map((column) =>
        utils.Column({
          link: `https://www.bilibili.com/read/cv${column.id}/`,
          cover: column.image_urls[0],
          title: column.title,
          up: column.author.name,
          uplink: `https://space.bilibili.com/${column.author.mid}`,
          view: column.stats.view,
          comment: column.stats.reply,
        })
      )
      .join('');
    this.change.classList.remove('active');
  }
  renderList(list) {
    let rank = this.section.querySelector('.ranklist');
    rank.innerHTML = list
      .map((column, index) =>
        utils.RankItem('column', {
          rank: index + 1,
          link: `https://www.bilibili.com/read/cv${column.id}/`,
          cover: column.image_urls[0],
          title: column.title,
          up: column.author.name,
          uplink: column.author.face,
          view: column.stats.view,
          comment: column.stats.reply,
          score: utils.handleNumber(column.score),
        })
      )
      .join('');
    utils.adjustLists();
  }
  bindEvent(info) {
    let { ps = 13 } = info;
    this.section.addEventListener('click', (e) => {
      let path = e.path || (e.composedPath && e.composedPath());
      if (path.includes(this.change)) {
        this.change.classList.add('active');
        axios
          .get(columnAPI, { params: { ps } })
          .then((res) => {
            this.renderColumns(res.data);
          })
          .catch((err) => {
            console.log('数据获取失败');
            console.log(err);
          });
      }
    });
  }
}
