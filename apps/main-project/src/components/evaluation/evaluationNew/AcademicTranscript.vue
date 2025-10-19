<!-- 评价名单 使用vxe-table组件 -->
<template>
  <el-container
    v-if="renderLoading"
    v-loading="renderLoading"
    element-loading-background="rgba(0, 0, 0, 0.2)"
    style="height: 92vh"
  ></el-container>
  <choose-classroom
    v-else-if="isCourseManager && !hasChooseClassroom"
    @classroom-chosen="handleClassroomChosen"
  ></choose-classroom>
  <el-container
    v-show="!isCourseManager || (isCourseManager && hasChooseClassroom)"
    style="height: 92vh; overflow: hidden"
  >
    <el-header
      style="
        height: 6vh;
        padding: 5px 0px;
        width: 100%;
        text-align: left;
        background-color: #deebf7;
      "
    >
      <!-- <el-button type="primary" v-if="!isCourseManager" style="margin-left: 0.8vw" @click="calc()"
        >重新生成成绩单</el-button
      > -->
      <el-button type="success" style="margin-left: 0.8vw" @click="exportData">导出excel</el-button>
      <el-button
        type="primary"
        v-if="isCourseManager"
        style="margin-left: 0.8vw"
        @click="hasChooseClassroom = false"
        >切换课堂</el-button
      >
    </el-header>

    <div
      v-loading="pageLoading"
      element-loading-background="rgba(0, 0, 0, 0.2)"
      id="container"
      style="height: 100vh"
    >
      <vxe-grid ref="gridRef" v-bind="gridOptions" class="mytable-scrollbar"></vxe-grid>
    </div>
  </el-container>
</template>

<script setup>
import useEvaluationNew from '../../../stores/useEvaluationNew.js';
import useItem from '../../../stores/useItem.js';
import { ElMessage } from 'element-plus';
import { nextTick, onBeforeMount, onMounted, ref, watch } from 'vue';
import request from '../../../utils/request.js';
import ChooseClassroom from '../subcomponents/ChooseClassroom.vue';
import _ from 'lodash';
import { storeToRefs } from 'pinia';
import parseJWT from '../../../utils/parseJWT.js';
import useLabel from '../../../stores/useLabel.ts';

const typeStore = useEvaluationNew();
const itemStore = useItem();
const { fetchCourseId, setCourseId } = itemStore;
const { courseId, bindList } = storeToRefs(itemStore);
const { fetchType } = typeStore;
const { typeList } = storeToRefs(typeStore);
const roleName = JSON.parse(sessionStorage.getItem('users')).rolename;
const classroomIdRef = ref(
  roleName === '任课教师' ? parseJWT(sessionStorage.getItem('token')).obsid : ''
);

console.log('clasrom', classroomIdRef.value);

const labelStore = useLabel();
const { fetchTypeEva, fetchLabelList } = labelStore;
const { typeEvaList, labelList } = storeToRefs(labelStore);

const isCourseManager = ref(null);
const hasChooseClassroom = ref(false);
const renderLoading = ref(true);
const pageLoading = ref(false);
const classroomId = ref(null);
const storeTypeList = ref([]);
const percentMap = ref(new Map());
const stuListNew = ref([]);

const getTypeData = async () => {
  if (classroomIdRef.value) {
    await fetchCourseId(classroomIdRef.value);
  } else {
    setCourseId(parseJWT(sessionStorage.getItem('token')).obsid);
  }

  await fetchType({ courseId: courseId.value, current: 1, size: -1 });
};

// onMounted(async () => {
//   await getTypeData();
//   console.log(typeList.value);
//   storeTypeList.value = [
//     ...typeList.value,
//     { courseId: typeList.value[0].courseId, categoryName: '期末考试', score: 100 }
//   ];
// });

