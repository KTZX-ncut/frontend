<template>
  <div class="test-list-wrap">
    <Header title="作业管理" :pathData="pathData" />

    <header class="flex-between" style="margin:10px 0">
      <div></div>
      <div>
        <el-button type="primary" @click="openManualPaper">手动组卷</el-button>
        <el-button type="success" @click="openAiPaper">AI智能组卷</el-button>
        <el-button @click="batchDel" :icon="Delete" type="danger" :disabled="!delIds.length">批量删除</el-button>
      </div>
    </header>

    <el-table ref="multipleTableRef" :data="tableData" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column property="name" label="名称" />
      <el-table-column property="questionsCount" label="题数" width="80" />
      <el-table-column property="totalScore" label="总分" width="80" />
      <el-table-column label="类型" width="80">
        <template #default="{ row }">{{ row.catelog === '1' ? '作业' : row.catelog === '2' ? '考试' : '--' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '已发布' : '未发布' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column property="createTime" label="创建时间" width="170" />
      <el-table-column fixed="right" label="操作" width="300">
        <template #default="{ row }">
          <el-button text @click="viewPaper(row)">查看</el-button>
          <el-button text type="primary" v-if="row.status !== 1" @click="publish(row)">发布</el-button>
          <el-button text type="success" v-if="row.status === 1" @click="openScoreSim(row)">模拟得分</el-button>
          <el-button text v-if="row.status === 1" @click="openScoreResult(row)">查看成绩</el-button>
          <el-button text type="danger" @click="del(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination flex-end" style="margin-top:16px">
      <el-pagination
        v-model:currentPage="params.pageIndex" v-model:page-size="params.pageSize"
        :page-sizes="[10,20,30,40]" layout="total,sizes,prev,pager,next,jumper" :total="total"
        @size-change="loadList" @current-change="loadList"
      />
    </div>

    <!-- 查看试卷题目弹窗 -->
    <el-dialog v-model="viewVisible" title="试卷题目" width="700px">
      <div v-for="(q,i) in viewQuestions" :key="i" style="margin-bottom:12px;padding:8px;background:#f5f7fa;border-radius:4px">
        <p><strong>{{i+1}}.</strong> <span v-html="renderLatex(q.content)"></span></p>
        <p style="color:#909399;font-size:13px;margin-top:4px">题型: {{ {'0201':'单选','0202':'多选','0203':'判断','0204':'填空','0205':'简答'}[q.questionTypeId] || q.questionTypeId }} | 难度: {{ q.difficultyLevel==1?'简单':q.difficultyLevel==3?'困难':'中等' }}</p>
      </div>
      <el-empty v-if="!viewQuestions.length" />
    </el-dialog>

    <!-- AI智能组卷弹窗 -->
    <el-dialog v-model="aiPaperVisible" title="AI智能组卷" width="500px">
      <el-form :model="aiPaperForm" label-width="100px">
        <el-form-item label="试卷名称" required><el-input v-model="aiPaperForm.name" placeholder="请输入试卷名称" /></el-form-item>
        <el-form-item label="目标难度" required><el-rate v-model="aiPaperForm.targetDifficulty" :max="3" show-text :texts="['简单','中等','困难']" /></el-form-item>
        <el-form-item label="客观题数量" required><el-input-number v-model="aiPaperForm.objectiveCount" :min="0" :max="50" /></el-form-item>
        <el-form-item label="主观题数量" required><el-input-number v-model="aiPaperForm.subjectiveCount" :min="0" :max="50" /></el-form-item>
        <el-form-item label="类型" required><el-radio-group v-model="aiPaperForm.catelog"><el-radio label="1">作业</el-radio><el-radio label="2">考试</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="aiPaperVisible=false">取消</el-button><el-button type="primary" :loading="aiPaperLoading" @click="handleAiPaper">生成试卷</el-button></template>
    </el-dialog>

    <!-- 手动组卷弹窗 -->
    <el-dialog v-model="manualVisible" title="手动组卷" width="800px">
      <el-form :model="manualForm" label-width="80px" inline>
        <el-form-item label="试卷名称" required><el-input v-model="manualForm.name" style="width:200px" /></el-form-item>
        <el-form-item label="类型" required>
          <el-radio-group v-model="manualForm.catelog"><el-radio label="1">作业</el-radio><el-radio label="2">考试</el-radio></el-radio-group>
        </el-form-item>
      </el-form>
      <el-table :data="manualQuestions" @selection-change="onManualSelect" max-height="400" stripe border style="margin-top:8px">
        <el-table-column type="selection" width="50" />
        <el-table-column type="index" label="#" width="50" />
        <el-table-column label="题目" min-width="250" show-overflow-tooltip prop="content">
          <template #default="{row}">{{ (row.content||'').replace(/<[^>]+>/g,'').substring(0,50) }}</template>
        </el-table-column>
        <el-table-column label="题型" width="80"><template #default="{row}">{{ {'0201':'单选','0202':'多选','0203':'判断','0204':'填空','0205':'简答'}[row.questionTypeId] || row.questionTypeId }}</template></el-table-column>
        <el-table-column label="分值" width="100"><template #default="{row}"><el-input-number v-model="row._score" :min="1" :max="100" size="small" /></template></el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="manualVisible=false">取消</el-button>
        <el-button type="primary" :loading="manualLoading" @click="handleManualGenerate" :disabled="!manualSelected.length">生成 (已选{{manualSelected.length}}题)</el-button>
      </template>
    </el-dialog>

    <!-- 分数模拟弹窗 -->
    <el-dialog v-model="scoreSimVisible" title="模拟学生作答" width="600px">
      <p style="margin-bottom:16px">将对当前课堂的学生进行分数模拟</p>
      <div v-if="scoreSimResult" style="margin-top:16px">
        <el-divider />
        <p>{{ scoreSimResult.questionCount }} 题 × {{ scoreSimResult.studentCount }} 人</p>
        <el-table :data="scoreSimResult.studentScores||[]" max-height="300" stripe border style="margin-top:8px;width:100%">
          <el-table-column type="index" label="#" width="60" align="center" />
          <el-table-column prop="stuName" label="学生" min-width="200" align="center" />
          <el-table-column prop="totalScore" label="总分" width="100" align="center">
            <template #default="{row}"><el-tag :type="row.totalScore>=80?'success':row.totalScore>=60?'warning':'danger'">{{row.totalScore}}</el-tag></template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="scoreSimVisible=false">关闭</el-button>
        <el-button type="primary" :loading="scoreSimLoading" @click="handleScoreSim">开始模拟</el-button>
      </template>
    </el-dialog>

    <!-- 查看历史成绩弹窗 -->
    <el-dialog v-model="resultVisible" title="模拟成绩" width="600px">
      <el-table :data="resultList" stripe border v-loading="resultLoading" max-height="400" style="width:100%">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="stuName" label="学生" align="center" />
        <el-table-column prop="totalScore" label="总分" width="90" align="center">
          <template #default="{row}"><el-tag :type="row.totalScore>=80?'success':row.totalScore>=60?'warning':'danger'">{{row.totalScore}}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{row}"><el-button text type="primary" @click="showDetail(row)">详情</el-button></template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!resultLoading && !resultList.length" description="暂无模拟成绩" />
    </el-dialog>

    <!-- 学生逐题明细弹窗 -->
    <el-dialog v-model="detailVisible" :title="detailStuName + ' 的答题明细'" width="800px">
      <el-table :data="detailQuestions" stripe border max-height="400" style="width:100%">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column label="题目" min-width="400">
          <template #default="{row}"><span v-html="renderLatex(row.content)"></span></template>
        </el-table-column>
        <el-table-column label="满分" width="70" prop="libScore" align="center" />
        <el-table-column label="得分" width="70" prop="libStuScore" align="center" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Delete } from '@element-plus/icons-vue'
