import axios from '/node_modules/axios/dist/axios';
import './http';
import { preAPI, danmuAPI, regionAPI, regionRankAPI, imgsrc } from './api';

var getProto = Object.getPrototypeOf;
var class2type = {};
var toString = class2type.toString; //Object.prototype.toString
var hasOwn = class2type.hasOwnProperty; //Object.prototype.hasOwnProperty
var fnToString = hasOwn.toString; //Function.prototype.toString
var ObjectFunctionString = fnToString.call(Object); //'function Object() { [native code] }'

// 检测是否是一个函数
var isFunction = function isFunction(obj) {
  // 排除部分浏览器中 `typeof document.createElement( "object" ) === "function"` && `typeof document.getElementsByTagName("div") === "function"`
  return (
    typeof obj === 'function' &&
    typeof obj.nodeType !== 'number' &&
    typeof obj.item !== 'function'
  );
};

// 检测是否是window对象
var isWindow = function isWindow(obj) {
  return obj != null && obj === obj.window;
};

// 检测数据类型的通用办法
var toType = function toType(obj) {
  if (obj == null) return obj + '';
  return /^(object|function)$/.test(typeof obj)
    ? /^\[object (\w+)\]$/g.exec(toString.call(obj))[1].toLowerCase()
    : typeof obj;
};

// 检测是否为数组或者类数组
var isArrayLike = function isArrayLike(obj) {
  var length = !!obj && 'length' in obj && obj.length,
    type = toType(obj);
  if (isFunction(obj) || isWindow(obj)) return false;
  return (
    type === 'array' ||
    length === 0 ||
    (typeof length === 'number' && length > 0 && length - 1 in obj)
  );
};

// 检测是否为纯粹对象「纯粹对象：obj.__proto__===Object.prototype」
var isPlainObject = function isPlainObject(obj) {
  var proto, Ctor;
  if (toType(obj) !== 'object') return false;
  proto = getProto(obj);
  if (!proto) return true; // Object.create(null) are plain
  Ctor = hasOwn.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor === 'function' && Ctor === Object;
};

// 检测是否为空对象
var isEmptyObject = function isEmptyObject(obj) {
  // Object.keys:获取对象所有非Symbol类型的私有属性「含属性名的数组集合」
  // Object.getOwnPropertySymbols:获取所有Symbol类型的私有属性
  var keys = Object.keys(obj);
  if (typeof Symbol !== 'undefined')
    keys = keys.concat(Object.getOwnPropertySymbols(obj));
  /* // 不考虑兼容的情况下，可以直接基于ES6中的Reflect对象处理
      var keys = Reflect.ownKeys(obj); */
  return keys.length === 0;
};

// 获取任意元素距离BODY的偏移 => {top:xxx,left:xxx}
const offset = function offset(elem) {
  let t = elem.offsetTop,
    l = elem.offsetLeft,
    p = elem.offsetParent;
  while (p && p.tagName !== 'BODY') {
    // 在IE8浏览器中,我们获取的偏移值本身就带着参照物的边框，所以不需要再加边框值
    if (!/MSIE 8/i.test(navigator.userAgent)) {
      t += p.clientTop;
      l += p.clientLeft;
    }
    t += p.offsetTop;
    l += p.offsetLeft;
    p = p.offsetParent;
  }
  return {
    top: t,
    left: l,
  };
};

// 限制数字范围
const range = (n, max, min) => {
  if (min > max) {
    let a = min;
    min = max;
    max = a;
  }
  return n > max ? max : n < min ? min : n;
};

// 自定义事件
var throttle = function (type, name, obj) {
  obj = obj || window;
  var running = false;
  var func = function () {
    if (running) {
      return;
    }
    running = true;
    requestAnimationFrame(function () {
      obj.dispatchEvent(new CustomEvent(name));
      running = false;
    });
  };
  obj.addEventListener(type, func);
};

const Qsstringify = (obj, sep, eq) => {
  sep = sep || '&';
  eq = eq || '=';
  let str = '';
  Object.keys(obj).forEach((key) => {
    str += key + eq + encodeURI(obj[key]) + sep;
  });
  return str.slice(0, -1);
};

const Qsparse = (str) => {
  var obj = {};
  strAry = str.split('&');
  for (var i = 0; i < strAry.length; i++) {
    let index = strAry[i].indexOf('=');
    obj[strAry[i].slice(0, index)] = encodeURI(strAry[i].slice(index + 1));
  }
  return obj;
};

