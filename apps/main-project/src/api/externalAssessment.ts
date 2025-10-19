import request from '../utils/request.js';
import { UniExport } from './type.js';

/**
 * 新增外部考核标签
 * @param {Object} data - 标签数据
 */
export const addExternalLabel = (classroomId: string, labelName: string): Promise<UniExport> => {
  return request.evaluation.post('/external-assessment/label/add', {
    classroomId,
    labelName
  });
};

/**
 * 更新外部考核标签
 * @param {Object} data - 标签更新数据
 */
export const updateExternalLabel = (id: string, labelName: string): Promise<UniExport> => {
  return request.evaluation.post('/external-assessment/label/update', {
    id,
    labelName
  });
};

/**
 * 根据考核任务 ID 获取标签列表
 * @param {string} taskId - 任务 ID
 */
export const getExternalLabelList = (classroomId: string): Promise<UniExport> => {
  return request.evaluation.get(`/external-assessment/label/list/${classroomId}`);
};

// 删除标签
export const deleteExternalLabel = (id: string): Promise<UniExport> => {
  return request.evaluation.delete(`/external-assessment/label/delete/${id}`);
};

// 获取所有考核项与课程目标的分数
export const listObjectiveCategory = (params): Promise<UniExport> => {
  return request.evaluation.get('/objective-category/list', { params });
};

/**
 * 导入外部考核 Excel 文件
 * @param {File|FormData} file - Excel 文件对象
 */
export const importExternalAssessment = (
  file: File,
  externalLabelId: string
): Promise<UniExport> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('externalLabelId', externalLabelId);
  return request.evaluation.post('/external-assessment/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000 // ✅ 改成 60秒 或更长
  });
};

/**
 * 批量保存客观题考核项
 * @param {Array|Object} data - 批量保存的数据
 */
export const batchSaveObjectiveCategory = data => {
  return request.evaluation.post('/objective-category/batch-save', data);
};

export const getExternalAssessmentList = (id: string) => {
  return request.evaluation.get(`/externalAssessmentTask/list/${id}?filter=true`);
  // return request.evaluation.get(`/externalAssessmentTask/list/${id}`);
};

// 一键计算
export const calculateExternalAssessment = (classroomId: string): Promise<UniExport> => {
  return request.evaluation.get(`/reach-evaluation/calculate?classroomId=${classroomId}`);
};

// 生成画像
// 考核类别
export const getTypeEvaluation = (classroomId: string) => {
  return request.evaluation.get(
    `reach-evaluation/getReachCategoryEvaluation?classroomId=${classroomId}`
  );
};

// 考核目标
export const getAimEvaluation = (classroomId: string) => {
  return request.evaluation.get(
    `reach-evaluation/getReachObjectiveEvaluation?classroomId=${classroomId}`
  );
};

// 所有学生id
export const getIdStuList = (classroomId: string) => {
  return request.evaluation.get(`/reach-evaluation/getUserIdList?classroomId=${classroomId}`);
};

// 根据考核id查询学生
export const getStuList = (id: string) => {
  return request.evaluation.get(`exAssessTaskDetail/list/${id}`);
};
