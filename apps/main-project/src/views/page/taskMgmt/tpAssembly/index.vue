<template>
  <!-- 试题组卷 -->
  <div class="tpAssembly-type">
    <Header title="试题组卷" :pathData="pathData" />
    <div class="task-msg flex-start">
      <div class="flex-start task-name">
        <span>作业名称</span>
        <el-input v-model="taskName" style="width: 200px;"></el-input>
      </div>
      <div class="flex-start task-name" style="width: 100px;margin-left: 10px;">
        <span>总分</span> <el-input v-model="total" disabled style="min-width: 60px;"></el-input>
      </div>
    </div>

    <div class="cpirse-lib-btn flex-between">
      <el-checkbox label="全选" @change="handleSelectAll"></el-checkbox>
      <div>
        <el-button type="primary" :icon="Plus" style="margin-left: 10px;" @click="openSearch">添加题目</el-button>
        <el-button type="success" @click="openAiPaper">AI智能组卷</el-button>
        <el-button type="danger" :icon="Delete" @click="allDel">批量删除</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </div>
    </div>
    <div class="flex-center" v-if="!taskList?.length">暂无数据</div>
    <vuedraggable v-model="taskList" @start="drag = true" @end="drag = false" item-key="index">
      <template #item="{ element, index }">
        <div class="topic-item">
          <div class="topic-kwa">
            <span class="topic-kwa-item" v-for="(kwa, kwaIdx) in element.lib.kwas" :key="kwaIdx" style="margin-right: 10px">
              {{ kwa.kwaName }}
            </span>
            <span class="topic-kwa-item">{{ TOPICTYPE[element.lib.questionTypeId] }}</span>
          </div>
          <div>
            <span class="flex-start">
              <el-checkbox v-model="element.checkbox" label=""></el-checkbox>
              <!-- <span style="font-size: 13px;"></span> -->
              <span class="topic-title">{{index+1}}、{{ element.lib.title }}（ {{ TOPICTYPE[element.lib.questionTypeId] }} ）</span>
            </span>
            <div class="topic-contents">
              <div v-show="element.lib.content !== '<p><br></p>'" v-html="element.lib.content"></div>
              <div v-for="(answer, answerIdx) in element.lib.answers" :key="answerIdx" class="topic-answer-item">
                {{ String.fromCharCode('A'.charCodeAt() + answerIdx) }}: {{ answer.itemContent }}
                <span v-if="answer.isAnswer">标准答案</span>
              </div>
              <div class="flex-start task-grade">
                <span>分数：</span> 
                <el-input v-model="element.score" @input="(value) => handleScore(value, index)" style="width: 60px;" oninput="value=value.replace(/^0|[^0-9]/g,'')"></el-input>
              </div>
            </div>
          </div>
          <div class="topic-item-icon">
            <span class="topic-item-icon-item" :style="index === 0 ? 'background: #c8c9cb;' : ''"> 
            <el-icon title="上移"  @click="(() => {
              if (index !== 0) {
                swapArrayElements(taskList, index, index - 1)
              }
            })">
              <Top  />
            </el-icon>
            </span>
            <span class="topic-item-icon-item" :style="index === taskList.length - 1 ? 'background: #c8c9cb;' : ''"> 
              <el-icon title="下移"  @click="(() => {
                if (index !== taskList.length - 1) {
                  swapArrayElements(taskList, index, index + 1)
                }
              })">
              <Bottom  />
            </el-icon>
            </span>
            <span class="topic-item-icon-item"> 
              <el-icon @click="del(element)">
                <Delete />
              </el-icon>
            </span>
          </div>
        </div>
      </template>
    </vuedraggable>

    <!-- AI智能组卷弹窗 -->
    <el-dialog v-model="aiPaperVisible" title="AI智能组卷" width="500px">
      <el-form :model="aiPaperForm" label-width="100px">
        <el-form-item label="试卷名称" required><el-input v-model="aiPaperForm.name" placeholder="请输入试卷名称" /></el-form-item>
        <el-form-item label="目标难度" required><el-rate v-model="aiPaperForm.targetDifficulty" :max="3" show-text :texts="['简单','中等','困难']" /></el-form-item>
        <el-form-item label="客观题数量" required><el-input-number v-model="aiPaperForm.objectiveCount" :min="0" :max="50" /></el-form-item>
        <el-form-item label="主观题数量" required><el-input-number v-model="aiPaperForm.subjectiveCount" :min="0" :max="50" /></el-form-item>
        <el-form-item label="类型" required><el-radio-group v-model="aiPaperForm.catelog"><el-radio label="1">作业</el-radio><el-radio label="2">考试</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="aiPaperVisible = false">取消</el-button>
        <el-button type="primary" :loading="aiPaperLoading" @click="handleAiPaper">生成试卷</el-button>
      </template>
    </el-dialog>

    <!-- 无权限显示 -->
    <NoAccessPermission v-if="privilege === 'none'" />
    <Search ref="searchRef" @save="(() => {
      getPreviewDetail()
    })" />
  </div>
