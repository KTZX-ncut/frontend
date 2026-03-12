<template>
  <!-- 课堂列表 -->
  <GraphTemplate
      :store="classroomGraphStore"
      :handleCellClick="handleCellClick"
      :addCellStyle="addCellStyle"
      :graphList="lists"
      :titleList="titles"
      @flushList="handleFlushList"
      keyword="请输入课程名称关键字检索"
  />

  <!-- 课堂画像图表 - 模拟数据版本 -->
  <GraphChart v-if="!isDestroy" :store="classroomGraphStore" @close="handleClose">
    <template #title>课程总体画像：{{ courseInfo.courseName || '高等数学' }}</template>
    <template #GraphItem>
      <!-- 第一部分：课程总结优化建议（流式输出） -->
      <GraphItem title="📊 课程总结优化建议">
        <div class="suggestion-box">
          <div class="suggestion-content" v-html="formattedSuggestion"></div>
          <div v-if="isStreaming" class="streaming-cursor">|</div>
          <div v-if="!isStreaming && suggestionText" class="suggestion-actions">
            <el-button type="primary" size="small" @click="copySuggestion" plain>复制建议</el-button>
            <el-button type="info" size="small" @click="regenerateSuggestion" plain>重新生成</el-button>
          </div>
        </div>
      </GraphItem>

      <!-- 第二行：两个图表并排 -->
      <div class="chart-row">
        <!-- 第二部分：学生知识水平（柱状图） -->
        <GraphItem title="📚 学生知识水平" class="half-width">
          <div ref="studentKnowledgeChart" style="width: 100%; height: 300px;"></div>
        </GraphItem>

        <!-- 第三部分：课程知识水平（仪表盘） -->
        <GraphItem title="🎯 课程知识水平" class="half-width">
          <div class="knowledge-level-card">
            <div class="knowledge-value">{{ courseKnowledgeLevel }}</div>
            <div class="knowledge-label">整体掌握度</div>
            <el-progress
                type="dashboard"
                :percentage="courseKnowledgeLevel"
                :color="knowledgeLevelColors"
                :width="180"
                :stroke-width="12"
            >
              <template #default="{ percentage }">
                <span class="percentage-value">{{ percentage }}%</span>
                <span class="percentage-label">掌握度</span>
              </template>
            </el-progress>
            <div class="knowledge-stats">
              <div class="stat-item">
                <span class="stat-label">优秀人数</span>
                <span class="stat-value">{{ excellentCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">及格人数</span>
                <span class="stat-value">{{ passCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">不及格人数</span>
                <span class="stat-value">{{ failCount }}</span>
              </div>
            </div>
          </div>
        </GraphItem>
      </div>

      <!-- 第四部分：学生参与热力图（多次评价） -->
      <GraphItem title="🔥 学生参与热力图">
        <!-- 删除了 <div class="heatmap-controls"> 整个切换按钮区域 -->
        <div ref="participationHeatmapChart" style="width: 100%; height: 500px;"></div>
        <div class="heatmap-legend">
          <span class="legend-label">参与度：</span>
          <div class="legend-gradient"></div>
          <div class="legend-values">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </GraphItem>

      <!-- 第五部分：课程参与度改变（折线图） -->
      <GraphItem title="📈 课程参与度变化趋势">
        <div ref="courseParticipationChart" style="width: 100%; height: 300px;"></div>
        <div class="participation-summary">
          <el-tag type="success" size="large">平均参与度: {{ averageParticipation }}%</el-tag>
          <el-tag :type="participationTrend.type" size="large">趋势: {{ participationTrend.text }}</el-tag>
          <el-tag type="warning" size="large">峰值: {{ maxParticipation }}%</el-tag>
        </div>
      </GraphItem>

      <!-- 第六部分：薄弱知识点（新增） -->
      <GraphItem title="⚠️ 关键薄弱知识点">
        <el-table :data="weakKnowledgePoints" border style="width: 100%">
          <el-table-column prop="knowledge" label="知识点" width="200" />
          <el-table-column prop="masteryRate" label="平均掌握率" width="120">
            <template #default="{ row }">
              <el-tag :type="getMasteryRateType(row.masteryRate)">{{ row.masteryRate }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="可能原因推测" />
        </el-table>
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
import * as echarts from 'echarts';
import { ElNotification } from 'element-plus';

/* ********************模拟数据定义******************** */

// 大模型返回的建议数据
const mockSuggestionData = {
  "一、【整体表现诊断】": {
    "学生参与积极性水平及趋势": "当前学生平均参与度为78.5%，处于中等偏上水平，但预测参与度将下降至65.2%，且趋势明确为“下降”，表明学生参与积极性面临下滑风险。",
    "知识传递整体成效": "知识掌握情况呈现两极分化。多数学生对“函数定义与性质”（88%）和“定积分基本概念”（71%）掌握良好。但课程存在明显短板，多个核心知识点掌握率不足60%，表明知识传递在关键模块上成效不足。"
  },
  "二、【关键薄弱知识点】": {
    "列表": [
      {
        "知识点": "链式法则应用",
        "平均掌握率": "39%",
        "可能原因推测": "概念抽象且涉及复合函数的多层运算，学生可能因理解链条断裂或练习量不足导致应用困难。"
      },
      {
        "知识点": "三角函数图像变换",
        "平均掌握率": "42%",
        "可能原因推测": "知识点结合了三角函数的周期性与图像变换的抽象规则，可能因讲解节奏过快或缺乏动态可视化演示，导致学生空间想象与规律总结困难。"
      },
      {
        "知识点": "导数的几何意义",
        "平均掌握率": "55%",
        "可能原因推测": "虽略高于50%，但仍属薄弱。可能原因在于从代数定义到几何切线斜率的抽象转换不够直观，学生未能建立数形结合的牢固联系。"
      }
    ]
  },
  "三、【风险与机会】": {
    "高风险学生预警": "高风险学生（低参与+低掌握）占比为28%，已超过20%的预警线，需立即关注并干预这部分学生的学习状态，以防其完全掉队。",
    "虚假活跃问题提示": "当前整体参与度（78.5%）与多个知识点的低掌握率（如链式法则39%）形成反差，提示课堂或作业中可能存在“虚假活跃”现象，即学生表面参与但深层理解不足。",
    "潜在流失风险分析": "预测参与度将显著下降（从78.5%至65.2%），结合高风险学生占比较高，表明课程对学生的吸引力或实用性正减弱，存在学生持续参与意愿降低乃至流失的潜在风险。"
  },
  "四、【教学优化建议】": {
    "建议列表": [
      {
        "建议": "针对薄弱知识点进行教学策略重构",
        "具体措施": "对“链式法则应用”和“三角函数图像变换”两个掌握率最低的点，设计专项突破模块。例如，利用函数图像动态软件演示三角函数变换过程；对链式法则，采用“分解-标识-组合”的三步法可视化流程图进行讲解，并配套阶梯式练习。"
      },
      {
        "建议": "建立分层干预与激励机制",
        "具体措施": "针对占比28%的高风险学生群体，推送包含基础概念回顾与针对性练习的“巩固资源包”，并设置阶段性、可达成的学习里程碑与奖励（如解锁进阶内容或获得徽章），以提升其持续参与的动力与成就感。"
      },
      {
        "建议": "引入诊断性测验与反馈循环",
        "具体措施": "在讲授“导数的几何意义”等抽象知识点后，立即进行简短的课堂诊断测验（如通过图形选择对应导数），快速识别理解误区。根据结果，在下节课开始时进行5-10分钟的集中答疑或变式讲解，形成“教学-诊断-反馈-强化”的闭环，打击“虚假活跃”，夯实理解。"
      }
    ]
  }
};

// 模拟学生名单
const mockStudents = [
  { name: '丁孙鹏', stuno: '2024001' },
  { name: '廖源哲', stuno: '2024002' },
  { name: '左峰迪', stuno: '2024003' },
  { name: '仇利东', stuno: '2024004' },
  { name: '张欣宇', stuno: '2024005' },
  { name: '蒋明孚', stuno: '2024006' },
  { name: '陶逸羽', stuno: '2024007' },
  { name: '吴海涵', stuno: '2024008' },
  { name: '朱学京', stuno: '2024009' },
  { name: '王渝馨', stuno: '2024010' }
];

// 模拟课堂列表
const mockCourseList = [
  {
    id: '1',
    classroomName: '高等数学A（1班）',
    termName: '2024春季学期',
    courseName: '高等数学',
    proName: '计算机科学与技术',
    teacherName: '张教授',
    labTeacher: '李老师',
    practiceTeacher: '王老师',
    creator: 'admin',
    classroomId: 'class_001'
  },
  {
    id: '2',
    classroomName: '线性代数（2班）',
    termName: '2024春季学期',
    courseName: '线性代数',
    proName: '软件工程',
    teacherName: '刘教授',
    labTeacher: '陈老师',
    practiceTeacher: '赵老师',
    creator: 'admin',
    classroomId: 'class_002'
  },
  {
    id: '3',
    classroomName: '概率论与数理统计（3班）',
    termName: '2024秋季学期',
    courseName: '概率论',
    proName: '数据科学',
    teacherName: '王教授',
    labTeacher: '孙老师',
    practiceTeacher: '周老师',
    creator: 'admin',
    classroomId: 'class_003'
  }
];

/* ********************变量定义******************** */
const courseId = ref('');
const isDestroy = ref(false);
const isStreaming = ref(false);
const suggestionText = ref('');
const selectedEvaluation = ref(0);

// ECharts实例
const studentKnowledgeChart = ref<HTMLElement>();
const participationHeatmapChart = ref<HTMLElement>();
const courseParticipationChart = ref<HTMLElement>();

let studentKnowledgeInstance: echarts.ECharts | null = null;
let heatmapInstance: echarts.ECharts | null = null;
let courseParticipationInstance: echarts.ECharts | null = null;

const courseInfo = reactive({
  courseName: '',
  classroomId: '',
  courseId: ''
});

// 模拟数据存储
const studentKnowledgeData = ref<Array<{ name: string; value: number }>>([]);
const participationData = ref<Array<{
  studentName: string;
  stuno: string;
  evaluations: number[];
}>>([]);
const courseParticipationData = ref<number[]>([]);
const evaluationList = ref<Array<{ name: string; date: string }>>([]);
const weakKnowledgePoints = ref<Array<{ knowledge: string; masteryRate: string; reason: string }>>([]);

// Pinia状态管理 - 关键部分！不要注释！
const classroomGraphStore = useClassroomGraph();
const mainStore = useMain();
const { chartVisible } = storeToRefs(classroomGraphStore);

/* ********************计算属性******************** */

// 格式化建议文本（将JSON转换为HTML）
const formattedSuggestion = computed(() => {
  if (!suggestionText.value) return '';

  // 如果已经是HTML格式，直接返回
  if (suggestionText.value.includes('<div>')) {
    return suggestionText.value;
  }

  // 尝试解析JSON
  try {
    const data = JSON.parse(suggestionText.value);
    return formatSuggestionToHtml(data);
  } catch {
    // 如果不是JSON，直接返回文本
    return suggestionText.value.replace(/\n/g, '<br>');
  }
});

// 课程知识水平颜色
const knowledgeLevelColors = computed(() => {
  return [
    { color: '#F56C6C', percentage: 60 },
    { color: '#E6A23C', percentage: 75 },
    { color: '#409EFF', percentage: 90 },
    { color: '#67C23A', percentage: 100 }
  ];
});

// 统计信息
const excellentCount = computed(() => {
  return studentKnowledgeData.value.filter(s => s.value >= 90).length;
});

const passCount = computed(() => {
  return studentKnowledgeData.value.filter(s => s.value >= 60 && s.value < 90).length;
});

const failCount = computed(() => {
  return studentKnowledgeData.value.filter(s => s.value < 60).length;
});

const courseKnowledgeLevel = computed(() => {
  if (studentKnowledgeData.value.length === 0) return 0;
  const total = studentKnowledgeData.value.reduce((sum, s) => sum + s.value, 0);
  return Math.round(total / studentKnowledgeData.value.length);
});

const averageParticipation = computed(() => {
  if (courseParticipationData.value.length === 0) return 0;
  const avg = courseParticipationData.value.reduce((a, b) => a + b, 0) / courseParticipationData.value.length;
  return Math.round(avg * 100);
});

const maxParticipation = computed(() => {
  if (courseParticipationData.value.length === 0) return 0;
  return Math.round(Math.max(...courseParticipationData.value) * 100);
});

const participationTrend = computed(() => {
  if (courseParticipationData.value.length < 2) {
    return { type: 'info', text: '数据不足' };
  }

  const first = courseParticipationData.value[0];
  const last = courseParticipationData.value[courseParticipationData.value.length - 1];

  if (last > first) {
    return { type: 'success', text: '上升中 ↑' };
  } else if (last < first) {
    return { type: 'danger', text: '下降中 ↓' };
  } else {
    return { type: 'info', text: '平稳 →' };
  }
});

/* ********************辅助函数******************** */

// 格式化建议为HTML
const formatSuggestionToHtml = (data: any) => {
  let html = '';

  // 整体表现诊断
  if (data['一、【整体表现诊断】']) {
    html += '<div class="suggestion-section">';
    html += '<h4>📋 整体表现诊断</h4>';
    html += `<p><strong>学生参与积极性水平及趋势：</strong> ${data['一、【整体表现诊断】']['学生参与积极性水平及趋势']}</p>`;
    html += `<p><strong>知识传递整体成效：</strong> ${data['一、【整体表现诊断】']['知识传递整体成效']}</p>`;
    html += '</div>';
  }

  // 关键薄弱知识点
  if (data['二、【关键薄弱知识点】']?.列表) {
    html += '<div class="suggestion-section">';
    html += '<h4>⚠️ 关键薄弱知识点</h4>';
    html += '<ul>';
    data['二、【关键薄弱知识点】'].列表.forEach((item: any) => {
      html += `<li><strong>${item.知识点}</strong> (掌握率: ${item.平均掌握率}) - ${item.可能原因推测}</li>`;
    });
    html += '</ul>';
    html += '</div>';
  }

  // 风险与机会
  if (data['三、【风险与机会】']) {
    html += '<div class="suggestion-section">';
    html += '<h4>🎯 风险与机会</h4>';
    html += `<p><strong>高风险学生预警：</strong> ${data['三、【风险与机会】']['高风险学生预警']}</p>`;
    html += `<p><strong>虚假活跃问题提示：</strong> ${data['三、【风险与机会】']['虚假活跃问题提示']}</p>`;
    html += `<p><strong>潜在流失风险分析：</strong> ${data['三、【风险与机会】']['潜在流失风险分析']}</p>`;
    html += '</div>';
  }

  // 教学优化建议
  if (data['四、【教学优化建议】']?.建议列表) {
    html += '<div class="suggestion-section">';
    html += '<h4>💡 教学优化建议</h4>';
    html += '<ol>';
    data['四、【教学优化建议】'].建议列表.forEach((item: any) => {
      html += `<li><strong>${item.建议}</strong><br>${item.具体措施}</li>`;
    });
    html += '</ol>';
    html += '</div>';
  }

  return html;
};

// 生成模拟学生知识水平数据
const generateMockStudentKnowledge = () => {
  return mockStudents.map(student => ({
    name: student.name,
    value: Math.floor(Math.random() * 40) + 60 // 60-100之间的随机数
  }));
};

// 生成模拟参与度数据
const generateMockParticipationData = () => {
  // 生成8次评价
  const evaluations = 8;
  evaluationList.value = Array.from({ length: evaluations }, (_, i) => ({
    name: `第${i + 1}次评价`,
    date: `2024-03-${10 + i}`
  }));

  // 为每个学生生成参与度数据
  const participation = mockStudents.map(student => ({
    studentName: student.name,
    stuno: student.stuno,
    evaluations: Array.from({ length: evaluations }, () => Number((Math.random() * 0.8 + 0.2).toFixed(2))) // [0.23, 0.45, 0.67, ...] 共8个
  }));

  // 计算课程整体参与度
  const courseParticipation = Array.from({ length: evaluations }, (_, evalIndex) => {
    const total = participation.reduce((sum, student) => sum + student.evaluations[evalIndex], 0);
    return Number((total / participation.length).toFixed(2));
  });

  return { participation, courseParticipation };
};

// 获取掌握率标签类型
const getMasteryRateType = (rate: string) => {
  const num = parseInt(rate);
  if (num >= 70) return 'success';
  if (num >= 50) return 'warning';
  return 'danger';
};

/* ********************模拟流式输出******************** */

const mockStreamOutput = async () => {
  isStreaming.value = true;
  suggestionText.value = '';

  const jsonString = JSON.stringify(mockSuggestionData, null, 2);
  const chunks = jsonString.split('');

  for (let i = 0; i < chunks.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 10)); // 每个字符延迟10ms
    suggestionText.value += chunks[i];
  }

  // 解析并存储薄弱知识点
  if (mockSuggestionData['二、【关键薄弱知识点】']?.列表) {
    weakKnowledgePoints.value = mockSuggestionData['二、【关键薄弱知识点】'].列表.map(item => ({
      knowledge: item.知识点,
      masteryRate: item.平均掌握率,
      reason: item.可能原因推测
    }));
  }

  isStreaming.value = false;
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
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: studentKnowledgeData.value.map(s => s.name),
      axisLabel: {
        rotate: 30,
        interval: 0,
        fontSize: 12,
        fontWeight: 'bold',
        formatter: (value: string) => value.length > 4 ? value.slice(0, 4) + '…' : value
      }
    },
    yAxis: {
      type: 'value',
      name: '知识水平',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value} 分'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
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
          borderRadius: [6, 6, 0, 0],
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}分',
          fontWeight: 'bold',
          fontSize: 11
        },
        barWidth: 24,
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.1)',
          borderRadius: 6
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

  // 准备热力图数据 - 矩阵形式 [x, y, value]
  const heatmapData: [number, number, number][] = [];

  participationData.value.forEach((student, studentIndex) => {
    student.evaluations.forEach((value, evalIndex) => {
      heatmapData.push([evalIndex, studentIndex, value]);  // 所有8次评价都加入
    });
  });

  const option = {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const student = participationData.value[params.data[1]];
        const value = (params.data[2] * 100).toFixed(0);
        return `
          <div style="font-weight:bold;margin-bottom:4px;">${student.studentName}</div>
          <div>学号：${student.stuno}</div>
          <div>参与度：${value}%</div>
          <div>评价：${evaluationList.value[currentEvalIndex]?.name}</div>
        `;
      },
      backgroundColor: 'rgba(50,50,50,0.9)',
      textStyle: { color: '#fff' },
      borderWidth: 0
    },
    grid: {
      left: '15%',
      right: '8%',
      bottom: '10%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: evaluationList.value.map(e => e.name),
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(0,0,0,0.02)']
        }
      },
      axisLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333'
      },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      data: participationData.value.map(s => s.studentName),
      splitArea: { show: true },
      axisLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        formatter: (value: string) => value.length > 6 ? value.slice(0, 6) + '…' : value
      },
      axisLine: { show: false },
      axisTick: { show: false }
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
          '#d7d7d7', // 0%
          '#fba89b', // 25%
          '#ffff00', // 50%
          '#4876ff', // 75%
          '#90ee90'  // 100%
        ]
      },
      text: ['高', '低'],
      textStyle: { fontSize: 12 }
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
        color: (params: any) => {
          const value = params.data[2];
          return value > 0.6 ? '#000' : '#333';
        },
        fontSize: 11,
        fontWeight: 'bold',
        position: 'inside',
        textShadow: '0 0 2px #fff'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          borderColor: '#333',
          borderWidth: 2
        }
      },
      progressive: 1000,
      animation: true
    }]
  };

  heatmapInstance?.setOption(option);
};

