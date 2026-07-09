<template>
  <div class="container">
    <el-header
      style="height: auto; padding: 5px 10px; width: 100%; background-color: #deebf7; display: flex"
    >
      <div class="button">
        <el-button type="primary" @click="exportData" v-blur-on-click>上传数据</el-button>
        <el-button type="primary" @click="handleInsert" v-blur-on-click>删除数据</el-button>
        <el-button type="primary" @click="handleUpload" v-blur-on-click>生成画像</el-button>
      </div>
    </el-header>

    <div class="dragwrapper">
      <el-table
        class="elTable"
        :data="myArray"
        :border="true"
        style="width: 100%"
        :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column label="序号" width="100%">
          <template #default="scope">{{
            myArray.findIndex(item => item.id === scope.row.id) + 1
          }}</template>
        </el-table-column>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="operation" label="操作(拖拽改变顺序)">
          <template #default="scope">
            <el-button @click="handleSingleClick(scope)" type="primary">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <GraphChart :store="portraitStore">
        <template #title>已交作业学生名单</template>
        <template #GraphItem>
          <List
            @close="handleClose"
            :titleList="titleList"
            :listData="portraitStore.submitTestsLists"
          />
        </template>
      </GraphChart>
    </div>
  </div>
</template>

<script setup>
import Sortable from 'sortablejs';
import List from '../PublicCpns/List.vue';
import GraphChart from '../PublicCpns/GraphChart.vue';
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import usePortrait from '../../../stores/dynamicEvaluation/portraitStore';
/* ********************变量定义******************** */
// props定义
// 普通变量
const titles = [];

// TODO:该数组应该放在pinia中共享管理，并且在拖拽结束后更新数组，因为要保持数据顺序
const myArray = ref([
  { name: '作业1', id: 0 },
  { name: '作业2', id: 1 },
  { name: '作业3', id: 2 }
]);

// titleList是固定写死的，定义在PortraitMangt中即可
const titleList = [
  { prop: 'name', label: '姓名' },
  { prop: 'stuno', label: '学号' },
  { prop: 'classno', label: '专业' }
];

// pinia状态管理
const portraitStore = usePortrait();

/* ********************方法定义******************** */

const initSort = () => {
  const table = document.querySelector('.elTable .el-table__body-wrapper tbody');
  Sortable.create(table, {
    group: 'shared',
    animation: 150,
    ghostClass: 'sortable-ghost', //拖拽样式
    easing: 'cubic-bezier(1, 0, 0, 1)',
    onStart: item => {
      console.log(item);
    },

    // 结束拖动事件
    onEnd: item => {
      console.log(item);
      setNodeSort(item.oldIndex, item.newIndex);
    }
  });
};

const setNodeSort = (oldIndex, newIndex) => {
  // 使用arr复制一份表格数组数据
  let arr = myArray.value;
  console.log(arr);
  const currentRow = arr.splice(oldIndex, 1)[0];
  arr.splice(newIndex, 0, currentRow);
  // 原数组置空
  myArray.value = [];
  nextTick(async () => {
    myArray.value = arr;
    // 数据处理
    // ...
    // 提交后后台数据进行排序
    // ...
  });
};

const handleSingleClick = scope => {
  // 此处通过scope中的id或相关信息发送请求得到已交对应作业的学生列表
  portraitStore.setChartVisible(true);
};

const handleClose = () => {
  portraitStore.setSubmitTestsLists([]);
};

const handleSelectAll = () => {};
const handleSelectionChange = () => {};

onMounted(() => {
  initSort();
});
</script>

<style lang="less" scoped>
.container {
  height: 92vh;
  display: flex;
  flex-direction: column;

  .title {
    display: flex;
    height: 15vh;
    flex-direction: row;
    flex-shrink: 0;
    .item {
      flex: 1;
    }
  }
}
</style>
