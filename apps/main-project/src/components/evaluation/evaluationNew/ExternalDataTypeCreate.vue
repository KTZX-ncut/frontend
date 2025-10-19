<template>
  <el-header
    style="height: auto; padding: 5px 0px; width: 100%; background-color: #fff; display: flex"
  >
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
      <el-input class="mb-2" v-model="addData.labelName" placeholder="标签名称" />
      <el-input class="mb-2" v-model="addData.remark" placeholder="备注" />
    </el-popover>
    <el-button @click="handleDelAll" type="danger" style="margin-left: 0.8vw">删除</el-button>
  </el-header>

  <div v-if="!!!labelList.length">暂无数据</div>
  <div v-else>
    <el-table
      v-loading="loading"
      :data="labelList"
      @select="handleSelect"
      @selectAll="handleSelectAll"
      style="width: 100%"
    >
      <el-table-column type="selection" />
      <el-table-column label="标签">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <span>{{ scope.row.labelName }}</span>
          </div>
        </template>
      </el-table-column>
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
                updateData.labelName = scope.row.labelName;
              }
            "
          >
            <template #reference>
              <el-button size="small"> 修改 </el-button>
            </template>
            <el-input class="mb-2" v-model="updateData.labelName" placeholder="标签名" />
          </el-popover>
          <el-button size="small" type="danger" @click="handleDelete(scope)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
// import useEvaluationNew from '../../../../stores/useEvaluationNew';
import parseJWT from '../../../utils/parseJWT.js';
import { ElMessage } from 'element-plus';
import { message } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import _, { update } from 'lodash';
import useLabel from '../../../stores/useLabel.js';

/* ********************变量定义******************** */
// props定义
// 普通变量
// pinia状态管理
const loading = ref(false);
const search = ref('');
const delList = ref([]);
const labelStore = useLabel();
const { fetchAddLabel, fetchDelLabel, fetchLabelList, fetchUpdLabel } = labelStore;
const { labelList } = storeToRefs(labelStore);
const classroomId = parseJWT(sessionStorage.getItem('token')).obsid;
const addData = reactive({
  id: '',
  labelName: '',
  remark: ''
});
const updateData = reactive({
  id: '',
  labelName: '',
  remark: ''
});

const handleHide = async (scope: any) => {
  if (updateData.labelName === scope.row.labelName) {
    ElMessage({
      type: 'info',
      message: '暂无修改'
    });
    return;
  }
  updateData.id = scope.row.id;
  if (updateData.labelName === scope.row.labelName) {
    delete updateData.labelName;
  }

  if (!updateData.labelName) {
    ElMessage({
      type: 'warning',
      message: '标签名不可为空'
    });
    return;
  }
  const data = await fetchUpdLabel(updateData.id, updateData.labelName);
  await fetchLabelList(classroomId);
  if (data.code === 200) return ElMessage.success('修改成功');
  ElMessage.error(data.msg);
};

const handleSelect = (selection: any) => {
  delList.value = selection.map(i => i.id);
  console.log(delList.value);
};

const handleSelectAll = (selection: any) => {
  delList.value = selection.map(i => i.id);
  console.log(delList.value);
};

const handleDelAll = async () => {
  if (!delList.value.length) {
    ElMessage.info('未选择类型名');
    return;
  }
  const data = await Promise.all(delList.value.map(async delid => await fetchDelLabel(delid)));

  const allSuccess = data.every(result => result.msg === 'success');
  if (allSuccess) {
    await fetchLabelList(classroomId);
    ElMessage.success('删除成功');
    return;
  }
  ElMessage.error('删除失败');
};

const handleDelete = async (scope: any) => {
  console.log(scope);
  let delList = [scope.row.id];
  const data = await fetchDelLabel(delList[0]);
  // const data = await fetchDelList({ idList: delList });
  if (data.msg === 'success') {
    await fetchLabelList(classroomId);
    // await fetchType({ courseId, current: 1, size: -1 });
    return ElMessage.success('删除成功');
  }
  ElMessage.error('删除失败');
};

const handelAdd = async () => {
  if (!addData.labelName) {
    ElMessage({
      type: 'warning',
      message: '标签名不可为空'
    });
    return;
  }

  const res = await fetchAddLabel(classroomId, addData.labelName);

  // const res = await fetchAddType({
  //   courseId,
  //   categoryName: addData.typeName,
  //   categoryDescription: addData.remark,
  //   score
  // });
  if (res.msg === 'success') {
    ElMessage({
      type: 'success',
      message: '添加成功'
    });
  } else {
    ElMessage({
      type: 'error',
      message: res.msg
    });
  }

  await fetchLabelList(classroomId);
  // await fetchType({ courseId, current: 1, size: -1 });
};

onMounted(async () => {
  // { courseId, current: 1, size: -1 }
  await fetchLabelList(classroomId);
  console.log(labelList.value);
});

/* ********************方法定义******************** */
</script>

<style lang="less" scoped></style>
