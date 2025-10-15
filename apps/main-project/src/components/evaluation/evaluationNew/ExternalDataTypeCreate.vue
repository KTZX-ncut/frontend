<template>
  <div class="external-type-container">
    <el-tabs v-model="activeTab" class="tabs">
      <el-tab-pane label="新建类别" name="createType">
        <div class="toolbar">
          <el-button type="primary" @click="openAddDialog">新增类别</el-button>
        </div>

        <el-table :data="typeList" border stripe>
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="name" label="类别名称" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <el-button size="small" @click="editType(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteType(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 新增 / 编辑弹窗 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px">
          <el-form :model="form" label-width="90px">
            <el-form-item label="类别名称">
              <el-input v-model="form.name" placeholder="请输入类别名称" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                type="textarea"
                v-model="form.description"
                placeholder="请输入类别描述"
                rows="3"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveType">保存</el-button>
          </template>
        </el-dialog>
        </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('createType')

// 模拟数据
const typeList = ref([
  { id: 1, name: '外部考试成绩', description: '从外部系统导入的考试数据' },
  { id: 2, name: '竞赛结果', description: '学生参加竞赛成绩' }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新建类别')
const form = reactive({
  id: null,
  name: '',
  description: ''
})

// 打开新增弹窗
function openAddDialog() {
  dialogTitle.value = '新建类别'
  form.id = null
  form.name = ''
  form.description = ''
  dialogVisible.value = true
}

// 编辑类别
function editType(row) {
  dialogTitle.value = '编辑类别'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 保存类别（新增或修改）
function saveType() {
  if (!form.name.trim()) {
    ElMessage.warning('请输入类别名称')
    return
  }

  if (form.id) {
    // 修改
    const index = typeList.value.findIndex(t => t.id === form.id)
    if (index !== -1) typeList.value[index] = { ...form }
    ElMessage.success('修改成功')
  } else {
    // 新增
    const newId = typeList.value.length ? Math.max(...typeList.value.map(t => t.id)) + 1 : 1
    typeList.value.push({ id: newId, name: form.name, description: form.description })
    ElMessage.success('新增成功')
  }

  dialogVisible.value = false
}

// 删除类别
function deleteType(id) {
  ElMessageBox.confirm('确定删除该类别吗？', '提示', { type: 'warning' })
    .then(() => {
      typeList.value = typeList.value.filter(t => t.id !== id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}
</script>

<style scoped>
.external-type-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.toolbar {
  margin-bottom: 12px;
}
.tabs {
  width: 100%;
}
</style>