import { getPaperList, publishPaper, deletePaper, simulateScores, autoGeneratePaper, manualGeneratePaper, getPaperQuestions, getSimResult, getQuestionGenPage } from '@/api/exam.js'

const renderLatex = (text) => {
  if (!text) return ''
  return text.replace(/\$([\s\S]+?)\$/g, (_, formula) => {
    let f = formula.replace(/\\\\/g, '\\').replace(/（/g, '(').replace(/）/g, ')').trim()
    let displayMode = /\\begin|\\frac|\\\\/.test(f)
    try { return katex.renderToString(f, { throwOnError: false, displayMode }) }
    catch { return f }
  })
}
import Header from '@/views/page/components/header/index.vue'

const tableData = ref([])
const total = ref(0)
const delIds = ref([])
const params = ref({ pageIndex: 1, pageSize: 20 })
const pathData = [{ name: '作业管理', path: '' }]

// 从token自动获取课堂ID
const getClassroomId = () => {
  try { const t = sessionStorage.getItem('token'); return t ? JSON.parse(atob(t.split('.')[1])).obsid || '' : '' } catch { return '' }
}
const classroomId = getClassroomId()

const loadList = () => {
  getPaperList().then(res => {
    if (res.code == '200' || res.code === 200) {
      // 后端返回数组或分页对象，兼容两种情况
      const arr = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      tableData.value = arr
      total.value = Array.isArray(res.data) ? arr.length : (res.data?.recordSize || arr.length)
    }
  })
}
onMounted(loadList)

const handleSelectionChange = (rows) => { delIds.value = rows.map(r => r.id) }

const publish = (row) => {
  ElMessageBox.confirm('确定发布该试卷？', '发布试卷', { type: 'warning' }).then(() => {
    publishPaper(row.id, classroomId).then(res => {
      if (res.code == '200' || res.code === 200) { ElMessage.success('已发布'); loadList() }
      else ElMessage.error(res.msg || '发布失败')
    })
  }).catch(() => {})
}

