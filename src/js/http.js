import axios from '/node_modules/axios/dist/axios';
import utils from './utils';

axios.defaults.baseURL = './fakeapi';
axios.defaults.withCredentials = true;

// 请求拦截
axios.interceptors.request.use(
  (config) => {
    // 反代
    if (!/^https?:\/\/api\.pinea\.cn\/biliproxy/.test(config.url))
      config.url = utils.proxyUrl(config.url);
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// axios.defaults.timeout=1;

// 响应拦截
axios.interceptors.response.use(
  (response) => {
    // code !== 1
    if (response.data.code) throw response.data.message;
    return response.data;
  },
  (error) => {
    // 响应失败
    console.dir(error);
    let err = '';
    // 有状态码
    if (error && error.response) {
      switch (error.response.status) {
        case 403:
          err = '服务器拒绝访问';
          break;
        case 404:
          err = '找不到页面';
          break;
        //...
        default:
      }
    } else {
      // 没有状态码
      // 请求超时
      if (error && error.code == 'ECONNABORTED') {
        err = '请求超时';
      } else if (!navigator.onLine) {
        // 没有网络
        err = '网络出错';
      }
    }
    return Promise.reject(err);
  }
);
