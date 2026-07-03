<template>
  <el-dialog
    :destroy-on-close="true"
    :show-close="false"
    :close-on-click-modal="false"
    style="width: 70vw;"
    v-model="visible"
    @close="closeDialog"
  >
    <template #header>
      <span style="font-size: 15px; font-weight: bold;">{{ dialogTitle }}</span>
    </template>

    <div v-if="showTermSelector" style="margin-bottom: 12px;">
      <span style="font-size: 14px; margin-right: 8px;">学期</span>
      <el-select v-model="selectedTermId" placeholder="请选择历史学期" style="width: 240px;" @change="fetchCourses">
        <el-option v-for="term in termList" :key="term.id" :label="term.termname" :value="term.id" />
      </el-select>
    </div>

    <el-table :data="courseList" style="width: 100%;" @selection-change="handleSelectionChange" stripe>
      <el-table-column type="selection" width="40" />
      <el-table-column type="index" width="50" />
      <el-table-column prop="courseChineseName" label="课程名称(中文)" min-width="140" />
      <el-table-column prop="courseEnglishName" label="课程名称(英文)" min-width="140" />
      <el-table-column prop="courseCode" label="课程代码" min-width="90" />
      <el-table-column prop="professionName" label="所属专业" min-width="100" />
    </el-table>

    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" :loading="loading" @click="confirmCopy">复制所选课程</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../../../utils/request.js';

const props = defineProps({
  copyType: { type: String, required: true },
});
const emit = defineEmits(['copySuccess']);

const visible = ref(false);
const loading = ref(false);
const termList = ref([]);
const selectedTermId = ref('');
const courseList = ref([]);
const selectedRows = ref([]);

// 判断是否显示学期选择器（关键字/能力/课程目标/考核项设计 类型直接展示全部课程，不需要学期选择）
const noTermTypes = ['keyword', 'ability', 'courseObjective', 'assessmentCategory', 'ideologyValue', 'ideologyUnit'];
const showTermSelector = computed(() => {
  return !noTermTypes.includes(props.copyType);
});

const titleMap = {
  syllabus: '从历史课程复制教学大纲',
  resource: '从历史课程复制课程资源',
  formative: '复制形成性评价建模',
  achievement: '复制达成性评价建模',
  ideology: '复制思政价值评价建模',
  keyword: '复制关键字',
  ability: '复制能力',
  courseObjective: '复制课程目标',
  assessmentCategory: '复制考核项设计',
  ideologyValue: '复制价值标签',
  ideologyUnit: '复制思政知识单元',
};
const dialogTitle = titleMap[props.copyType] || '从历史课程复制';

async function init() {
  visible.value = true;
  if (showTermSelector.value) {
    // 需要学期选择器的类型：先加载学期列表
    await loadTermList();
  } else {
    // keyword和ability类型：直接加载所有课程
    await fetchAllCourses();
  }
}
defineExpose({ init });

async function loadTermList() {
  try {
    const res = await request.course.get('/coursemangt/course/allterm');
    if (res.code === 200) {
      termList.value = res.data || [];
      if (termList.value.length) {
        selectedTermId.value = termList.value[0].id;
        await fetchCourses(selectedTermId.value);
      }
    } else ElMessage.error(res.msg || '获取学期失败');
  } catch (e) {
    ElMessage.error('获取学期失败');
  }
}

async function fetchCourses(termId) {
  try {
    const res = await request.course.get(`/coursemangt/course/getPreCourseByCode?termId=${termId}`);
    if (res.code === 200) courseList.value = res.data || [];
    else ElMessage.error(res.msg || '获取课程失败');
  } catch (e) {
    ElMessage.error('获取历史课程失败');
  }
}

// 获取所有课程（不按学期过滤）
async function fetchAllCourses() {
  try {
    const res = await request.course.get('/coursemangt/course/getAllCourses');
    if (res.code === 200) courseList.value = res.data || [];
    else ElMessage.error(res.msg || '获取课程失败');
  } catch (e) {
    ElMessage.error('获取课程失败');
  }
}

function handleSelectionChange(selection) {
  selectedRows.value = selection;
}

function closeDialog() {
  visible.value = false;
  selectedTermId.value = '';
  courseList.value = [];
  selectedRows.value = [];
}

async function confirmCopy() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择需要复制的历史课程');
    return;
  }
  if (selectedRows.value.length > 1) {
    ElMessage.warning('只能选择一门课程');
    return;
  }
  const pastCourse = selectedRows.value[0];
  try {
    await ElMessageBox.confirm(
      `复制将覆盖当前课程该模块已有数据，确认从「${pastCourse.courseChineseName}」复制？`,
      '警告',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    );
  } catch {
    return;
  }

  loading.value = true;
  try {
    await doCopy(pastCourse.id);
    ElMessage.success('复制成功');
    emit('copySuccess');
    closeDialog();
  } catch (e) {
    ElMessage.error('复制失败：' + (e.message || e));
  } finally {
    loading.value = false;
  }
}

async function doCopy(pastCourseId) {
  const params = new URLSearchParams({ pastCourseId });
  switch (props.copyType) {
    case 'syllabus':
      return request.course.post(`/coursemangt/instructionalprogram/copy?${params}`);
    case 'resource':
      return request.course.post(`/coursemangt/courseresources/copy?${params}`);
    case 'formative':
      return request.course.post(`/coursemangt/course/copyFormative?pastId=${pastCourseId}`);
    case 'keyword':
      return request.course.post(`/coursemangt/course/copyKeyword?pastId=${pastCourseId}`);
    case 'ability':
      return request.course.post(`/coursemangt/course/copyAbility?pastId=${pastCourseId}`);
    case 'achievement':
      return request.evaluation.post(`/fe/achievement/copy?${params}`);
    case 'courseObjective':
      return request.evaluation.post(`/fe/course-objectives/copy?${params}`);
    case 'assessmentCategory':
      return request.evaluation.post(`/fe/assessment-categories/copy?${params}`);
    case 'ideology':
      return request.evaluation.post(`/evaluation/ideology/value/copy?${params}`);
    case 'ideologyValue':
      return request.evaluation.post(`/evaluation/ideology/value/copyValues?${params}`);
    case 'ideologyUnit':
      return request.evaluation.post(`/evaluation/ideology/value/copyKnowledgeUnit?${params}`);
    default:
      throw new Error('未知的复制类型');
  }
}
</script>