</template>

<script setup>
import vuedraggable from "vuedraggable"
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Top, Bottom, Delete, Plus } from '@element-plus/icons-vue'
// import { courseLibTypeSetStatus } from '@/api/courseLib.js'
import { previewDetail, taskSave, taskdel, courseLiWR } from '@/api/taskMgmt.js'
import { autoGeneratePaper, getCourseId } from '@/api/exam.js'
import Header from '@/views/page/components/header/index.vue'
import Search from './components/search/index.vue'
import NoAccessPermission from '@/views/page/components/noAccessPermission/index.vue'
import { swapArrayElements } from '@/utils/index.js'
import { TOPICTYPE } from '@/utils/consts.js'

const router = useRouter()
const route = router.currentRoute.value
let drag = ref(false)
const searchRef = ref(null)
const taskList = ref([])
const taskName = ref('')
const total = ref(0)
const privilege = ref('')

const pathData = [
  {
    name: '作业管理',
    path: '/homes/courseteacherhome/exam/test/testmangt'
  },
  {
    name: '试题组卷',
    path: ''
  },
]

// ===== AI智能组卷 =====
const aiPaperVisible = ref(false)
const aiPaperLoading = ref(false)
const aiPaperForm = ref({ name: '', targetDifficulty: 2, objectiveCount: 5, subjectiveCount: 3, catelog: '1' })
const openAiPaper = () => { aiPaperForm.value = { name: taskName.value || '', targetDifficulty: 2, objectiveCount: 5, subjectiveCount: 3, catelog: '1' }; aiPaperVisible.value = true }
const handleAiPaper = async () => {
  if (!aiPaperForm.value.name) { ElMessage.warning('请输入试卷名称'); return }
  aiPaperLoading.value = true
  try {
    const cRes = await getCourseId()
    const cid = (cRes.code == '200' || cRes.code === 200) ? (cRes.data?.courseId || '') : ''
    if (!cid) { ElMessage.error('无法获取课程ID'); aiPaperLoading.value = false; return }
    const res = await autoGeneratePaper({ ...aiPaperForm.value, courseId: cid })
    if (res.code == '200' || res.code === 200) { ElMessage.success('AI组卷成功'); aiPaperVisible.value = false; router.push('/homes/courseteacherhome/exam/test/testmangt') }
    else ElMessage.error(res.msg || '组卷失败')
  } finally { aiPaperLoading.value = false }
}

const getWR = () => {
  courseLiWR().then(res => {
    if (res.code === '200') {
      privilege.value = res.data
    }
  })
}
const openSearch = () => {
  if (searchRef.value) searchRef.value.init()
}
onMounted(() => {
  getWR()
  getPreviewDetail()
})

const handleSelectAll = (val) => {
  taskList.value.forEach((item) => {
    item.checkbox = val
  })
}

const handleScore = (value, index) => {
  let num = 0
  taskList.value.forEach((item, i) => {
    if (index === i && value >= 1000)  item.score = 1000
    if (item.score) {
      num += Number(item.score)
    }
  })
  total.value = num
}
 
const getPreviewDetail = () => {
  previewDetail(route.query.id).then(res => {
    if (res.code === '200') {
      total.value = res.data.totalScore
      taskName.value = res.data.name
      res.data?.items.forEach((item) => {
        // 设置默认勾选值
        item.checkbox = false
      })
      taskList.value = res.data?.items
    }
  })
}

const del = (row) => {
  const data = {
    paperId: route.query.id,
    libIds: [row.lib.id]
  }
  _taskdel(data, '确认要删除此题目吗?')
}

