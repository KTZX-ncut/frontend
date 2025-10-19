<template>
  <div class="inner">
    <el-dialog
      class="!h-[600px]"
      :destroy-on-close="true"
      :show-close="true"
      :close-on-click-modal="true"
      style="width: 50vw; padding-top: 0; height: 78vh; overflow: auto"
      v-model="isShow"
      @close="handleBack"
      @open="handleShow"
    >
      <!-- 标题与操作按钮 -->
      <div
        class="flex justify-start items-center gap-4 mb-4 overflow-auto"
        style="user-select: none"
      >
        <el-button type="primary" size="small" @click.stop="handleToggle">
          {{ isBindingMode ? '返回查看' : '绑定' }}
        </el-button>
        <h2 style="margin: 0">
          {{ isBindingMode ? '请选择需要绑定的考核项' : '已绑定的考核项' }}
        </h2>
      </div>

      <!-- ========== ✅ 查看模式（支持批量删除） ========== -->
      <div class="overflow-auto" v-if="!isBindingMode">
        <div class="flex justify-between items-center mb-3">
          <h2 style="margin: 0">已绑定的考核项</h2>
          <el-button
            type="danger"
            size="small"
            :disabled="!multipleSelection.length"
            @click="handleBatchDelete"
          >
            取消绑定
          </el-button>
        </div>

        <el-table
          ref="bindTableRef"
          :data="bindList"
          v-loading="loading"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="itemName" label="考核项名称" />
          <el-table-column prop="itemType" label="类型" />
        </el-table>

        <div v-if="!bindList.length" class="text-center text-gray-400 mt-4">暂无已绑定考核项</div>
      </div>

      <!-- ========== 绑定模式（原逻辑保留） ========== -->
      <div v-else>
        <div class="flex items-center justify-between gap-6 mb-4 mt-4">
          <el-input
            title="考核项"
            style="width: 240px"
            disabled
            :placeholder="props.categoryName"
          />
          <el-tree-select
            v-model="itemType"
            :props="typeProps"
            :data="typeOptions"
            :render-after-expand="false"
            style="width: 240px"
            :check-on-click-node="true"
            node-key="type"
            placeholder="请选择类别"
            @node-click="data => mapping(data.type)"
          />
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
                <span>{{ scope.row.itemName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="类别">
              <template #default="scope">
                <span>{{ scope.row.itemType }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="mt-4">
          <el-button style="margin-right: 10px" @click="handleToggle">返回查看</el-button>
          <el-button type="success" @click="submitUpload">绑定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import '../../../assets/css/taildwind.css';
import { ref, onBeforeUnmount, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import useItem from '../../../stores/useItem';
import { ElMessage, ElMessageBox } from 'element-plus';
import _ from 'lodash';
import useLabel from '../../../stores/useLabel';

enum DataSource {
  TestPaper = 0, //作业
  Practice = 1, //实验
  OutRage = 2 //外部
}

const labelStore = useLabel();
const { fetchLabelList, fetchExternalAssessmentList } = labelStore;
const { labelList, externalAssessmentList } = storeToRefs(labelStore);
const labelmap = ref(new Map());

/* ========== props ========== */
const props = defineProps({
  classroomId: { type: String, default: '' },
  categoryName: { type: String, default: '考核项' }
});

/* ========== 状态定义 ========== */
const filterData = ref<any>([]);
const bindList = ref([]);
const tableRef = ref();
const itemType = ref('');
const inputList = ref([]);
const loading = ref(false);
const isBindingMode = ref(false);

/* ✅ 新增批量删除相关状态 */
const multipleSelection = ref([]);
const bindTableRef = ref(null);
const dataSource = ref();

/* ========== 引入 store ========== */
const itemStore = useItem();
const { isShow, testList, categoryId, objectiveId, courseId } = storeToRefs(itemStore);
const { setShow, fetchBind, fetchTest, fetchGetBind, fetchDelBind } = itemStore;

/* ========== 树配置与下拉类型 ========== */
const typeProps = { children: node => node.children, label: node => node.type };
const typeOptions = computed(() => {
  const all = [
    ...(testList.value.testPaper || []),
    ...(testList.value.practice || []),
    ...(labelList.value || [])
  ];
  console.log(all);

  return _.uniqBy(
    all.map(i => ({ type: i.itemType || i.labelName, id: i.id || i.typeId })),
    'type'
  );
});

/* ========== classroomId 自动识别 ========== */
const classroomId = ref('');
onMounted(async () => {
  if (props.classroomId) classroomId.value = props.classroomId;
  else {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) classroomId.value = token;
  }
  await fetchLabelList(classroomId.value);
  console.log(labelList.value);
  labelList.value.map(item => {
    labelmap.value.set(item.labelName, item.id);
  });
});

/* ========== 加载数据 ========== */
const handleShow = async () => {
  console.log('➡️ 打开查看弹窗，加载已绑定数据...');
  loading.value = true;
  await fetchTest({ classroomId: classroomId.value });
  await fetchGetBind(courseId.value, -1, 1, categoryId.value, objectiveId.value);
  bindList.value = itemStore.bindList;
  loading.value = false;
  isBindingMode.value = false;
  console.log(testList.value);
};

/* ========== 模式切换 ========== */
const handleToggle = () => {
  console.log('🟢 点击切换绑定模式');
  isBindingMode.value = !isBindingMode.value;
  if (isBindingMode.value) {
    // console.log('bangding1');
    // mapping(itemType.value || '作业');
    itemType.value = '';
    filterData.value = [];
  } else {
    bindList.value = itemStore.bindList;
  }
};

/* ========== 类型映射逻辑 ========== */
const mapping = async (type: string) => {
  switch (type) {
    case '作业':
      await fetchTest({ classroomId: classroomId.value });
      filterData.value = testList.value.testPaper || [];
      dataSource.value = DataSource.TestPaper;
      break;
    case '实验':
      await fetchTest({ classroomId: classroomId.value });
      filterData.value = testList.value.practice || [];
      dataSource.value = DataSource.Practice;
      break;
    default:
      // TODO: 根据labelName获取对应的测试列表
      await fetchExternalAssessmentList(labelmap.value.get(type));
      console.log(labelmap.value);
      console.log(externalAssessmentList.value);
      filterData.value =
        externalAssessmentList.value.map(e => ({
          itemName: e.exAssessmentName,
          itemType: '外部导入数据',
          categoryId: '', // 类别ID（必填）
          courseId: courseId.value || testList.value.testPaper[0].courseId, // 课程ID（必填）
          classroomId: classroomId.value, // 课堂ID（必填）
          objectiveId: '', // 目标ID（必填）
          typeId: e.id, // 类型ID（必填）
          itemDescription: '', // 考核项描述（可选）
          sortOrder: 1
        })) || [];
      dataSource.value = DataSource.OutRage;
  }
};

/* ========== 多选绑定 ========== */
const handleSelectAll = selection => {
  inputList.value = selection.map(i => ({
    ...i,
    categoryId: categoryId.value,
    objectiveId: objectiveId.value,
    source: dataSource.value
  }));
  console.log(inputList.value);
};
const handleSelect = selection => {
  inputList.value = selection.map(i => ({
    ...i,
    categoryId: categoryId.value,
    objectiveId: objectiveId.value,
    source: dataSource.value
  }));
  console.log(inputList.value);
};

/* ========== 提交绑定 ========== */
const submitUpload = async () => {
  if (!inputList.value.length) {
    ElMessage.info('未选择任何考核项');
    return;
  }
  const { code, msg } = await fetchBind(inputList.value);
  if (code === 200) {
    ElMessage.success('绑定成功');
    await fetchGetBind(courseId.value, -1, 1, categoryId.value, objectiveId.value);
    bindList.value = itemStore.bindList;
    isBindingMode.value = false;
  } else {
    ElMessage.error(msg);
  }
};

/* ========== ✅ 批量删除逻辑 ========== */
const handleSelectionChange = selection => {
  multipleSelection.value = selection;
};

const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    ElMessage.info('请先选择要取消绑定的考核项');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要取消选中的 ${multipleSelection.value.length} 个绑定项吗？`,
      '提示',
      { type: 'warning' }
    );

    const ids = multipleSelection.value.map(item => item.id);
    const res = await fetchDelBind(ids);
    if (res.code === 200) {
      ElMessage.success('批量取消绑定成功');
      await fetchGetBind(courseId.value, -1, 1, categoryId.value, objectiveId.value);
      bindList.value = itemStore.bindList;
      multipleSelection.value = [];
    } else {
      ElMessage.error(res.msg);
    }
  } catch {
    ElMessage.info('已取消操作');
  }
};

/* ========== 返回关闭 ========== */
const handleBack = () => setShow(false);
onBeforeUnmount(() => (itemType.value = ''));
</script>

<style scoped lang="less">
.text-center {
  text-align: center;
}
.text-gray-400 {
  color: #aaa;
}
</style>
