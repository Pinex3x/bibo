import axios from '/node_modules/axios/dist/axios'
import './http'
import utils from './utils'

export class Swiper {
  constructor(selector, data, styles) {
    if (selector.nodeType === 1) this.swiper = selector
    else this.swiper = document.querySelector(selector)
    this.imgBox = this.swiper.querySelector('ul')
    this.pageBox = this.swiper.querySelector('.page')
    this.title = this.swiper.querySelector('.title')
    this.width = parseFloat(getComputedStyle(this.swiper).width)
    this.height = parseFloat(getComputedStyle(this.swiper).height)
    this.transition = getComputedStyle(this.imgBox).transition
    this.imgNum = 0 // 图片数量
    this.index = 0 // 当前索引
    this.timer = null // 定时器
    this.ob = new IntersectionObserver(
      (changes) => {
        let { isIntersecting } = changes[0]
        if (isIntersecting) {
          this.data = data
          this.render(this.data, styles)
        }
      },
      { threshold: [0] }
    )
    this.ob.observe(this.swiper)
  }
  render(data, styles) {
    styles = {
      pageWidth: 10,
      pageMargin: 5,
      imgQ: 100,
      imgF: 'webp',
      ...styles,
    }
    this.imgNum = data.length
    data = [...data, data[0]]
    let imgStr = ''
    let pageStr = ''
    let imgQue = []
    data.forEach((item, index) => {
      let imgUrl = utils.handleImgUrl(item.img, {
        width: this.width,
        height: this.height,
      })
      // imgQue.push(this.loadImg(imgUrl))
      imgStr += `
        <li>
          <a href="${item.link || ''}">
              <img src="${imgUrl}" alt=""/>
          </a>
        </li>`
      if (index < this.imgNum)
        pageStr += `
          <li class=""></li>`
    })
    // Promise.all(imgQue)
    //   .then(() => {
    this.imgBox.style.width = data.length * this.width + 'px'
    this.pageBox.style.width = this.imgNum * (styles.pageWidth + styles.pageMargin * 2) + 'px'
    this.imgBox.innerHTML = imgStr
    this.pageBox.innerHTML = pageStr
    this.pageList = Array.from(this.pageBox.querySelectorAll('li'))
    this.swipe(0)
    this.bindEvent()
    this.autoSwipe(styles)
    // });
  }
  swipe(tarIndex) {
    if (tarIndex < 0 || tarIndex > this.imgNum) {
      let skip = tarIndex < 0 ? this.imgNum : 0
      this.imgBox.style.transition = 'none'
      this.imgBox.style.transform = `translateX(${-skip * this.width}px)`
      this.imgBox.offsetTop
      this.imgBox.style.transition = this.transition
    }
    this.index = tarIndex < 0 ? this.imgNum - 1 : tarIndex > this.imgNum ? 1 : tarIndex
    this.imgBox.style.transform = `translateX(${-this.index * this.width}px)`
    this.pageList.forEach((item) => {
      item.classList.remove('active')
    })
    let curIndex = this.index % this.imgNum
    this.pageList[curIndex].classList.add('active')
    this.title.innerHTML = `${this.data[curIndex].title}`
  }
  bindEvent() {
    this.swiper.addEventListener('mouseover', () => {
      clearInterval(this.timer)
      this.timer = null
    })
    this.swiper.addEventListener('mouseout', () => {
      this.autoSwipe()
    })
    this.pageBox.addEventListener('click', (e) => {
      clearInterval(this.timer)
      this.timer = null
      this.swipe(this.pageList.indexOf(e.target))
    })
  }
  autoSwipe(styles) {
    styles = {
      interval: 5000,
      ...styles,
    }
    if (this.timer) return
    this.timer = setInterval(() => {
      this.swipe(++this.index)
    }, styles.interval)
  }
  loadImg(url) {
    let img = new Image()
    img.src = url
    return new Promise((res, rej) => {
      img.onload = () => {
        res()
      }
      img.onerror = (e) => {
        rej(e)
      }
    })
  }
}

export class TopSwiper {
  constructor(selector, url, styles) {
    this.swiper = document.querySelector(selector)
    this.imgBox = this.swiper.querySelector('ul')
    this.pageBox = this.swiper.querySelector('.page')
    this.title = this.swiper.querySelector('.title')
    this.width = parseFloat(getComputedStyle(this.swiper).width)
    this.transition = getComputedStyle(this.imgBox).transition
    this.imgNum = 0 // 图片数量
    this.index = 0 // 当前索引
    this.timer = null // 定时器
    axios
      .get(url)
      .then((data) => {
        this.data = data
        this.render(this.data, styles)
        this.bindEvent()
        this.autoSwipe(styles)
      })
      .catch((err) => {
        console.log('数据获取失败')
        console.log(err)
      })
  }
  render = (data, styles) => {
    styles = {
      pageWidth: 10,
      pageMargin: 5,
      ...styles,
    }
    this.imgNum = data.length
    data = [...data, data[0]]
    let imgStr = ''
    let pageStr = ''
    data.forEach((item, index) => {
      imgStr += `
      <li>
        <a href="${item.link || ''}">
            <img src="${item.pic}" alt="" />
        </a>
      </li>`
      if (index < this.imgNum)
        pageStr += `
        <li class=""></li>`
    })
    this.imgBox.style.width = data.length * this.width + 'px'
    this.pageBox.style.width = this.imgNum * (styles.pageWidth + styles.pageMargin * 2) + 'px'
    this.imgBox.innerHTML = imgStr
    this.pageBox.innerHTML = pageStr
    this.pageList = Array.from(this.pageBox.querySelectorAll('li'))
    this.swipe(0)
  }
  swipe = (tarIndex) => {
    if (tarIndex < 0 || tarIndex > this.imgNum) {
      let skip = tarIndex < 0 ? this.imgNum : 0
      this.imgBox.style.transition = 'none'
      this.imgBox.style.transform = `translateX(${-skip * this.width}px)`
      this.imgBox.offsetTop
      this.imgBox.style.transition = this.transition
    }
    this.index = tarIndex < 0 ? this.imgNum - 1 : tarIndex > this.imgNum ? 1 : tarIndex
    this.imgBox.style.transform = `translateX(${-this.index * this.width}px)`
    this.pageList.forEach((item) => {
      item.classList.remove('active')
    })
    let curIndex = this.index % this.imgNum
    this.pageList[curIndex].classList.add('active')
    this.title.innerHTML = `${this.data[curIndex].isad ? '<i class="ad-icon"></i>' : ''}${this.data[curIndex].title}`
  }
  bindEvent = () => {
    this.swiper.addEventListener('mouseenter', () => {
      clearInterval(this.timer)
      this.timer = null
    })
    this.swiper.addEventListener('mouseleave', () => {
      this.autoSwipe()
    })
    this.pageBox.addEventListener('click', (e) => {
      clearInterval(this.timer)
      this.timer = null
      this.swipe(this.pageList.indexOf(e.target))
    })
  }
  autoSwipe = (styles) => {
    styles = {
      interval: 5000,
      ...styles,
    }
    if (this.timer) return
    this.timer = setInterval(() => {
      this.swipe(++this.index)
    }, styles.interval)
  }
}