const proxyUrl = (url) => {
  return url.replace(/^https?:\/\/(.+)\.com/g, (a, b) => {
    b = 'https://api.pinea.cn/biliproxy/' + b.replace(/\./g, '');
    return b;
  });
};
const handleImgUrl = (url, params) => {
  params = {
    width: 206,
    height: 116,
    quality: 100,
    format: 'webp',
    ...params,
  };
  url = proxyUrl(url) + '@';
  params.width ? (url += `${params.width}w_`) : null;
  params.height ? (url += `${params.height}h`) : null;
  url += `_${params.quality}q`;
  url += `.${params.format}`;
  return url;
};

const handleNumber = (number) => {
  if (toType(number) !== 'number') return;
  if (number < 10000) return number + '';
  else return (number / 10000).toFixed(1) + '万';
};

const handleTime = (time) => {
  if (toType(time) !== 'number') return;
  let hour = Math.floor(time / 3600);
  let min = Math.floor((time % 3600) / 60);
  let sec = time - min * 60 - hour * 3600;
  return `${hour > 0 ? (hour < 10 ? '0' + hour + ':' : hour + ':') : ''}${
    min < 10 ? '0' + min : min
  }:${sec < 10 ? '0' + sec : sec}`;
};

const userInfo = (info) => {
  return `
    <div class="avatar">
      <img src="${handleImgUrl(info.avatar, {
        width: 100,
        height: 100,
      })}" alt="avatar" />
    </div>
    <div class="userinfo">
      <a href="" class="name">${info.name} </a>
      <a href="" class="vip">${info.vip}</a>
      <div class="privilege">
        <span>已领取B币</span>
        <span>已领取优惠券</span>
      </div>
      <div class="level">
        <a href="" title="等级" class="lvn">
          <i class="iconfont-extended icon-lv${info.level.current_level}"></i>
        </a>
        <div class="exp">${info.level.current_exp} / ${
    info.level.next_exp
  }</div>
      </div>
      <div class="lv-progress divider">
        <div class="lv-percent" style="width:${
          (info.level.current_exp / info.level.next_exp).toFixed(2) * 100
        }%"></div>
      </div>
      <div class="coins">
        <a href="javascript:;" title="${
          info.mobile == 1 ? '已绑定' : '未绑定'
        }" class="phone">
          <i class="iconfont-new-home icon-bind-phone"></i>
          <i class="iconfont-new-home ${info.mobile == 1 ? 'icon-ok' : ''}"></i>
        </a>
        <a href="javascript:;" title="${
          info.email == 1 ? '已绑定' : '未绑定'
        }" class="e-mail">
          <i class="iconfont-new-home icon-bind-email"></i>
          <i class="iconfont-new-home ${info.email == 1 ? 'icon-ok' : ''}"></i>
        </a>
        <a href="" title="硬币" class="coin">
          <i class="iconfont-new-home icon-coin"></i>
          <span class="number">${info.coin}</span>
        </a>
        <a href="" title="B币" class="b-coin">
          <i class="iconfont-new-home icon-b-coin"></i>
          <span class="number">${info.bcoin}</span>
        </a>
      </div>
      <div class="divider"></div>
      <div class="follow">
        <a href="" class="follows">
          <div class="number">${info.follow}</div>
          <div class="description">关注</div>
        </a>
        <a href="" class="fans">
          <div class="number">${info.fans}</div>
          <div class="description">粉丝</div>
        </a>
        <a href="" class="my-dynamic">
          <div class="number">${info.dynamic}</div>
          <div class="description">动态</div>
        </a>
      </div>
      <div class="divider"></div>
      <a href="" class="personal">
        <i class="icon icon-profile iconfont-new-home"></i>
        个人中心
      </a>
      <a href="" class="personal">
        <i class="icon icon-posts iconfont-new-home"></i>
        投稿管理
      </a>
      <a href="" class="personal">
        <i class="icon icon-wallet iconfont-new-home"></i>
        B币钱包
      </a>
      <a href="" class="personal">
        <i class="icon icon-live-center iconfont-new-home"></i>
        直播中心
      </a>
      <a href="" class="personal">
        <i class="icon icon-order-center iconfont-new-home"></i>
        订单中心
      </a>
      <a href="" class="personal">
        <i class="icon icon-course iconfont-new-home"></i>
        我的课程
      </a>
      <div href="" class="logout">退出登录</div>
    </div>
    `;
};

