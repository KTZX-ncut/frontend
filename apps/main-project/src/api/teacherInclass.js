import request from '../utils/request.js';
import qs from 'qs';
// 获取学生名单
export const getStuList = obsid => {
  return request.course.get('/coursemangt/classroommangt/student/list?obsid=' + obsid);
};

// 删除某一学生信息
export const delSingleStudent = (classRoomId, stuIds) => {
  return request.course.delete('/coursemangt/classroommangt/student/delete', {
    params: {
      classRoomId,
      stuIds
    },
    paramsSerializer: params => {
      return qs.stringify(params, { arrayFormat: 'repeat' }); // 序列化为用逗号分隔的格式
    }
  });
};

// 删除全部学生
export const delAllStudent = classRoomId => {
  return request.course.delete('/coursemangt/classroommangt/student/deleteAll', {
    params: {
      classRoomId
    }
  });
};

// 获取学生信息
export const getOrgnization = () => {
  return request.course.get('/coursemangt/classroommangt/student/studentRP');
};

// 模板导入学生
export const importStudentList = fd => {
  return request.course.post('/coursemangt/classroommangt/student/import', fd);
};

// 批量导入学生
export const importStudentmenu = list => {
  return request.course.post('/coursemangt/classroommangt/student/create', list);
};

// 修改学生是否参与评价
export const isAttendEvaluation = arr => {
  return request.evaluation.put('/dynamic/portrait/modifyStudentDynamicState', arr);
};

// 一键生成画像
export const generatePortrait = (courseId, classroomId, stuIdList = [], paperIdList = []) => {
  const data = {
    courseId,
    classroomId,
    ...qs.parse(
      qs.stringify(
        { stuIdList, paperIdList },
        { arrayFormat: 'repeat' } // 数组以重复键的格式序列化
      )
    )
  };
  return request.evaluation.post('/dynamic/portrait/calculate', data);
};

// 修改学生参与达成性评价
export const isAttendEvaluationAchievement = arr => {
  return request.evaluation.put('reach-evaluation/modifyStudentReachState', arr);
};

// 一键生成画像达成性
export const generatePortraitAchievement = () => {};
