<template>
  <section class="secretary-manage-page">
    <header class="page-header">
      <div>
        <h2>课程信息</h2>
        <p>为专业补充课程信息，并为课程安排负责人，便于后续课堂建设。</p>
      </div>
      <el-button :icon="Refresh" :loading="loading.courses" @click="loadCourses(true)">刷新列表</el-button>
    </header>

    <div class="summary-strip">
      <div class="summary-item">
        <span>课程总数</span>
        <strong>{{ courses.length }}</strong>
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

    <section class="panel list-panel">
      <div class="panel-toolbar">
        <div class="panel-title">
          <h3>课程目录</h3>
          <span>共 {{ courses.length }} 门课程</span>
        </div>
        <div class="toolbar-actions">
          <el-button type="primary" :icon="Plus" @click="dialogVisible = true">新增课程</el-button>
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
        :data="courses"
        border
        stripe
        empty-text="暂无课程数据"
        @selection-change="selectedRows = $event"
      >
        <el-table-column type="selection" width="42" />
        <el-table-column prop="courseChineseName" label="中文名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="courseEnglishName" label="英文名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="courseCode" label="课程代码" min-width="110" />
        <el-table-column prop="professionName" label="所属专业" min-width="140" show-overflow-tooltip />
        <el-table-column label="课程负责人" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ formatPeople(row.responsiblePersonList) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button text type="danger" :icon="Delete" @click="deleteRows([row])">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="dialogVisible" title="录入课程信息" width="520px" :close-on-click-modal="false" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <!-- <el-form-item label="学期">
          <el-input v-model="form.term" disabled />
        </el-form-item> -->
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
              :key="profession.obsid || profession.id"
              :label="profession.proname || profession.obsname"
              :value="profession.obsid || profession.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开课年份" prop="termYear">
          <el-select v-model="form.termYear" placeholder="请选择年份">
            <el-option v-for="y in yearOptions" :key="y" :label="y + '年'" :value="y" />
          </el-select>
        </el-form-item>
        <el-form-item label="开课学期" prop="termSeason">
          <el-select v-model="form.termSeason" placeholder="请选择学期">
            <el-option label="春季学期" value="春季学期" />
            <el-option label="秋季学期" value="秋季学期" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程名称(中文)" prop="courseChineseName">
          <el-input v-model="form.courseChineseName" placeholder="请输入中文课程名称" />
        </el-form-item>
        <el-form-item label="课程名称(英文)" prop="courseEnglishName">
          <el-input v-model="form.courseEnglishName" placeholder="请输入英文课程名称" />
        </el-form-item>
        <el-form-item label="课程代码" prop="courseCode">
          <el-input v-model="form.courseCode" placeholder="请输入课程代码" />
        </el-form-item>
        <el-form-item label="课程负责人">
          <el-cascader
            v-model="teacherIds"
            :options="teacherOptions"
            placeholder="请选择负责人"
            :props="teacherProps"
            filterable
            clearable
            :show-all-levels="false"
            @focus="loadTeachers"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.submit" @click="submitForm">保存课程</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Plus, Refresh } from '@element-plus/icons-vue';
import request from '../../utils/request.js';

const yearOptions = computed(() => {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = current - 2; y <= current + 4; y++) years.push(String(y));
  return years;
});

const formRef = ref(null);
const professions = ref([]);
const courses = ref([]);
const teacherOptions = ref([]);
const teacherIds = ref([]);
const selectedRows = ref([]);
const dialogVisible = ref(false);

const loading = reactive({
  professions: false,
  teachers: false,
  courses: false,
  submit: false,
  delete: false
});

const form = reactive({
  term: '',
  schoolTermId: '',
  professionId: '',
  termYear: String(new Date().getFullYear()),
  termSeason: '',
  courseChineseName: '',
  courseEnglishName: '',
  courseCode: ''
});

const rules = reactive({
  professionId: [{ required: true, message: '请选择所属专业', trigger: 'change' }],
  termYear: [{ required: true, message: '请选择开课年份', trigger: 'change' }],
  termSeason: [{ required: true, message: '请选择开课学期', trigger: 'change' }],
  courseChineseName: [{ required: true, message: '请输入课程中文名称', trigger: 'blur' }],
  courseEnglishName: [{ required: true, message: '请输入课程英文名称', trigger: 'blur' }],
  courseCode: [{ required: true, message: '请输入课程代码', trigger: 'blur' }]
});

const teacherProps = {
  value: 'id',
  label: 'label',
  children: 'children',
  emitPath: false,
  multiple: true
};