const Video = (type, info) => {
  switch (type) {
    case 'recommend':
      return ` 
            <div class="video-card">
              <div class="shadow"></div>
              <div class="video-cover">
              <a href="${info.link}" target="_blank">
                  <img src="${info.cover}" alt="${info.title}" />
                  <div class="info">
                  <p class="inner-title">
                      ${info.title}
                  </p>
                  <p class="up">
                      <i class="bilifont bili-icon_xinxi_UPzhu"></i>
                      <span>${info.up}</span>
                  </p>
                  <p class="play">${info.play}播放</p>
                  </div>
              </a>
              <div class="watchlater"></div>
              </div>
            </div>`;
    case 'preview':
      return `
            <div class="video-box">
            <div class="video-card">
                <div class="video-cover">
                <a href="${info.link}" target="_blank">
                    <img src="${info.cover}" alt="${info.title}" />
                    <div class="time">${handleTime(info.time)}</div>
                </a>
                <div class="preview">
                  <div class="progress">
                  <div class="duration">
                      <div class="percent"></div>
                  </div>
                  </div>
                  <div class="videocut" data-aid="${info.aid}"><div class="danmu"></div></div>
                </div>
                <div class="watchlater"></div>
                </div>
            </div>
            <div class="detail">
                <a href="${info.link}" target="_blank" class="outer-title">
                <p title="${info.title}">
                    ${info.title}
                </p>
                </a>
                <a href="${info.uplink}" target="_blank" class="up">
                <i class="bilifont bili-icon_xinxi_UPzhu"></i>
                    ${info.up}
                </a>
            </div>
            </div>`;
    case 'live':
      return `
          <div class="video-box">
          <div class="video-card">
            <div class="video-cover">
              <a href="${info.link}" target="_blank" class="video-link">
                <img src="${info.cover}" alt="${info.title}" />
                <div class="watching">
                  <i class="bilifont bili-icon_xinxi_renqi"></i>
                  <span>${info.watching}</span>
                </div>
              </a>
              <div class="preview">
                <a href="${info.link}" target="_blank" class="video-link">
                  <img src="" data-url="${info.keyframe}" />
                </a>
              </div>
            </div>
          </div>
          <div class="live-info">
            <a href="${info.link}" target="_blank" class="up-link">
              <div class="anchor">
                <img src="${info.upavatar}" alt="${info.up}" />
                ${
                  info.verified === -1
                    ? ''
                    : `<svg class="verified">
                        <use xlink:href="${imgsrc}/bibo.svg#verified${
                        info.verified === 0 ? '' : '2'
                      }"></use>
                      </svg>`
                }
              </div>
              <div class="ancinfo">
                <p class="name">${info.up}</p>
                <p class="title" title="${info.title}">
                ${info.title}
                </p>
                <p class="tag">${info.tag}</p>
              </div>
            </a>
          </div>
        </div>`;
    case 'live2':
      return `
          <div class="video-box">
            <div class="video-card">
              <div class="video-cover">
                <a href="${info.link}" target="_blank" class="video-link">
                  <img src="${info.cover}" alt="${info.title}" />
                  <div class="watching atright">
                    <i class="bilifont bili-icon_xinxi_renqi"></i>
                    <span>${info.watching}</span>
                  </div>
                </a>
              </div>
            </div>
            <div class="detail">
              <a href="${info.link}" target="_blank" class="outer-title video-link">
                <p title="${info.title}">
                <span class="living"> <i></i> 直播中 </span>
                ${info.title}
                </p>
              </a>
            </div>
          </div>`;
    case 'mix':
      return `
            <div class="video-box">
            <div class="video-card">
                <div class="video-cover">
                <a href="${info.link}" target="_blank">
                    <img src="${info.cover}" alt="${info.title}" />
                    <div class="mix-info">
                    <div class="play">
                      <i class="bilifont bili-icon_shipin_bofangshu"></i>
                      <span>${info.play}</span>
                    </div>
                    <div class="like">
                      <i class="bilifont bili-icon_shipin_dianzanshu"></i>
                      <span>${info.like}</span>
                    </div>
                    <div class="time">${handleTime(info.time)}</div>
                  </div>
                  ${info.crown ? `<div class="crown ${info.crown}"></div>` : ''}
                </a>
                <a href="${info.link}" target="_blank">
                <div class="preview">
                  <div class="progress">
                  <div class="duration">
                      <div class="percent"></div>
                  </div>
                  </div>
                  <div class="videocut" data-aid="${info.aid}"><div class="danmu"></div></div>
                </div>
                </a>
                <div class="watchlater"></div>
                </div>
            </div>
            <div class="detail">
                <a href="${info.link}" target="_blank" class="outer-title">
                <p title="${info.title}">
                    ${info.title}
                </p>
                </a>
                <a href="${info.uplink}" target="_blank" class="up">
                <i class="bilifont bili-icon_xinxi_UPzhu"></i>
                    ${info.up}
                </a>
            </div>
            </div>`;
    case 'lesson':
      return `
          <div class="video-box">
            <div class="video-card">
              <div class="video-cover">
                <a href="${info.link}" target="_blank">
                  <img src="${info.cover}" alt="${info.title}" />
                  <div class="mix-info">
                    <div class="play">
                      <i class="bilifont bili-icon_shipin_bofangshu"></i>
                     <span>${info.play}</span>
                    </div>
                  </div>
                </a>
              </div>
              <div class="detail">
                <a href="${info.link}" target="_blank" class="outer-title">
                  <p title="${info.title}">${info.title}</p>
                </a>
                <span class="up">${info.updateinfo}</span>
              </div>
            </div>
          </div>`;

    default:
      return '<div class="video-box"></div>';
  }
};