const initCourseParticipationChart = () => {
  if (!courseParticipationInstance && courseParticipationChart.value) {
    courseParticipationInstance = echarts.init(courseParticipationChart.value);
  }

  const xAxisData = evaluationList.value.map((e, i) => e.name);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        return `${params[0].axisValue}<br/>课程参与度：${(params[0].data * 100).toFixed(0)}%`;
      },
      backgroundColor: 'rgba(50,50,50,0.9)',
      textStyle: { color: '#fff' },
      borderWidth: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        rotate: 15
      },
      axisLine: {
        lineStyle: { color: '#999' }
      },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '参与度',
      min: 0,
      max: 1,
      axisLabel: {
        formatter: (value: number) => (value * 100).toFixed(0) + '%',
        fontWeight: 'bold'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#ddd'
        }
      },
      axisLine: { show: false }
    },
    series: [
      {
        name: '课程参与度',
        type: 'line',
        data: courseParticipationData.value,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: {
          color: '#409EFF',
          width: 4,
          shadowColor: 'rgba(64, 158, 255, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        itemStyle: {
          color: '#409EFF',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => (params.data * 100).toFixed(0) + '%',
          fontWeight: 'bold',
          fontSize: 11,
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: [2, 6],
          borderRadius: 10,
          borderColor: '#409EFF',
          borderWidth: 1
        },
        markLine: {
          data: [
            {
              type: 'average',
              name: '平均线',
              lineStyle: {
                color: '#F56C6C',
                type: 'dashed',
                width: 2,
                shadowColor: 'rgba(245, 108, 108, 0.3)',
                shadowBlur: 6
              },
              label: {
                formatter: '平均参与度: {c}%',
                fontWeight: 'bold'
              }
            }
          ]
        },
        smooth: true,
        connectNulls: true,
        step: false
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

    ElMessage.info('正在加载模拟数据...');

    try {
      // 生成模拟数据
      studentKnowledgeData.value = generateMockStudentKnowledge();

      const { participation, courseParticipation } = generateMockParticipationData();
      participationData.value = participation;
      courseParticipationData.value = courseParticipation;

      // 模拟流式输出建议
      await mockStreamOutput();

      // 显示图表区域
      classroomGraphStore.setChartVisible(true);

      // 初始化所有图表
      nextTick(() => {
        initStudentKnowledgeChart();
        initHeatmapChart();
        initCourseParticipationChart();

        ElMessage.success('模拟数据加载完成');
      });

    } catch (error) {
      ElMessage.error('数据加载失败');
      console.error(error);
    }
  }
};

