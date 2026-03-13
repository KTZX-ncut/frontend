import { UniExport } from './type';
import request from '../../utils/request.js';

// 获取所有 workflows
export const getAllWorkflows = (): Promise<UniExport> => {
  return request.ai.get<UniExport>('/workflows');
};

// 运行某个 worflows
export const runWorkflow = (
  id: string,
  params: any,
  stream: boolean = false
): Promise<UniExport> => {
  return request.ai.post<UniExport>(`/workflows/${id}/${stream ? 'stream' : 'execute'}`, params);
};

// 获取所选文件路径并运行工作流
export const getFilePathandGenerate = (
  params: any,
  id: string,
  stream: boolean = true
): Promise<UniExport> => {
  return request.bff.post<UniExport>(
    `/ai/generate-workflow-path?id=${id}&stream=${stream}`,
    params
  );
};

// 获取所有文件
export const getAllFile = (): Promise<UniExport> => {
  return request.course.get<UniExport>('/coursemangt/courseresources');
};
