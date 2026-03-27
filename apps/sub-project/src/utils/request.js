import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
//60.205.178.180
//127.0.0.1

// 开发环境
// request.js 物理机配置
const baseURL = window.__APP_CONFIG__?.API_BASE_URL || 'http://127.0.0.1';

const WDD_HOST = import.meta.env.VITE_WDD_HOST;
const HOST_ADMIN = import.meta.env.VITE_API_HOST_ADMIN;
const HOST_COURSE = import.meta.env.VITE_API_HOST_COURSE;
const HOST_EVALUATION = import.meta.env.VITE_API_HOST_EVALUATION;
// 图片上传用到的域名
// // 物理机
// export const host = `${baseURL}:10203`;

// const request = {
//   admin: createAPI(`${baseURL}:9000/api/admin`),
//   course: createAPI(`${baseURL}:9000/api/course`),
//   evaluation: createAPI(`${baseURL}:9000/api/evaluation`),
//   page: createAPI(`${baseURL}:10203/page`),
//   fork: createAPI(`${baseURL}:10203/fork`),
//   common: createAPI(`${baseURL}:10203/common`),
//   term: createAPI(`${baseURL}:10203/term`)
// };

// 云主机部署
export const host = import.meta.env.VITE_UPLOAD_HOST;
const request = {
  admin: createAPI(`${HOST_ADMIN}`),
  course: createAPI(`${HOST_COURSE}`),
  evaluation: createAPI(`${HOST_EVALUATION}`),
  page: createAPI(`${WDD_HOST}:10203/page`),
  fork: createAPI(`${WDD_HOST}:10203/fork`),
  common: createAPI(`${WDD_HOST}:10203/common`),
  term: createAPI(`${WDD_HOST}:10203/term`)
};

// 60.205.178.180
function createAPI(url) {
  // 构建不同端口的异步请求数据
  const axiosData = axios.create({
    baseURL: url
    // timeout: 70000
  });

  // request 拦截器
  // 可以自请求发送前对请求做一些处理
  // 比如统一加token，对请求参数统一加密
  axiosData.interceptors.request.use(
    config => {
      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json;charset=utf-8';
      }
      const token = sessionStorage.getItem('token'); // 示例获取 token 的代码
      console.log(token);
      if (token) {
        config.headers['token'] = token; // 设置请求头中的 token
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // response 拦截器
  // 可以在接口响应后统一处理结果
  axiosData.interceptors.response.use(
    response => {
      let res = response.data;
      const isBinaryResponse = ['blob', 'arraybuffer'].includes(response.config.responseType);

      // 文件预览/下载接口可能返回 206，二进制响应不走业务码解析
      if (isBinaryResponse) {
        return res;
      }

      // 登录已过期
      if (response.data.code == '1001' || response.data.code == '1000') {
        ElMessage.error('登录已过期，请重新登录');
        router.push('/login');
        return;
      }
      // 课程、课堂、问卷、实验、组卷异常提示
      if (res?.result === false) {
        ElMessage.error(res.message);
      }
      // 兼容服务端返回的字符串数据
      if (typeof res === 'string') {
        res = res ? JSON.parse(res) : res;
      }
      return res;
    },
    error => {
      console.log('err' + error); // for debug
      return Promise.reject(error);
    }
  );

  return axiosData;
}

export default request;
