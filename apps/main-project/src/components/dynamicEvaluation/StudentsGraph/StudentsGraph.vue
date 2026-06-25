<template>
  <!-- 课堂列表 -->
  <GraphTemplate
    :store="studentGraphStore"
    :handleCellClick="handleCellClick"
    :addCellStyle="addCellStyle"
    :graphList="lists"
    :titleList="titles"
    @flushList="handleFlushList"
    keyword="请输入课堂名称关键字检索"
  />
  <!-- 课堂列表结束 -->
  <!-- 学生列表浮窗 -->
  <DynamicStudentList
    :store="studentGraphStore"
    :handleCellClick="stuListCellClick"
    :addCellStyle="stuListCellStyle"
    :studentList="studentLists"
    :studentListTitle="studentTitles"
  >
    <template #title>画像学生列表</template>
  </DynamicStudentList>
  <!-- 学生列表浮窗结束 -->
  <!-- 图标列表 -->
  <!-- 在GraphChart组件的具名插槽中可以插入GraphItem，可自定义图表 -->
  <GraphChart :store="studentGraphStore">
    <template #title
      >学生课程画像：{{ stuInfo.courseName }} - {{ stuInfo.stuname }}({{ stuInfo.stuNo }})</template
    >
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
        :isShow="showTitle"
        :currentTimes="currentWordIndex + 1"
        :totalTimes="studentGraphStore.attendEvalList.length"
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
  <!-- 图标列表结束 -->
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { getCourseId } from '@/utils/searchCourseId.js';
import GraphChart from '../PublicCpns/GraphChart.vue';
import GraphItem from '../PublicCpns/GraphItem.vue';
import parseJWT from '../../../utils/parseJWT.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import { wordMapPreset } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Wordmap.js';
import { radarOption } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Radar.js';
import { treeOption } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Treemap.js';
import { wordOption } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Wordmap.js';
import useStudentGraph from '../../../stores/dynamicEvaluation/studentGraphStore.js';
import DynamicStudentList from '../PublicCpns/DynamicStudentList.vue';
import GraphTemplate from '../PublicCpns/GraphTemplate.vue';
import { onMounted, reactive, ref, nextTick, onBeforeUnmount } from 'vue';
import useMain from '../../../stores/useMain.js';
import KWAgraph from './StudentsGraphCpns/KWAgraph.vue';
import { graphicTitle, graphicLegend } from '@/assets/js/dynamicEvaluationPresets/PublicPresets.js';

/* ********************变量定义******************** */
// props
// 普通变量
const showTitle = ref(true);
const currentTreeIndex = ref(0);
const currentRadarIndex = ref(0);
const currentWordIndex = ref(0);
const courseId = ref('');
const currentTreeOption = ref({});
const currentRadarOption = ref({});
const currentWordOption = ref({});

// echarts实例
const radarCmp = ref(null);
const wordmapCmp = ref(null);
const treeCmp = ref(null);
let radarInstance = radarCmp.value?.getChartInstance();
let wordInstance = wordmapCmp.value?.getChartInstance();
let treeInstance = treeCmp.value?.getChartInstance();

const stuInfo = reactive({
  stuId: 0, //学生id
  courseName: '', //课程名称
  classroomId: 0, //课堂id
  courseName: '',
  stuname: '',
  stuNo: ''
});

// pinia状态
const studentGraphStore = useStudentGraph();
const mainStore = useMain();
const { stuListVisible, chartVisible } = storeToRefs(studentGraphStore);

/* ********************课程数据定义******************** */
const titles = [
  { prop: 'classroomName', label: '课堂名称' }, //小
  { prop: 'termName', label: '学期' },
  { prop: 'courseName', label: '课程' }, //大
  { prop: 'proName', label: '专业' },
  { prop: 'teacherName', label: '主讲教师' },
  { prop: 'labTeacher', label: '实验教师' },
  { prop: 'practiceTeacher', label: '实践教师' },
  { prop: 'creator', label: '创建人' }
];