const del = (row) => {
  ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' }).then(() => {
    deletePaper(row.id).then(res => {
      if (res.code == '200' || res.code === 200) { ElMessage.success('已删除'); loadList() }
    })
  }).catch(() => {})
}

const batchDel = () => {
  ElMessageBox.confirm(`确定删除 ${delIds.value.length} 份试卷？`, '提示', { type: 'warning' }).then(() => {
    Promise.all(delIds.value.map(id => deletePaper(id))).then(() => { ElMessage.success('已删除'); loadList() })
  }).catch(() => {})
}

// ===== 查看试卷 =====
const viewVisible = ref(false)
const viewQuestions = ref([])
const viewPaper = (row) => {
  getPaperQuestions(row.id).then(res => {
    if (res.code == '200' || res.code === 200) { viewQuestions.value = res.data || []; viewVisible.value = true }
  })
}

// ===== 查看历史成绩 =====
const resultVisible = ref(false)
const resultList = ref([])
const resultLoading = ref(false)
const detailVisible = ref(false)
const detailStuName = ref('')
const detailQuestions = ref([])

const openScoreResult = (row) => {
  resultVisible.value = true
  resultList.value = []
  resultLoading.value = true
  getSimResult({ paperId: row.id }).then(res => {
    if (res.code == '200' || res.code === 200) {
      resultList.value = res.data?.students || []
    }
  }).finally(() => { resultLoading.value = false })
}

const showDetail = (row) => {
  detailStuName.value = row.stuName
  detailQuestions.value = row.questions || []
  detailVisible.value = true
}

// ===== 手动组卷 =====
const manualVisible = ref(false)
const manualLoading = ref(false)
const manualQuestions = ref([])
const manualSelected = ref([])
const manualForm = ref({ name: '', catelog: '1' })

const openManualPaper = async () => {
  manualForm.value = { name: '', catelog: '1' }
  manualSelected.value = []
  manualVisible.value = true
  try {
    const res = await getQuestionGenPage({ pageSize: 200 })
    if (res.code == '200' || res.code === 200) {
      manualQuestions.value = (res.data?.data || []).map(q => ({ ...q, _score: 5 }))
    }
  } catch {}
}

const onManualSelect = (rows) => { manualSelected.value = rows }

const handleManualGenerate = () => {
  if (!manualForm.value.name) return ElMessage.warning('请输入试卷名称')
  if (!manualSelected.value.length) return ElMessage.warning('请选择题目')
  manualLoading.value = true
  manualGeneratePaper({
    name: manualForm.value.name,
    catelog: manualForm.value.catelog,
    libIds: manualSelected.value.map(q => q.id),
    scores: manualSelected.value.map(q => q._score || 5)
  }).then(res => {
    if (res.code == '200' || res.code === 200) { ElMessage.success('组卷成功'); manualVisible.value = false; loadList() }
    else ElMessage.error(res.msg || '组卷失败')
  }).finally(() => { manualLoading.value = false })
}

// ===== AI智能组卷 =====
const aiPaperVisible = ref(false)
const aiPaperLoading = ref(false)
const aiPaperForm = ref({ name: '', targetDifficulty: 2, objectiveCount: 5, subjectiveCount: 3, catelog: '1' })
const openAiPaper = () => { aiPaperForm.value = { name: '', targetDifficulty: 2, objectiveCount: 5, subjectiveCount: 3, catelog: '1' }; aiPaperVisible.value = true }
const handleAiPaper = () => {
  if (!aiPaperForm.value.name) return ElMessage.warning('请输入试卷名称')
  aiPaperLoading.value = true
  autoGeneratePaper(aiPaperForm.value).then(res => {
    if (res.code == '200' || res.code === 200) { ElMessage.success('AI组卷成功'); aiPaperVisible.value = false; loadList() }
    else ElMessage.error(res.msg || '组卷失败')
  }).finally(() => { aiPaperLoading.value = false })
}

// ===== 分数模拟 =====
const scoreSimVisible = ref(false)
const scoreSimLoading = ref(false)
const scoreSimResult = ref(null)
let currentSimPaperId = ''
const openScoreSim = (row) => { currentSimPaperId = row.id; scoreSimResult.value = null; scoreSimVisible.value = true }
const handleScoreSim = () => {
  scoreSimLoading.value = true
  simulateScores({ paperId: currentSimPaperId, classroomId }).then(res => {
    if (res.code == '200' || res.code === 200) { scoreSimResult.value = res.data; ElMessage.success('模拟完成') }
    else ElMessage.error(res.msg || '模拟失败')
  }).finally(() => { scoreSimLoading.value = false })
}
</script>

<style scoped>
.test-list-wrap { padding: 0 20px 20px 20px; background: #fff; min-height: 100%; box-sizing: border-box; }
</style>
