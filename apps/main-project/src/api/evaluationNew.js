import { c } from 'naive-ui';
import request from '../utils/request.js';
import qs from 'qs';

// 查询所有考核项类别
export const getType = (courseId, current, size) => {
  return request.evaluation.get(
    `/fe/assessment-categories/list?courseId=${courseId}&current=${current}&size=${size}`
  );
};

// 增加考核项
export const addType = (courseId, categoryName, categoryDescription, score, percent) => {
  return request.evaluation.post('/fe/assessment-categories/add', {
    courseId, // 课程ID（必填）
    categoryName, // 类别名称（必填）
    categoryDescription, // 类别描述（可选）
    score, // 类别分数（必填，范围：0-100）
    percent
  });
};

// 删除考核项
export const delType = idList => {
  return request.evaluation.delete('/fe/assessment-categories/batch', {
    data: idList
  });
};

// 查询考核项
// 模糊查询
export const fuzzyType = payload => {
  return request.evaluation.post('/fe/assessment-categories/search', { ...payload });
};

// 修改
export const updateType = payload => {
  return request.evaluation.put('/fe/assessment-categories/update', { ...payload });
};

/* 
  课程目标
*/
// 查询所有课程目标
export const getAim = (courseId, current, size) => {
  return request.evaluation.get(
    `/fe/course-objectives/list?courseId=${courseId}&current=${current}&size=${size}`
  );
};

// 增加课程目标
export const addAim = (courseId, objectiveName, objectiveDescription, weight, sortOrder) => {
  return request.evaluation.post('/fe/course-objectives/add', {
    courseId, // 课程ID（必填）
    objectiveName, // 目标名称（必填）
    objectiveDescription, // 目标描述（可选）
    weight, // 权重，0-1之间（必填）
    sortOrder
  });
};

// 删除课程目标
export const delAim = idList => {
  return request.evaluation.delete('/fe/course-objectives/batch', {
    data: idList
  });
};

// 查询课程目标
// 模糊查询
export const fuzzyAim = payload => {
  return request.evaluation.post('/fe/course-objectives/search', { ...payload });
};

// 修改课程目标
export const updateAim = payload => {
  return request.evaluation.put('/fe/course-objectives/update', { ...payload });
};

/* 
  考核项
*/
export const getTest = classroomId => {
  return request.evaluation.get(`/fe/assessment-items/config/list?classroomId=${classroomId}`);
};

export const getCourseId = classroomId => {
  return request.evaluation.get(`dynamic/portrait/getCourseId?classroomId=${classroomId}`);
};

// 绑定考核项和课程目标
export const bindTypeAim = inputList => {
  return request.evaluation.post('/fe/assessment-items/batch/add', inputList);
};

// 查看考核项
export const getbindType = (courseId, size, current, categoryId, objectiveId) => {
  return request.evaluation.get(
    `/fe/assessment-items/list?current=${current}&size=${size}&courseId=${courseId}&categoryId=${categoryId}&objectiveId=${objectiveId}`
  );
};

// 删除考核项
export const delbindType = delList => {
  return request.evaluation.delete('/fe/assessment-items/batch/delete', { data: delList });
};
