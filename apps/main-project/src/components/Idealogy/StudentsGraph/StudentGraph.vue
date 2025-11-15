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
      <GraphItem title="思政标签画像" :chartOption="currentWordOption" ref="wordmapCmp" />
      <!-- <GraphItem title="KWA画像" /> -->
      <GraphItem title="思政标签评价" :chartOption="currentBarFOption" ref="barFCmp" />
      <GraphItem title="思政标签占比" :chartOption="currentPieOption" ref="pieChartCmp" />
    </template>
  </GraphChart>
  <!-- 图标列表结束 -->
</template>

<script setup lang="ts">
import GraphItem from '../../dynamicEvaluation/PublicCpns/GraphItem.vue';
import { storeToRefs } from 'pinia';
import { getCourseId } from '@/utils/searchCourseId.js';
import GraphChart from '../../dynamicEvaluation/PublicCpns/GraphChart.vue';
import parseJWT from '../../../utils/parseJWT.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import { wordMapPreset } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Wordmap.js';
import { radarOption } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Radar.js';
import { treeOption } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Treemap.js';
import { wordOption } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Wordmap.js';
import useStudentGraph from '../../../stores/dynamicEvaluation/studentGraphStore.js';
import DynamicStudentList from '../../dynamicEvaluation/PublicCpns/DynamicStudentList.vue';
import GraphTemplate from '../../dynamicEvaluation/PublicCpns/GraphTemplate.vue';
import { onMounted, reactive, ref, nextTick, onBeforeUnmount } from 'vue';
import useMain from '../../../stores/useMain.js';
import { graphicTitle, graphicLegend } from '@/assets/js/dynamicEvaluationPresets/PublicPresets.js';
import useIdealogyNew from '../../../stores/idealogyNewStore';
import { toolbox } from '@/assets/js/dynamicEvaluationPresets/PublicPresets.js';
import clickFSvg from '@/assets/images/click.svg';
import { axisLabel } from '@/assets/js/dynamicEvaluationPresets/PublicPresets';
import { barOption } from '@/assets/js/dynamicEvaluationPresets/StudentGraphPresets/Bar.js';

/* ********************变量定义******************** */
// props
// 普通变量
const courseId = ref('');
const currentWordOption = ref({});
const currentBarFOption = ref({});
const currentPieOption = ref({});

// echarts实例
const wordmapCmp = ref(null);
const pieChartCmp = ref(null);
const barFCmp = ref(null);

const IdealogyNewStore = useIdealogyNew();
const { fetchStudentValue } = IdealogyNewStore;
const { studentValueList } = storeToRefs(IdealogyNewStore);
const type = ref<{ name: string; value: number; type: string }[]>([]);
const values = ref<{ name: string; value: number; type: string }[]>([]);
const payloadMap = ref<Map<string, boolean>>(new Map());

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

const newtoolbox = (name: string) => ({
  ...toolbox,
  feature: {
    ...toolbox.feature,
    myCustomBtn: {
      show: true,
      title: '点击切换数据源',
      icon: `image://${clickFSvg}`,
      onclick: () => handleCustomeClick(name)
    }
  }
});

const handleCustomeClick = (name: string) => {
  payloadMap.value.set(name, !payloadMap.value.get(name));
  switch (name) {
    case 'word': {
      // 更新word数据源
      const chartInstance = wordmapCmp.value?.getChartInstance();
      chartInstance.setOption(
        {
          series: [
            {
              ...wordMapPreset,
              data: !payloadMap.value.get(name) ? type.value : values.value
            }
          ]
        },
        {
          replaceMerge: 'series'
        }
      );
      break;
    }
    case 'bar': {
      const chartInstance = barFCmp.value?.getChartInstance();
      let xData;
      let yData;
      if (!payloadMap.value.get(name)) {
        xData = type.value.map(t => t.name);
        yData = type.value;
      } else {
        xData = values.value.map(v => v.name);
        yData = values.value;
      }
      chartInstance.setOption(
        {
          xAxis: {
            type: 'category',
            data: xData,
            axisLabel
          },
          series: [
            {
              name: '评价',
              type: 'bar',
              data: yData
            }
          ]
        },
        {
          replaceMerge: ['xAxis', 'series']
        }
      );
      break;
    }
    case 'pie': {
      const chartInstance = pieChartCmp.value?.getChartInstance();
      chartInstance.setOption(
        {
          series: [
            {
              ...currentPieOption.value.series[0],
              data: !payloadMap.value.get(name) ? type.value : values.value
            }
          ]
        },
        {
          replaceMerge: 'series'
        }
      );
    }
  }
};

