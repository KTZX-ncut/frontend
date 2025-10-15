<template>
  <div class="inner">
    <el-dialog
      class="!h-[600px]"
      :destroy-on-close="true"
      :show-close="true"
      :close-on-click-modal="true"
      style="width: 50vw; padding-top: 0; height: 78vh"
      @close="handleBack"
      v-model="isShow"
      @open="handleShow"
    >
      <h2 style="margin-top: 0">请选择需要绑定的考核项</h2>
      <div class="wrapper">
        <div>
          <el-dropdown>
            <div class="flex items-center justify-between gap-6 mb-4 mt-4">
              <el-input
                title="平时作业"
                style="width: 240px"
                disabled
                :placeholder="props.categoryName"
              />
              <el-tree-select
                v-model="itemType"
                :props="typeProps"
                :data="
                  _.uniqBy(
                    [...testList.testPaper, ...testList.practice].map(i => ({ type: i.itemType })),
                    'type'
                  )
                "
                :render-after-expand="false"
                style="width: 240px"
                :check-on-click-node="true"
                @node-click="data => mapping(data.type)"
                node-key="type"
                placeholder="请选择类别"
              />
            </div>
          </el-dropdown>
        </div>
        <div class="h-[400px] overflow-auto">
          <el-table
            ref="tableRef"
            v-loading="loading"
            :data="filterData"
            @select="handleSelect"
            @selectAll="handleSelectAll"
            style="width: 100%"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column label="作业/实验名称">
              <template #default="scope">
                <div style="display: flex; align-items: center">
                  <span>{{ scope.row.itemName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="类别">
              <template #default="scope">
                <div style="display: flex; align-items: center">
                  <span>{{ scope.row.itemType }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="mt-4">
          <el-button style="margin-right: 10px" @click="handleBack">关闭</el-button>
          <!-- 添加内联样式 -->
          <el-button type="success" @click="submitUpload">绑定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import useItem from '../../../stores/useItem';
import useCourseAim from '../../../stores/useCourseAim';
import useEvaluationNew from '../../../stores/useEvaluationNew';
import { ElMessage } from 'element-plus';
import _, { update } from 'lodash';
const loading = ref(false)

/* ********************变量定义******************** */
// props定义
const props = defineProps({
  classroomId: {
    type: String,
    default: ''
  },
  categoryName: {
    type: String,
    default: '考核项'
  }
});

const defaultProps = {
  children: node => node.children || node.studentDtos, // 子节点字段
  label: node => node.categoryName // 显示文本字段
};

const typeProps = {
  children: node => node.children || node.studentDtos, // 子节点字段
  label: node => node.type
};
// 普通变量
// pinia状态管理
const filterData = ref([]);
const tableRef = ref();
const treeValue = ref();
const itemType = ref();
const inputList = ref([]);
const itemStore = useItem();
const aimStore = useCourseAim();
const typeStore = useEvaluationNew();
const { typeList } = storeToRefs(typeStore);
const { setShow, setCategoryId, fetchBind, fetchTest } = itemStore;
const { isShow, testList, categoryId, objectiveId, courseId } = storeToRefs(itemStore);

const handleBack = () => {
  setShow(false);
};

const handleShow = async () => {
  await fetchTest({ classroomId: props.classroomId });
};

const mapping = type => {
  switch (type) {
    case '作业':
      filterData.value = testList.value.testPaper;
      break;
    case '实验':
      filterData.value = testList.value.practice;
      break;
  }
};

const handleSelectAll = selection => {
  inputList.value = selection.map(i => ({
    ...i,
    categoryId: categoryId.value,
    objectiveId: objectiveId.value
  }));
  console.log(inputList.value);
};

const handleSelect = selection => {
  // console.log(selection);
  inputList.value = selection.map(i => ({
    ...i,
    categoryId: categoryId.value,
    objectiveId: objectiveId.value
  }));
  console.log(inputList.value);
};

const nodeClick = (data, node, event) => {
  // treeValue.value = data.categoryName;
  console.log(data.id);
  setCategoryId(data.id);
};

const submitUpload = async () => {
  if (!categoryId.value || !objectiveId.value) {
    ElMessage({ type: 'warning', message: '请先选择考核类别' });
    tableRef.value.clearSelection();
    return;
  }
  const { code, msg } = await fetchBind(inputList.value);
  await fetchTest({ classroomId: props.classroomId });
  filterData.value = mapping(itemType.value);
  itemType.value = '';
  ElMessage({
    type: code === 200 ? 'success' : 'error',
    message: msg === 'success' ? '绑定成功' : msg
  });
};

/* ********************方法定义******************** */
onBeforeUnmount(() => {
  itemType.value = '';
  treeValue.value = '';
});
</script>

<style lang="less" scoped></style>
