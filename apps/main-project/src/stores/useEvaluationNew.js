import { defineStore } from 'pinia';
import { ref } from 'vue';
import { addType, delType, fuzzyType, getType } from '../api/evaluationNew';
import { updateType } from '../api/evaluationNew';

const useEvaluationNew = defineStore('evaluationNew', () => {
  const typeList = ref([]);

  const fetchType = async ({ courseId, current, size }) => {
    const { data, code, msg } = await getType(courseId, current, size);
    if (code === 200 && msg === 'success') {
      typeList.value = data.records;
    }
  };

  const fetchAddType = async ({ courseId, categoryName, categoryDescription, score, percent }) => {
    const data = await addType(courseId, categoryName, categoryDescription, score, percent);
    return data;
  };

  const fetchDelList = async ({ idList }) => {
    const data = await delType(idList);
    return data;
  };

  const fuzzyQuery = async payload => {
    const { data } = await fuzzyType(payload);
    typeList.value = data.records;
  };

  const fetchUpdateType = async payload => {
    const data = await updateType(payload);
    return data;
  };

  return {
    typeList,
    fetchType,
    fetchAddType,
    fetchDelList,
    fuzzyQuery,
    fetchUpdateType
  };
});

export default useEvaluationNew;
