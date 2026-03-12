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

  <!-- 课堂画像图表 - 新布局 -->
  <GraphChart v-if="!isDestroy" :store="classroomGraphStore" @close="handleClose">
    <template #title>课堂画像：{{ courseInfo.courseName }}</template>
    <template #GraphItem>
      <!-- 第一部分：课程总结优化建议（流式输出） -->
      <GraphItem title="课程总结优化建议">
        <div class="suggestion-box">
          <div class="suggestion-content" v-html="formattedSuggestion"></div>
          <div v-if="isStreaming" class="streaming-cursor">|</div>
        </div>
      </GraphItem>

      <!-- 第二行：两个图表并排 -->
      <div class="chart-row">
        <!-- 第二部分：学生知识水平（柱状图） -->
        <GraphItem title="学生知识水平" class="half-width">
          <div ref="studentKnowledgeChart" style="width: 100%; height: 300px;"></div>
        </GraphItem>

        <!-- 第三部分：课程知识水平（仪表盘或数字卡片） -->
        <GraphItem title="课程知识水平" class="half-width">
          <div class="knowledge-level-card">
            <div class="knowledge-value">{{ courseKnowledgeLevel }}</div>
            <div class="knowledge-label">整体掌握度</div>
            <el-progress
                type="circle"
                :percentage="courseKnowledgeLevel"
                :color="knowledgeLevelColor"
                :width="120"
            />
          </div>
        </GraphItem>
      </div>

      <!-- 第四部分：学生参与热力图（多次评价） -->
      <GraphItem title="学生参与热力图">
        <div class="heatmap-controls">
          <el-radio-group v-model="selectedEvaluation" size="small" @change="handleEvaluationChange">
            <el-radio-button
                v-for="(evalItem, index) in evaluationList"
                :key="index"
                :label="index"
            >
              第{{ index + 1 }}次评价
            </el-radio-button>
          </el-radio-group>
        </div>
        <div ref="participationHeatmapChart" style="width: 100%; height: 400px;"></div>
        <div class="heatmap-legend">
          <span>参与度：</span>
          <span class="legend-item" style="background: #d7d7d7">0</span>
          <span class="legend-item" style="background: #fba89b">0.25</span>
          <span class="legend-item" style="background: #ffff00">0.5</span>
          <span class="legend-item" style="background: #4876ff">0.75</span>
          <span class="legend-item" style="background: #90ee90">1</span>
        </div>
      </GraphItem>

      <!-- 第五部分：课程参与度改变（折线图） -->
      <GraphItem title="课程参与度变化趋势">
        <div ref="courseParticipationChart" style="width: 100%; height: 300px;"></div>
      </GraphItem>
    </template>
  </GraphChart>
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
import { reactive, ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import useClassroomGraph from '../../../stores/dynamicEvaluation/classroomStore.js';
import useIdealogyNew from '../../../stores/idealogyNewStore';
import * as echarts from 'echarts';
import { streamChat } from '@/api/chat.js'; // 假设有流式聊天API

/* ********************变量定义******************** */
const courseId = ref('');
const isDestroy = ref(false);
const isStreaming = ref(false);
const suggestionText = ref('');
const courseKnowledgeLevel = ref(85); // 默认值，后面从API获取
const selectedEvaluation = ref(0);
const evaluationList = ref<any[]>([]);

// ECharts实例
const studentKnowledgeChart = ref<HTMLElement>();
const participationHeatmapChart = ref<HTMLElement>();
const courseParticipationChart = ref<HTMLElement>();

let studentKnowledgeInstance: echarts.ECharts | null = null;
let heatmapInstance: echarts.ECharts | null = null;
let courseParticipationInstance: echarts.ECharts | null = null;

const courseInfo = reactive({
  courseName: '',
  classroomId: 0,
  courseId: 0
});

// 数据存储
const studentKnowledgeData = ref<Array<{ name: string; value: number }>>([]);
const participationData = ref<Array<{
  studentName: string;
  evaluations: number[]; // 每次评价的参与度 (0-1)
}>>([]);
const courseParticipationData = ref<number[]>([]); // 每次评价的整体参与度

// Pinia状态管理
const classroomGraphStore = useClassroomGraph();
const mainStore = useMain();
const { chartVisible } = storeToRefs(classroomGraphStore);
const IdealogyNewStore = useIdealogyNew();
const { fetchAllStudentValue, fetchAllQuestionsLabels } = IdealogyNewStore;
const { allStudentValueList, questionsLabels } = storeToRefs(IdealogyNewStore);

/* ********************计算属性******************** */
const formattedSuggestion = computed(() => {
  return suggestionText.value.replace(/\n/g, '<br>');
});

const knowledgeLevelColor = computed(() => {
  const level = courseKnowledgeLevel.value;
  if (level >= 90) return '#67C23A';
  if (level >= 80) return '#409EFF';
  if (level >= 70) return '#E6A23C';
  return '#F56C6C';
});

/* ********************API调用******************** */
// 获取课程总结优化建议（流式输出）
const fetchSuggestion = async (classroomId: string) => {
  isStreaming.value = true;
  suggestionText.value = '';

  try {
    // 假设有流式API
    await streamChat({
      prompt: `请对课堂${classroomId}的思政教学效果进行总结，并给出优化建议。`,
      onMessage: (chunk: string) => {
        suggestionText.value += chunk;
      },
      onComplete: () => {
        isStreaming.value = false;
      }
    });
  } catch (error) {
    console.error('获取建议失败:', error);
    suggestionText.value = '无法获取优化建议，请稍后重试。';
    isStreaming.value = false;
  }
};

// 计算学生知识水平
const calculateStudentKnowledge = () => {
  // 从 allStudentValueList 计算每个学生的知识水平
  studentKnowledgeData.value = allStudentValueList.value.map((student: any) => {
    let totalScore = 0;
    let totalCount = 0;

    if (student.ideologyList?.length) {
      student.ideologyList.forEach((type: any) => {
        if (type.children?.length) {
          type.children.forEach((label: any) => {
            if (label.evalResult?.valueCount) {
              totalScore += label.evalResult.valueCount;
              totalCount++;
            }
          });
        }
      });
    }

    // 计算平均分并转换为百分制
    const averageScore = totalCount > 0 ? (totalScore / totalCount) * 100 : 0;

    return {
      name: student.studentName,
      value: Math.round(averageScore)
    };
  });

  // 按分数降序排序
  studentKnowledgeData.value.sort((a, b) => b.value - a.value);
};

// 计算课程整体知识水平
const calculateCourseKnowledge = () => {
  if (studentKnowledgeData.value.length === 0) return;

  const total = studentKnowledgeData.value.reduce((sum, student) => sum + student.value, 0);
  courseKnowledgeLevel.value = Math.round(total / studentKnowledgeData.value.length);
};

// 计算参与度数据
const calculateParticipationData = () => {
  // 清空旧数据
  participationData.value = [];
  evaluationList.value = [];

  // 从 questionsLabels 中提取每次评价的数据
  // 假设 questionsLabels 包含多次评价的信息
  if (questionsLabels.value.length) {
    // 获取所有学生的名字
    const studentNames = allStudentValueList.value.map((s: any) => s.studentName);

    // 初始化参与度数据
    studentNames.forEach(name => {
      participationData.value.push({
        studentName: name,
        evaluations: []
      });
    });

    // 处理每次评价
    questionsLabels.value.forEach((paper: any, paperIndex: number) => {
      evaluationList.value.push({
        name: `第${paperIndex + 1}次评价`,
        data: paper
      });

      // 计算本次评价每个学生的参与度
      allStudentValueList.value.forEach((student: any, studentIndex: number) => {
        // 这里需要根据实际数据结构计算学生的参与度
        // 暂时用随机数模拟
        const participation = Math.random();
        participationData.value[studentIndex].evaluations.push(participation);
      });
    });

    // 计算课程整体参与度
    courseParticipationData.value = evaluationList.value.map((_, evalIndex) => {
      let total = 0;
      participationData.value.forEach(student => {
        total += student.evaluations[evalIndex] || 0;
      });
      return Number((total / participationData.value.length).toFixed(2));
    });
  }
};

/* ********************图表初始化******************** */
const initStudentKnowledgeChart = () => {
  if (!studentKnowledgeInstance && studentKnowledgeChart.value) {
    studentKnowledgeInstance = echarts.init(studentKnowledgeChart.value);
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        return `${params[0].name}<br/>知识水平：${params[0].value}分`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: studentKnowledgeData.value.map(s => s.name),
      axisLabel: {
        rotate: 45,
        interval: 0,
        fontSize: 12,
        formatter: (value: string) => value.length > 6 ? value.slice(0, 6) + '…' : value
      }
    },
    yAxis: {
      type: 'value',
      name: '知识水平',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value} 分'
      }
    },
    series: [
      {
        name: '知识水平',
        type: 'bar',
        data: studentKnowledgeData.value.map(s => s.value),
        itemStyle: {
          color: (params: any) => {
            const value = params.data;
            if (value >= 90) return '#67C23A';
            if (value >= 80) return '#409EFF';
            if (value >= 70) return '#E6A23C';
            return '#F56C6C';
          },
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}分'
        }
      }
    ]
  };

  studentKnowledgeInstance?.setOption(option);
};