const lists = ref([]);

/* ********************学生数据数据定义******************** */
const studentTitles = [
  { prop: 'userName', label: '姓名' },
  { prop: 'stuno', label: '学号' },
  { prop: 'obsName', label: '班级' }
];

const studentLists = ref([]);

/* ********************方法定义******************** */

/* ************课程单元格样式定义*********** */
const onAbilityTimelineChanged = async params => {
  if (!studentGraphStore.attendEvalList.includes(params.currentIndex + 1)) {
    currentRadarOption.value.baseOption.timeline = {
      ...currentRadarOption.value.baseOption.timeline,
      currentIndex: currentRadarIndex.value
    };
    ElMessage({
      type: 'error',
      message: '暂无此次评价信息！'
    });

    return;
  }
  if (currentRadarOption.value.options[params.currentIndex].series[0].data[0].value.length === 0) {
    // 如果保存的options中的配置数据为空，则发送请求，否则直接使用
    const { code, msg } = await studentGraphStore.fetchGraphEvaluation(
      stuInfo.classroomId,
      // '292104772-9c9f88f0-7af9-438c-a117-e2efc2020b7b',
      stuInfo.stuId,
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
    currentRadarIndex.value = params.currentIndex;
    initChart(params.currentIndex + 1, false, 'RADAR');
  }
  currentRadarOption.value.baseOption.timeline = {
    ...currentRadarOption.value.baseOption.timeline,
    currentIndex: params.currentIndex
  };
  currentRadarOption.value.baseOption.graphic = {
    ...currentRadarOption.value.baseOption.graphic,
    top: 5,
    style: {
      text: `当前展示第${params.currentIndex + 1}次评价，已评价${
        studentGraphStore.attendEvalList.length
      }次`
    }
  };
};

const onKWTimelineChanged = async params => {
  showTitle.value = false;
  const chartInstance = wordmapCmp.value?.getChartInstance();
  // 更新前先把原数据清空
  chartInstance.setOption({ series: { ...wordMapPreset, data: [] } }, { replaceMerge: 'series' });
  // 更新词云中的内容
  if (!studentGraphStore.attendEvalList.includes(params.currentIndex + 1)) {
    currentWordOption.value.timeline = {
      ...currentWordOption.value.timeline,
      currentIndex: currentWordIndex.value
    };
    ElMessage({
      type: 'error',
      message: '暂无此次评价信息！'
    });
    return;
  }
  currentWordIndex.value = params.currentIndex;

  if (studentGraphStore.charts[1].options[currentWordIndex.value].length === 0) {
    const { code, msg } = await studentGraphStore.fetchGraphEvaluation(
      stuInfo.classroomId,
      // '292104772-9c9f88f0-7af9-438c-a117-e2efc2020b7b',
      stuInfo.stuId,
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
    initChart(params.currentIndex + 1, false, 'WORD');
  } else {
    initChart(params.currentIndex + 1, false, 'WORD');
  }
};

const onTreeTimelineChanged = async params => {
  const chartInstance = treeCmp.value?.getChartInstance();
  // 更新前先把原数据清空
  chartInstance.setOption({ series: { type: 'tree', data: [] } }, { replaceMerge: 'series' });
  // 更新树图
  if (!studentGraphStore.attendEvalList.includes(params.currentIndex + 1)) {
    currentTreeOption.value.baseOption.timeline = {
      ...currentTreeOption.value.baseOption.timeline,
      currentIndex: currentTreeIndex.value
    };
    ElMessage({
      type: 'error',
      message: '暂无此次评价信息！'
    });
    return;
  }
  currentTreeIndex.value = params.currentIndex;
  if (currentTreeOption.value.options[params.currentIndex].series[0].data.length === 0) {
    const { code, msg } = await studentGraphStore.fetchGraphEvaluation(
      stuInfo.classroomId,
      // '292104772-9c9f88f0-7af9-438c-a117-e2efc2020b7b',
      stuInfo.stuId,
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
      text: `当前展示第${params.currentIndex + 1}次评价，已评价${
        studentGraphStore.attendEvalList.length
      }次`
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
const handleCellClick = (row, column, cell) => {
  // 限定只有courseName单元格才能点击
  if (column.property === 'classroomName') {
    // 记录学生课堂信息
    stuInfo.courseName = row.courseName;
    stuInfo.classroomId = row.classroomId;
    // 控制学生列表是否可见
    studentGraphStore.setListVisible(true);
    // 获取学生列表
    initStuList(row.classroomId);
  }
};

/* ************学生列表单元格样式定义*********** */
const stuListCellStyle = ({ row, column, rowIndex, columnIndex }) => {
  if (column.property === 'userName' || column.property === 'stuno') {
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
const stuListCellClick = async (row, column, cell) => {
  // 限定只有courseName单元格才能点击
  if (column.property === 'userName' || column.property === 'stuno') {
    // 将被点击的学生记录
    stuInfo.stuId = row.userId;
    stuInfo.stuname = row.userName;
    stuInfo.stuNo = row.stuno;
    // 清空数据
    studentGraphStore.setChart(0, [], [], [], [], [], [], []);
    studentGraphStore.setChart(1, [], [], [], [], [], [], []);
    studentGraphStore.setChart(2, [], [], [], [], [], [], []);
    // 1：获取总评价次数
    const { code: timeCode, msg: timeMsg } = await studentGraphStore.fetchEvaluationTimes(
      courseId.value,
      stuInfo.classroomId
      // '292104772-9c9f88f0-7af9-438c-a117-e2efc2020b7b'
    );
    if (!(timeCode === 200 && timeMsg === 'success')) {
      ElMessage({
        type: 'error',
        message: timeMsg + '或暂无相关评价'
      });
      return;
    }

    // 2：获取参与评价作业次数数组
    const {
      code: evaCode,
      msg: evaMsg,
      data
    } = await studentGraphStore.fetchAttenfEvalList(
      stuInfo.classroomId,
      stuInfo.stuId,
      courseId.value
    );
    if (!(evaCode === 200 && evaMsg === 'success')) {
      ElMessage({
        type: 'error',
        message: evaMsg
      });
      return;
    }

    if (data.length === 0) {
      ElMessage({
        type: 'warning',
        message: '暂无此次评价'
      });
      return;
    }

    studentGraphStore.setChartVisible(true);
    const { code, msg } = await studentGraphStore.fetchGraphEvaluation(
      stuInfo.classroomId,
      stuInfo.stuId,
      // '292104772-9c9f88f0-7af9-438c-a117-e2efc2020b7b',
      courseId.value,
      // '1508003654-abbeeeba-9e13-4d5e-b0c2-254bdda7c4c9',
      // studentGraphStore.totalTimes
      studentGraphStore.attendEvalList[studentGraphStore.attendEvalList.length - 1]
    );
    if (!(code === 200 && msg === 'success')) {
      ElMessage({
        type: 'error',
        message: msg
      });
      return;
    }

    // 记录评价次数
    currentRadarIndex.value =
      studentGraphStore.attendEvalList[studentGraphStore.attendEvalList.length - 1] - 1;

    currentWordIndex.value =
      studentGraphStore.attendEvalList[studentGraphStore.attendEvalList.length - 1] - 1;

    currentTreeIndex.value =
      studentGraphStore.attendEvalList[studentGraphStore.attendEvalList.length - 1] - 1;

    initChart(
      studentGraphStore.totalTimes,
      true,
      null,
      studentGraphStore.attendEvalList[studentGraphStore.attendEvalList.length - 1]
    );
    // 雷达图图例更新
    currentRadarOption.value.baseOption.graphic = {
      ...currentRadarOption.value.baseOption.graphic,
      style: {
        text: `当前展示第${currentRadarIndex.value + 1}次评价，已评价${
          studentGraphStore.attendEvalList.length
        }次`
      },
      top: 15
    };

    // 词云图例更新
    currentWordOption.value.graphic[1] = {
      ...currentWordOption.value.graphic[1],
      style: {
        text: `当前展示第${currentWordIndex.value + 1}次评价，已评价${
          studentGraphStore.attendEvalList.length
        }次`
      }
    };

    // 树图图例更新
    currentTreeOption.value.baseOption.graphic[1] = {
      ...currentTreeOption.value.baseOption.graphic[1],
      style: {
        text: `当前展示第${currentTreeIndex.value + 1}次评价，已评价${
          studentGraphStore.attendEvalList.length
        }次`
      }
    };
  }
};

// 需要传递第几次作业，默认最新一次评价
const initChart = (num = studentGraphStore.totalTimes, isInit, which = 'all', times) => {
  // TODO 此处获取课堂名单
  // 加载数据前清空图表
  radarInstance?.clear();
  wordInstance?.clear();
  treeInstance?.clear();
  // 渲染图表
  studentGraphStore.updateCharts(num, isInit, times);

  if (which === 'RADAR') {
    studentGraphStore.updateCharts(num, isInit, 0, 1);
    currentRadarOption.value = {
      ...radarOption(
        studentGraphStore.charts[0].timelineData,
        studentGraphStore.charts[0].options,
        studentGraphStore.charts[0].indicators,
        true,
        null,
        studentGraphStore.attendEvalList[studentGraphStore.attendEvalList.length - 1]
      )
    };
  } else if (which === 'WORD') {
    studentGraphStore.updateCharts(num, isInit, 0, 2);
    try {
      const chartInstance = wordmapCmp.value?.getChartInstance();
      chartInstance.setOption(studentGraphStore.charts[1].options[currentWordIndex.value], {
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
                  studentGraphStore.attendEvalList.length
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
    studentGraphStore.updateCharts(num, isInit, 0, 3);
    currentTreeOption.value = {
      ...treeOption(
        studentGraphStore.charts[2].timelineData,
        studentGraphStore.charts[2].options,
        studentGraphStore.charts[2].response
      )
    };
  } else {
    currentRadarOption.value = {
      ...radarOption(
        studentGraphStore.charts[0].timelineData,
        studentGraphStore.charts[0].options,
        studentGraphStore.charts[0].indicators,
        true,
        [],
        studentGraphStore.attendEvalList[studentGraphStore.attendEvalList.length - 1]
      )
    };

    currentWordOption.value = {
      ...wordOption(
        studentGraphStore.charts[1].timelineData,
        studentGraphStore.charts[1].options[
          studentGraphStore.attendEvalList[studentGraphStore.attendEvalList.length - 1] - 1
        ],
        studentGraphStore.attendEvalList[studentGraphStore.attendEvalList.length - 1]
      )
    };
    currentTreeOption.value = {
      ...treeOption(
        studentGraphStore.charts[2].timelineData,
        studentGraphStore.charts[2].options,
        studentGraphStore.attendEvalList[studentGraphStore.attendEvalList.length - 1]
      )
    };
  }
};

const initStuList = async classroomId => {
  const { code, msg } = await studentGraphStore.fetchStuGraStudentlist(classroomId);
  if (!(code === 200 && msg === 'success')) {
    ElMessage({
      type: 'error',
      message: msg
    });
    return;
  }
  studentLists.value = studentGraphStore.studentList;
};

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
  const { code, msg } = await studentGraphStore.fetchStuGraCourseList(
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
  lists.value = studentGraphStore.courseList;
};
const handleFlushList = () => {
  lists.value = studentGraphStore.courseList;
  mainStore.setDynamicSearchloading(false);
};

onMounted(async () => {
  // 获取课程列表
  initList();
  // 此为异步操作，应为await，此处为模拟
  // initChart();
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
  studentGraphStore.setChart(0);
  studentGraphStore.setChart(1);
  studentGraphStore.setChart(2);
});
</script>

<style lang="less" scoped></style>