const handleEvaluationChange = (val: number) => {
  selectedEvaluation.value = val;
  initHeatmapChart();

  ElNotification({
    title: '切换评价',
    message: `已切换到${evaluationList.value[val]?.name}`,
    type: 'info',
    duration: 2000
  });
};

const handleClose = () => {
  studentKnowledgeInstance?.dispose();
  heatmapInstance?.dispose();
  courseParticipationInstance?.dispose();
  studentKnowledgeInstance = null;
  heatmapInstance = null;
  courseParticipationInstance = null;
};

const copySuggestion = () => {
  navigator.clipboard.writeText(suggestionText.value);
  ElMessage.success('建议已复制到剪贴板');
};

const regenerateSuggestion = async () => {
  await mockStreamOutput();
  ElMessage.success('建议已重新生成');
};

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
  { prop: 'teacherName', label: '主讲教师' },
  { prop: 'labTeacher', label: '实验教师' },
  { prop: 'practiceTeacher', label: '实践教师' },
  { prop: 'creator', label: '创建人' }
];

const lists = ref(mockCourseList); // 直接使用模拟数据

const addCellStyle = ({ row, column, rowIndex, columnIndex }) => {
  if (column.property === 'classroomName') {
    return {
      color: '#86BFA8',
      textAlign: 'center',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontWeight: 'bold'
    };
  }
  return { textAlign: 'center' };
};

