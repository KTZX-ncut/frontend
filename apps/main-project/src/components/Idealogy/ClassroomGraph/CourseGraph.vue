<template>
  <div v-loading="loading">
    <GraphItem title="思政标签画像" :chartOption="currentWordOption" ref="wordmapCmp" />
    <!-- <GraphItem title="KWA画像" /> -->
    <GraphItem title="思政标签评价" :chartOption="currentBarFOption" ref="barFCmp" />
    <GraphItem title="思政标签占比" :chartOption="currentPieOption" ref="pieChartCmp" />
    <GraphItem title="思政标签分布" :chartOption="currentHotOption" ref="hotChartCmp" />
    <GraphItem title="思政标签达成情况">
      <div class="table-wrapper" :style="{ '--col-count': values.length }">
        <table class="equal-table">
          <tr>
            <td style="width: 50px">序号</td>
            <td style="width: 120px">学号</td>
            <td style="width: 80px">姓名</td>
            <td style="width: 120px">班级</td>
            <td v-for="(v, index) in values" :key="index" :title="v.name">
              <el-tooltip :content="v.name" placement="top">
                <span>{{ v.name }}</span>
              </el-tooltip>
            </td>
          </tr>
          <tr v-for="(v, index) in heatMapNames" :key="index">
            <td style="width: 50px">{{ index + 1 }}</td>
            <td style="width: 120px">{{ v.stuno }}</td>
            <td style="width: 80px">{{ v.name }}</td>
            <td style="width: 120px">
              <el-tooltip :content="classroomInfo.classroomName" placement="top">
                <span>{{ classroomInfo.classroomName }}</span>
              </el-tooltip>
            </td>
            <template v-for="innerV in v.value">
              <td style="width: 80px">{{ innerV }}</td>
            </template>
          </tr>
        </table>
      </div>
    </GraphItem>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import useMain from '../../../stores/useMain.js';
import parseJWT from '../../../utils/parseJWT.js';
import GraphItem from '../../dynamicEvaluation/PublicCpns/GraphItem.vue';
import GraphChart from '../../dynamicEvaluation/PublicCpns/GraphChart.vue';
import { getCourseId } from '@/utils/searchCourseId.js';
import GraphTemplate from '../../dynamicEvaluation/PublicCpns/GraphTemplate.vue';
import { reactive, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { radarOption } from '../../../assets/js/dynamicEvaluationPresets/ClassRoomGraphPresets/Radar.js';
import { treeOption } from '../../../assets/js/dynamicEvaluationPresets/ClassRoomGraphPresets/Treemap.js';
import { wordOption } from '../../../assets/js/dynamicEvaluationPresets/ClassRoomGraphPresets/Wordmap.js';
import { wordMapPreset } from '../../../assets/js/dynamicEvaluationPresets/StudentGraphPresets/Wordmap.js';
import { graphicLegend, graphicTitle } from '@/assets/js/dynamicEvaluationPresets/PublicPresets.js';
import useCourseGraph from '../../../stores/dynamicEvaluation/courseStore.js';
import useIdealogyNew from '../../../stores/idealogyNewStore';
import { number } from 'echarts';
import { tooltip } from '@ui/src/links/data.js';
import { toolbox } from '@/assets/js/dynamicEvaluationPresets/PublicPresets.js';
import { axisLabel } from '@/assets/js/dynamicEvaluationPresets/PublicPresets';
import clickFSvg from '@/assets/images/click.svg';
import { barOption } from '@/assets/js/dynamicEvaluationPresets/StudentGraphPresets/Bar.js';

/* ********************变量定义******************** */
// props定义
// 普通变量
const loading = ref(true);
const currentWordIndex = ref(0);
const courseId = ref('');
const classroomId = ref('');
const radarCmp = ref(null);
const wordmapCmp = ref(null);
const barFCmp = ref(null);
const pieChartCmp = ref(null);
const hotChartCmp = ref(null);

const currentWordOption = ref({});
const currentBarFOption = ref({});
const currentPieOption = ref({});
const currentHotOption = ref({});
const payloadMap = ref<Map<string, boolean>>(new Map());

// 随机颜色
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
    case 'hot': {
      const chartInstance = hotChartCmp.value?.getChartInstance();
      chartInstance.setOption(
        {
          xAxis: {
            type: 'category',
            data: !payloadMap.value.get(name)
              ? type.value.map(t => t.name)
              : values.value.map(v => v.name),
            splitArea: { show: true } // 显示块区域背景
          },
          series: [
            {
              name: 'HeatMap',
              type: 'heatmap',
              progressive: 5000,
              data: heatmapValues.value.map(heat => {
                const x = values.value.findIndex(t => t.id === heat.id);
                const y = heatMapNames.value.findIndex(n => n.stuno === heat.stuno);
                return [x, y, heat.value];
              }),
              label: {
                show: true,
                formatter: v => v.data[2],
                color: '#000'
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.4)'
                }
              }
            }
          ]
        },
        {
          replaceMerge: ['xAxis', 'series']
        }
      );
    }
  }
};

