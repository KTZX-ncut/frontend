<template>
  <!-- 课堂列表 -->
  <GraphTemplate
    :store="studentReportStore"
    :handleCellClick="handleCellClick"
    :addCellStyle="addCellStyle"
    :graphList="lists"
    :titleList="titles"
    @flushList="handleFlushList"
    keyword="请输入课堂名称关键字检索"
  />
  <!-- 课堂列表结束 -->
  <DynamicStudentList
    :store="studentReportStore"
    :handleCellClick="stuListCellClick"
    :addCellStyle="stuListCellStyle"
    :studentList="studentLists"
    :studentListTitle="studentTitles"
  >
    <template #title>画像学生列表</template>
  </DynamicStudentList>
  <!-- 学生列表浮窗结束 -->
  <!-- 课堂画像图表 -->
  <GraphChart :store="studentReportStore">
    <template #title
      >学生作业评价报告：{{ stuInfo.paperName }} - {{ stuInfo.stuname }}({{
        stuInfo.stuNo
      }})</template
    >
    <template #GraphItem>
      <GraphItem
        title="关键词评价"
        :onTimelineChanged="onAbilityTimelineChanged"
        :chartOption="currentBarFOption"
        ref="barFCmp"
      />
      <GraphItem
        title="能力评价"
        :onTimelineChanged="onKWTimelineChanged"
        :chartOption="currentRadarOption"
        ref="radarCmp"
      />
      <GraphItem ref="barSCmp" title="KWA评价" :chartOption="currentBarSOption" />
    </template>
  </GraphChart>
  <!-- 课堂画像图表结束 -->
</template>

<script setup>
import _ from 'lodash';
import { getCourseId } from '@/utils/searchCourseId.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import parseJWT from '../../../utils/parseJWT.js';
import GraphItem from '../PublicCpns/GraphItem.vue';
import GraphChart from '../PublicCpns/GraphChart.vue';
import GraphTemplate from '../PublicCpns/GraphTemplate.vue';
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import DynamicStudentList from '../PublicCpns/DynamicStudentList.vue';
import { barOption } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Bar.js';
import { radarOption } from '@/assets/js/dynamicEvaluationPresets/StudentReportPresets/Radar.js';
import useStudentReport from '../../../stores/dynamicEvaluation/studentReportStore.js';
import useMain from '../../../stores/useMain.js';
/* ********************变量定义******************** */
// props定义
// 普通变量
const courseId = ref('');
const barFCmp = ref(null);
const radarCmp = ref(null);
const barSCmp = ref(null);
let barFInstance = barFCmp.value?.getChartInstance();
let radarInstance = radarCmp.value?.getChartInstance();
let barSInstance = barSCmp.value?.getChartInstance();

const stuInfo = reactive({
  stuId: 0, //学生id
  classroomId: 0, //课程id
  courseId: 0, //课堂id
  paperId: 0,
  paperName: '',
  stuname: '',
  stuNo: ''
});

const currentBarFOption = ref({});
const currentRadarOption = ref({});
const currentBarSOption = ref({});

// pinia状态管理
const studentReportStore = useStudentReport();
const mainStore = useMain();

/* ********************课堂数据定义******************** */
const titles = [
  { prop: 'testName', label: '考试/作业名称' }, //大
  { prop: 'paperName', label: '试卷名称' },
  { prop: 'classroomName', label: '课堂' }, //小
  { prop: 'courseName', label: '课程' }, //小
  { prop: 'creator', label: '提交人' },
  { prop: 'createTime', label: '提交时间' },
  { prop: 'note', label: '备注' }
];

const lists = ref([]);

/* ********************学生数据数据定义******************** */
const studentTitles = [
  { prop: 'userName', label: '姓名' },
  { prop: 'stuNo', label: '学号' },
  { prop: 'obsName', label: '班级' }
];

const studentLists = ref([]);

