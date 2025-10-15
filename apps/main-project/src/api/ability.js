import request from '../utils/request.js';

// 获取专业负责人能力字典\
export const getProfessionAbility = () => {
  // return request.course.get('/coursemangt/classroommangt/student/list?obsid=' + obsid);
  return request.evaluation.get('/evaluation/ability');
};

// 获取课程负责人能力字典
export const getCourseManagerAbility = () => {
  // return request.course.get('/coursemangt/classroommangt/student/list?obsid=' + obsid);
  return request.evaluation.get('/evaluation/getability');
};