const Manga = (info) => {
  return `
      <div class="manga-box">
        <a href=${info.link}>
          <img src='${handleImgUrl(info.cover, {
            width: 160,
            height: 210,
          })}' alt='${info.title}'>
          <p title=${info.title}>${info.title}</p>
          <span>${info.tag}</span>  
        </a>
      </div>`;
};

const Column = (info) => {
  return `
    <div class="article-card">
      <a href="${info.link}" target="_blank" class="pic">
        <img src="${handleImgUrl(info.cover, {
          width: 200,
        })}" alt="" >
      </a>
      <div class="content">
        <a href="${info.link}" target="_blank" title="${
    info.title
  }" class="title">${info.title}</a>
        <a href="${info.uplink}" target="_blank" class="up">
        <i class="bilifont bili-icon_xinxi_UPzhu"></i>
        ${info.up}
        </a>
        <p class="count">
        <span>
          <i class="bilifont bili-icon_xinxi_yuedushu"></i>
          ${info.view}
        </span>
        <span>
          <i class="bilifont bili-icon_xinxi_pinglunshu"></i>
          ${info.comment}
        </span>
        </p>
      </div>
    </div>`;
};

const LiveList = (type, info) => {
  switch (type) {
    case 'rank':
      return `
          <li>
            <a href="${info.link}" target="_blank" class="item">
              <span class="number ${info.rank <= 3 ? 'top' : ''}">${
        info.rank
      }</span>
              <div class="anchor">
                <img src="${info.avatar}" alt="${info.title}" />
                <div class="live-title">
                  <p>${info.up}</p>
                  <p>${info.title}</p>
                </div>
              </div>
              <div class="watching">
                <i class="bilifont bili-icon_xinxi_renqi"></i>
                <span>${info.watching}</span>
              </div>
            </a>
          </li>`;
    case 'follow':
      return `
          <li>
            <a href="${info.link}" target="_blank" class="item">
              <div class="anchor">
                <img src="${info.avatar}" alt="${info.title}" />
                <div class="live-title">
                  <p>${info.up}</p>
                  <p>${info.title}</p>
                </div>
              </div>
              <div class="watching">
                <i class="bilifont bili-icon_xinxi_renqi"></i>
                <span>${info.watching}</span>
              </div>
            </a>
          </li>`;
    default:
      return '<li></li>';
  }
};

