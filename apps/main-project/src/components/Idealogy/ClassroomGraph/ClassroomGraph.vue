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
  <GraphChart v-if="!isDestroy" :store="classroomGraphStore" @close="handleClose">
    <template #title>课堂画像：{{ courseInfo.courseName }}</template>
    <template #GraphItem>
      <GraphItem title="思政标签画像" :chartOption="currentWordOption" ref="wordmapCmp" />
      <!-- <GraphItem title="KWA画像" /> -->
      <GraphItem title="思政标签评价" :chartOption="currentBarFOption" ref="barFCmp" />
      <GraphItem title="思政标签占比" :chartOption="currentPieOption" ref="pieChartCmp" />
      <GraphItem title="思政标签分布" :chartOption="currentHotOption" ref="hotChartCmp" />
      <GraphItem title="思政题目分布" :chartOption="currentQuestionOption" ref="questionChartCmp" />
      <GraphItem title="思政标签达成情况">
        <div class="table-wrapper" :style="{ '--col-count': values.length }">
          <table class="equal-table">
            <tr>
              <td style="width: 50px">序号</td>
              <td style="width: 120px">学号</td>
              <td style="width: 80px">姓名</td>
              <td style="width: 120px">课堂</td>
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
                <el-tooltip :content="courseInfo.courseName" placement="top">
                  <span>{{ courseInfo.courseName }}</span>
                </el-tooltip>
              </td>
              <template v-for="innerV in v.value">
                <td style="width: 80px">{{ innerV }}</td>
              </template>
            </tr>
          </table>
        </div>
      </GraphItem>
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
import { number } from 'echarts';
/* ********************变量定义******************** */
// props定义
// 普通变量
const courseId = ref('');
const wordmapCmp = ref(null);
const barFCmp = ref(null);
const pieChartCmp = ref(null);
const hotChartCmp = ref(null);
const questionChartCmp = ref(null);
const isDestroy = ref(false);

const courseInfo = reactive({
  courseName: '',
  classroomId: 0, //课程id
  courseId: 0 //课堂id
});

const currentWordOption = ref({});
const currentBarFOption = ref({});
const currentPieOption = ref({});
const currentHotOption = ref({});
const currentQuestionOption = ref({});

// pinia状态管理
const classroomGraphStore = useClassroomGraph();
const mainStore = useMain();
const { chartVisible } = storeToRefs(classroomGraphStore);
const IdealogyNewStore = useIdealogyNew();
const { fetchCourseValue, setCourseValueList, fetchAllStudentValue, fetchAllQuestionsLabels } =
  IdealogyNewStore;
const { courseValueList, allStudentValueList, questionsLabels } = storeToRefs(IdealogyNewStore);
const type = ref<{ name: string; value: number; type: string; id: string }[]>([]);
const values = ref<{ name: string; value: number; type: string; id: string }[]>([]);
const payloadMap = ref<Map<string, boolean>>(new Map());

const heatMapNames = ref<{ name: string; stuno: string; userId: string; value: number[] }[]>([]);
const heatmapTypesCount = ref<{ stuno: string; id: string; value: number }[]>([]);
const heatmapValues = ref<{ stuno: string; id: string; value: number }[]>([]);

const questionLists = ref<
  {
    questionName: string;
    questionId: string;
    labels: Array<{ labelName: string; value: number; valueId: string }>;
  }[]
>([]);
const testsLists = ref<
  {
    testName: string;
    testId: string;
    labels: Array<{ labelName: string; value: number; valueId: string }>;
  }[]
>([]);

