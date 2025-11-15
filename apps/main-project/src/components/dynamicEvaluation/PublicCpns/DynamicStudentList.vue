<template>
  <el-dialog
    :destroy-on-close="true"
    :show-close="true"
    :close-on-click-modal="true"
    style="width: 50vw; padding-top: 0; height: 78vh"
    v-model="props.store.listVisible"
  >
    <h2 style="margin-top: 0">
      <slot name="title">默认学生列表</slot>
    </h2>

    <!-- 学生列表开始 -->
    <div class="stuList-container">
      <el-scrollbar>
        <List
          v-if="props.isDefault"
          :titleList="props.studentListTitle"
          :listData="props.studentList"
          :handleCellClick="props.handleCellClick"
          :addCellStyle="props.addCellStyle"
        />
        <ListWithSelection
          v-else
          :titleList="props.studentListTitle"
          :listData="props.studentList"
          :handleCellClick="props.handleCellClick"
          :addCellStyle="props.addCellStyle"
          :handleSelectAll="props.handleSelectAll"
          :handleSelectionChange="props.handleSelectionChange"
        />
      </el-scrollbar>
    </div>
    <slot name="footer"></slot>
    <!-- 学生列表开始结束 -->
  </el-dialog>
</template>

<script setup>
import ListWithSelection from './ListWithSelection.vue';
import { storeToRefs } from 'pinia';
import useStudentGraph from '../../../stores/dynamicEvaluation/studentGraphStore';
import List from './List.vue';
import { ref, reactive, computed, onMounted, watch } from 'vue';

/* ********************变量定义******************** */
// props定义
const props = defineProps({
  store: {
    type: Object,
    default: () => ({ listVisible: false })
  },
  studentList: {
    type: Array,
    default: () => []
  },
  studentListTitle: {
    type: Array,
    default: () => []
  },
  addCellStyle: {
    type: Function,
    default: ({ row, column, rowIndex, columnIndex }) => ({ textAlign: 'center' })
  },
  handleCellClick: {
    type: Function,
    default: () => ({})
  },
  isDefault: {
    type: Boolean,
    default: true
  },
  handleSelectionChange: {
    type: Function,
    default: () => ({})
  },
  handleSelectAll: {
    type: Function,
    default: () => ({})
  }
});

// 普通变量

// pinia状态管理
const studentGraphStore = useStudentGraph();
const { stuListVisible } = storeToRefs(studentGraphStore);


/* ********************方法定义******************** */
</script>

<style lang="less" scoped>
.stuList-container {
  overflow: auto;
  height: 67vh;
}
</style>