const RankItem = (type, info) => {
  switch (type) {
    case 'video':
      return `
          <li class="${info.rank === 1 ? 'top1' : 'top'}">
            <a href="${info.link}" target="_blank" title=${
        info.title
      } class="item">
              <span class="number ${info.rank <= 3 ? 'tops' : ''}">${
        info.rank
      }</span>
        ${
          info.rank === 1
            ? ` <div class="title">
                  <div class="cover">
                    <img src="${info.pic}" alt="${info.title}" />
                    <div class="watchlater"></div>
                  </div>
                  <div class="txt">
                    <p class="vdname">${info.title}</p>
                    <p class="score">综合得分：${info.score}</p>
                  </div>
                </div>`
            : ` <p class="vdname">${info.title}</p>`
        } 
            </a>
            <div class="detail-card">
              <div class="title">
                  <div class="cover">
                    <img src="${info.pic}" alt="${info.title}" />
                  </div>
                  <div class="txt">
                    <h6>${info.title}</h6>
                    <p>${info.up} · ${info.pubdate}</p>
                  </div>
              </div>
              <ul  class="count">
                <li><i class="bilifont bili-icon_shipin_bofangshu"></i><span>${
                  info.play
                }</span></li>
                <li><i class="bilifont bili-icon_shipin_danmushu"></i><span>${
                  info.danmaku
                }</span></li>
                <li><i class="bilifont bili-icon_shipin_shoucangshu"></i><span>${
                  info.favor
                }</span></li>
                <li><i class="bilifont bili-icon_shipin_yingbishu"></i><span>${
                  info.coin
                }</span>
                </li>
              </ul>
            </div>
          </li>`;
    case 'movie':
      return `
          <li class="top no-preview">
            <a href="${info.link}" target="_blank" title=${
        info.title
      } class="item">
              <span class="number ${info.rank <= 3 ? 'tops' : ''}">${
        info.rank
      }</span>
              <p class="vdname">${info.title} <span>${info.desc}</span></p>
            </a>
          </li>`;
    case 'manga':
      return ` 
        ${
          info.rank === 1
            ? `<li class="top1 no-preview">
            <a href="${info.link}" target="_blank" title=${
                info.title
              } class="item">
              <span class="number ${info.rank <= 3 ? 'tops' : ''}">${
                info.rank
              }</span>
              <div class="title">
              <div class="cover">
                <img src="${handleImgUrl(info.cover, { height: 150 })}" alt="${
                info.title
              }">
              </div>
              <div class="txt">
              <p class="vdname">${info.title}</p>
              <span>${info.tag}</span>
              <span>更新至${info.update}</span>
              </div>
            </div>

            </a>
          </li>`
            : `<li class="top no-preview">
                <a href="${info.link}" target="_blank" title=${
                info.title
              } class="item">
                  <span class="number ${info.rank <= 3 ? 'tops' : ''}">${
                info.rank
              }</span>
                  <p class="vdname">${info.title} <span>更新至${
                info.update
              }</span></p>
                </a>
              </li>`
        }`;
    case 'column':
      return `
          <li class="${info.rank === 1 ? 'top1' : 'top'}">
            <a href="${info.link}" target="_blank" title=${
        info.title
      } class="item">
              <span class="number ${info.rank <= 3 ? 'tops' : ''}">${
        info.rank
      }</span>
        ${
          info.rank === 1
            ? ` <div class="title">
                  <div class="cover">
                    <img src="${handleImgUrl(info.cover)}" alt="${
                info.title
              }" />
                  </div>
                  <div class="txt">
                    <p class="vdname">${info.title}</p>
                    <p class="score">综合得分：${info.score}</p>
                  </div>
                </div>`
            : ` <p class="vdname">${info.title}</p>`
        } 
            </a>
          </li>`;
    default:
      return `<li class="top"></li>`;
  }
};

const bindShowCard = (e) => {
  let tar = e.target;
  let card = tar.querySelector('.detail-card');
  if (tar.tagName.toLowerCase() !== 'li') return;
  if (!card) return;
  const show = (e) => {
    card.style.display = 'block';
    card.offsetTop;
    card.style.opacity = 1;
    tar.addEventListener('mouseout', hide);
  };
  const hide = () => {
    card.style.opacity = 0;
    card.style.display = 'none';
  };
  tar.addEventListener('mouseover', show);
};