const formatPeople = people => (people || []).map(user => user.username).filter(Boolean).join('、') || '-';

const formatTeacherTree = nodes => {
  const formatNode = node => {
    const children = [];
    if (node.children?.length) children.push(...node.children.map(formatNode).filter(Boolean));
    if (node.responsiblePerson?.length) {
      children.push(...node.responsiblePerson.map(teacher => ({ id: teacher.id, label: teacher.username, isLeaf: true })));
    }
    return children.length ? { ...node, label: node.obsname, children } : null;
  };
  return (nodes || []).map(formatNode).filter(Boolean);
};

const loadCurrentTerm = async () => {
  const storedUserInfo = sessionStorage.getItem('users');
  const userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : {};
  form.term = userInfo.currentterm || '';
  try {
    const res = await request.course.get('/coursemangt/course/currenttermId');
    if (res.code === 200) form.schoolTermId = res.data;
  } catch (error) {
    ElMessage.warning('获取当前学期失败，请确认登录状态和课程服务权限');
  }
};

const loadProfessions = async () => {
  if (professions.value.length) return;
  loading.professions = true;
  try {
    const res = await request.admin.get('/sysmangt/professionmangt');
    if (res.code === 200) professions.value = res.data || [];
  } catch (error) {
    ElMessage.error('获取专业列表失败');
  } finally {
    loading.professions = false;
  }
};

const loadTeachers = async () => {
  if (teacherOptions.value.length) return;
  loading.teachers = true;
  try {
    const res = await request.course.post('/coursemangt/course/courseRP');
    if (res.code === 200) teacherOptions.value = formatTeacherTree(res.data || []);
  } catch (error) {
    ElMessage.error('获取负责人列表失败');
  } finally {
    loading.teachers = false;
  }
};

const loadCourses = async (force = false) => {
  if (courses.value.length && !force) return;
  loading.courses = true;
  try {
    const res = await request.course.get('/coursemangt/course');
    if (res.code === 200) courses.value = res.data || [];
  } catch (error) {
    ElMessage.error('获取课程列表失败');
  } finally {
    loading.courses = false;
  }
};

const resetForm = () => {
  form.professionId = '';
  form.termYear = String(new Date().getFullYear());
  form.termSeason = '';
  form.courseChineseName = '';
  form.courseEnglishName = '';
  form.courseCode = '';
  teacherIds.value = [];
  formRef.value?.clearValidate();
};

const submitForm = async () => {
  try {
    await formRef.value?.validate();
    if (form.term === '默认学期') {
      ElMessage.warning('创建课程前，请先创建学期');
      return;
    }

    await ElMessageBox.confirm('是否确认新增课程？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    });

    loading.submit = true;
    const courseResponse = await request.course.post('/coursemangt/course/create', {
      schooltermId: form.schoolTermId,
      courseChineseName: `${form.termYear}${form.termSeason}-${form.courseChineseName}`,
      courseEnglishName: form.courseEnglishName,
      courseCode: form.courseCode,
      professionId: form.professionId
    });

    if (courseResponse.code === 200) {
      const courseId = courseResponse.data;
      const courseRPs = teacherIds.value.map(userid => ({ userid, obsid: courseId }));
      const courseRPResponse = await request.course.post('/coursemangt/course/courseRP/create', courseRPs);
      if (courseRPResponse.code === 200) {
        ElMessage.success('新增课程成功');
        dialogVisible.value = false;
        resetForm();
        await loadCourses(true);
      }
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '新增课程失败');
    }
  } finally {
    loading.submit = false;
  }
};

const deleteRows = async rows => {
  const ids = rows.map(row => row.id).filter(Boolean);
  if (!ids.length) {
    ElMessage.info('没有可删除的课程');
    return;
  }

  try {
    await ElMessageBox.confirm(`是否删除选中的 ${ids.length} 门课程？`, '提示', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    });
    loading.delete = true;
    const res = await request.course.post('/coursemangt/course/delete', ids);
    if (res.code === 200) {
      ElMessage.success('删除课程成功');
      await loadCourses(true);
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '删除课程失败');
    }
  } finally {
    loading.delete = false;
  }
};

onMounted(() => {
  loadCurrentTerm();
  loadProfessions();
  loadCourses();
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

.panel-toolbar {
  margin-bottom: 14px;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
}

.el-select,
.el-cascader {
  width: 100%;
}

@media (max-width: 980px) {
  .summary-strip {
    grid-template-columns: 1fr;
  }
}
</style>
