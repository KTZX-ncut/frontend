<template>
  <el-header
    style="height: auto; padding: 5px 0px; width: 100%; background-color: #fff; display: flex"
  >
    <div class="searchInput">
      <el-input
        v-model.lazy="search"
        @input="debouncedQuerySearch"
        placeholder="输入属性名进行检索"
        class="input-with-select"
        style="width: 200px; margin-right: 0.8vw"
      ></el-input>
      <el-button type="primary" @click="querySearch">搜索</el-button>
    </div>
    <el-popover
      class="box-item"
      content="Left Top prompts info"
      placement="left-start"
      trigger="click"
      @hide="handelAdd"
    >
      <template #reference>
        <el-button type="success" style="margin-left: 0.8vw">新增</el-button>
      </template>
      <el-input class="mb-2" v-model="addData.objectiveName" placeholder="课程目标" />
      <el-input class="mb-2" v-model="addData.objectiveDescription" placeholder="备注" />
      <!-- <el-input v-model="addData.weight" placeholder="权重" /> -->
    </el-popover>
    <el-button @click="handleDelAll" type="danger" style="margin-left: 0.8vw">删除</el-button>
  </el-header>

  <div v-if="!aimList.length">暂无数据</div>
  <div v-else>
    <el-table
      v-loading="loading"
      :data="aimList"
      @select="handleSelect"
      @selectAll="handleSelectAll"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="课程目标">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <span>{{ scope.row.objectiveName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="备注">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <span>{{ scope.row.objectiveDescription }}</span>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column label="权重">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <span>{{ scope.row.weight }}</span>
          </div>
        </template>
      </el-table-column> -->
      <el-table-column label="操作">
        <template #default="scope">
          <el-popover
            class="box-item"
            content="Left Top prompts info"
            placement="left-start"
            trigger="click"
            @hide="handleHide(scope)"
            @show="
              () => {
                updateData.objectiveDescription = scope.row.objectiveDescription;
                updateData.objectiveName = scope.row.objectiveName;
                // updateData.weight = scope.row.weight;
              }
            "
          >
            <template #reference>
              <el-button size="small"> 修改 </el-button>
            </template>
            <el-input class="mb-2" v-model="updateData.objectiveName" placeholder="课程目标" />
            <el-input class="mb-2" v-model="updateData.objectiveDescription" placeholder="备注" />
            <!-- <el-input v-model="updateData.weight" placeholder="权重" /> -->
          </el-popover>
          <el-button size="small" type="danger" @click="handleDelete(scope)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import parseJWT from '../../../utils/parseJWT';
import { ElMessage } from 'element-plus';
import { storeToRefs } from 'pinia';
import _ from 'lodash';
import useCourseAim from '../../../stores/useCourseAim';

/* ********************变量定义******************** */
// props定义
// 普通变量
// pinia状态管理
const loading = ref(false);
const search = ref('');
const delList = ref([]);
const aimStore = useCourseAim();
const { fetchAim, fetchAddAim, fetchDelList, fuzzyQuery, fetchUpdateAim } = aimStore;
const { aimList } = storeToRefs(aimStore);
const courseId = parseJWT(sessionStorage.getItem('token')).obsid;
const addData = reactive({
  courseId: '', // 课程ID（必填）
  objectiveName: '', // 目标名称（必填）
  objectiveDescription: '', // 目标描述（可选）
  weight: 0, // 权重，0-1之间（必填）
  sortOrder: 1
});
const updateData = reactive({
  courseId: '', // 课程ID（必填）
  objectiveName: '', // 目标名称（必填）
  objectiveDescription: '', // 目标描述（可选）
  weight: 0, // 权重，0-1之间（必填）
  sortOrder: 1
});

const debouncedQuerySearch = _.debounce(() => {
  querySearch();
}, 500);

const querySearch = async () => {
  if (search.value.length >= 1 || search.value.length === 0) {
    loading.value = true;
    await fuzzyQuery({
      fuzzyQuery: true,
      objectiveName: search.value,
      courseId: addData.courseId
    });
    loading.value = false;
  }
};

const handleHide = async scope => {
  if (
    updateData.objectiveDescription === scope.row.objectiveDescription &&
    updateData.objectiveName === scope.row.objectiveName
    // updateData.weight === scope.row.weight
  ) {
    ElMessage({
      type: 'info',
      message: '暂无修改'
    });
    return;
  }
  updateData.id = scope.row.id;
  if (updateData.typeName === scope.row.objectiveName) {
    delete updateData.objectiveName;
  }
  const score = Number(updateData.weight);
  // if (!(score > 0 && score <= 1)) {
  //   ElMessage({
  //     type: 'warning',
  //     message: '权重应在0-1之间'
  //   });
  //   return;
  // }
  const data = await fetchUpdateAim({
    id: updateData.id,
    objectiveName: updateData.objectiveName,
    objectiveDescription: updateData.objectiveDescription,
    weight: updateData.weight
  });
  await fetchAim({ courseId, current: 1, size: -1 });
  if (data.code === 200) return ElMessage.success('修改成功');
  ElMessage.error(msg);
};

const handleSelect = selection => {
  delList.value = selection.map(i => i.id);
  console.log(delList.value);
};

const handleSelectAll = selection => {
  delList.value = selection.map(i => i.id);
  console.log(delList.value);
};

const handleDelAll = async () => {
  if (!delList.value.length) {
    ElMessage.info('未选择类型名');
    return;
  }
  const data = await fetchDelList({ idList: delList.value });
  if (data.msg === 'success') {
    await fetchAim({ courseId, current: 1, size: -1 });
    ElMessage.success('删除成功');
    return;
  }
  ElMessage.error('删除失败');
};

const handleDelete = async scope => {
  console.log(scope);
  let delList = [scope.row.id];
  const data = await fetchDelList({ idList: delList });
  if (data.msg === 'success') {
    await fetchAim({ courseId, current: 1, size: -1 });
    return ElMessage.success('删除成功');
  }
  ElMessage.error('删除失败');
};

const handelAdd = async () => {
  const score = Number(addData.weight);
  if (!addData.objectiveName) {
    ElMessage({
      type: 'warning',
      message: '课程目标名称，课程目标不可为空'
    });
    return;
  }

  const res = await fetchAddAim({
    courseId,
    objectiveName: addData.objectiveName,
    objectiveDescription: addData.objectiveDescription,
    weight: 1
  });
  if (res.msg === 'success') {
    ElMessage({
      type: 'success',
      message: '添加成功'
    });
  } else {
    ElMessage({
      type: 'error',
      message: res
    });
  }
  await fetchAim({ courseId, current: 1, size: -1 });
};

onMounted(async () => {
  await fetchAim({ courseId, current: 1, size: -1 });
});

/* ********************方法定义******************** */
</script>

<style lang="less" scoped></style>
