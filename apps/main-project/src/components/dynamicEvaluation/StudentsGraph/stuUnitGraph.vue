<template>
  <div class="student-capability-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>学生综合能力总览表</h2>
      <div class="filter-area">
        <el-select v-model="selectedClass" placeholder="选择班级" clearable @change="filterData" style="width: 180px">
          <el-option
              v-for="item in classOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
        <el-input
            v-model="searchKeyword"
            placeholder="请输入姓名或学号检索"
            :prefix-icon="Search"
            clearable
            @input="filterData"
            style="width: 250px; margin-left: 15px"
        />
      </div>
    </div>

    <!-- 表格区域 - 只展示班级、姓名、综合能力 -->
    <el-table
        :data="filteredTableData"
        border
        stripe
        style="width: 100%"
        :cell-style="addCellStyle"
        @cell-click="handleCellClick"
        v-loading="loading"
    >
      <el-table-column prop="className" label="班级" width="200" align="center" />
      <el-table-column prop="studentName" label="姓名" width="150" align="center" />
      <el-table-column prop="studentNo" label="学号" width="180" align="center" />
      <el-table-column prop="comprehensiveScore" label="综合能力" width="150" align="center">
        <template #default="{ row }">
          <el-tag :type="getScoreType(row.comprehensiveScore)" effect="dark" round size="large">
            {{ row.comprehensiveScore }}分
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
    />

    <!-- 学生雷达图弹窗 - 两个雷达图并排 -->
    <el-dialog
        v-model="dialogVisible"
        :title="`学生综合能力雷达图：${currentStudent.className} - ${currentStudent.studentName}(${currentStudent.studentNo})`"
        width="1200px"
        destroy-on-close
        :close-on-click-modal="false"
        @closed="handleDialogClosed"
    >
      <div class="radar-dialog-content">
        <!-- 时间轴控制 -->
        <div class="timeline-control" v-if="totalTimes > 1">
          <span class="timeline-label">评价时间轴：</span>
          <el-button-group>
            <el-button :icon="ArrowLeft" size="small" @click="prevTime" :disabled="currentTimeIndex === 0" />
            <el-button size="small" disabled>{{ currentTimeIndex + 1 }} / {{ totalTimes }}</el-button>
            <el-button :icon="ArrowRight" size="small" @click="nextTime" :disabled="currentTimeIndex === totalTimes - 1" />
          </el-button-group>
          <span class="timeline-info" v-if="attendEvalList.length">
            已参与{{ attendEvalList.length }}次评价
          </span>
        </div>

        <!-- 两个雷达图并排 -->
        <div class="radar-row">
          <!-- 潜力雷达图 -->
          <div class="radar-item">
            <h3 class="radar-title">📈 潜力维度分析</h3>
            <div class="radar-chart-container" ref="potentialRadarRef" style="width: 100%; height: 350px;"></div>
            <div class="indicator-list">
              <div class="indicator-item" v-for="item in potentialIndicators" :key="item.name">
                <span class="indicator-dot" :style="{ backgroundColor: item.color }"></span>
                <span class="indicator-name">{{ item.name }}</span>
              </div>
            </div>
          </div>

          <!-- 适应能力雷达图 -->
          <div class="radar-item">
            <h3 class="radar-title">🔄 适应能力维度分析</h3>
            <div class="radar-chart-container" ref="adaptabilityRadarRef" style="width: 100%; height: 350px;"></div>
            <div class="indicator-list">
              <div class="indicator-item" v-for="item in adaptabilityIndicators" :key="item.name">
                <span class="indicator-dot" :style="{ backgroundColor: item.color }"></span>
                <span class="indicator-name">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部说明 -->
        <div class="radar-footer">
          <p class="score-description">* 各项指标满分为100分，分数越高表示能力越强</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 图表实例
const potentialRadarRef = ref(null)
const adaptabilityRadarRef = ref(null)
let potentialChart = null
let adaptabilityChart = null

// 加载状态
const loading = ref(false)

// 班级选项
const classOptions = ref([
  { value: '自动化22-1', label: '自动化22-1班' },
  { value: '自动化22-2', label: '自动化22-2班' },
  { value: '自动化22-3', label: '自动化22-3班' },
  { value: '自动化22-4', label: '自动化22-4班' }
])

