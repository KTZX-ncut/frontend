<template>
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
    <el-table
      ref="bindTableRef"
      :data="stuList"
      v-loading="loading"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column prop="studentName" label="学生名称" />
      <el-table-column prop="stuScore" label="学生得分" />
      <el-table-column prop="fullScore" label="总分" />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import useLabel from '../../../stores/useLabel';
import { ref, watch } from 'vue';

const labelStore = useLabel();
const { setSHow, fetchStuList } = labelStore;
const { isShow, id, stuList } = storeToRefs(labelStore);

const handleBack = () => setSHow(false);
const handleShow = async () => {
  await fetchStuList(id.value);
};
</script>

<style></style>
