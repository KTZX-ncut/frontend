import {
  addExternalLabel,
  calculateExternalAssessment,
  deleteExternalLabel,
  getAimEvaluation,
  getExternalAssessmentList,
  getExternalLabelList,
  getIdStuList,
  getStuList,
  getTypeEvaluation,
  updateExternalLabel
} from '../api/externalAssessment';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Label {
  id: string;
  classroomId: string;
  labelName: string;
  createdAt: Date;
}

export interface External {
  id: string;
  labelId: string;
  exAssessmentName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypeEva {
  userId: string;
  stuNo: string;
  studentName: string;
  assessmentCategoryId: string;
  assessmentCategoryName: string;
  percent: number;
  achievementScore: string;
}

export interface AimEva {
  userId: string;
  stuNo: string;
  studentName: string;
  objectiveId: string;
  objectiveName: string;
  achievementScore: string;
}

const useLabel = defineStore('label', () => {
  const isShow = ref(false);

  const labelList = ref<Label[]>([]);

  const typeEvaList = ref<TypeEva[]>([]);

  const aimEvaList = ref<AimEva[]>([]);

  const stuIds = ref<string[]>([]);
  const stuList = ref<any>([]);
  const id = ref('');

  const externalAssessmentList = ref<External[]>([]);

  const setSHow = (val: boolean) => {
    isShow.value = val;
  };

  // 增
  const fetchAddLabel = async (classroomId: string, labelName: string) => {
    return await addExternalLabel(classroomId, labelName);
  };

  // 删
  const fetchDelLabel = async (id: string) => {
    return await deleteExternalLabel(id);
  };

  // 改
  const fetchUpdLabel = async (id: string, labelName: string) => {
    return await updateExternalLabel(id, labelName);
  };

  // 查
  const fetchLabelList = async (classroomId: string) => {
    const res = await getExternalLabelList(classroomId);
    labelList.value = res.data;
  };

  // 查询外部考核数据列表
  const fetchExternalAssessmentList = async (id: string) => {
    const res = await getExternalAssessmentList(id);
    externalAssessmentList.value = res.data;
  };

  const fetchExternalAssessmenCalc = async (classroomId: string) => {
    return await calculateExternalAssessment(classroomId);
  };

  const fetchTypeEva = async (classroomId: string) => {
    const res = await getTypeEvaluation(classroomId);
    typeEvaList.value = res.data;
  };

  const fetchAimEva = async (classroomId: string) => {
    const res = await getAimEvaluation(classroomId);
    aimEvaList.value = res.data;
  };

  const fetchStuIds = async (classroomId: string) => {
    const res = await getIdStuList(classroomId);
    stuIds.value = res.data;
  };

  const fetchStuList = async (id: string) => {
    const res = await getStuList(id);
    stuList.value = res.data;
  };

  const setId = (idx: string) => {
    id.value = idx;
  };

  return {
    isShow,
    typeEvaList,
    aimEvaList,
    stuIds,
    labelList,
    externalAssessmentList,
    stuList,
    id,
    setSHow,
    fetchAddLabel,
    fetchDelLabel,
    fetchUpdLabel,
    fetchLabelList,
    fetchExternalAssessmentList,
    fetchExternalAssessmenCalc,
    fetchTypeEva,
    fetchAimEva,
    fetchStuIds,
    fetchStuList,
    setId
  };
});

export default useLabel;