const stuInfo = reactive({
  stuId: 0, //学生id
  courseName: '', //课程名称
  classroomId: 0, //课堂id
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
    const userId = row.userId;

    const { code, msg } = await fetchStudentValue(userId);
    if (code !== 200) {
      ElMessage({
        type: 'error',
        message: msg
      });
    }
    studentValueList.value.map(c => {
      type.value.push({
        name: c.name,
        value: c.weight,
        type: '类型'
      });
      if (c.children) {
        c.children.map(ch => {
          values.value.push({
            name: ch.name,
            value: ch.weight,
            type: '标签'
          });
        });
      }
    });

    studentGraphStore.setChartVisible(true);

    initChart();
  }
};

// 需要传递第几次作业，默认最新一次评价
const initChart = () => {
  // 第一个图表在点击的时候会将所有数据进行初始化，节省性能

  // courseGraphStore.updateCharts(num, isInit);
  // console.log('---lyjcs', courseGraphStore.charts[1].options[courseGraphStore.totalTimes - 1]);
  const idealogySet = {
    series: [
      {
        ...wordMapPreset,
        data: type.value
      }
    ]
  };
  currentWordOption.value = {
    ...wordOption({}, idealogySet),
    timeline: { show: false },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return `${params.name}<br/>得分：${params.value}<br/>层级：${params.data.type}`;
      }
    },
    toolbox: {
      ...newtoolbox('word')
    }
  };
  payloadMap.value.set('word', false);

  currentBarFOption.value = {
    ...barOption(
      type.value.map(t => t.name),
      type.value
    ),
    timeline: { show: false },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return `${params.name}<br/>得分：${params.value}<br/>层级：${params.data.type}`;
      }
    },
    toolbox: {
      ...newtoolbox('bar')
    },
    series: [
      {
        name: '得分',
        type: 'bar',
        barWidth: 32,
        data: type.value.map(t => ({
          value: t.value,
          type: t.type
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      }
    ]
  };
  payloadMap.value.set('bar', false);

  currentPieOption.value = {
    toolbox: {
      ...newtoolbox('pie')
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(50,50,50,0.85)',
      padding: 10,
      borderRadius: 6,
      formatter: params => {
        return `
       <div style="color:#ffffff">
        <div style="font-weight:600">${params.name}</div>
        <div>得分：<b>${params.value}</b></div>
        <div>类型：<b>${params.data.type}</b></div>
       </div>
      `;
      }
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      top: 'middle',
      textStyle: { fontSize: 12, color: '#333' }
    },
    series: [
      {
        name: '得分分布',
        type: 'pie',

        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}: {c}',
          fontSize: 12,
          color: '#333'
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          smooth: true
        },
        itemStyle: {
          borderRadius: 6,
          color: params => {
            const value = params.data.value;
            // if (value >= 0.9) return 'rgb(144, 238, 144)';
            // else if (value >= 0.8) return 'rgb(72, 118, 255)';
            // else if (value >= 0.7) return 'rgb(255, 255, 0)';
            // else if (value < 0.7 && value > 0) return 'rgb(251, 158, 148)';
            // else if (value === 0) return 'rgb(207, 207, 207)';、
            return getRandomColor();
          }
        },
        data: type.value.map(d => ({
          value: d.value,
          name: d.name,
          type: d.type
        }))
      }
    ]
  };
  payloadMap.value.set('pie', false);
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
</script>

<style lang="less" scoped></style>
