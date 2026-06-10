<template>
  <section class="secretary-manage-page">
    <header class="page-header">
      <div>
        <h2>课堂信息</h2>
        <p>为课程建立课堂，补充教师和学时信息，方便后续教学安排。</p>
      </div>
      <el-button :icon="Refresh" :loading="loading.classrooms" @click="loadClassrooms">刷新列表</el-button>
    </header>

    <div class="summary-strip">
      <div class="summary-item">
        <span>课堂总数</span>
        <strong>{{ validClassroomCount }}</strong>
      </div>
      <div class="summary-item">
        <span>关联课程</span>
        <strong>{{ coveredCourseCount }}</strong>
      </div>
      <div class="summary-item">
        <span>已选择</span>
        <strong>{{ selectedRows.length }}</strong>
      </div>
    </div>

    <section class="panel list-panel">
      <div class="panel-toolbar">
        <div class="panel-title">
          <h3>课堂列表</h3>
          <span>共 {{ validClassroomCount }} 个课堂</span>
        </div>
        <div class="toolbar-actions">
          <el-button type="primary" :icon="Plus" @click="dialogVisible = true">新增课堂</el-button>
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
        :data="classrooms"
        border
        stripe
        empty-text="暂无课堂数据"
        @selection-change="selectedRows = $event"
      >
        <el-table-column type="selection" width="42" :selectable="row => Boolean(row.id)" />
        <el-table-column prop="courseChineseName" label="课程名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="classroomName" label="课堂名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="teacherName" label="主讲教师" min-width="120" />
        <el-table-column prop="labTeacher" label="实验教师" min-width="120" />
        <el-table-column prop="practiceTeacher" label="实践教师" min-width="120" />
        <el-table-column label="学时" min-width="130">
          <template #default="{ row }">
            {{ row.teachTime || 0 }}/{{ row.labTime || 0 }}/{{ row.practiceTime || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button text type="danger" :icon="Delete" :disabled="!row.id" @click="deleteRows([row])">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="dialogVisible" title="录入课堂信息" width="520px" :close-on-click-modal="false" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="课程名称" prop="courseId">
          <el-select
            v-model="form.courseId"
            placeholder="请选择课程"
            filterable
            :loading="loading.courses"
            @focus="loadCourses"
          >
            <el-option
              v-for="course in courses"
              :key="course.id"
              :label="course.courseChineseName"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课堂名称" prop="classroomName">
          <el-input v-model="form.classroomName" placeholder="请输入课堂名称" />
        </el-form-item>
        <el-form-item label="讲授学时" prop="teachTime">
          <el-input v-model="form.teachTime" placeholder="请输入讲授学时" />
        </el-form-item>
        <el-form-item label="实验学时" prop="labTime">
          <el-input v-model="form.labTime" placeholder="请输入实验学时" />
        </el-form-item>
        <el-form-item label="实践学时" prop="practiceTime">
          <el-input v-model="form.practiceTime" placeholder="请输入实践学时" />
        </el-form-item>
        <el-form-item label="主讲教师" prop="teacherId">
          <el-cascader
            v-model="form.teacherId"
            :options="teacherOptions"
            placeholder="请选择主讲教师"
            :props="teacherProps"
            filterable
            clearable
            :show-all-levels="false"
            @focus="loadTeachers"
            @change="value => handleTeacherChange('main', value)"
          />
        </el-form-item>
        <el-form-item label="实验教师" prop="labTeacherId">
          <el-cascader
            v-model="form.labTeacherId"
            :options="teacherOptions"
            placeholder="请选择实验教师"
            :props="teacherProps"
            filterable
            clearable
            :show-all-levels="false"
            @focus="loadTeachers"
            @change="value => handleTeacherChange('lab', value)"
          />
        </el-form-item>
        <el-form-item label="实践教师" prop="practiceTeacherId">
          <el-cascader
            v-model="form.practiceTeacherId"
            :options="teacherOptions"
            placeholder="请选择实践教师"
            :props="teacherProps"
            filterable
            clearable
            :show-all-levels="false"
            @focus="loadTeachers"
            @change="value => handleTeacherChange('practice', value)"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading.submit" @click="submitForm">保存课堂</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Plus, Refresh } from '@element-plus/icons-vue';
import request from '../../utils/request.js';
import { useProfileStore } from '../../stores/profileStore.js';

const profileStore = useProfileStore();
const formRef = ref(null);
const courses = ref([]);
const classrooms = ref([]);
const teacherOptions = ref([]);
const selectedRows = ref([]);
const dialogVisible = ref(false);

const loading = reactive({
  courses: false,
  classrooms: false,
  teachers: false,
  submit: false,
  delete: false
});

const teacherNames = reactive({
  main: '',
  lab: '',
  practice: ''
});

const form = reactive({
  courseId: '',
  classroomName: '',
  teachTime: '',
  labTime: '',
  practiceTime: '',
  teacherId: '',
  labTeacherId: '',
  practiceTeacherId: ''
});

const rules = reactive({
  courseId: [{ required: true, message: '请选择课程', trigger: 'change' }],
  classroomName: [{ required: true, message: '请输入课堂名称', trigger: 'blur' }],
  teachTime: [{ required: true, message: '请输入讲授时长', trigger: 'blur' }],
  labTime: [{ required: true, message: '请输入实验时长', trigger: 'blur' }],
  practiceTime: [{ required: true, message: '请输入实践时长', trigger: 'blur' }],
  teacherId: [{ required: true, message: '请选择主讲教师', trigger: 'change' }],
  labTeacherId: [{ required: true, message: '请选择实验教师', trigger: 'change' }],
  practiceTeacherId: [{ required: true, message: '请选择实践教师', trigger: 'change' }]
});

const teacherProps = {
  value: 'id',
  label: 'label',
  children: 'children',
  emitPath: false
};

const selectedCourse = computed(() => courses.value.find(course => course.id === form.courseId));
const validClassroomCount = computed(() => classrooms.value.filter(row => row.id).length);
const coveredCourseCount = computed(() => new Set(classrooms.value.filter(row => row.id).map(row => row.courseId)).size);

const flattenClassrooms = data => {
  const rows = [];
  (data || []).forEach(course => {
    const classroomsOfCourse = course.classroomReqList || [];
    if (!classroomsOfCourse.length) {
      rows.push({
        courseId: course.id,
        courseChineseName: course.courseChineseName,
        classroomName: '',
        id: ''
      });
      return;
    }
    classroomsOfCourse.forEach(classroom => {
      rows.push({
        courseId: course.id,
        courseChineseName: course.courseChineseName,
        ...classroom
      });
    });
  });
  return rows;
};

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

const findNodeById = (nodes, id) => {
  for (const node of nodes || []) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
};

const loadCourses = async () => {
  if (courses.value.length) return;
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

const loadClassrooms = async () => {
  loading.classrooms = true;
  try {
    const res = await request.course.get('/coursemangt/classroom');
    if (res.code === 200) classrooms.value = flattenClassrooms(res.data || []);
  } catch (error) {
    ElMessage.error('获取课堂列表失败');
  } finally {
    loading.classrooms = false;
  }
};

const loadTeachers = async () => {
  if (teacherOptions.value.length) return;
  loading.teachers = true;
  try {
    const res = await request.course.post('/coursemangt/course/courseRP');
    if (res.code === 200) teacherOptions.value = formatTeacherTree(res.data || []);
  } catch (error) {
    ElMessage.error('获取教师列表失败');
  } finally {
    loading.teachers = false;
  }
};

const handleTeacherChange = (type, value) => {
  const node = findNodeById(teacherOptions.value, value);
  teacherNames[type] = node?.label || '';
};

const resetForm = () => {
  form.courseId = '';
  form.classroomName = '';
  form.teachTime = '';
  form.labTime = '';
  form.practiceTime = '';
  form.teacherId = '';
  form.labTeacherId = '';
  form.practiceTeacherId = '';
  teacherNames.main = '';
  teacherNames.lab = '';
  teacherNames.practice = '';
  formRef.value?.clearValidate();
};

const submitForm = async () => {
  try {
    await formRef.value?.validate();
    await ElMessageBox.confirm('是否确认新增课堂？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    });

    loading.submit = true;
    const res = await request.course.post('/coursemangt/classroom/create', {
      courseId: form.courseId,
      classroomName: form.classroomName,
      creatorName: profileStore.profilename,
      teacherId: form.teacherId,
      teacherName: teacherNames.main,
      labTeacherId: form.labTeacherId,
      labTeacher: teacherNames.lab,
      practiceTeacherId: form.practiceTeacherId,
      practiceTeacher: teacherNames.practice,
      teachTime: form.teachTime,
      labTime: form.labTime,
      practiceTime: form.practiceTime
    });

    if (res.code === 200) {
      ElMessage.success(`新增课堂成功：${selectedCourse.value?.courseChineseName || ''}`);
      dialogVisible.value = false;
      resetForm();
      await loadClassrooms();
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '新增课堂失败');
    }
  } finally {
    loading.submit = false;
  }
};

const deleteRows = async rows => {
  const ids = rows.map(row => row.id).filter(Boolean);
  if (!ids.length) {
    ElMessage.info('所选内容中没有可删除的课堂');
    return;
  }

  try {
    await ElMessageBox.confirm(`是否删除选中的 ${ids.length} 个课堂？`, '提示', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    });
    loading.delete = true;
    const res = await request.course.post('/coursemangt/classroom/delete', ids);
    if (res.code === 200) {
      ElMessage.success('删除课堂成功');
      await loadClassrooms();
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '删除课堂失败');
    }
  } finally {
    loading.delete = false;
  }
};

onMounted(() => {
  loadCourses();
  loadClassrooms();
  loadTeachers();
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
