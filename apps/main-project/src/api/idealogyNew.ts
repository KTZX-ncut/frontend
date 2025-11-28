import { Test, UpdateLabel } from 'stores/idealogyNewStore.js';
import request from '../utils/request.js';
import { UniExport } from './type.js';
// 修改学生参与思政价值

export interface State {
  classroomStudentId: string;
  reachState: number;
}




export const updateStudentState = (stateList: State[]): Promise<UniExport> => {
  return request.evaluation.put('/evaluation/ideology/modifyStudentIdeologyState', stateList)
}

// 一键计算
export const calculate = (classroomId: string): Promise<UniExport> => {
  return request.evaluation.get(`/evaluation/ideology/calculate?classroomId=${classroomId}`)
}

// 思政价值增删改查
// 查
export const getIdeologyList = (): Promise<UniExport> => {
  return request.evaluation.get('/evaluation/ideology/value')
}

// 改
export const updateIdeology = (params: UpdateLabel): Promise<UniExport> => {
  return request.evaluation.put('/evaluation/ideology/value', params)
}

// 增加类型(课程负责人)
export const addParentIdeology = (): Promise<UniExport> => {
  return request.evaluation.post('/evaluation/ideology/value/parent')
}

// 下级新增（both）
export const addChildIdeology = (params: { id: string }): Promise<UniExport> => {
  return request.evaluation.post('/evaluation/ideology/value/addSubLevelNode', params)
}

// 同级新增
export const addSameIdeology = (params: { id: string }): Promise<UniExport> => {
  return request.evaluation.post('/evaluation/ideology/value/addSameLevelNode', params)
}

// 删除
export const deleteIdeology = (params: { id: string }): Promise<UniExport> => {
  return request.evaluation.delete('/evaluation/ideology/value', { data: params })
}

// 配置信息
// 查询当前课堂考试信息
export const getExamList = (classroomId: string): Promise<UniExport> => {
  return request.evaluation.get(`/evaluation/ideology/conf/getTestInfoList?classroomId=${classroomId}`)
}

// 考试插入评价数据表
export const insertExam = (params: Test[]): Promise<UniExport> => {
  return request.evaluation.post('/evaluation/ideology/conf/saveConfPaper', params)
}

// 删除配置试卷数据
export const deleteExam = (params: number[]): Promise<UniExport> => {
  return request.evaluation.delete('/evaluation/ideology/conf/removeConfPaper', { data: params })
}

// 查询已配置的课堂考试信息
export const getinsertedExamInfo = (classroomId: string): Promise<UniExport> => {
  return request.evaluation.get(`/evaluation/ideology/conf/getConfTestInfoList?classroomId=${classroomId}`)
}

// 改变评价顺序
export const changeOrder = (classroomId: string, params: number[]): Promise<UniExport> => {
  return request.evaluation.put(`/evaluation/ideology/conf/updateConfTestInfoListRow?classroomId=${classroomId}`, params)
}

// 获取课堂思政评分
export const getClassroomValue = (classroomId: string): Promise<UniExport> => {
  return request.evaluation.get(`/evaluation/ideology/getClassroomIdeologyEvaluation?classroomId=${classroomId}`)
}

// 获取学生思政评分
export const getStudentValue = (userId: string, classroomId: string): Promise<UniExport> => {
  return request.evaluation.get(`/evaluation/ideology/getStudentIdeologyEvaluation?userId=${userId}&classroomId=${classroomId}`)
}

// 获取所有学生评价
export const getAllStudentValue = (classroomId: string): Promise<UniExport> => {
  return request.evaluation.get(`/evaluation/ideology/getAllStudentIdeologyEvaluation?classroomId=${classroomId}`)
}

// 通过classroomId获取课堂明细
export const getClassroominfo = (): Promise<UniExport> => {
  return request.evaluation.get('/evaluation/attainment/getClassroomByClassroomId');
}

// 获取所有题目对应标签
export const getAllQuestionLabels = (classroomId: string): Promise<UniExport> => {
  return request.evaluation.get(`/evaluation/ideology/getAllPaperIdeologyEvaluation?classroomId=${classroomId}`);
}