const gridRef = ref();
// 用于渲染表格的数据
const gridOptions = ref({
  size: 'mini',
  border: true,
  // maxHeight: 200, // 表格默认高度，在钩子函数中会修改
  align: 'center',
  showOverflow: true,
  showHeaderOverflow: true,
  columnConfig: {
    resizable: true
  },
  columns: [
    {
      title: '',
      children: [
        {
          field: 'studentScore',
          title: '学生成绩',
          children: [
            {
              type: 'seq',
              title: '序号',
              width: 50
            },
            {
              field: 'stuno',
              title: '学号'
            },
            {
              field: 'username',
              title: '姓名',
              width: 100
            },
            {
              field: 'totalScore',
              title: '总成绩',
              width: 70
            }
          ]
        },
        {
          field: 'checkitems',
          title: '课程各类考核项',
          width: 950,
          children: null
        }
      ]
    }
  ],
  data: null
});

const stuList = ref(null);
const totalScore = ref(null);
const assessmentData = ref(null);
const finalList = ref([]);

const checkRole = async () => {
  // 查询是否是课程负责人，课程负责人要先选择课堂
  try {
    const res = await request.evaluation.get('/evaluation/attainment');
    if (res.code === 200) {
      if (res.data.isCourseManager) {
        isCourseManager.value = true;
        hasChooseClassroom.value = false;
      } else {
        gridOptions.value.columns[0].title = '课堂名称：' + res.data.classroomName;
        isCourseManager.value = false;
      }
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('查询角色类型失败' + error);
  }

  return isCourseManager.value;
};

const handleClassroomChosen = async (classroomId_, classroomInfo) => {
  console.log(classroomId_, classroomInfo);

  gridOptions.value.columns[0].title = '课堂名称：' + classroomInfo.classroomName;
  classroomId.value = classroomId_;
  classroomIdRef.value = classroomId_;
  // await getData(classroomId.value);
  await generate();
  await getData(classroomIdRef.value);
  // await nextTick();
  nextTick(async () => {
    const minHeight = 800;
    const container = document.getElementById('container');
    gridOptions.value.height = container.clientHeight;
  });
  hasChooseClassroom.value = true;
};

const calc = async () => {
  pageLoading.value = true;
  try {
    const res = await request.evaluation.get(`/evaluation/attainment/calc`);
    if (res.code === 200) {
      await getData(classroomId.value);
      await nextTick();
      // 强制刷新表头
      gridRef.value.reloadColumn(_.cloneDeep(gridOptions.value.columns));
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('计算失败' + error);
  }
  pageLoading.value = false;
};

const generate = async () => {
  renderLoading.value = true;

  await checkRole();
  await getTypeData();
  console.log('cls', classroomIdRef.value);
  await fetchTypeEva(classroomIdRef.value);
  await fetchLabelList(classroomIdRef.value);
  console.log('type', typeList.value);
  console.log('label', labelList.value);
  typeList.value.map(t => {
    console.log(t);
    percentMap.value.set(t.id, t.percent);
  });
  Object.entries(typeEvaList.value).forEach(([key, value]) => {
    let newItem = { totalScore: 0 };
    value.map((s, index) => {
      newItem['username'] = s.studentName;
      newItem[s.assessmentCategoryName] = s.achievementScore;
      newItem[s.assessmentCategoryId] = {
        id: s.assessmentCategoryId,
        name: s.assessmentCategoryName,
        score: s.achievementScore
      };
      newItem['final'] = s.final || 0;
      newItem['stuno'] = s.stuNo;
      newItem['seq'] = index + 1;
      newItem['totalScore'] = Number(newItem['totalScore']) + Number(s.achievementScore) || 0;
      // percentMap.value.set(s.assessmentCategoryName, s.percent);
    });
    stuListNew.value.push(newItem);
    newItem = {};
  });

  stuListNew.value.map(i => {
    let item = {};
    item['stuno'] = i.stuno;
    item['username'] = i.username;
    item['score'] = [];
    [...percentMap.value.keys()].map(k => {
      if (i[k]?.name && i[k]?.score) {
        item['score'].push({
          id: k,
          name: i[k]?.name,
          score: i[k]?.score * percentMap.value.get(k)
        });
      }
    });
    console.log(item);
    finalList.value.push(item);
    item = {};
  });
  console.log('finalList', finalList.value);
  console.log(stuListNew.value);
  console.log(percentMap.value);

  storeTypeList.value = [
    ...typeList.value
    // { courseId: typeList.value[0].courseId, categoryName: '期末考试', score: 100 }
  ];
  gridOptions.value.columns[0].children[1].children = storeTypeList.value;
  renderLoading.value = false;
  console.log(storeTypeList.value);
  console.log('hhhh');
  if (!isCourseManager.value) {
    const token = sessionStorage.getItem('token');
    classroomId.value = getObsdataFromToken(token);
    await getData(classroomId.value);
    nextTick(() => {
      const container = document.getElementById('container');
      gridOptions.value.maxHeight = container.offsetHeight;
    });
  }
};

onMounted(async () => {
  await generate();
});

const getObsdataFromToken = token => {
  if (!token) return null;

  // 获取 token 中的 payload 部分（token 是 base64 编码的）
  const payload = token.split('.')[1];
  const decodedPayload = JSON.parse(atob(payload)); // 解码并解析 payload

  const obsid = decodedPayload.obsid;

  // 假设 obsid 在 payload 中
  return obsid;
};

const getData = async classroomId => {
  pageLoading.value = true;

  initialize();

  // 强制刷新表头
  gridRef.value.reloadColumn(_.cloneDeep(gridOptions.value.columns));
  pageLoading.value = false;
};

const checkitemScoreRatioMap = ref(null); // 考核项对总评的占比

const initialize = () => {
  gridOptions.value.data = finalList.value.map(f => {
    let totalScore = 0;
    return {
      ...f,
      ...Object.fromEntries(
        f.score.map(s => {
          totalScore += Number(s.score);
          return [s.id, s.score.toFixed(2)];
        })
      ),
      totalScore: totalScore.toFixed(2)
    };
  });
  console.log('stuListNew', stuListNew.value);

  createHeaderNew(storeTypeList.value);
};

const getLeafAndRoot = (leafAndRootMap, checkitemData, rootId = null, floor = 0) => {
  checkitemData.forEach(c => {
    if (floor === 0) rootId = c.id;
    if (c.children && c.children.length > 0) {
      getLeafAndRoot(leafAndRootMap, c.children, rootId, floor + 1);
    } else if (floor !== 0) {
      leafAndRootMap.set(c.id, rootId);
    }
  });
};

const createHeader = head => {
  head.forEach(h => {
    let ratio = checkitemScoreRatioMap.value.get(h.id);
    h.title = h.itemName + (ratio ? '(' + Number((ratio * 100).toFixed(2)) + '%)' : '');
    h.field = h.itemName;
    if (h.children && h.children.length > 0) createHeader(h.children);
  });
};

function splitEvenlyInt(arr) {
  const len = arr.length;
  if (len === 0) return [];

  const base = Math.floor(100 / len);
  const remainder = 100 % len;

  return arr.map((_, i) => (i < remainder ? base + 1 : base));
}

const createHeaderNew = head => {
  const ratio = splitEvenlyInt(head.slice(0, head.length - 1));
  console.log('head', head);
  head.forEach((h, index) => {
    console.log(h.percent);
    h.title = h.categoryName + '（' + (h.percent ?? 1) * 100 + '%）';
    h.field = h.id;
  });
};

const exportData = () => {
  const $grid = gridRef.value;
  if ($grid) {
    // 导出数据
    $grid.exportData({ type: 'xlsx' });
  }
};
</script>

<style lang="scss" scoped>
.mytable-scrollbar {
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
  }
}

[data-vxe-ui-theme='light'] {
  .mytable-scrollbar {
    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-corner {
      background-color: #ffffff;
    }
    ::-webkit-scrollbar-thumb {
      background-color: #aeaeae;
    }
    ::-webkit-scrollbar-thumb:hover,
    ::-webkit-scrollbar-thumb:active {
      background-color: #8e8e8e;
    }
  }
}
</style>
