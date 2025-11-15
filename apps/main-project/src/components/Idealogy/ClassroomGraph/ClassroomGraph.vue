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
      <GraphItem title="思政标签画像" :chartOption="currentWordOption" ref="wordmapCmp" />
      <!-- <GraphItem title="KWA画像" /> -->
      <GraphItem title="思政标签评价" :chartOption="currentBarFOption" ref="barFCmp" />
      <GraphItem title="思政标签占比" :chartOption="currentPieOption" ref="pieChartCmp" />
    </template>
  </GraphChart>
  <!-- 课堂画像图表结束 -->
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { getCourseId } from '@/utils/searchCourseId.js';
import useMain from '../../../stores/useMain.js';
import parseJWT from '../../../utils/parseJWT.js';
import GraphItem from '../../dynamicEvaluation/PublicCpns/GraphItem.vue';
import GraphChart from '../../dynamicEvaluation/PublicCpns/GraphChart.vue';
import GraphTemplate from '../../dynamicEvaluation/PublicCpns/GraphTemplate.vue';
import { reactive, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import useClassroomGraph from '../../../stores/dynamicEvaluation/classroomStore.js';
import { radarOption } from '../../../assets/js/dynamicEvaluationPresets/ClassRoomGraphPresets/Radar.js';
import { treeOption } from '../../../assets/js/dynamicEvaluationPresets/ClassRoomGraphPresets/Treemap.js';
import { wordOption } from '../../../assets/js/dynamicEvaluationPresets/ClassRoomGraphPresets/Wordmap.js';
import { wordMapPreset } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Wordmap.js';
import { graphicLegend, graphicTitle } from '@/assets/js/dynamicEvaluationPresets/PublicPresets.js';
import useIdealogyNew from '../../../stores/idealogyNewStore';
import { toolbox } from '@/assets/js/dynamicEvaluationPresets/PublicPresets.js';
import { axisLabel } from '@/assets/js/dynamicEvaluationPresets/PublicPresets';
import clickFSvg from '@/assets/images/click.svg';
import { barOption } from '@/assets/js/dynamicEvaluationPresets/StudentGraphPresets/Bar.js';
/* ********************变量定义******************** */
// props定义
// 普通变量
const courseId = ref('');
const radarCmp = ref(null);
const wordmapCmp = ref(null);
const barFCmp = ref(null);
const pieChartCmp = ref(null);

const courseInfo = reactive({
  courseName: '',
  classroomId: 0, //课程id
  courseId: 0 //课堂id
});

const currentWordOption = ref({});
const currentBarFOption = ref({});
const currentPieOption = ref({});

// pinia状态管理
const classroomGraphStore = useClassroomGraph();
const mainStore = useMain();
const { chartVisible } = storeToRefs(classroomGraphStore);
const IdealogyNewStore = useIdealogyNew();
const { fetchCourseValue } = IdealogyNewStore;
const { courseValueList } = storeToRefs(IdealogyNewStore);
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
  console.log('lyjc--', row);
  if (column.property === 'classroomName') {
    // 记录学生课堂信息
    courseInfo.courseName = row.courseName;
    courseInfo.courseId = row.id;
    courseInfo.classroomId = row.classroomId;
    // 控制学生列表是否可见

    console.log(row.classroomId);
    //TODO 此处将打开学生列表，发送请求将classroomId,courseId(token中的obsid)传过去
    // 获取总评价次数await
    await fetchCourseValue(row.classroomId);
    courseValueList.value.map(c => {
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
    classroomGraphStore.setChartVisible(true);

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
</script>

<style lang="less" scoped></style>
