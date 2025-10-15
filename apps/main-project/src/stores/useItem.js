import { defineStore } from 'pinia';
import { ref } from 'vue';
import { bindTypeAim, delbindType, getbindType, getCourseId, getTest } from '../api/evaluationNew';
import { updateAim } from '../api/evaluationNew';

const useItem = defineStore('item', () => {
  const testList = ref({
    testPaper: [],
    practice: []
  });

  const courseId = ref();
  const isShow = ref(false);
  const categoryId = ref();
  const objectiveId = ref('');
  const isItemShow = ref(false);
  const bindList = ref([]);

  const setCourseId = value => {
    courseId.value = value;
  };

  const setItemShow = value => {
    isItemShow.value = value;
  };
  const setShow = value => {
    isShow.value = value;
  };

  const setCategoryId = value => {
    categoryId.value = value;
  };

  const setObjectiveId = value => {
    objectiveId.value = value;
  };

  const fetchTest = async ({ classroomId }) => {
    const { data, code, msg } = await getTest(classroomId);
    if (code === 200 && msg === 'success') {
      testList.value = data;
    }
  };

  const fetchCourseId = async classroomId => {
    const { data } = await getCourseId(classroomId);
    courseId.value = data;
  };

  const fetchBind = async inputList => {
    const { code, msg } = await bindTypeAim(inputList);
    return { code, msg };
  };

  const fetchGetBind = async (courseId, size, current, categoryId, objectiveId) => {
    const { data } = await getbindType(courseId, size, current, categoryId, objectiveId);
    bindList.value = data.records;
  };

  const fetchDelBind = async delList => {
    const data = await delbindType(delList);
    return data;
  };

  return {
    fetchTest,
    testList,
    fetchCourseId,
    courseId,
    isShow,
    setShow,
    categoryId,
    setCategoryId,
    objectiveId,
    setObjectiveId,
    fetchBind,
    isItemShow,
    setItemShow,
    fetchGetBind,
    bindList,
    fetchDelBind,
    setCourseId
  };
});

export default useItem;