// 潜力指标
const potentialIndicators = [
  { name: '学习敏锐度与初次认识效能', color: '#86BFA8' },
  { name: '知识迁移率与巩固速率', color: '#5CAF8C' },
  { name: '挑战偏好与学术韧性', color: '#409EFF' },
  { name: '学习稳定性与持续投入度', color: '#E6A23C' }
]

// 适应能力指标
const adaptabilityIndicators = [
  { name: '难度适应系数', color: '#9B59B6' },
  { name: '知识广度与深度适应性', color: '#F56C6C' },
  { name: '知识迁移速率', color: '#3498DB' },
  { name: '错误后提升率', color: '#E67E22' },
  { name: '答题稳定性', color: '#2ECC71' }
]

// 学生数据
const allStudentData = ref([
  // 自动化22-1班
  { id: 1, className: '自动化22-1', studentName: '仇利东', studentNo: '202201001', comprehensiveScore: 95 },
  { id: 2, className: '自动化22-1', studentName: '王芳', studentNo: '202201002', comprehensiveScore: 88 },
  { id: 3, className: '自动化22-1', studentName: '李娜', studentNo: '202201003', comprehensiveScore: 92 },
  { id: 4, className: '自动化22-1', studentName: '刘洋', studentNo: '202201004', comprehensiveScore: 78 },
  { id: 5, className: '自动化22-1', studentName: '陈静', studentNo: '202201005', comprehensiveScore: 85 },
  // 自动化22-2班
  { id: 6, className: '自动化22-2', studentName: '赵磊', studentNo: '202202001', comprehensiveScore: 91 },
  { id: 7, className: '自动化22-2', studentName: '孙俪', studentNo: '202202002', comprehensiveScore: 82 },
  { id: 8, className: '自动化22-2', studentName: '周杰', studentNo: '202202003', comprehensiveScore: 96 },
  { id: 9, className: '自动化22-2', studentName: '吴京', studentNo: '202202004', comprehensiveScore: 75 },
  { id: 10, className: '自动化22-2', studentName: '郑爽', studentNo: '202202005', comprehensiveScore: 89 },
  // 自动化22-3班
  { id: 11, className: '自动化22-3', studentName: '林心如', studentNo: '202203001', comprehensiveScore: 93 },
  { id: 12, className: '自动化22-3', studentName: '苏有朋', studentNo: '202203002', comprehensiveScore: 84 },
  { id: 13, className: '自动化22-3', studentName: '古天乐', studentNo: '202203003', comprehensiveScore: 79 },
  { id: 14, className: '自动化22-3', studentName: '刘德华', studentNo: '202203004', comprehensiveScore: 97 },
  { id: 15, className: '自动化22-3', studentName: '张学友', studentNo: '202203005', comprehensiveScore: 86 },
  // 自动化22-4班
  { id: 16, className: '自动化22-4', studentName: '郭富城', studentNo: '202204001', comprehensiveScore: 90 },
  { id: 17, className: '自动化22-4', studentName: '黎明', studentNo: '202204002', comprehensiveScore: 81 },
  { id: 18, className: '自动化22-4', studentName: '王菲', studentNo: '202204003', comprehensiveScore: 94 },
  { id: 19, className: '自动化22-4', studentName: '那英', studentNo: '202204004', comprehensiveScore: 77 },
  { id: 20, className: '自动化22-4', studentName: '孙楠', studentNo: '202204005', comprehensiveScore: 87 }
])

// 筛选相关
const selectedClass = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 计算过滤后的数据
const filteredTotal = computed(() => {
  let filtered = allStudentData.value
  if (selectedClass.value) filtered = filtered.filter(item => item.className === selectedClass.value)
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item =>
        item.studentName.toLowerCase().includes(keyword) ||
        item.studentNo.includes(keyword)
    )
  }
  return filtered.length
})

const filteredTableData = computed(() => {
  let filtered = allStudentData.value
  if (selectedClass.value) filtered = filtered.filter(item => item.className === selectedClass.value)
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item =>
        item.studentName.toLowerCase().includes(keyword) ||
        item.studentNo.includes(keyword)
    )
  }
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// 弹窗相关
const dialogVisible = ref(false)
const currentStudent = reactive({
  id: '',
  studentName: '',
  className: '',
  studentNo: ''
})

