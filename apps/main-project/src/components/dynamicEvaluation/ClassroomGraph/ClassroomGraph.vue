<template>
  <!-- 课堂列表 -->
  <GraphTemplate
    :store="classroomGraphStore"
    :handleCellClick="handleCellClick"
    :addCellStyle="addCellStyle"
    :graphList="lists"
    :titleList="titles"
    @flushList="handleFlushList"
    keyword="请输入课堂名称关键字检索"
  />
  <!-- 课堂列表结束 -->
  <!-- 课堂画像图表 -->
  <GraphChart :store="classroomGraphStore">
    <template #title>课堂画像：{{ courseInfo.courseName }}</template>
    <template #GraphItem>
      <GraphItem
        title="能力画像"
        :onTimelineChanged="onAbilityTimelineChanged"
        chartHeight="65"
        :chartOption="currentRadarOption"
        ref="radarCmp"
      />
      <GraphItem
        title="关键字画像"
        :onTimelineChanged="onKWTimelineChanged"
        :chartOption="currentWordOption"
        ref="wordmapCmp"
      />
      <!-- <GraphItem title="KWA画像" /> -->
      <GraphItem title="KWA画像">
        <KWAgraph />
      </GraphItem>
      <GraphItem
        ref="treeCmp"
        title="知识单元画像"
        :onTimelineChanged="onTreeTimelineChanged"
        :chartOption="currentTreeOption"
      />
    </template>
  </GraphChart>
  <!-- 课堂画像图表结束 -->
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import KWAgraph from './ClassroomGraphCpns/KWAgraph.vue';
import { getCourseId } from '@/utils/searchCourseId.js';
import useMain from '../../../stores/useMain.js';
import parseJWT from '../../../utils/parseJWT.js';
import GraphItem from '../PublicCpns/GraphItem.vue';
import GraphChart from '../PublicCpns/GraphChart.vue';
import GraphTemplate from '../PublicCpns/GraphTemplate.vue';
import { reactive, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import useClassroomGraph from '../../../stores/dynamicEvaluation/classroomStore.js';
import { radarOption } from '../../../assets/js/dynamicEvaluationPresets/ClassRoomGraphPresets/Radar.js';
import { treeOption } from '../../../assets/js/dynamicEvaluationPresets/ClassRoomGraphPresets/Treemap.js';
import { wordOption } from '../../../assets/js/dynamicEvaluationPresets/ClassRoomGraphPresets/Wordmap.js';
import { wordMapPreset } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Wordmap.js';
import { graphicLegend, graphicTitle } from '@/assets/js/dynamicEvaluationPresets/PublicPresets.js';
/* ********************变量定义******************** */
// props定义
// 普通变量
const currentWordIndex = ref(0);
const courseId = ref('');
const radarCmp = ref(null);
const wordmapCmp = ref(null);
const treeCmp = ref(null);
const radarInstance = radarCmp.value?.getChartInstance();
const wordInstance = wordmapCmp.value?.getChartInstance();
const treeInstance = treeCmp.value?.getChartInstance();

const courseInfo = reactive({
  courseName: '',
  classroomId: 0, //课程id
  courseId: 0 //课堂id
});

const currentRadarOption = ref({});
const currentWordOption = ref({});
const currentTreeOption = ref({});

// pinia状态管理
const classroomGraphStore = useClassroomGraph();
const mainStore = useMain();
const { chartVisible } = storeToRefs(classroomGraphStore);

/* ********************课堂数据定义******************** */
const titles = [
  { prop: 'classroomName', label: '课堂名称' }, //大
  { prop: 'termName', label: '学期' },
  { prop: 'courseName', label: '课程' }, //小
  { prop: 'proName', label: '专业' },
  { prop: 'teacherName', label: '主讲教师' },
  { prop: 'labTeacher', label: '实验教师' },
  { prop: 'practiceTeacher', label: '实践教师' },
  { prop: 'creator', label: '创建人' }
];

const lists = ref([]);

/* ********************方法定义******************** */
const onAbilityTimelineChanged = async params => {
  // TODO:之后根据timeline的点击节点监听什么时候获取节点数据
  // TODO：1：将新的数据{插入}options中，更新
  // classroomGraphStore.setChart(0, classroomGraphStore.charts[0].timelineData, [], [], []);
  if (currentRadarOption.value.options[params.currentIndex].series[0].data[0].value.length === 0) {
    const { code, msg } = await classroomGraphStore.fetchCourseEvaluation(
      courseInfo.classroomId,
      // '292104772-9c9f88f0-7af9-438c-a117-e2efc2020b7b',
      courseId.value,
      // '1508003654-abbeeeba-9e13-4d5e-b0c2-254bdda7c4c9',
      params.currentIndex + 1
    );
    if (!(code === 200 && msg === 'success')) {
      ElMessage({
        type: 'error',
        message: msg
      });
    }
    // 渲染数据
    initChart(params.currentIndex + 1, false, 'RADAR');
  }

  // 注意深浅拷贝问题
  currentRadarOption.value.baseOption.timeline = {
    ...currentRadarOption.value.baseOption.timeline,
    currentIndex: params.currentIndex
  };
  currentRadarOption.value.baseOption.graphic = {
    ...currentRadarOption.value.baseOption.graphic,
    top: 5,
    style: {
      text: `当前展示第${params.currentIndex + 1}次评价，已评价${classroomGraphStore.totalTimes}次`
    }
  };
};

const onKWTimelineChanged = async params => {
  currentWordIndex.value = params.currentIndex;
  const chartInstance = wordmapCmp.value?.getChartInstance();
  // 更新前先把原数据清空
  chartInstance.setOption({ series: { ...wordMapPreset, data: [] } }, { replaceMerge: 'series' });
  // 更新词云中的内容
  if (classroomGraphStore.charts[1].options[currentWordIndex.value].series[0].data.length === 0) {
    classroomGraphStore
      .fetchCourseEvaluation(
        courseInfo.classroomId,
        // '292104772-9c9f88f0-7af9-438c-a117-e2efc2020b7b',
        courseId.value,
        // '1508003654-abbeeeba-9e13-4d5e-b0c2-254bdda7c4c9',
        params.currentIndex + 1
      )
      .then(({ code, msg }) => {
        if (!(code === 200 && msg === 'success')) {
          ElMessage({
            type: 'error',
            message: msg
          });
          return;
        }
        initChart(currentWordIndex.value + 1, false, 'WORD');
      });
  } else {
    initChart(params.currentIndex + 1, false, 'WORD');
  }
};

const onTreeTimelineChanged = async params => {
  const chartInstance = treeCmp.value?.getChartInstance();
  // 更新前先把原数据清空
  chartInstance.setOption({ series: { type: 'tree', data: [] } }, { replaceMerge: 'series' });
  if (currentTreeOption.value.options[params.currentIndex].series[0].data.length === 0) {
    const { code, msg } = await classroomGraphStore.fetchCourseEvaluation(
      courseInfo.classroomId,
      // '292104772-9c9f88f0-7af9-438c-a117-e2efc2020b7b',
      courseId.value,
      // '1508003654-abbeeeba-9e13-4d5e-b0c2-254bdda7c4c9',
      params.currentIndex + 1
    );
    if (!(code === 200 && msg === 'success')) {
      ElMessage({
        type: 'error',
        message: msg
      });
    }
    // 渲染数据
    initChart(params.currentIndex + 1, false, 'TREE');
  }

  // 注意深浅拷贝问题
  currentTreeOption.value.baseOption.timeline = {
    ...currentTreeOption.value.baseOption.timeline,
    currentIndex: params.currentIndex
  };
  currentTreeOption.value.baseOption.graphic[1] = {
    ...currentTreeOption.value.baseOption.graphic[1],
    style: {
      text: `当前展示第${params.currentIndex + 1}次评价，已评价${classroomGraphStore.totalTimes}次`
    }
  };
};
// 单元格样式定义
const addCellStyle = ({ row, column, rowIndex, columnIndex }) => {
  if (column.property === 'classroomName') {
    return {
      color: '#86BFA8',
      textAlign: 'center',
      textDecoration: 'underline',
      cursor: 'pointer'
    };
  }
  return {
    textAlign: 'center'
  };
};

// 单元格点击事件
const handleCellClick = async (row, column, cell) => {
  // 限定只有courseName单元格才能点击
  if (column.property === 'classroomName') {
    // 记录学生课堂信息
    courseInfo.courseName = row.courseName;
    courseInfo.courseId = row.id;
    courseInfo.classroomId = row.classroomId;
    // 控制学生列表是否可见

    console.log(row.classroomId);
    //TODO 此处将打开学生列表，发送请求将classroomId,courseId(token中的obsid)传过去
    // 获取总评价次数
    const { code: timeCode, msg: timeMsg } = await classroomGraphStore.fetchEvaluationTimes(
      courseId.value,
      courseInfo.classroomId
      // '292104772-9c9f88f0-7af9-438c-a117-e2efc2020b7b'
    );
    if (!(timeCode === 200 && timeMsg === 'success')) {
      ElMessage({
        type: 'error',
        message: timeMsg + '或暂无相关评价'
      });
      return;
    }
    classroomGraphStore.setChartVisible(true);
    const { code, msg } = await classroomGraphStore.fetchCourseEvaluation(
      row.classroomId,
      // '292104772-9c9f88f0-7af9-438c-a117-e2efc2020b7b',
      courseId.value,
      // '1508003654-abbeeeba-9e13-4d5e-b0c2-254bdda7c4c9',
      classroomGraphStore.totalTimes
    );
    if (!(code === 200 && msg === 'success')) {
      ElMessage({
        type: 'error',
        message: msg
      });
      return;
    }

    initChart(classroomGraphStore.totalTimes);
    console.log(classroomGraphStore.charts[1].options[classroomGraphStore.totalTimes - 1]);
    currentRadarOption.value.baseOption.graphic.style.text = `当前展示第${classroomGraphStore.totalTimes}次评价，已评价${classroomGraphStore.totalTimes}次`;
    currentWordOption.value.graphic[1] = {
      ...currentWordOption.value.graphic[1],
      style: {
        text: `当前展示第${classroomGraphStore.totalTimes}次评价，已评价${classroomGraphStore.totalTimes}次`
      }
    };
    currentTreeOption.value.baseOption.graphic[1] = {
      ...currentTreeOption.value.baseOption.graphic[1],
      style: {
        text: `当前展示第${classroomGraphStore.totalTimes}次评价，已评价${classroomGraphStore.totalTimes}次`
      }
    };
  }
};

// 需要传递第几次作业，默认最新一次评价
const initChart = (num = classroomGraphStore.totalTimes, isInit, which = 'all') => {
  // 渲染图表
  // 加载数据前清空图表
  radarInstance?.clear();
  wordInstance?.clear();
  treeInstance?.clear();

  // 第一个图表在点击的时候会将所有数据进行初始化，节省性能

  if (which === 'RADAR') {
    classroomGraphStore.updateCharts(num, isInit, 1);
    currentRadarOption.value = {
      ...radarOption(
        classroomGraphStore.charts[0].timelineData,
        classroomGraphStore.charts[0].options,
        classroomGraphStore.charts[0].indicators
      )
    };
  } else if (which === 'WORD') {
    classroomGraphStore.updateCharts(num, isInit, 2);
    try {
      const chartInstance = wordmapCmp.value?.getChartInstance();
      chartInstance.setOption(classroomGraphStore.charts[1].options[currentWordIndex.value], {
        replaceMerge: 'series'
      });
      chartInstance.setOption(
        {
          graphic: [
            {
              ...graphicLegend
            },
            {
              ...graphicTitle,
              top: 35,
              style: {
                text: `当前展示第${currentWordIndex.value + 1}次评价，已评价${
                  classroomGraphStore.totalTimes
                }次`
              }
            }
          ]
        },
        {
          replaceMerge: 'graphic'
        }
      );
    } catch (error) {
      console.log(error);
    }
  } else if (which === 'TREE') {
    classroomGraphStore.updateCharts(num, isInit, 3);
    currentTreeOption.value = {
      ...treeOption(
        classroomGraphStore.charts[2].timelineData,
        classroomGraphStore.charts[2].options,
        classroomGraphStore.charts[2].response
      )
    };
  } else {
    classroomGraphStore.updateCharts(num, isInit);
    currentRadarOption.value = {
      ...radarOption(
        classroomGraphStore.charts[0].timelineData,
        classroomGraphStore.charts[0].options,
        classroomGraphStore.charts[0].indicators
      )
    };

    currentWordOption.value = {
      ...wordOption(
        classroomGraphStore.charts[1].timelineData,
        classroomGraphStore.charts[1].options[classroomGraphStore.totalTimes - 1]
      )
    };

    currentTreeOption.value = {
      ...treeOption(
        classroomGraphStore.charts[2].timelineData,
        classroomGraphStore.charts[2].options
        // classroomGraphStore.charts[2].options[classroomGraphStore.totalTimes - 1]
        // classroomGraphStore.charts[2].options
      )
    };
    console.log(classroomGraphStore.charts[2].options[classroomGraphStore.totalTimes - 1]);
  }
};

// 获取课堂列表
const initList = async () => {
  const role = JSON.parse(sessionStorage.getItem('users'));
  if (role.rolename === '任课教师') {
    const { code, msg, data } = await getCourseId(parseJWT(sessionStorage.getItem('token')).obsid);
    if (code === 200 && msg === 'success') {
      courseId.value = data;
    }
  } else {
    courseId.value = parseJWT(sessionStorage.getItem('token')).obsid;
  }
  const { code, msg } = await classroomGraphStore.fetchCourseList(
    // parseJWT(sessionStorage.getItem('token')).obsid
    courseId.value
  );
  if (!(code === 200 && msg === 'success')) {
    ElMessage({
      type: 'error',
      message: msg
    });
    return;
  }
  lists.value = classroomGraphStore.courseList;
  // console.log(classroomGraphStore.courseList);
};

// 模糊搜索
const handleFlushList = () => {
  lists.value = classroomGraphStore.courseList;
  mainStore.setDynamicSearchloading(false);
};

onMounted(async () => {
  initList();
  // 获取总评价次数
});

onBeforeUnmount(() => {
  if (radarInstance || wordInstance || treeInstance) {
    radarInstance.dispose();
    radarInstance = null;
    wordInstance.dispose();
    wordInstance = null;
    treeInstance.dispose();
    treeInstance = null;
  }
  // 初始化pinia数据
  classroomGraphStore.setChart(0);
  classroomGraphStore.setChart(1);
  classroomGraphStore.setChart(2);
});
</script>

<style lang="less" scoped></style>