// pinia状态管理
const courseGraphStore = useCourseGraph();

const IdealogyNewStore = useIdealogyNew();
const { fetchCourseValue, fetchAllStudentValue, fetchClassroomInfo } = IdealogyNewStore;
const { courseValueList, allStudentValueList, classroomInfo } = storeToRefs(IdealogyNewStore);
const type = ref<{ name: string; value: number; type: string; id: string }[]>([]);
const values = ref<{ name: string; value: number; type: string; id: string }[]>([]);

const heatMapNames = ref<{ name: string; stuno: string; userId: string; value: number[] }[]>([]);
const heatmapTypesCount = ref<{ stuno: string; id: string; value: number }[]>([]);
const heatmapValues = ref<{ stuno: string; id: string; value: number }[]>([]);
/* ********************课堂数据定义******************** */

/* ********************方法定义******************** */
// 单元格点击事件
const handleCellClick = async (row, column, cell) => {
  //TODO 此处将打开学生列表，发送请求将classroomId,courseId(token中的obsid)传过去
  await initList();
  // 获取总评价次数

  const { code: classCode, msg: classMsg } = await fetchClassroomInfo();
  if (classCode !== 200) {
    ElMessage({
      type: 'error',
      message: classMsg
    });
    return;
  }

  await fetchCourseValue(classroomId.value);
  courseValueList.value.map(c => {
    type.value.push({
      name: c.name,
      value: c.evalResult?.valueCount ?? 0,
      type: '类型',
      id: c.id
    });
    if (c.children) {
      c.children.map(ch => {
        values.value.push({
          name: ch.name,
          value: ch.evalResult?.valueCount ?? 0,
          type: '标签',
          id: ch.id
        });
      });
    }
  });

  //  获取所有学生评价
  const { code, msg } = await fetchAllStudentValue(classroomId.value);
  if (code !== 200) {
    ElMessage({
      type: 'error',
      message: msg
    });
    return;
  }
  allStudentValueList.value.map(sin => {
    const names = {
      name: sin.studentName,
      stuno: sin.stuno,
      userId: sin.userId,
      value: [] as number[]
    };

    let cid: null | string = null;
    if (sin.ideologyList.length) {
      sin.ideologyList.map(id => {
        let count = 0;
        cid = id.id;
        if (id.children?.length) {
          id.children.map(ch => {
            names.value.push(ch.evalResult?.valueCount ?? 0);
            values.value.map(v => {
              heatmapValues.value.push({
                stuno: sin.stuno,
                id: v.id,
                value: ch.evalResult?.valueCount ?? 0
              });
            });
            if (ch.evalResult?.valueCount && ch.evalResult?.valueCount > 0) {
              count++;
            }
          });
        }

        heatmapTypesCount.value.push({
          stuno: sin.stuno,
          id: cid,
          value: count
        });
      });
    }
    heatMapNames.value.push(names);
  });
  // @ts-ignore
  initChart();
  loading.value = false;
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
    ...wordOption(courseGraphStore.charts[1].timelineData, idealogySet),
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

  currentHotOption.value = {
    toolbox: {
      ...newtoolbox('hot')
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `学生: ${heatMapNames.value[params.data[1]].name}<br/>学号：${
          heatMapNames.value[params.data[1]].stuno
        }<br/>评价: ${params.data[2]}`;
      }
    },
    grid: {
      height: '60%',
      top: '10%',
      left: '10%',
      right: '10%',
      containLabel: true // 确保轴标签不会被裁掉
    },
    xAxis: {
      type: 'category',
      data: type.value.map(t => t.name),
      splitArea: { show: true }, // 显示块区域背景
      axisLabel: {
        rotate: 45, // 标签旋转 45 度
        interval: 0, // 强制显示所有标签
        fontSize: 12, // 根据需要调整字体大小
        formatter: function (value) {
          return value.length > 8 ? value.slice(0, 8) + '…' : value; // 长标签截断
        }
      }
    },
    yAxis: {
      type: 'category',
      data: heatMapNames.value.map(n => n.name),
      splitArea: { show: true }
    },
    visualMap: {
      min: 0,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      inRange: {
        color: [
          '#d7d7d7', // 低值
          '#fba89b', // 中间偏低
          '#ffff00', // 中间
          '#4876ff', // 中间偏高
          '#90ee90' // 高值
        ]
      }
    },
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        yAxisIndex: 0,
        start: 0,
        end: 50 // 显示前 50% 类目，可滑动查看
      },
      {
        type: 'slider', // 纵向滑块
        yAxisIndex: 0,
        start: 0,
        end: 50,
        right: '5%', // 放在右侧，避开 visualMap
        orient: 'vertical' // 纵向滑块
      }
    ],
    series: [
      {
        name: 'HeatMap',
        type: 'heatmap',
        progressive: 5000,
        data: heatmapTypesCount.value.map(heat => {
          const x = type.value.findIndex(t => t.id === heat.id);
          const y = heatMapNames.value.findIndex(n => n.stuno === heat.stuno);
          return [x, y, heat.value];
        }),
        label: {
          show: true,
          formatter: v => v.data[2],
          color: '#000'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.4)'
          }
        }
      }
    ]
  };
  payloadMap.value.set('hot', false);
};