const bindDanmuScroll = (e) => {
  if (!e.target.classList.contains('videocut')) return;
  let tar = e.target;
  let danmuList = tar.querySelectorAll('.danmu-content');
  console.log(tar, danmuList);
  if (!danmuList.length) {
    let aid = tar.getAttribute('data-aid');
    // 渲染弹幕
    let danmuBox = tar.querySelector('.danmu');
    axios
      .get(danmuAPI, { params: { aid } })
      .then((res) => {
        let danmuList = res.data;
        let fragment = document.createDocumentFragment();
        danmuList.forEach((content, index) => {
          let danmu = document.createElement('span');
          danmu.classList.add('danmu-content');
          danmu.innerText = content;
          danmu.style.top = `${(index % 3) * 16}px`;
          fragment.appendChild(danmu);
        });
        danmuBox.appendChild(fragment);
        danmuBox.style.display = 'block';
      })
      .catch((err) => {
        console.log('弹幕获取失败:', err);
      });
  } else {
    console.log(1);
  }
};

const adjustVideos = function adjustVideos() {
  let videoArea = document.querySelectorAll('.videoArea');
  videoArea.forEach((area) => {
    let areaSize = getComputedStyle(area);
    let videoList = area.querySelectorAll('.video-box');
    if (videoList.length == 0) videoList = area.querySelectorAll('.video-card');
    if (videoList.length == 0) return;
    let videoSize = getComputedStyle(videoList[0]);
    let maxCol = Math.floor(
      parseFloat(areaSize.width) / parseFloat(videoSize.width)
    );
    let maxRow = Math.floor(
      parseFloat(areaSize.height) / parseFloat(videoSize.height)
    );
    let max = maxCol * maxRow;
    videoList.forEach((video, index) => {
      if (index >= max) {
        video.style.display = 'none';
      } else {
        video.style.display = 'block';
      }
    });
  });
};

const adjustMangas = function adjustMangas() {
  let videoArea = document.querySelectorAll('.mangas');
  videoArea.forEach((area) => {
    let areaSize = getComputedStyle(area);
    let videoList = area.querySelectorAll('.manga-box');
    if (videoList.length == 0) return;
    let videoSize = getComputedStyle(videoList[0]);
    let maxCol = Math.floor(
      parseFloat(areaSize.width) / parseFloat(videoSize.width)
    );
    let maxRow = Math.floor(
      parseFloat(areaSize.height) / parseFloat(videoSize.height)
    );
    let max = maxCol * maxRow;
    videoList.forEach((video, index) => {
      if (index >= max) {
        video.style.display = 'none';
      } else {
        video.style.display = 'block';
      }
    });
  });
};

const adjustLists = function adjustLists() {
  let lists = document.querySelectorAll('.ranklist');
  lists.forEach((list) => {
    let listH = parseFloat(getComputedStyle(list).height);
    let items = list.querySelectorAll('.ranklist>li');
    let currentH = 0;
    items.forEach((item) => {
      let itemH = parseFloat(getComputedStyle(item).height);
      isNaN(itemH) ? (currentH = Infinity) : (currentH += itemH);
      if (currentH > Math.round(listH)) {
        item.style.display = 'none';
      } else {
        item.style.display = 'block';
      }
    });
  });
};

const adjustContents = function adjustContents(box, content, content2) {
  let boxEle = document.querySelectorAll(box);
  boxEle.forEach((area) => {
    let areaSize = getComputedStyle(area);
    let contents = area.querySelectorAll(content);
    if (contents.length == 0) contents = area.querySelectorAll(content2);
    if (contents.length == 0) return;
    let contentSize = getComputedStyle(contents[0]) || {
      width: Infinity,
      height: Infinity,
    };
    let maxCol = Math.floor(
      parseFloat(areaSize.width) / parseFloat(contentSize.width)
    );
    let maxRow = Math.floor(
      parseFloat(areaSize.height) / parseFloat(contentSize.height)
    );
    let max = maxCol * maxRow;
    contents.forEach((content, index) => {
      if (index >= max) {
        content.style.display = 'none';
      } else {
        content.style = contentSize.display;
      }
    });
  });
};

// 等待一定时间
const wait = async (delay) => {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, delay);
  });
};
/* 暴露API */
export default {
  toType,
  isFunction,
  isWindow,
  isPlainObject,
  isEmptyObject,
  isArrayLike,
  offset,
  range,
  throttle,
  Qsstringify,
  Qsparse,
  proxyUrl,
  handleImgUrl,
  handleNumber,
  handleTime,
  userInfo,
  Video,
  Manga,
  Column,
  LiveList,
  RankItem,
  bindShowCard,
  bindDanmuScroll,
  adjustVideos,
  adjustMangas,
  adjustLists,
  adjustContents,
  wait,
};
