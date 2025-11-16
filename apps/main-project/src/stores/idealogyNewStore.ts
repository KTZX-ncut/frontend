import { State, updateStudentState, calculate, getIdeologyList, updateIdeology, addParentIdeology, addSameIdeology, addChildIdeology, deleteIdeology, getExamList, getinsertedExamInfo, insertExam, deleteExam, changeOrder, getClassroomValue, getStudentValue, getAllStudentValue, getClassroominfo } from '../api/idealogyNew';

import { defineStore } from 'pinia';
import { ref } from 'vue';


export interface IdeaLabel {
  id: string;
  parentId: null | string;
  name: string;
  weight: number;
  remark: null;
  courseId: string;
  leaf: number;
  level: number;
  createTime: Date;
  updateTime: Date;
  children?: IdeaLabel[];
}


export interface UpdateLabel {
  id: string
  vname: string;
}

export interface Test {
  testId: string;
  paperId: string;
  testName: string;
  paperName: string;
  classroomId: string;
  classroomName: string;
  courseName: string;
  creator: string;
  createTime: Date;
  catelog: string;
}

export interface CourseIdealogy {
  id: string;
  parentId: null | string;
  name: string;
  weight: number;
  remark: null;
  courseId: string;
  leaf: number;
  level: number;
  createTime: Date;
  updateTime: Date;
  children?: CourseIdealogy[];
  evalResult?: EvalResult;
}

export interface EvalResult {
  id: string;
  courseId: string;
  classroomId: string;
  valueCount: number;
  createdAt: Date;
  updatedAt: Date;
  vid: string;
}

export interface AllStudentValue {
  userId: string;
  studentName: string;
  stuno: string;
  ideologyList: CourseIdealogy[];
}

export interface ClassroomInfo {
  classroomId: string;
  classroomName: string;
  termName: string;
  courseName: string;
  professionName: null;
  teacherName: string;
  time: number;
  score: null;
  assistantName: null;
}



const useIdealogyNew = defineStore('idealogyNew', () => {
  const Llist = ref<IdeaLabel[]>([])
  const testList = ref<Test[]>([])
  const testInfo = ref<Test[]>([])
  const listVisible = ref(false)
  const courseValueList = ref<CourseIdealogy[]>([])
  const studentValueList = ref<CourseIdealogy[]>([])
  const allStudentValueList = ref<AllStudentValue[]>([])
  const classroomInfo = ref<ClassroomInfo>({} as ClassroomInfo)

  const fetchStudentState = async (stateList: State[]) => {
    return await updateStudentState(stateList);
  }

  const setCourseValueList = (value: CourseIdealogy[]) => {
    courseValueList.value = value
  }

  const setStudentvalueList = (value: CourseIdealogy[]) => {
    studentValueList.value = value
  }

  const fetchCalc = async (classroomId: string) => {
    return await calculate(classroomId);
  }

  const fetchList = async () => {
    const { data } = await getIdeologyList()
    Llist.value = data;
  }

  const fetchUpdateLabel = async (params: UpdateLabel) => {
    return await updateIdeology(params);
  }

  const fetchAddParent = async () => {
    return await addParentIdeology()
  }

  const fetchAddSame = async (param: { id: string }) => {
    return await addSameIdeology(param)
  }

  const fetchAddChild = async (param: { id: string }) => {
    return await addChildIdeology(param)
  }

  const fetchDelLabel = async (param: { id: string }) => {
    return await deleteIdeology(param)
  }

  // 配置信息
  const fetchEmaxList = async (classroomId: string) => {
    const { data } = await getinsertedExamInfo(classroomId);
    testList.value = data;
  }

  const setTestList = (list: Test[]) => {
    testList.value = list;
  }

  const setListVisible = (value: boolean) => {
    listVisible.value = value
  }

  const fetchAllTests = async (classroomId: string) => {
    const { data, code, msg } = await getExamList(classroomId);
    testInfo.value = data
    return { code, msg }
  }

  const fetchInsertTests = async (params: Test[]) => {
    return await insertExam(params)
  }

  const fetchDelStuList = async (params: number[]) => {
    return await deleteExam(params)
  }

  const fetchChangeOrder = async (classroomId: string, params: number[]) => {
    return await changeOrder(classroomId, params)
  }

  // 评价
  const fetchCourseValue = async (classroomId: string) => {
    const { data } = await getClassroomValue(classroomId)
    courseValueList.value = data
  }

  const fetchStudentValue = async (userId: string, classroomId: string) => {
    const { data, msg, code } = await getStudentValue(userId, classroomId)
    studentValueList.value = data
    return {
      code, msg
    }
  }

  const fetchAllStudentValue = async (classroomId: string) => {
    const { code, msg, data } = await getAllStudentValue(classroomId)
    allStudentValueList.value = data
    return { code, msg }
  }

  const fetchClassroomInfo = async () => {
    const { code, msg, data } = await getClassroominfo()
    classroomInfo.value = data
    return {
      code, msg
    }
  }

  return {
    Llist,
    testList,
    testInfo,
    listVisible,
    classroomInfo,
    courseValueList,
    studentValueList,
    allStudentValueList,
    setTestList,
    fetchStudentState,
    fetchCalc,
    fetchList,
    fetchUpdateLabel,
    fetchAddParent,
    fetchAddSame,
    fetchAddChild,
    fetchDelLabel,
    fetchEmaxList,
    fetchAllTests,
    setListVisible,
    fetchInsertTests,
    fetchDelStuList,
    fetchChangeOrder,
    fetchCourseValue,
    fetchStudentValue,
    setCourseValueList,
    setStudentvalueList,
    fetchAllStudentValue,
    fetchClassroomInfo,
  }

});

export default useIdealogyNew;