const initHeatmapChart = () => {
  if (!heatmapInstance && participationHeatmapChart.value) {
    heatmapInstance = echarts.init(participationHeatmapChart.value);
  }

  const currentEvalIndex = selectedEvaluation.value;

  // 准备热力图数据
  const heatmapData: [number, number, number][] = [];
  participationData.value.forEach((student, studentIndex) => {
    const value = student.evaluations[currentEvalIndex] || 0;
    heatmapData.push([0, studentIndex, value]); // x固定为0，因为只有一列数据
  });

  const option = {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const studentName = participationData.value[params.data[1]]?.studentName;
        const value = (params.data[2] * 100).toFixed(0);
        return `学生: ${studentName}<br/>参与度: ${value}%`;
      }
    },
    grid: {
      left: '15%',
      right: '5%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['参与度'],
      splitArea: { show: true },
      axisLabel: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    yAxis: {
      type: 'category',
      data: participationData.value.map(s => s.studentName),
      splitArea: { show: true },
      axisLabel: {
        fontSize: 12,
        formatter: (value: string) => value.length > 8 ? value.slice(0, 8) + '…' : value
      }
    },
    visualMap: {
      min: 0,
      max: 1,
      calculable: true,
      orient: 'vertical',
      right: '2%',
      top: 'center',
      inRange: {
        color: [
          '#d7d7d7', // 0
          '#fba89b', // 0.25
          '#ffff00', // 0.5
          '#4876ff', // 0.75
          '#90ee90'  // 1
        ]
      }
    },
    series: [{
      name: '参与度',
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: true,
        formatter: (params: any) => {
          return (params.data[2] * 100).toFixed(0) + '%';
        },
        color: '#000',
        fontSize: 11
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.4)'
        }
      }
    }]
  };

  heatmapInstance?.setOption(option);
};

