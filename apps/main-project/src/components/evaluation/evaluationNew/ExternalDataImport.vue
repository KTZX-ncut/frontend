<template>
  <div class="external-import-container">
    <!-- 文件上传区域 -->
    <el-form inline class="form-area">
      <el-form-item label="选择类别">
        <el-select
          @change="handleChange"
          v-model="selectedType"
          placeholder="请选择类别"
          style="width: 260px"
        >
          <el-option
            v-for="type in typeList"
            :key="type.id"
            :label="type.labelName"
            :value="type.labelName"
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
        <el-button type="success" :disabled="!file" :loading="loading" @click="uploadExcel">
          导入 Excel
        </el-button>
      </el-form-item>
    </el-form>

    <el-divider />

    <!-- 标签管理部分 -->
    <div class="label-section">
      <div class="label-header">
        <h3>外部考核数据列表</h3>
      </div>

      <el-table :data="testList" border stripe v-loading="tableLoading">
        <el-table-column prop="index" label="序号" align="center" />
        <el-table-column prop="testName" label="数据名称" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="success" @click="handleShow(scope)"> 查看 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <StuList />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  importExternalAssessment,
  getExternalLabelList,
  addExternalLabel,
  updateExternalLabel,
  deleteExternalLabel
} from '@/api/externalAssessment';
import useLabel, { Label } from '../../../stores/useLabel';
import { storeToRefs } from 'pinia';
import parseJWT from '../../../utils/parseJWT.js';
import StuList from './StuList.vue';

const labelStore = useLabel();
const { fetchLabelList, fetchExternalAssessmentList, setSHow, setId } = labelStore;
const { labelList, externalAssessmentList, isShow } = storeToRefs(labelStore);
const classroomId = parseJWT(sessionStorage.getItem('token')).obsid;
const selectedMap = ref(new Map());

// ---------- 基础变量 ----------
const selectedType = ref(null);
const typeList = ref<Label[]>([]);
const file = ref(null);
const loading = ref(false);
const tableLoading = ref(false);
const testList = ref<any>([]);
const uploadRef = ref();

const handleShow = scope => {
  console.log(scope);
  setId(scope.row.id);
  setSHow(true);
  console.log(isShow);
};

// ---------- 弹窗 ----------
const dialogVisible = ref(false);
const dialogMode = ref('add'); // 'add' | 'edit'
const form = ref({
  id: null,
  labelName: '',
  classroomId: ''
});

// ---------- 上传逻辑 ----------
function handleFileChange(uploadFile: any) {
  file.value = uploadFile.raw;
}

const handleChange = async (value: any) => {
  const id = selectedMap.value.get(value);
  await fetchExternalAssessmentList(id, false);
  testList.value = externalAssessmentList.value.map((e, index) => ({
    index: index + 1,
    testName: e.exAssessmentName,
    id: e.id,
    labelId: e.labelId
  }));
};

// 刷新表格数据
const refreshTableData = async () => {
  if (selectedType.value) {
    tableLoading.value = true;
    try {
      const id = selectedMap.value.get(selectedType.value);
      await fetchExternalAssessmentList(id, false);
      testList.value = externalAssessmentList.value.map((e, index) => ({
        index: index + 1,
        testName: e.exAssessmentName,
        id: e.id,
        labelId: e.labelId
      }));
    } catch (error) {
      console.error('刷新表格数据失败:', error);
      ElMessage.error('刷新数据失败');
    } finally {
      tableLoading.value = false;
    }
  }
};

async function uploadExcel() {
  if (!selectedType.value) {
    return ElMessage.warning('请先选择类别');
  }
  if (!file.value) return ElMessage.warning('请先选择 Excel 文件');
  ElMessage.info('正在上传...');
  loading.value = true;
  console.log(selectedType.value, selectedMap.value.get(selectedType.value));
  console.log(file.value);

  try {
    const { code, msg } = await importExternalAssessment(
      file.value,
      selectedMap.value.get(selectedType.value)
    );
    if (code === 200) {
      ElMessage.success('Excel 导入成功');
    } else {
      ElMessage.error(msg);
    }

    // 上传成功后刷新表格数据
    await refreshTableData();

    // 清空文件选择
    file.value = null;
    if (uploadRef.value) {
      uploadRef.value.clearFiles();
    }
  } catch (err) {
    console.error(err);
    ElMessage.error(err?.response?.data?.message || '导入失败');
  } finally {
    loading.value = false;
  }
}

const handleDelete = (scope: any) => {};

// ---------- 页面初始化 ----------
onMounted(async () => {
  await fetchLabelList(classroomId);
  typeList.value = labelList.value;
  console.log(typeList.value);
  typeList.value.map(t => {
    selectedMap.value.set(t.labelName, t.id);
  });
});
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
