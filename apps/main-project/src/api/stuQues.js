import request from '../utils/request.js';
// 学生端问卷列表
export const myQueFormPager = data => {
  return request.page.post('/my/queForm/pager', data);
};
// 答题页-问卷答题提交
export const myQueFormSubmit = data => {
  return request.page.post('/my/queForm/answer/submit', data);
};
// 答题页-问卷详情
export const myQueFormDetail = id => {
  return request.page.get('/my/queForm/answer/detail?qfId=' + id);
};
