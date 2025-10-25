<template>
  <div class="task-list">
    <Header title="问卷列表" :pathData="pathData" />
    <!-- 作业列表 -->
    <el-table
      ref="multipleTableRef"
      class="custom-table"
      :data="tableData"
      style="width: 100%; margin-top: 15px"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column property="name" label="名称" />
      <el-table-column property="createTime" label="上传时间" />
      <el-table-column property="status" label="状态">
        <template #default="scope">
          {{ ['未完成', '已完成'][scope.row.status] ?? '' }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" property="address" label="操作">
        <template #default="scope">
          <el-button
            v-if="scope.row.status === 0"
            class="custom-link-button custom-link-active-button"
            @click="
              () => {
                router.push({
                  path: '/homes/studentcourses/exam/detail',
                  query: {
                    id: scope.row.id,
                    type: 'edit'
                  }
                });
              }
            "
          >
            去做问卷
          </el-button>
          <el-button
            v-else
            class="custom-link-button custom-link-active-button"
            @click="
              () => {
                router.push({
                  path: '/homes/studentcourses/exam/detail',
                  query: {
                    id: scope.row.id,
                    type: 'view'
                  }
                });
              }
            "
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination flex-end">
      <!-- <el-pagination v-model:currentPage="params.pageIndex" v-model:page-size="params.pageSize"
        :page-sizes="[10, 20, 30, 40]" layout="total, sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" /> -->
      <Pagination
        :pageIndex="params.pageIndex"
        :pageSize="params.pageSize"
        :total="total"
        @update:pageIndex="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import Pagination from '@/views/page/components/pagination/index.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElTable } from 'element-plus';
import { myQueFormPager } from '@/api/stuQues.js';
import Header from '@/views/page/components/header/index.vue';
const router = useRouter();
const { currentRoute } = router;
const route = currentRoute.value;
const tableData = ref([]);
const total = ref(0);
const params = ref({
  pageIndex: 1,
  pageSize: 20
});
const pathData = [
  {
    name: '问卷列表',
    path: ''
  }
];
onMounted(() => {
  getMyQueFormPager();
});

const handleSizeChange = val => {
  params.value.pageSize = val;
  getMyQueFormPager();
};

const handleCurrentChange = val => {
  params.value.pageIndex = val;
  getMyQueFormPager();
};

const getMyQueFormPager = () => {
  myQueFormPager(params.value).then(res => {
    if (res.code === '200') {
      tableData.value = res.data.data;
      total.value = res?.data?.recordSize ?? 0;
    }
  });
};
</script>

<style scoped>
.task-list {
  background: #fff;
  padding: 0 10px 10px 10px;
  font-size: 13px;
  height: 100%;
  box-sizing: border-box;
}
.pagination {
  margin-top: 10px;
}
</style>