const handleFlushList = () => {
  lists.value = mockCourseList;
  mainStore.setDynamicSearchloading(false);
};

const initList = async () => {
  // 直接使用模拟数据，不调用真实API
  lists.value = mockCourseList;
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
 padding: 20px;
 background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
 border-radius: 12px;
 min-height: 200px;
 font-size: 14px;
 line-height: 1.7;
 color: #2c3e50;
 position: relative;
 box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
 text-align: left; /* 添加这一行 */

 .suggestion-content {
   white-space: pre-wrap;
   word-break: break-word;
   text-align: left; /* 添加这一行 */

   :deep(.suggestion-section) {
     margin-bottom: 20px;
     padding: 16px;
     background: white;
     border-radius: 8px;
     box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
     text-align: left; /* 添加这一行 */

     h4 {
       margin: 0 0 10px 0;
       color: #2c3e50;
       font-size: 16px;
       text-align: left; /* 添加这一行 */
     }

     p {
       margin: 8px 0;
       line-height: 1.6;
       text-align: left; /* 添加这一行 */
     }

     ul, ol {
       margin: 8px 0;
       padding-left: 20px;
       text-align: left; /* 添加这一行 */

       li {
         margin: 4px 0;
         text-align: left; /* 添加这一行 */
       }
     }
   }
 }
 // ... 其他样式保持不变
}
</style>