const handleClose = () => {
  setCourseValueList([]);
  type.value = [];
  values.value = [];
};

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
      break;
    }
    case 'hot': {
      const chartInstance = hotChartCmp.value?.getChartInstance();
      const updateMaps = !payloadMap.value.get(name) ? heatmapTypesCount : heatmapValues;
      const updateXData = !payloadMap.value.get(name) ? type : values;

      const updateData = updateMaps.value.map(heat => {
        const x = updateXData.value.findIndex(t => t.id === heat.id);
        const y = heatMapNames.value.findIndex(n => n.stuno === heat.stuno);
        return [x, y, heat.value];
      });
      chartInstance.setOption(
        {
          yAxis: {
            type: 'category',
            data: heatMapNames.value.map(n => n.name),
            splitArea: { show: true }
          },
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
              data: updateData,
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
      break;
    }
    case 'question': {
      const chartInstance = questionChartCmp.value?.getChartInstance();
      const updateMaps = !payloadMap.value.get(name)
        ? testsLists.value.map(t => t.testName)
        : questionLists.value.map(q => q.questionName);
      const testsSeries = () => {
        const heatmapData: number[][] = [];
        testsLists.value.forEach((test, testIndex) => {
          test.labels.forEach(label => {
            const x = values.value.findIndex(v => v.id === label.valueId);
            const y = testsLists.value.findIndex(t => t.testId === test.testId);
            if (x !== -1 && y !== -1) {
              // 只处理能找到对应标签的数据
              heatmapData.push([x, y, label.value]);
            }
          });
        });
        return heatmapData;
      };

      const questionSeries = () => {
        const heatmapData: number[][] = [];
        questionLists.value.forEach((question, questionIndex) => {
          question.labels.forEach(label => {
            const x = values.value.findIndex(v => v.id === label.valueId);
            const y = questionLists.value.findIndex(q => q.questionId === question.questionId);
            if (x !== -1 && y !== -1) {
              // 只处理能找到对应标签的数据
              heatmapData.push([x, questionIndex, label.value]);
            }
          });
        });
        return heatmapData;
      };

      chartInstance.setOption(
        {
          yAxis: {
            type: 'category',
            data: updateMaps,
            splitArea: { show: true },
            axisLabel: {
              formatter: function (value: string) {
                return value.length > 10 ? value.slice(0, 10) + '…' : value; // 长标签截断
              }
            }
          },
          tooltip: {
            position: 'top',
            formatter: function (params) {
              // params.data[0] 是 x 轴索引（标签索引）
              // params.data[1] 是 y 轴索引（试卷索引）
              // params.data[2] 是值
              const labelName = values.value[params.data[0]]?.name || '未知标签';
              const testName = !payloadMap.value.get(name)
                ? testsLists.value[params.data[1]]?.testName || '未知试卷'
                : questionLists.value[params.data[1]]?.questionName || '未知题目';
              return `${
                !payloadMap.value.get(name) ? '试卷' : '题目'
              }: ${testName}<br/>标签: ${labelName}<br/>评价: ${params.data[2]}`;
            }
          },
          series: [
            {
              name: 'HeatMap',
              type: 'heatmap',
              progressive: 5000,
              data: !payloadMap.value.get(name) ? testsSeries() : questionSeries(),
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
          replaceMerge: ['yAxis', 'series', 'tooltip']
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
      let count = 0;
      if (c.children) {
        c.children.map(ch => {
          if (ch.evalResult?.valueCount && ch.evalResult?.valueCount > 0) {
            count += ch.evalResult?.valueCount;
          }
          values.value.push({
            name: ch.name,
            value: ch.evalResult?.valueCount ?? 0,
            type: '标签',
            id: ch.id
          });
        });
      }
      type.value.push({
        name: c.name,
        value: count,
        type: '类型',
        id: c.id
      });
    });

    //  获取所有学生评价
    const { code, msg } = await fetchAllStudentValue(row.classroomId);
    if (code !== 200) {
      ElMessage({
        type: 'error',
        message: msg
      });
      return;
    }

    // 获取所有题目的标签
    await fetchAllQuestionsLabels(row.classroomId);

    // 清空之前的数据，避免重复
    questionLists.value = [];
    testsLists.value = [];

    // 处理试卷维度的标签数据
    questionsLabels.value.forEach(paper => {
      // 按试卷分组，创建试卷对象
      const testPaper = {
        testName: paper?.paperName,
        testId: paper?.paperId,
        labels: [] as Array<{ labelName: string; value: number; valueId: string }>
      };

      // 遍历试卷中的题目，收集所有不重复的标签
      const uniqueLabels = new Map<string, { labelName: string; value: number; valueId: string }>();

      paper?.questionList.forEach(question => {
        const labelKey = question.valueId;
        if (!uniqueLabels.has(labelKey)) {
          uniqueLabels.set(labelKey, {
            labelName: question.valueTypeName,
            value: question.valueCount,
            valueId: question.valueId
          });
        }
      });

      // 将去重后的标签添加到试卷中
      testPaper.labels = Array.from(uniqueLabels.values());
      testsLists.value.push(testPaper);
    });

    // 处理题目维度的标签数据
    questionsLabels.value.forEach(paper => {
      // 遍历试卷中的所有题目
      let labels = [] as Array<{ labelName: string; value: number; valueId: string }>;
      paper?.questionList.forEach(question => {
        if (Array.isArray(question.valueName)) {
        } else {
          labels.push({
            labelName: question.valueTypeName,
            value: question.valueCount,
            valueId: question.valueId
          });
          questionLists.value.push({
            questionName: question.questionTitle,
            questionId: question.questionId,
            labels: labels
          });
        }
      });
    });

    console.log('试卷标签数据:', testsLists.value);
    console.log('题目标签数据:', questionLists.value);

    allStudentValueList.value.map(sin => {
      const names = {
        name: sin.studentName,
        stuno: sin.stuno,
        userId: sin.userId,
        value: [] as number[]
      };

      if (sin.ideologyList.length) {
        sin.ideologyList.map(id => {
          let count = 0;
          if (id.children?.length) {
            id.children.map(ch => {
              names.value.push(ch.evalResult?.valueCount ?? 0);
              heatmapValues.value.push({
                stuno: sin.stuno,
                id: ch.id,
                value: ch.evalResult?.valueCount ?? 0
              });
              if (ch.evalResult?.valueCount && ch.evalResult?.valueCount > 0) {
                count += ch.evalResult?.valueCount;
              }
            });
          }

          heatmapTypesCount.value.push({
            stuno: sin.stuno,
            id: id.id,
            value: count
          });
        });
      }
      heatMapNames.value.push(names);
    });
    console.log('typecount :', heatMapNames.value);
    classroomGraphStore.setChartVisible(true);

    initChart();
  }
};

// 需要传递第几次作业，默认最新一次评价
const initChart = () => {
  // 第一个图表在点击的时候会将所有数据进行初始化，节省性能
  console.log('---lyjc', testsLists.value);
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

  currentQuestionOption.value = {
    toolbox: {
      ...newtoolbox('question')
    },
    tooltip: {
      position: 'top',
      formatter: function (params) {
        // params.data[0] 是 x 轴索引（标签索引）
        // params.data[1] 是 y 轴索引（试卷索引）
        // params.data[2] 是值
        const labelName = values.value[params.data[0]]?.name || '未知标签';
        const testName = testsLists.value[params.data[1]]?.testName || '未知试卷';
        return `试卷: ${testName}<br/>标签: ${labelName}<br/>评价: ${params.data[2]}`;
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
      data: values.value.map(t => t.name),
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
      data: testsLists.value.map(t => t.testName),
      splitArea: { show: true },
      axisLabel: {
        formatter: function (value: string) {
          return value.length > 8 ? value.slice(0, 8) + '…' : value; // 更短的截断
        }
      }
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
        data: (() => {
          const heatmapData: number[][] = [];
          testsLists.value.forEach((test, testIndex) => {
            test.labels.forEach(label => {
              const x = values.value.findIndex(v => v.id === label.valueId);
              const y = testsLists.value.findIndex(t => t.testId === test.testId);
              if (x !== -1 && y !== -1) {
                // 只处理能找到对应标签的数据
                heatmapData.push([x, y, label.value]);
              }
            });
          });
          return heatmapData;
        })(),
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
  payloadMap.value.set('question', false);
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