const initCourseParticipationChart = () => {
  if (!courseParticipationInstance && courseParticipationChart.value) {
    courseParticipationInstance = echarts.init(courseParticipationChart.value);
  }

  const xAxisData = evaluationList.value.map((_, index) => `第${index + 1}次`);

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].name}<br/>课程参与度：${(params[0].data * 100).toFixed(0)}%`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '参与度',
      min: 0,
      max: 1,
      axisLabel: {
        formatter: (value: number) => (value * 100).toFixed(0) + '%'
      }
    },
    series: [
      {
        name: '课程参与度',
        type: 'line',
        data: courseParticipationData.value,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#409EFF',
          width: 3,
          type: 'solid'
        },
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => (params.data * 100).toFixed(0) + '%'
        },
        markLine: {
          data: [
            { type: 'average', name: '平均线' }
          ],
          lineStyle: {
            color: '#F56C6C',
            type: 'dashed'
          }
        }
      }
    ]
  };

  courseParticipationInstance?.setOption(option);
};

/* ********************事件处理******************** */
const handleCellClick = async (row: any, column: any, cell: any) => {
  if (column.property === 'classroomName') {
    // 记录课堂信息
    courseInfo.courseName = row.courseName;
    courseInfo.courseId = row.id;
    courseInfo.classroomId = row.classroomId;

    // 显示加载状态
    ElMessage.info('正在加载数据...');

    try {
      // 1. 获取所有学生评价
      const { code, msg } = await fetchAllStudentValue(row.classroomId);
      if (code !== 200) {
        ElMessage.error(msg);
        return;
      }

      // 2. 获取题目标签数据
      await fetchAllQuestionsLabels(row.classroomId);

      // 3. 计算所有数据
      calculateStudentKnowledge();
      calculateCourseKnowledge();
      calculateParticipationData();

      // 4. 获取优化建议（流式）
      await fetchSuggestion(row.classroomId);

      // 5. 显示图表区域
      classroomGraphStore.setChartVisible(true);

      // 6. 初始化所有图表
      nextTick(() => {
        initStudentKnowledgeChart();
        initHeatmapChart();
        initCourseParticipationChart();
      });

    } catch (error) {
      ElMessage.error('数据加载失败');
      console.error(error);
    }
  }
};

const handleEvaluationChange = (val: number) => {
  selectedEvaluation.value = val;
  initHeatmapChart(); // 重新绘制热力图
};

const handleClose = () => {
  // 销毁图表实例
  studentKnowledgeInstance?.dispose();
  heatmapInstance?.dispose();
  courseParticipationInstance?.dispose();
  studentKnowledgeInstance = null;
  heatmapInstance = null;
  courseParticipationInstance = null;
};

// 窗口大小改变时自适应
const handleResize = () => {
  studentKnowledgeInstance?.resize();
  heatmapInstance?.resize();
  courseParticipationInstance?.resize();
};

/* ********************初始化******************** */
const titles = [
  { prop: 'classroomName', label: '课堂名称' },
  { prop: 'termName', label: '学期' },
  { prop: 'courseName', label: '课程' },
  { prop: 'proName', label: '专业' },
  { prop: 'teacherName', label: '主讲教师' }
];

const lists = ref([]);

const addCellStyle = ({ row, column, rowIndex, columnIndex }) => {
  if (column.property === 'classroomName') {
    return {
      color: '#86BFA8',
      textAlign: 'center',
      textDecoration: 'underline',
      cursor: 'pointer'
    };
  }
  return { textAlign: 'center' };
};

const handleFlushList = () => {
  lists.value = classroomGraphStore.courseList;
  mainStore.setDynamicSearchloading(false);
};

const initList = async () => {
  const role = JSON.parse(sessionStorage.getItem('users') || '{}');
  if (role.rolename === '任课教师') {
    const { code, msg, data } = await getCourseId(parseJWT(sessionStorage.getItem('token')).obsid);
    if (code === 200 && msg === 'success') {
      courseId.value = data;
    }
  } else {
    courseId.value = parseJWT(sessionStorage.getItem('token')).obsid;
  }

  const { code, msg } = await classroomGraphStore.fetchCourseList(courseId.value);
  if (!(code === 200 && msg === 'success')) {
    ElMessage.error(msg);
    return;
  }
  lists.value = classroomGraphStore.courseList;
};

onMounted(() => {
  initList();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  handleClose();
});
</script>

<style lang="less" scoped>
.suggestion-box {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  min-height: 100px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;

  .suggestion-content {
    white-space: pre-wrap;
    word-break: break-word;
  }

  .streaming-cursor {
    display: inline-block;
    width: 2px;
    height: 18px;
    background-color: #409EFF;
    margin-left: 2px;
    animation: blink 1s infinite;
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.chart-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  .half-width {
    flex: 1;
    min-width: 0; // 防止flex溢出
  }
}

.knowledge-level-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  height: 300px;

  .knowledge-value {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .knowledge-label {
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 20px;
  }

  :deep(.el-progress) {
    .el-progress__text {
      color: white !important;
    }
  }
}

.heatmap-controls {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;

  .legend-item {
    width: 30px;
    height: 20px;
    border-radius: 2px;
    margin: 0 2px;
  }
}
</style>