// 时间轴相关
const totalTimes = ref(5)
const currentTimeIndex = ref(4)
const attendEvalList = ref([1, 2, 3, 4, 5])

// 生成潜力雷达图数据
const generatePotentialData = (studentId, timeIndex) => {
  const baseSeed = parseInt(studentId) || 1
  const timeFactor = (timeIndex + 1) * 0.1
  return [
    Math.min(98, 70 + (baseSeed % 20) + timeFactor * 10), // 学习敏锐度
    Math.min(96, 65 + (baseSeed % 25) + timeFactor * 8),  // 知识迁移率
    Math.min(95, 60 + (baseSeed % 30) + timeFactor * 7),  // 挑战偏好
    Math.min(94, 68 + (baseSeed % 22) + timeFactor * 6)   // 学习稳定性
  ]
}

// 生成适应能力雷达图数据
const generateAdaptabilityData = (studentId, timeIndex) => {
  const baseSeed = parseInt(studentId) || 1
  const timeFactor = (timeIndex + 1) * 0.1
  return [
    Math.min(97, 72 + (baseSeed % 18) + timeFactor * 9),  // 难度适应系数
    Math.min(96, 70 + (baseSeed % 20) + timeFactor * 8),  // 知识广度与深度适应性
    Math.min(95, 68 + (baseSeed % 22) + timeFactor * 7),  // 知识迁移速率
    Math.min(94, 65 + (baseSeed % 24) + timeFactor * 6),  // 错误后提升率
    Math.min(93, 75 + (baseSeed % 15) + timeFactor * 5)   // 答题稳定性
  ]
}

// 初始化潜力雷达图
const initPotentialRadar = () => {
  if (!potentialRadarRef.value) return
  nextTick(() => {
    if (potentialChart) potentialChart.dispose()
    potentialChart = echarts.init(potentialRadarRef.value)

    const currentData = generatePotentialData(currentStudent.id, currentTimeIndex.value)

    const option = {
      radar: {
        indicator: potentialIndicators.map(item => ({ name: item.name, max: 100 })),
        center: ['50%', '50%'],
        radius: '65%',
        name: {
          textStyle: {
            color: '#2c3e50',
            fontSize: 11,
            borderRadius: 3,
            padding: [2, 4]
          }
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(134, 191, 168, 0.02)', 'rgba(134, 191, 168, 0.05)']
          }
        }
      },
      series: [{
        type: 'radar',
        data: [{
          value: currentData,
          name: currentStudent.studentName,
          areaStyle: { color: 'rgba(134, 191, 168, 0.3)' },
          lineStyle: { color: '#86BFA8', width: 2 },
          itemStyle: { color: '#5CAF8C' }
        }],
        symbol: 'circle',
        symbolSize: 6,
        label: {
          show: true,
          formatter: (params) => params.value,
          position: 'top',
          fontSize: 10,
          color: '#2c3e50'
        }
      }]
    }
    potentialChart.setOption(option)
  })
}

// 初始化适应能力雷达图
const initAdaptabilityRadar = () => {
  if (!adaptabilityRadarRef.value) return
  nextTick(() => {
    if (adaptabilityChart) adaptabilityChart.dispose()
    adaptabilityChart = echarts.init(adaptabilityRadarRef.value)

    const currentData = generateAdaptabilityData(currentStudent.id, currentTimeIndex.value)

    const option = {
      radar: {
        indicator: adaptabilityIndicators.map(item => ({ name: item.name, max: 100 })),
        center: ['50%', '50%'],
        radius: '65%',
        name: {
          textStyle: {
            color: '#2c3e50',
            fontSize: 11,
            borderRadius: 3,
            padding: [2, 4]
          }
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(155, 89, 182, 0.02)', 'rgba(155, 89, 182, 0.05)']
          }
        }
      },
      series: [{
        type: 'radar',
        data: [{
          value: currentData,
          name: currentStudent.studentName,
          areaStyle: { color: 'rgba(155, 89, 182, 0.3)' },
          lineStyle: { color: '#9B59B6', width: 2 },
          itemStyle: { color: '#8E44AD' }
        }],
        symbol: 'circle',
        symbolSize: 6,
        label: {
          show: true,
          formatter: (params) => params.value,
          position: 'top',
          fontSize: 10,
          color: '#2c3e50'
        }
      }]
    }
    adaptabilityChart.setOption(option)
  })
}