const allDel = () => {
  const selectTask = taskList.value?.filter((item) => item.checkbox)
  const data = {
    paperId: route.query.id,
    libIds: selectTask?.map((item) => item.lib.id)
  }
  if (!selectTask?.length) return ElMessage.error('请勾选要删除的题目')
  _taskdel(data, '确定删选中的题目?')
}

const _taskdel = (data, title) => {
  ElMessageBox.confirm(
    title,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    taskdel(data).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        getPreviewDetail()
      }
    })
  })
}

const save = () => {
  ElMessageBox.confirm(
    '确定保存吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const questionDtos = taskList.value?.map((item) => {
      return {
        libId: item.lib.id,
        score: Number(item.score || 0)
      }
    })
    const data = {
      id: route.query.id,
      name: taskName.value,
      questionDtos
    }
    taskSave(data).then(res => {
      if (res.code === '200') {
        ElMessage.success('保存成功')
        router.push('/homes/courseteacherhome/exam/test/testmangt')
      }
    })
    console.log('data', data)
  }).catch(() => { })
}

</script>
<style scoped lang="scss">
.tpAssembly-type {
  text-align: left;
  background: #fff;
  padding: 0 10px 10px 10px;
  position: relative;
  color: #000000;
  height: 100%;
  box-sizing: border-box;
}

.task-msg {
  margin-top: 10px;
  width: 400px;
}

.task-msg span {
  font-size: 14px;
  width: 70px;
  text-align: left;
}

.task-name {
  color: #000000;
  margin-bottom: 10px;
}

.topic-item {
  text-align: left;
  margin: 10px 0;
  border-bottom: 1px solid #a9a9a9;
  padding-bottom: 10px;
  position: relative;

  .topic-title {
    font-family: MicrosoftYaHei;
    font-size: 16px !important;
    color: #1B1B1B;
  }

  .topic-item-icon {
    position: absolute;
    right: 10px;
    bottom: 10px;
    // width: 60px;
    font-size: 18px;
    color: #103ccc;
  }

  .topic-answer-item {
    font-size: 14px;

    span {
      font-size: 12px;
      margin-left: 8px;
      color: #409eff;
    }
  }

  .task-grade {
    font-size: 16px;
    position: absolute;
    top: 10px;
    right: 10px;
    color: #1B1B1B;
  }
}

/* .topic-kwa {
  font-size: 13px;
  margin-left: 22px;
}*/
.topic-contents {
  margin-left: 22px;
  font-family: MicrosoftYaHei;
  font-size: 16px;
  color: #1B1B1B;
} 
.topic-kwa {
  width: 98%;
  height: 25px;
  line-height: 25px;
  transform: translateY(5px);
  margin-bottom: 10px;
}

.topic-kwa-item {
  background: #dff2ff;
  border-radius: 5px;
  padding: 3px 10px;
  margin-right: 10px;
  color: #0078cd;
  font-size: 14px;
}

.cpirse-lib-btn {
  padding: 30px 0 10px;
}

.topic-item {
  text-align: left;
  padding: 0 10px;
  position: relative;
  margin-left: 11px;
  border-bottom: 1px solid #EEEEEE !important;
  padding-bottom: 20px;

  .topic-title {
    font-size: 14px;
  }

  .topic-item-icon {
    position: absolute;
    right: 0;
    // width: 60px;
    font-size: 18px;
    color: #103ccc;
    
  }

  .topic-answer-item {
    font-family: MicrosoftYaHei;
    font-size: 16px;
    color: #949494;
    line-height: 30px;

    span {
      font-size: 12px;
      margin-left: 8px;
      color: #019a48;
      background: rgba(50, 177, 108, 0.15);
      border-radius: 5px;
      padding: 3px 10px;
    }
  }
  .topic-course-content {
    font-family: MicrosoftYaHei;
    font-size: 16px;
    color: #1b1b1b;
    line-height: 30px;
  }
}
.flex-start1 {
  align-items: flex-start;
}
.pagination {
  margin-top: 10px;
}
.topic-item-icon-item {
  font-size: 16px;
  color: #fff;
  width: 26px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  background: #27a5ff;
  border-radius: 5px;
  display: inline-block;
  margin-left: 10px;
  cursor: pointer;
}
.topic-item-icon-item-delete {
  background: #ff4c48;
}
</style>