/* ********************方法定义******************** */
const onKWTimelineChanged = event => {
  // 更新词云中的内容
  const currentId = event.currentIndex;
};
// 单元格样式定义
const addCellStyle = ({ row, column, rowIndex, columnIndex }) => {
  if (column.property === 'testName') {
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
  console.log(row);
  // 限定只有courseName单元格才能点击
  if (column.property === 'testName') {
    // 记录学生课堂信息
    stuInfo.paperId = row.paperId;
    stuInfo.classroomId = row.classroomId;
    stuInfo.courseId = courseId.value;
    stuInfo.paperName = row.paperName;
    // 控制学生列表是否可见
    studentReportStore.setListVisible(true);
    console.log(row.id);
    initStudent(row.testId);
  }
};

/* ************学生列表单元格样式定义*********** */
const stuListCellStyle = ({ row, column, rowIndex, columnIndex }) => {
  if (column.property === 'userName' || column.property === 'stuNo') {
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
  console.log(row);
  // 限定只有courseName单元格才能点击
  if (column.property === 'userName' || column.property === 'stuNo') {
    // 将被点击的学生记录
    stuInfo.stuId = row.userId;
    stuInfo.stuname = row.userName;
    stuInfo.stuNo = row.stuNo;
    //先将原先数据进行清除
    studentReportStore.setChart(0, [], [], [], [], [], [], []);
    studentReportStore.setChart(1, [], [], [], [], [], [], []);
    studentReportStore.setChart(2, [], [], [], [], [], [], []);
    const { code, msg } = await studentReportStore.fetchReportEvaluation(
      stuInfo.classroomId,
      stuInfo.stuId,
      stuInfo.courseId,
      stuInfo.paperId
    );
    if (!(code === 200 && msg === 'success')) {
      ElMessage({
        type: 'error',
        message: msg
      });
    }
    studentReportStore.setChartVisible(true);
    initChart();
  }
};

const initChart = () => {
  // TODO 此处获取课堂名单
  // 加载数据前清空图表
  radarInstance?.clear();
  barFInstance?.clear();
  barSInstance?.clear();
  // 渲染图表

  studentReportStore.updateCharts();
  currentBarFOption.value = {
    ...barOption(studentReportStore.charts[0].xData, studentReportStore.charts[0].values)
  };

  const options = radarOption(
    studentReportStore.charts[1].options,
    studentReportStore.charts[1].indicators,
    studentReportStore.charts[1].expectdValue
  );
  // 更改配置项
  options.legend.show = false;
  options.graphic.invisible = true;
  currentRadarOption.value = {
    ...options
  };

  currentBarSOption.value = {
    ...barOption(studentReportStore.charts[2].xData, studentReportStore.charts[2].values)
  };
};

const initStudent = async testId => {
  const { code, msg } = await studentReportStore.fetchStuRepStudnetList(testId);
  if (!(code === 200 && msg === 'success')) {
    ElMessage({
      type: 'error',
      message: msg
    });
    return;
  }
  studentLists.value = studentReportStore.studentlist;
};

const initList = async () => {
  const role = JSON.parse(sessionStorage.getItem('users'));
  if (role.rolename === '任课教师') {
    const { code, msg, data } = await getCourseId(parseJWT(sessionStorage.getItem('token')).obsid);
    if (code === 200 && msg === 'success') {
      courseId.value = data;
    }
    const { code: listCode, msg: listMsg } = await studentReportStore.fetchStuRepCourseList(
      // parseJWT(sessionStorage.getItem('token')).obsid
      courseId.value,
      parseJWT(sessionStorage.getItem('token')).obsid
    );
    if (!(listCode === 200 && listMsg === 'success')) {
      ElMessage({
        type: 'error',
        message: listMsg
      });
      return;
    }
  } else if (role.rolename === '课程负责人') {
    courseId.value = parseJWT(sessionStorage.getItem('token')).obsid;
    const { code, msg } = await studentReportStore.fetchStuRepCourseList(
      // parseJWT(sessionStorage.getItem('token')).obsid
      courseId.value,
      ''
    );
    if (!(code === 200 && msg === 'success')) {
      ElMessage({
        type: 'error',
        message: msg
      });
      return;
    }
  }

  lists.value = studentReportStore.courseList;
};

// 搜索框逻辑
const handleFlushList = () => {
  lists.value = studentReportStore.courseList;
  mainStore.setDynamicSearchloading(false);
};

onMounted(async () => {
  initList();
});

onBeforeUnmount(() => {
  if (radarInstance || barFInstance || barSInstance) {
    radarInstance.dispose();
    radarInstance = null;
    barFInstance.dispose();
    barFInstance = null;
    barSInstance.dispose();
    barSInstance = null;
  }
  // 初始化pinia数据
  studentReportStore.setChart(0);
  studentReportStore.setChart(1);
  studentReportStore.setChart(2);
});
</script>

<style lang="less" scoped></style>