// 时间轴控制
const prevTime = () => {
  if (currentTimeIndex.value > 0) {
    currentTimeIndex.value--
    if (!attendEvalList.value.includes(currentTimeIndex.value + 1)) {
      ElMessage.warning(`第${currentTimeIndex.value + 1}次评价未参与`)
    }
    refreshCharts()
  }
}

const nextTime = () => {
  if (currentTimeIndex.value < totalTimes.value - 1) {
    currentTimeIndex.value++
    if (!attendEvalList.value.includes(currentTimeIndex.value + 1)) {
      ElMessage.warning(`第${currentTimeIndex.value + 1}次评价未参与`)
    }
    refreshCharts()
  }
}

const refreshCharts = () => {
  initPotentialRadar()
  initAdaptabilityRadar()
}

// 单元格样式
const addCellStyle = ({ column }) => {
  if (column.property === 'studentName') {
    return {
      color: '#86BFA8',
      textAlign: 'center',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontWeight: 'bold'
    }
  }
  return { textAlign: 'center' }
}

// 获取分数标签类型
const getScoreType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 70) return 'warning'
  return 'danger'
}

// 单元格点击
const handleCellClick = (row, column) => {
  if (column.property === 'studentName') {
    currentStudent.id = row.id
    currentStudent.studentName = row.studentName
    currentStudent.className = row.className
    currentStudent.studentNo = row.studentNo

    // 根据学生ID模拟不同的评价参与情况
    const seed = parseInt(row.id) || 1
    if (seed % 3 === 0) {
      attendEvalList.value = [1, 3, 5]
    } else if (seed % 3 === 1) {
      attendEvalList.value = [1, 2, 3, 4, 5]
    } else {
      attendEvalList.value = [2, 4, 5]
    }
    totalTimes.value = 5
    currentTimeIndex.value = attendEvalList.value[attendEvalList.value.length - 1] - 1

    dialogVisible.value = true
    ElMessage.success(`正在查看${row.studentName}的能力雷达图`)
  }
}

// 弹窗关闭
const handleDialogClosed = () => {
  if (potentialChart) {
    potentialChart.dispose()
    potentialChart = null
  }
  if (adaptabilityChart) {
    adaptabilityChart.dispose()
    adaptabilityChart = null
  }
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const filterData = () => {
  currentPage.value = 1
}

// 监听弹窗
watch(dialogVisible, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      refreshCharts()
    }, 100)
  }
})

// 窗口大小变化
const handleResize = () => {
  if (dialogVisible.value) {
    if (potentialChart) potentialChart.resize()
    if (adaptabilityChart) adaptabilityChart.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (potentialChart) potentialChart.dispose()
  if (adaptabilityChart) adaptabilityChart.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.student-capability-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 20px;
  }
}

.radar-dialog-content {
  .timeline-control {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;

    .timeline-label {
      margin-right: 15px;
      font-weight: bold;
      color: #606266;
    }

    .timeline-info {
      margin-left: 15px;
      color: #86BFA8;
    }
  }

  .radar-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .radar-item {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      .radar-title {
        margin: 0 0 15px 0;
        color: #2c3e50;
        font-size: 16px;
        text-align: center;
      }
    }
  }

  .indicator-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px dashed #e4e7ed;

    .indicator-item {
      display: flex;
      align-items: center;
      margin-right: 15px;

      .indicator-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 5px;
      }

      .indicator-name {
        font-size: 12px;
        color: #606266;
      }
    }
  }

  .radar-footer {
    text-align: center;
    margin-top: 10px;

    .score-description {
      margin: 0;
      color: #909399;
      font-size: 12px;
    }
  }
}

:deep(.el-table) {
  th {
    background-color: #f5f7fa;
    color: #2c3e50;
    font-weight: bold;
  }

  .el-tag {
    font-size: 14px;
    padding: 0 12px;
  }
}
</style>