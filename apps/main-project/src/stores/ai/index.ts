import { getAllFile, getAllWorkflows, getFilePathandGenerate, runWorkflow } from '../../api/ai';

import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface workflow {
  id: string;
  name: string;
  purpose: string;
  stepsCount: number;
  status: 'idle';
}

export interface FileResourceSchema {
  fileName: string;
  bucketName: string;
}

export interface fileParams {
  studentFeedback: FileResourceSchema; // 学生反馈
  lessonPlan: FileResourceSchema; // 课堂教案
  ppt: FileResourceSchema; // ppt
}

export interface fileType {
  id: string;
  obsid: string;
  filename: string;
  size: number;
  type: string;
  createtime: Date;
  remark: null;
  objectName: string;
  bucketName: string;
}

export interface content {
  fileName: string;
  type: 'lessonPlan' | 'ppt' | 'studentFeedback';
  url: string;
}

export interface urlContent {
  lessonPlan: content;
  ppt: content;
  studentFeedback: content;
}

const useAI = defineStore('aiStore', () => {
  const workflows = ref<workflow[]>([]);
  const allFiles = ref<fileType[]>([]);
  const files = ref<urlContent>();

  const fetchAllWorkflows = async () => {
    const { data, success, error } = await getAllWorkflows();
    if (success) {
      workflows.value = data;
    } else {
      console.log(error);
    }
  };

  const fetchRunWorkflow = async (id: string, params: any, stream: boolean) => {
    const { data, success, error } = await runWorkflow(id, params, stream);
    if (success) {
      console.log(data);
    } else {
      console.error(error);
    }
  };

  const fetchFilePath = async (params: fileParams, id: string, stream: boolean) => {
    const { data, success, error } = await getFilePathandGenerate(params, id, stream);
    console.log(data);
    files.value = data;
  };

  const fetchAllFile = async () => {
    const { data, msg, code } = await getAllFile();
    allFiles.value = data;
  };

  return {
    files,
    workflows,
    allFiles,
    fetchAllWorkflows,
    fetchRunWorkflow,
    fetchFilePath,
    fetchAllFile
  };
});

export default useAI;