// 获取课堂列表
const initList = async () => {
  const role = JSON.parse(sessionStorage.getItem('users'));
  if (role.rolename === '任课教师') {
    const { code, msg, data } = await getCourseId(parseJWT(sessionStorage.getItem('token')).obsid);
    if (code === 200 && msg === 'success') {
      courseId.value = data;
      classroomId.value = parseJWT(sessionStorage.getItem('token')).obsid;
    }
  } else {
    courseId.value = parseJWT(sessionStorage.getItem('token')).obsid;
  }
  const { code, msg } = await courseGraphStore.fetchCourseList(
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
};

onMounted(async () => {
  // initList();
  // 获取总评价次数
  // 初始化数据
  handleCellClick();
});
</script>

<style lang="less" scoped>
/* 放到组件的 <style> 中，或全局样式里 */
.table-wrapper {
  width: 100%; /* 占满父容器 */
  overflow-x: auto; /* 横向滚动 */
  -webkit-overflow-scrolling: touch;
}

/* 表格等宽逻辑：
   --col-count 由 Vue 传入（values.length）
   当列很多时，min-width 会使表格总宽 > 容器，从而触发滚动
*/
.equal-table {
  width: 100%;
  border-collapse: collapse; /* 边框不双线 */
  table-layout: fixed; /* 固定表格布局，配合 width 均分 */
  min-width: calc(var(--col-count) * 120px); /* 每列至少 120px（可改或删） */
  box-sizing: border-box;
}

/* th / td 通用样式 */
.equal-table th,
.equal-table td {
  border: 1px solid #000; /* 黑色描边 */
  padding: 8px 10px;
  box-sizing: border-box;
  width: calc(100% / var(--col-count)); /* 均分父宽 */
  min-width: 120px; /* 列最小宽度（同上） */
  white-space: nowrap; /* 内容单行显示 */
  overflow: hidden;
  text-overflow: ellipsis; /* 溢出用省略号 */
  vertical-align: middle;
}

/* 可选：固定表头（在横向滚动时也保持可见）*/
.equal-table tr:first-child td {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
}
</style>
