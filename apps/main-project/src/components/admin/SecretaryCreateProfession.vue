<template>
  <section class="secretary-manage-page">
    <header class="page-header">
      <div>
        <h2>专业信息</h2>
        <p>维护学校专业目录，新增后可用于课程归属和后续负责人配置。</p>
      </div>
      <el-button :icon="Refresh" :loading="loading.list" @click="loadProfessions">刷新列表</el-button>
    </header>

    <div class="summary-strip">
      <div class="summary-item">
        <span>专业总数</span>
        <strong>{{ professions.length }}</strong>
      </div>
      <div class="summary-item">
        <span>已选择</span>
        <strong>{{ selectedRows.length }}</strong>
      </div>
    </div>

    <section class="panel list-panel">
      <div class="panel-toolbar">
        <div class="panel-title">
          <h3>专业目录</h3>
          <span>共 {{ professions.length }} 个专业</span>
        </div>
        <div class="toolbar-actions">
          <el-button type="primary" :icon="Plus" @click="dialogVisible = true">新增专业</el-button>
          <el-button
            type="danger"
            :icon="Delete"
            :disabled="!selectedRows.length"
            :loading="loading.delete"
            @click="deleteRows(selectedRows)"
          >
            删除所选
          </el-button>
        </div>
      </div>
      <el-table
        :data="professions"
        border
        stripe
        empty-text="暂无专业数据"
        @selection-change="selectedRows = $event"
      >
        <el-table-column type="selection" width="42" />
        <el-table-column prop="proname" label="专业名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="procode" label="专业代码" min-width="110" />
        <el-table-column prop="reachpercent" label="达成阈值" min-width="110" />
        <el-table-column label="专业负责人" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ formatPeople(row.responsiblePersonList) }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button text type="danger" :icon="Delete" @click="deleteRows([row])">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="dialogVisible" title="录入专业信息" width="500px" :close-on-click-modal="false" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="专业名称" prop="proname">
          <el-input v-model="form.proname" placeholder="请输入专业名称" />
        </el-form-item>
        <el-form-item label="专业代码" prop="procode">
          <el-input v-model="form.procode" placeholder="请输入专业代码" />
        </el-form-item>
        <el-form-item label="课程目标达成阈值">
          <el-input v-model="form.reachpercent" placeholder="请输入课程目标达成阈值" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.submit" @click="submitForm">保存专业</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Plus, Refresh } from '@element-plus/icons-vue';
import request from '../../utils/request.js';

const formRef = ref(null);
const professions = ref([]);
const selectedRows = ref([]);
const dialogVisible = ref(false);

const loading = reactive({
  list: false,
  submit: false,
  delete: false
});

const form = reactive({
  proname: '',
  procode: '',
  reachpercent: '',
  remark: ''
});

const rules = reactive({
  proname: [{ required: true, message: '请输入专业名称', trigger: 'blur' }],
  procode: [{ required: true, message: '请输入专业代码', trigger: 'blur' }]
});

const getProfessionId = row => row.id || row.obsid;

const formatPeople = people => (people || []).map(user => user.username).filter(Boolean).join('、') || '-';

const resetForm = () => {
  form.proname = '';
  form.procode = '';
  form.reachpercent = '';
  form.remark = '';
  formRef.value?.clearValidate();
};

const loadProfessions = async () => {
  loading.list = true;
  try {
    const res = await request.admin.get('/sysmangt/professionmangt');
    if (res.code === 200) professions.value = res.data || [];
  } catch (error) {
    ElMessage.error('获取专业列表失败');
  } finally {
    loading.list = false;
  }
};

const submitForm = async () => {
  try {
    await formRef.value?.validate();
    await ElMessageBox.confirm('是否确认新增专业？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    });

    loading.submit = true;
    const res = await request.admin.post('/sysmangt/professionmangt/create', {
      proname: form.proname,
      procode: form.procode,
      reachpercent: form.reachpercent,
      remark: form.remark
    });
    if (res.code === 200) {
      ElMessage.success('新增专业成功');
      dialogVisible.value = false;
      resetForm();
      await loadProfessions();
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '新增专业失败');
    }
  } finally {
    loading.submit = false;
  }
};

const deleteRows = async rows => {
  const ids = rows.map(getProfessionId).filter(Boolean);
  if (!ids.length) {
    ElMessage.info('没有可删除的专业');
    return;
  }

  try {
    await ElMessageBox.confirm(`是否删除选中的 ${ids.length} 个专业？`, '提示', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    });
    loading.delete = true;
    const res = await request.admin.post('/sysmangt/professionmangt/delete', ids);
    if (res.code === 200) {
      ElMessage.success('删除专业成功');
      await loadProfessions();
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '删除专业失败');
    }
  } finally {
    loading.delete = false;
  }
};

onMounted(loadProfessions);
</script>

<style scoped>
.secretary-manage-page {
  min-height: 100%;
  padding: 18px;
  background: #f3f6f8;
}

.page-header,
.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-header {
  position: relative;
  margin-bottom: 12px;
  padding: 20px 22px;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #eef7f3 100%);
  border: 1px solid #dfe7e2;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.page-header h2,
.panel-title h3 {
  margin: 0;
  color: #1f2937;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 700;
}

.page-header p,
.panel-title span {
  margin: 6px 0 0;
  color: #6b7280;
}

.page-header p {
  font-size: 14px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e3e8ef;
  border-radius: 8px;
}

.summary-item span {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 13px;
}

.summary-item strong {
  color: #0f766e;
  font-size: 24px;
  line-height: 1;
}

.panel {
  background: #fff;
  border: 1px solid #e3e8ef;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

.panel-title {
  padding-bottom: 14px;
  margin-bottom: 18px;
  border-bottom: 1px solid #edf1f5;
}

.list-panel {
  min-width: 0;
}

.panel-toolbar {
  margin-bottom: 14px;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 980px) {
  .summary-strip {
    grid-template-columns: 1fr;
  }
}
</style>
