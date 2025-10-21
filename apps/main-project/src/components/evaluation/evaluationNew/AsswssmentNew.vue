<template>
  <el-header
    style="height: auto; padding: 5px 0px; width: 100%; background-color: #fff; display: flex"
  >
    <div class="searchInput">
      <el-input
        v-model.lazy="search"
        @input="debouncedQuerySearch"
        placeholder="输入课程目标名称进行检索"
        class="input-with-select"
        style="width: 200px; margin-right: 0.8vw"
      ></el-input>
      <el-button type="primary" @click="querySearch">搜索</el-button>
    </div>
    <el-button @click="handleLook" type="danger" style="margin-left: 0.8vw"
      >点击查看已参与考核项</el-button
    >
  </el-header>

  <div v-if="!aimList.length">暂无数据</div>
  <div v-else>
    <div class="h-[800px] overflow-auto" style="width: 100%">
      <el-table
        v-loading="loading"
        :data="aimList"
        @select="handleSelect"
        @selectAll="handleSelectAll"
        style="width: 100%; min-width: 800px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="课程目标名称">
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
        <el-table-column label="操作">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-button size="small" @click="handleClick(scope)"> 绑定考核项 </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <Test
        :classroomId="classroomId"
        v-show="testList.practice.length || testList.testPaper.length"
        :objectiveId="objectiveId"
      />
      <TypeItem v-if="bindList.length" />
    </div>
  </div>
</template>

<script setup>
import Test from './Test.vue';
import { onMounted, ref } from 'vue';
import useItem from '../../../stores/useItem';
import { storeToRefs } from 'pinia';
import parseJWT from '../../../utils/parseJWT';
import useCourseAim from '../../../stores/useCourseAim';
import useEvaluationNew from '../../../stores/useEvaluationNew';
import TypeItem from './TypeItem.vue';
import _, { update } from 'lodash';
import { ElMessage } from 'element-plus';

/* ********************变量定义******************** */
// props定义
// 普通变量
// pinia状态管理
const loading = ref(false);
const search = ref('');
const itemStore = useItem();
const aimStore = useCourseAim();
const typeStore = useEvaluationNew();
const { fetchTest, fetchCourseId, setShow, setObjectiveId, setItemShow, fetchGetBind } = itemStore;
const { fetchType } = typeStore;
const { fetchAim, fuzzyQuery } = aimStore;
const { testList, courseId, bindList } = storeToRefs(itemStore);
const { aimList } = storeToRefs(aimStore);
const classroomId = parseJWT(sessionStorage.getItem('token')).obsid;

/* ********************方法定义******************** */

const debouncedQuerySearch = _.debounce(() => {
  querySearch();
}, 500);

const querySearch = async () => {
  if (search.value.length >= 1 || search.value.length === 0) {
    loading.value = true;
    await fuzzyQuery({
      fuzzyQuery: true,
      objectiveName: search.value,
      courseId: courseId.value
    });
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchTest({ classroomId });
  await fetchCourseId(classroomId);
  await fetchAim({ courseId: courseId.value, current: 1, size: -1 });
  await fetchType({ courseId: courseId.value, current: 1, size: -1 });

  // await fetchTest({ classroomId: '292104772-1fadaf0b-0b82-4f42-8181-b1621279e074' });
});

const handleClick = async scope => {
  await fetchTest({ classroomId });
  if (!(testList.value.practice.length || testList.value.testPaper.length)) {
    ElMessage({
      type: 'warning',
      message: '暂无数据'
    });
    return;
  }
  setObjectiveId(scope.row.id);

  // objectiveId.value = scope.row.objectiveId;
  setShow(true);
};

const handleLook = async () => {
  await fetchGetBind(courseId.value, -1, 1);
  setItemShow(true);
};
</script>

<style lang="less" scoped></style>
