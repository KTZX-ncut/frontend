<template>
  <div class="external-import-container">
    <h2>外部数据导入与标签管理</h2>

    <!-- 文件上传区域 -->
    <el-form inline class="form-area">
      <el-form-item label="选择类别">
        <el-select v-model="selectedType" placeholder="请选择类别" style="width: 260px">
          <el-option
            v-for="type in typeList"
            :key="type.id"
            :label="type.name"
            :value="type.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          accept=".xlsx,.xls"
        >
          <el-button type="primary">选择 Excel 文件</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button
          type="success"
          :disabled="!file"
          :loading="loading"
          @click="uploadExcel"
        >
          导入 Excel
        </el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <!-- 标签管理部分 -->
    <div class="label-section">
      <div class="label-header">
        <h3>外部考核标签列表</h3>
        <el-button type="primary" @click="openAddDialog">新建标签</el-button>
      </div>

      <el-table :data="labelList" border stripe v-loading="tableLoading">
        <el-table-column prop="id" label="ID" width="160" align="center" />
        <el-table-column prop="labelName" label="标签名称" />
        <el-table-column prop="classroomId" label="课堂ID" />
        <el-table-column label="操作" width="240" align="center">
          <template #default="scope">
            <el-button type="primary" text @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" text @click="deleteLabel(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? '新建标签' : '编辑标签'" width="400px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="标签名称">
          <el-input v-model="form.labelName" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="课堂ID">
          <el-input v-model="form.classroomId" placeholder="请输入课堂ID" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveLabel">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  importExternalAssessment,
  getExternalLabelList,
  addExternalLabel,
  updateExternalLabel,
  deleteExternalLabel
} from '@/api/externalAssessment'

// ---------- 基础变量 ----------
const selectedType = ref(null)
const typeList = ref([
  { id: 1, name: '外部考试成绩' },
  { id: 2, name: '竞赛结果' },
  { id: 3, name: '外部测评数据' }
])
const file = ref(null)
const loading = ref(false)
const tableLoading = ref(false)
const labelList = ref([])

// ---------- 弹窗 ----------
const dialogVisible = ref(false)
const dialogMode = ref('add') // 'add' | 'edit'
const form = ref({
  id: null,
  labelName: '',
  classroomId: ''
})

// ---------- 上传逻辑 ----------
function handleFileChange(uploadFile) {
  file.value = uploadFile.raw
}

async function uploadExcel() {
  if (!selectedType.value) {
    return ElMessage.warning('请先选择类别')
  }
  if (!file.value) return ElMessage.warning('请先选择 Excel 文件')
  ElMessage.info('正在上传...')
  loading.value = true

  try {
    await importExternalAssessment(file.value)
    ElMessage.success('Excel 导入成功')
    getLabelList() // 导入成功后刷新标签列表
  } catch (err) {
    console.error(err)
    ElMessage.error(err?.response?.data?.message || '导入失败')
  } finally {
    loading.value = false
  }
}

// ---------- 标签管理 ----------
async function getLabelList() {
    console.log('调用 getLabelList() 前 token =', sessionStorage.getItem('token'))
  tableLoading.value = true
  try {
    const res = await getExternalLabelList() // ⚠️ 这里暂时可传空或固定值
    labelList.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error(err)
    labelList.value = []
  } finally {
    tableLoading.value = false
  }
}

function openAddDialog() {
  dialogMode.value = 'add'
  form.value = { id: null, labelName: '', classroomId: '' }
  dialogVisible.value = true
}

function openEditDialog(row) {
  dialogMode.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

async function saveLabel() {
  try {
    if (!form.value.labelName) {
      return ElMessage.warning('请输入标签名称')
    }

    if (dialogMode.value === 'add') {
      await addExternalLabel(form.value)
      ElMessage.success('标签添加成功')
    } else {
      await updateExternalLabel(form.value)
      ElMessage.success('标签更新成功')
    }
    dialogVisible.value = false
    getLabelList()
  } catch (err) {
    console.error(err)
    ElMessage.error('保存失败')
  }
}

async function deleteLabel(id) {
  ElMessageBox.confirm('确定要删除该标签吗？', '提示', { type: 'warning' })
    .then(async () => {
      await deleteExternalLabel(id)
      ElMessage.success('删除成功')
      getLabelList()
    })
    .catch(() => {})
}

// ---------- 页面初始化 ----------
onMounted(() => {
  getLabelList(),
  console.log('当前 token:', sessionStorage.getItem('token'))
})
</script>

<style scoped>
.external-import-container {
  padding: 24px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.form-area {
  margin-bottom: 16px;
}

.label-section {
  margin-top: 24px;
}

.label-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
</style>
