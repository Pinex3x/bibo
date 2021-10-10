import '../css/reset.min.css';
import '../css/bilifont.css';
import '../css/iconfont.css';
import '../css/index.css';
import '../css/scrollbar.css';

import axios from '/node_modules/axios/dist/axios';
import './http';
import utils from './utils';
import { TopSwiper } from './swiper';
import { Live } from './live';
import { Section } from './section';
import { Manga } from './manga';
import { Column } from './column';
import { liveAPI, videoInfoAPI, preAPI, danmuAPI, rcmdAPI } from './api';

~(function main() {
  // 动态banner
  let dynamicBanner = document.querySelector('.top-banner .dynamic');
  dynamicBanner.innerHTML = `
    <video
    class="video"
    src="https://pinewe.oss-cn-shanghai.aliyuncs.com/pic_bed/img/banner.mp4"
    autoplay
    loop
    muted
    ></video>`;

  // 个人信息
  let user = document.querySelector('.user');
  axios.get('userinfo.json').then((res) => {
    let data = res.data;
    user.innerHTML = utils.userInfo({
      avatar: data.face,
      name: data.uname,
      vip: data.vip_label.text,
      level: data.level_info,
      mobile: data.mobile_verified,
      email: data.email_verified,
      coin: data.money,
      bcoin: data.wallet.bcoin_balance,
      follow: 204,
      fans: 57,
      dynamic: 9,
    });
  });

  // 未读信息
  let unread = document.querySelector('.msg');
  let total_unread = unread.querySelector('.count');
  let msglist = unread.querySelectorAll('.msgs');
  axios.get('unread.json').then((res) => {
    let ary = ['reply', 'at', 'like', 'chat', 'sys_msg'];
    let total = 0;
    msglist.forEach((ele, index) => {
      let num = res.data[ary[index]];
      if (num > 0) {
        total += num;
        ele.innerText = num > 99 ? 99 : num;
        ele.classList.add('active');
      } else {
        ele.innerText = '';
        ele.classList.remove('active');
      }
    });
    if (total > 0) {
      total_unread.innerText = total > 99 ? '99+' : total;
      total_unread.classList.add('active');
    } else {
      total_unread.innerText = '';
      total_unread.classList.remove('active');
    }
  });
  // 轮播图
  new TopSwiper('#swiper', '/swiper.json');
  // 推荐视频
  let recommend = document.querySelector('.recommend');
  let rcmdVideos = recommend.querySelector('.videos');
  let changeBtn = recommend.querySelector('.change');

  const renderRcmd = (result) => {
    let data = result.data;
    let videoStr = data.item
      .map((video) => {
        return utils.Video('recommend', {
          link: `${video.uri}`,
          cover: utils.handleImgUrl(video.pic),
          title: video.title,
          up: video.owner.name,
          play: utils.handleNumber(video.stat.view),
          aid: video.id,
        });
      })
      .join('');
    rcmdVideos.innerHTML = videoStr;
    utils.adjustVideos();
    changeBtn.classList.remove('active');
  };
  axios.get('recommend.json').then((res) => renderRcmd(res));
  // 推广
  let adVideos = document.querySelector('#ads .videos');
  axios.get('ad.json').then((res) => {
    let data = res.data;
    let videoStr = data.item
      .map((video) => {
        return utils.Video('mix', {
          aid: video.aid,
          link: video.uri,
          cover: utils.handleImgUrl(video.pic),
          title: video.title,
          play: utils.handleNumber(video.stat.view),
          like: utils.handleNumber(video.stat.like),
          time: video.duration,
          up: video.owner.name,
          uplink: `https://space.bilibili.com/${video.owner.mid}/`,
        });
      })
      .join('');
    adVideos.innerHTML = videoStr;
    utils.adjustVideos();
  });
  // 分区
  let sectionInfo = [
    { tag: 'live', name: '直播', rid: -1 },
    { tag: 'douga', name: '动画', rid: 1 },
    { tag: 'anime', name: '番剧', rid: 13, season_type: 1 },
    { tag: 'guochuang', name: '国创', rid: 167, season_type: 4 },
    { tag: 'manga', name: '漫画', rid: -1 },
    { tag: 'music', name: '音乐', rid: 3 },
    { tag: 'dance', name: '舞蹈', rid: 129 },
    { tag: 'game', name: '游戏', rid: 4 },
    { tag: 'knowledge', name: '知识', rid: 36 },
    { tag: 'lesson', name: '课堂', rid: -1 },
    { tag: 'tech', name: '科技', rid: 188 },
    { tag: 'sport', name: '运动', rid: 234 },
    { tag: 'car', name: '汽车', rid: 223 },
    { tag: 'life', name: '生活', rid: 160 },
    { tag: 'food', name: '美食', rid: 211 },
    { tag: 'animal', name: '动物圈', rid: 217 },
    { tag: 'kichiku', name: '鬼畜', rid: 119 },
    { tag: 'fashion', name: '时尚', rid: 155 },
    { tag: 'information', name: '资讯', rid: 202 },
    { tag: 'ent', name: '娱乐', rid: 5 },
    { tag: 'column', name: '专栏', rid: -1, cid: 3 },
    { tag: 'movie', name: '电影', rid: 23, season_type: 2 },
    { tag: 'tv', name: '电视剧', rid: 11, season_type: 5 },
    { tag: 'cinephile', name: '影视', rid: 181 },
    { tag: 'documentary', name: '纪录片', rid: 177, season_type: 3 },
  ];

  let subarea = document.querySelector('.subareas');
  let elevator = document.querySelector('.elevator');
  let area = elevator.querySelector('.sortlist');
  // 排序列表
  let tempList = document.createDocumentFragment();
  // 分区列表
  let tempSectionList = document.createDocumentFragment();
  sectionInfo.forEach((section) => {
    let li = document.createElement('li');
    let sectionEle = document.createElement('section');
    li.innerText = section.name;
    li.classList.add('sort');
    li.setAttribute('data-name', section.tag);
    sectionEle.classList.add('section');
    sectionEle.id = section.tag;
    tempList.appendChild(li);
    tempSectionList.appendChild(sectionEle);
  });
  area.appendChild(tempList);
  subarea.appendChild(tempSectionList);

  let sections = subarea.querySelectorAll('.subareas>.section');
  let sortItems = elevator.querySelectorAll('.sort');

  const changeCurrent = () => {
    let currentSection =
      [].find.call(
        sections,
        (section) => section.getBoundingClientRect().top >= 0
      ) || sections[0];
    let tag = currentSection.id;
    let current = getSortItem(tag);
    current.classList.add('active');
    [].forEach.call(sortItems, (item) => {
      if (item !== current) item.classList.remove('active');
    });
  };
  const getSortItem = (tag) => {
    return [].find.call(
      sortItems,
      (item) => item.getAttribute('data-name') === tag
    );
  };

  sectionInfo.forEach((section) => {
    if (section.season_type) {
      switch (section.season_type) {
        case 1: // 番剧
          new Section(`#${section.tag}`, {
            ...section,
            subtitle: '番剧动态',
            type: 'anime',
          });
          break;
        case 2: // 电影
        case 3: // 纪录片
        case 5: // 电视剧
          new Section(`#${section.tag}`, {
            ...section,
            type: 'movie',
          });
          break;
        case 4: // 国创
          new Section(`#${section.tag}`, {
            ...section,
            subtitle: '国产原创相关',
            type: 'guochuang',
          });
          break;
        default:
          break;
      }
    } else if (section.rid === -1) {
      switch (section.tag) {
        case 'live': // 直播
          new Live(`#${section.tag}`, liveAPI);
          break;
        case 'manga': // 漫画
          new Manga(`#${section.tag}`, section);
          break;
        case 'lesson': // 课堂
          new Section(`#${section.tag}`, {
            ...section,
            type: 'lesson',
          });
          break;
        case 'column':
          new Column(`#${section.tag}`, section);
          break;
        default:
          break;
      }
    } else {
      if (section.rid === 202) {
        new Section(`#${section.tag}`, { ...section, type: section.tag });
      } else {
        new Section(`#${section.tag}`, section);
      }
    }
  });

  let sortBtn = elevator.querySelector('.sortbtn');
  let sortList = elevator.querySelector('.sortlist');
  let isSorting = false;
  let isDragging = false;
  let startY, movingItem, movingIndex, tarIndex, itemH, maxY, minY;
  // 分区排序
  const sort = (e) => {
    let path = e.path || (e.composedPath && e.composedPath());
    if (isSorting) {
      if (path.includes(sortBtn)) return cancelSort();
      let guidebar = elevator.querySelector('.guidebar');
      if (path.includes(guidebar)) return;
      cancelSort();
    } else {
      if (path.includes(sortBtn)) startSort();
    }
  };
  // 开始排序
  const startSort = () => {
    sortBtn.classList.add('active');
    [].forEach.call(sortItems, (item, index) => {
      if (isSorting) {
        item.classList.remove('sorting');
        item.style = '';
      } else {
        item.classList.remove('active');
        item.classList.add('sorting');
        item.style = `animation: shake 1s ${(index % 3) * 0.1}s ease infinite`;
        sortList.addEventListener('mouseover', stopShake);
        sortList.addEventListener('mouseout', shake);
        sortList.addEventListener('mousedown', drag);
      }
    });
    isSorting = !isSorting;
  };
  // 取消排序
  const cancelSort = () => {
    sortBtn.classList.remove('active');
    [].forEach.call(sortItems, (item) => {
      item.classList.remove('sorting');
      item.style = '';
    });
    isSorting = !isSorting;
    sortList.removeEventListener('mouseover', stopShake);
    sortList.removeEventListener('mouseout', shake);
    sortList.removeEventListener('mousedown', drag);
    changeCurrent();
  };
  // 抖动
  const shake = (e) => {
    if (isDragging) return;
    if (e.target.tagName.toLowerCase() !== 'li') return;
    e.target.style = 'animation: shake 1s ease infinite';
  };
  // 取消抖动
  const stopShake = (e) => {
    if (isDragging) return;
    if (e.target.tagName.toLowerCase() !== 'li') return;
    e.target.style = '';
  };
  // 开始拖动
  const drag = (e) => {
    if (!isSorting) return;
    isDragging = true;
    startY = e.clientY;
    movingItem = e.target;
    movingItem.classList.add('active');
    itemH = parseFloat(getComputedStyle(movingItem).height);
    movingIndex = [].indexOf.call(sortItems, movingItem);
    maxY = (sortItems.length - 1 - movingIndex) * itemH;
    minY = -movingIndex * itemH;
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', dragend);
  };
  // 结束拖动
  const dragend = () => {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', dragend);
    movingItem.classList.remove('active');
    // 重排快速导航
    let sortedItems = document.createDocumentFragment();
    let newSortItems = [];
    changeSort(sortItems, movingIndex, tarIndex).forEach((item, index) => {
      // 异步修改生效?
      requestAnimationFrame(() => {
        item.style = `animation: shake 1s ${(index % 3) * 0.1}s ease infinite`;
      });
      sortedItems.appendChild(item);
      newSortItems.push(item);
    });
    sortList.appendChild(sortedItems);
    sortItems = newSortItems;
    // 重排分区
    changeSort(sections, movingIndex, tarIndex).forEach((item) => {
      subarea.appendChild(item);
    });
    sections = subarea.querySelectorAll('.subareas>.section');
    sectionInfo = changeSort(sectionInfo, movingIndex, tarIndex);

    isDragging = false;
  };
  // 跟随鼠标移动
  const move = (e) => {
    // 鼠标所在位置对应索引
    let moveY = utils.range(e.clientY - startY, minY, maxY);
    tarIndex = utils.range(
      movingIndex + Math.round(moveY / itemH, 0, sortItems.length - 1)
    );
    let min = Math.min(tarIndex, movingIndex);
    let max = Math.max(tarIndex, movingIndex);
    let flag = tarIndex > movingIndex ? -1 : 1;
    const change = () => {
      [].forEach.call(sortItems, (item, index) => {
        if (item === movingItem) return;
        if (index >= min && index <= max)
          item.style = `transform:translate3d(0px,${itemH * flag}px,0px)`;
        else item.style = `transform:translate3d(0px,0px,0px)`;
      });
      movingItem.style = `transform:translate3d(0px,${
        e.clientY - startY
      }px,0px)`;
    };
    requestAnimationFrame(change);
  };

  // 改变顺序
  const changeSort = (ary, originIndex, tarIndex) => {
    let temp = [...ary];
    let originItem = temp[originIndex];
    if (tarIndex > originIndex) {
      // 前面移到后面 在目标索引后添加, 删除原来的(索引不变)
      temp.splice(tarIndex + 1, 0, originItem);
      temp.splice(originIndex, 1);
    }
    if (tarIndex < originIndex) {
      // 后面移到前面 在目标索引处插入,再删除原来的(索引+1)
      temp.splice(tarIndex, 0, originItem);
      temp.splice(originIndex + 1, 1);
    }
    return temp;
  };

  // 快速导航
  let topBtn = elevator.querySelector('.totop');
  let flag = true;
  const fastJump = (e) => {
    let path = e.path || (e.composedPath && e.composedPath());
    if (path.includes(topBtn) || path.includes(sortList)) {
      if (!flag) return;
      flag = false;
      let top = 0;
      if (path.includes(sortList)) {
        let tar = e.target;
        if (tar.tagName.toLowerCase() !== 'li') return;
        let name = tar.dataset.name;
        let index = sectionInfo.findIndex((section) => section.tag === name);
        top = utils.offset(sections[index]).top;
      }
      if (path.includes(topBtn)) scrollTo(top, 100);
      else document.documentElement.scrollTop = top;
      flag = true;
    }
  };

  const scrollTo = (top, duration = 1000, maxstep = Infinity) => {
    let times = Math.ceil(duration / 10);
    let totalScroll = document.documentElement.scrollTop - top;
    let step = Math.round(totalScroll / times);
    let count = 0;
    if (Math.abs(step) > maxstep) {
      times = Math.abs(Math.ceil(totalScroll / maxstep));
      step = maxstep * (step / Math.abs(step));
    }
    const scroll = () => {
      if (document.documentElement.scrollTop === top) return;
      document.documentElement.scrollTop -= step;
      if (count < times) {
        setTimeout(() => {
          scroll();
        }, 10);
        count++;
      } else document.documentElement.scrollTop = top;
    };
    requestAnimationFrame(scroll);
    flag = true;
  };

  // 视频预览
  const preview = async (e) => {
    let tar = e.target;
    if (!tar.classList.contains('videocut') || tar.classList.contains('loaded'))
      return;
    let aid = tar.getAttribute('data-aid');
    let time;
    let size = getComputedStyle(tar);
    size = {
      width: parseFloat(size.width),
      height: parseFloat(size.height),
    };
    Promise.all([
      axios.get(preAPI, { params: { aid } }),
      axios.get(danmuAPI, { params: { aid } }),
      axios.get(videoInfoAPI, { params: { aid } }),
    ])

      .then(async (res) => {
        time = res[2].data.pages[0].duration;
        // 获取预览信息
        let { img_x_len, img_y_len, index, image } = res[0].data;
        let img = utils.proxyUrl(`http:${image[0]}`);
        // 加载预览图
        await loadKeyframe(img);
        tar.style.backgroundImage = `url(${img})`;
        tar.style.backgroundSize = `${size.width * img_x_len}px ${
          size.height * img_y_len
        }px`;
        tar.style.backgroundPosition = `0 0`;
        // 加载弹幕
        let danmuBox = tar.querySelector('.danmu');
        let fragment = document.createDocumentFragment();
        res[1].data.forEach((content, index) => {
          let danmu = document.createElement('span');
          danmu.classList.add('danmu-content');
          danmu.innerText = content;
          fragment.appendChild(danmu);
        });
        danmuBox.appendChild(fragment);
        danmuBox.style.display = 'block';
        // 预览图移动
        tar.addEventListener('mousemove', (e) => {
          // 进度条
          let percent = tar.parentElement.querySelector('.percent');
          let process = e.offsetX / size.width;
          percent.style.width = `${process * 100}%`;
          // 预览图
          let sec = Math.floor(process * time);
          let curTime = index.find(
            (time, i) =>
              i === index.length - 1 || (sec <= time && time < index[i + 1])
          );
          changeKeyframe(
            curTime,
            { img_x_len, img_y_len, index, image, size },
            tar
          );
        });
        // 弹幕滚动
        let danmus = Array.from(danmuBox.querySelectorAll('.danmu-content'));
        let { start, pause } = danmuDisplay(danmus, 2, size);
        tar.addEventListener('mouseover', start);
        tar.addEventListener('mousemove', start);
        tar.addEventListener('mouseleave', pause);
        // 加载完成
        tar.classList.add('loaded');
      })
      .catch((err) => {
        console.log('加载失败:', err);
      });
  };

  // 切换预览图
  const changeKeyframe = async (curTime = 0, data, tar) => {
    let currentImg = tar.style.backgroundImage;
    if (!currentImg) return;
    let { img_x_len, img_y_len, index, image, size } = data;
    let frameIndex = index.lastIndexOf(curTime) - 1;
    let position = {
      x: frameIndex % img_x_len,
      y: Math.floor(frameIndex / img_y_len) % img_y_len,
    };
    currentImg = currentImg.match(/(?<=url\(").+(?="\))/)[0];
    let tarImg = image[Math.floor(frameIndex / (img_x_len * img_y_len))];
    tarImg = utils.proxyUrl(`http:${tarImg}`);
    if (currentImg !== tarImg) {
      // 替换为新图片
      await loadKeyframe(tarImg);
      tar.style.backgroundImage = `url(${tarImg})`;
      tar.style.backgroundSize = `${size.width * img_x_len}px ${
        size.height * img_y_len
      }px`;
    }
    tar.style.backgroundPosition = `${-position.x * size.width}px ${
      -position.y * size.height
    }px `;
  };

  // 加载预览图
  const loadKeyframe = async (src) => {
    return new Promise((res) => {
      let img = new Image();
      img.onload = () => {
        res();
      };
      img.src = src;
    });
  };

  // 显示弹幕
  const danmuDisplay = (danmus, line, size, delay = 1000) => {
    let lineAry = new Array(line).fill(0);
    let controller; // 控制弹幕滚动或暂停
    let runningTimer = []; // 正在滚动的弹幕的定时器
    let runningFn = []; // 正在滚动的弹幕的定时器
    let running = false;
    // 添加弹幕
    const addDanmu = (danmus, runningTimer) => {
      danmus.forEach((danmu, index) => {
        let lineIndex = lineAry.findIndex((n) => n <= 0);
        if (lineIndex < 0) return;
        // 设置弹幕位置
        danmu.style.top = `${(lineIndex % 3) * 20}px`;
        danmu.style.transition = `transform ${delay / 1000}s linear`;
        let width = parseFloat(getComputedStyle(danmu).width);
        lineAry[lineIndex] += width + 20;
        let left = 0;
        // 滚动
        const scroll = () => {
          if (left <= -(width + size.width)) {
            // 滚动完,清除定时器及对应方法
            clearInterval(timer);
            runningTimer = runningTimer.filter((item) => item !== timer);
            runningFn = runningFn.filter((item) => item !== scroll);
            danmu.style = '';
            return;
          }
          left -= 100;
          danmu.style.transform = `translateX(${left}px)`;
        };
        let timer = setInterval(scroll, delay);
        runningTimer.push(timer);
        runningFn.push(scroll);
        danmus.splice(index, 1);
      });
    };
    // 开始滚动
    const start = () => {
      if (running) return;
      running = true;
      // 未滚动完的弹幕
      if (runningTimer.length) {
        runningTimer = runningTimer.map((timer, index) =>
          setInterval(runningFn[index], delay)
        );
      }
      if (controller != undefined) return;
      controller = setInterval(() => {
        lineAry = lineAry.map((len) => (len - 100 < 0 ? 0 : len - 100));
        if (danmus.length > 0) {
          addDanmu(danmus, runningTimer);
        } else {
          clearInterval(controller);
          controller = null;
        }
      }, delay);
    };
    // 暂停滚动
    const pause = () => {
      running = false;
      clearInterval(controller);
      controller = null;
      runningTimer.map((timer) => {
        clearInterval(timer);
        timer = null;
      });
    };

    return {
      start,
      pause,
    };
  };

  let topbanner = document.querySelector('.top-banner');
  let vedio = topbanner.querySelector('.dynamic .video');

  utils.throttle('scroll', 'customScroll');
  utils.throttle('resize', 'customResize');
  document.addEventListener('mouseover', (e) => {
    let path = e.path || (e.composedPath && e.composedPath());
    if (path.includes(topbanner)) {
      let startX = e.clientX;
      let width = parseFloat(getComputedStyle(topbanner).width);
      document.addEventListener('mousemove', (e) => {
        let path = e.path || (e.composedPath && e.composedPath());
        if (path.includes(topbanner)) {
          let percent = (e.clientX - startX) / width;
          vedio.style.left = `${50 + -percent * 2.5}%`;
        }
      });
      document.addEventListener('mouseout', (e) => {
        let path = e.path || (e.composedPath && e.composedPath());
        if (path.includes(topbanner)) {
          vedio.style = ``;
        }
      });
    }
  });
  window.addEventListener('customScroll', changeCurrent);
  window.addEventListener('customResize', () => {
    utils.adjustVideos();
    utils.adjustLists();
    utils.adjustMangas();
  });
  document.addEventListener('click', sort);
  document.addEventListener('click', fastJump);
  document.addEventListener('click', (e) => {
    let path = e.path || (e.composedPath && e.composedPath());
    if (path.includes(changeBtn)) {
      changeBtn.classList.add('active');
      axios
        .get(rcmdAPI, { params: { fresh_type: 3 } })
        .then((res) => renderRcmd(res));
    }
  });
  document.addEventListener('mouseover', utils.bindShowCard);
  document.addEventListener('mouseover', preview);
})();
