<template>
  <section class="secretary-manage-page">
    <header class="page-header">
      <div>
        <h2>班级信息</h2>
        <p>为专业建立行政班级，后续可用于学生归属和课堂学生名单维护。</p>
      </div>
      <el-button :icon="Refresh" :loading="loading.classes" @click="loadClassData">刷新列表</el-button>
    </header>

    <div class="summary-strip">
      <div class="summary-item">
        <span>班级总数</span>
        <strong>{{ classes.length }}</strong>
      </div>
      <div class="summary-item">
        <span>可选专业</span>
        <strong>{{ professions.length }}</strong>
      </div>
      <div class="summary-item">
        <span>已选择</span>
        <strong>{{ selectedRows.length }}</strong>
      </div>
    </div>

    <div class="content-grid">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="panel form-panel">
        <div class="panel-title">
          <h3>录入班级信息</h3>
          <span>选择所属专业后填写班级名称和年级</span>
        </div>
        <el-form-item label="所属专业" prop="professionId">
          <el-select
            v-model="form.professionId"
            placeholder="请选择所属专业"
            filterable
            :loading="loading.professions"
            @focus="loadProfessions"
          >
            <el-option
              v-for="profession in professions"
              :key="profession.id || profession.obsid"
              :label="profession.obsname || profession.proname"
              :value="profession.id || profession.obsid"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级名称" prop="classname">
          <el-input v-model="form.classname" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-select v-model="form.grade" placeholder="请选择年级">
            <el-option v-for="year in recentYears" :key="year" :label="year" :value="year" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注" />
        </el-form-item>
        <div class="form-actions">
          <el-button :icon="Refresh" @click="resetForm">重置</el-button>
          <el-button type="primary" :icon="Plus" :loading="loading.submit" @click="submitForm">
            保存班级
          </el-button>
        </div>
      </el-form>

      <section class="panel list-panel">
        <div class="panel-toolbar">
          <div class="panel-title">
            <h3>班级目录</h3>
            <span>共 {{ classes.length }} 个班级</span>
          </div>
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
        <el-table
          :data="classes"
          border
          stripe
          empty-text="暂无班级数据"
          @selection-change="selectedRows = $event"
        >
          <el-table-column type="selection" width="42" />
          <el-table-column prop="classname" label="班级名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="grade" label="年级" min-width="90" />
          <el-table-column prop="professionName" label="所属专业" min-width="150" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="{ row }">
              <el-button text type="danger" :icon="Delete" @click="deleteRows([row])">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Plus, Refresh } from '@element-plus/icons-vue';
import request from '../../utils/request.js';

const formRef = ref(null);
const professions = ref([]);
const classes = ref([]);
const selectedRows = ref([]);

const loading = reactive({
  professions: false,
  classes: false,
  submit: false,
  delete: false
});

const form = reactive({
  professionId: '',
  classname: '',
  grade: '',
  remark: ''
});

const rules = reactive({
  professionId: [{ required: true, message: '请选择所属专业', trigger: 'change' }],
  classname: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  grade: [{ required: true, message: '请选择年级', trigger: 'change' }]
});

const recentYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
});

const normalizeProfession = item => ({
  id: item.id || item.obsid,
  obsid: item.obsid || item.id,
  obsname: item.obsname || item.proname || item.name
});

const mergeProfessions = list => {
  const map = new Map(professions.value.map(item => [item.id || item.obsid, item]));
  list.map(normalizeProfession).forEach(item => {
    if (item.id && !map.has(item.id)) map.set(item.id, item);
  });
  professions.value = Array.from(map.values());
};

const flattenClasses = data => {
  const rows = [];
  (data || []).forEach(profession => {
    const professionId = profession.id || profession.obsid;
    const professionName = profession.obsname || profession.proname || profession.name;
    (profession.cmClassList || []).forEach(classItem => {
      rows.push({
        ...classItem,
        professionId,
        professionName
      });
    });
  });
  return rows;
};

const resetForm = () => {
  form.professionId = '';
  form.classname = '';
  form.grade = '';
  form.remark = '';
  formRef.value?.clearValidate();
};

const loadProfessions = async () => {
  loading.professions = true;
  try {
    const res = await request.admin.get('/sysmangt/professionmangt');
    if (res.code === 200) mergeProfessions(res.data || []);
  } catch (error) {
    ElMessage.error('获取专业列表失败');
  } finally {
    loading.professions = false;
  }
};

const loadClassData = async () => {
  loading.classes = true;
  try {
    const res = await request.admin.get('/sysmangt/classmangt');
    if (res.code === 200) {
      classes.value = flattenClasses(res.data || []);
      selectedRows.value = [];
    }
  } catch (error) {
    ElMessage.error('获取班级列表失败');
  } finally {
    loading.classes = false;
  }
};

const submitForm = async () => {
  try {
    await formRef.value?.validate();
    await ElMessageBox.confirm('是否确认保存该班级？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    });

    loading.submit = true;
    const res = await request.admin.post('/sysmangt/classmangt/create', {
      id: form.professionId,
      classname: form.classname,
      grade: form.grade,
      remark: form.remark
    });
    if (res.code === 200) {
      ElMessage.success('保存班级成功');
      resetForm();
      await loadClassData();
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '保存班级失败');
    }
  } finally {
    loading.submit = false;
  }
};

const deleteRows = async rows => {
  const ids = rows.map(row => row.id).filter(Boolean);
  if (!ids.length) {
    ElMessage.info('没有可删除的班级');
    return;
  }

  try {
    await ElMessageBox.confirm(`是否删除选中的 ${ids.length} 个班级？`, '提示', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    });
    loading.delete = true;
    const res = await request.admin.post('/sysmangt/classmangt/delete', ids);
    if (res.code === 200) {
      ElMessage.success('删除班级成功');
      await loadClassData();
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '删除班级失败');
    }
  } finally {
    loading.delete = false;
  }
};

onMounted(() => {
  loadClassData();
  loadProfessions();
});
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
  margin-bottom: 12px;
  padding: 20px 22px;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.content-grid {
  display: grid;
  grid-template-columns: minmax(330px, 440px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.list-panel {
  min-width: 0;
}

.panel-toolbar {
  margin-bottom: 14px;
}

.el-select {
  width: 100%;
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .summary-strip {
    grid-template-columns: 1fr;
  }
}
</style>
