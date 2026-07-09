<template>
  <div class="container">
    <Header title="学生名单" />
    <el-header style="height: auto; padding: 5px 0px; width: 100%; display: flex">
      <div class="button">
        <el-button
          type="primary"
          class="custom-nav-button custom-nav-button-primary"
          @click="exportData"
          v-blur-on-click
          >导出到Excel文件</el-button
        >
        <el-button
          type="primary"
          class="custom-nav-button custom-nav-button-primary"
          @click="handleInsert"
          v-blur-on-click
          >选择学生</el-button
        >
        <el-button
          type="primary"
          class="custom-nav-button custom-nav-button-primary"
          @click="handleUpload"
          v-blur-on-click
          >导入Excel文件</el-button
        >
        <el-button
          type="danger"
          class="custom-nav-button custom-nav-button-delete"
          @click="handleDelete"
          v-blur-on-click
          >删除选中学生</el-button
        >
        <el-button
          type="primary"
          class="custom-nav-button custom-nav-button-delete"
          @click="handleDelAll"
          color="#800000"
          v-blur-on-click
          >删除全部学生</el-button
        >
        <el-button
          type="success"
          class="custom-nav-button custom-nav-button-success"
          v-if="roleName === '任课教师'"
          @click="handleCreateReport"
          v-blur-on-click
          >生成画像</el-button
        >
      </div>
    </el-header>
    <!-- 列表开始 -->
    <div class="list">
      <el-table
        :data="pagedData"
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
            tableData.findIndex(item => item.id === scope.row.id) + 1
          }}</template>
        </el-table-column>

        <el-table-column prop="loginname" label="登录名称" />
        <el-table-column prop="userName" label="姓名" />
        <el-table-column prop="obsName" :label="unitName" />
        <!-- <el-table-column label="参与评价(形成性)">
          <template #default="scope">
            <el-switch
              @change="value => handleChange(value, scope, 0)"
              size="large"
              v-model="
                tableData[tableData.findIndex(item => item.id === scope.row.id)].attendDynamic
              "
            />
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="参与评价(达成性)">
          <template #default="scope">
            <el-switch
              @change="value => handleChange(value, scope, 1)"
              size="large"
              v-model="tableData[scope.$index].attendEnd"
            />
          </template>
        </el-table-column> -->
      </el-table>
      <!-- 分页器 -->
      <el-footer
        style="display: flex; justify-content: center; align-items: center; padding-bottom: 15px"
      >
        <el-pagination
          style="margin-top: 20px; text-align: center"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </el-footer>
      <!-- 分页器结束 -->
    </div>
    <!-- 列表结束 -->

    <!-- 导入学生信息开始 -->
    <el-dialog
      :destroy-on-close="true"
      :show-close="false"
      :close-on-click-modal="false"
      style="width: 20vw; padding-top: 0"
      v-model="importdialogViaible"
    >
      <h2 style="margin-top: 0">导入Excel文件</h2>
      <el-upload
        class="upload-demo"
        ref="uploadRef"
        auto-upload="false"
        show-file-list="false"
        :before-upload="beforeUpload"
        style="margin-bottom: 20px"
      >
        <!-- 使用输入框作为上传的触发器 -->
        <el-input
          slot="trigger"
          v-model="fileName"
          placeholder="未选择文件"
          readonly
          style="cursor: pointer; text-align: center"
        ></el-input>
      </el-upload>

      <div style="text-align: center; margin-bottom: 20px">
        <!-- 添加内联样式 -->
        <!-- 下载链接 -->
        <a href="/file/实践教师-导入学生名单模板.xlsx" download>点击下载模板文件</a>
      </div>

      <div>
        <!-- 添加内联样式 -->
        <!-- 上传按钮 -->
        <el-button style="margin-right: 10px" @click="closeimportdialogViable">关闭</el-button>
        <!-- 添加内联样式 -->
        <el-button type="success" @click="submitUpload">上传</el-button>
      </div>
    </el-dialog>
    <!-- 导入学生结束 -->

    <!-- 插入学生开始 -->
    <el-dialog
      :destroy-on-close="true"
      :show-close="false"
      :close-on-click-modal="false"
      style="padding-top: 0"
      v-model="insertStudentVisible"
    >
      <InsertStudent :parse-Token="parseToken" @close-tab="handleCloseTab" />
    </el-dialog>
    <!-- 插入学生结束 -->

    <!-- 生成学生报告开始 -->

    <el-dialog
      :destroy-on-close="true"
      :show-close="true"
      :close-on-click-modal="true"
      style="width: 50vw; padding-top: 0; height: 78vh"
      @close="handleBack"
      v-model="createReport"
    >
      <div style="height: 100%" v-loading="creating">
        <div class="wrapper">
          <h2 style="margin-top: 0">学生列表</h2>
          <div
            style="
              display: flex;
              width: 80%;
              justify-content: space-around;
              margin: 0 auto;
              margin-bottom: 15px;
            "
          >
            <el-button type="success" @click="handleDynamic">形成性评价</el-button>
            <el-button type="success" @click="handleEnd">达成行评价</el-button>
          </div>
          <List :titleList="titleList" :listData="attendList" />
          <el-button type="primary" @click="handleBack">返回</el-button>
          <el-popconfirm @confirm="handleConfirm" title="您确定选择以上学生生成评价吗？">
            <template #reference>
              <el-button type="success">确认</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </el-dialog>

    <!-- 生成学生报告结束 -->
  </div>
</template>

<script setup>
import request from '../../../utils/request';
import Header from '@/views/page/components/header/index.vue';
import List from '../../dynamicEvaluation/PublicCpns/List.vue';
import { storeToRefs } from 'pinia';
import useTeacherInClass from '@/stores/useTeacherInClass.js';
import parseJWT from '../../../utils/parseJWT';
import InsertStudent from './StudentsListCpns/InsertStudent.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, reactive, computed, onMounted } from 'vue';
import { exportTableToCSV } from '../../../utils/exportTableToCSV';
import useTeacherStuGra from '../../../stores/dynamicEvaluation/TeacherStuGraStore';

/* ********************变量定义******************** */
const unitName = ref('默认专业');

const selectedData = ref([]);

const attendList = ref([]);

const roleName = JSON.parse(sessionStorage.getItem('users')).rolename;

const creating = ref(false);

const TeacherStuGraStore = useTeacherStuGra();

const titleList = [
  { prop: 'stuno', label: '学号' },
  { prop: 'userName', label: '姓名' },
  { prop: 'obsName', label: '专业' }
];

const createReport = ref(false);

const handleCreateReport = () => {
  createReport.value = true;
};

const handleDynamic = () => {
  attendList.value = tableData.value.filter(item => item.attendDynamic);
};

const handleEnd = () => {
  attendList.value = tableData.value.filter(item => item.attendEnd);
};

const handleBack = () => {
  createReport.value = false;
  attendList.value = [];
};

const handleChange = (value, scope, flag) => {
  console.log(scope);
  if (flag === 0) {
    tableData.value[scope.$index].attendDynamic = value;
  } else if (flag === 1) {
    tableData.value[scope.$index].attendEnd = value;
  }
};

const handleConfirm = () => {
  // TODO:点击此按钮后发送后端生成学生报告
  creating.value = true;
  // 模拟后端
  new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, 5000); // 模拟 2 秒延迟
  }).then(() => {
    handleBack();
    creating.value = false;
    ElMessage({
      type: 'success',
      message: '生成成功'
    });
  });
};

const handleSelectAll = selection => {
  selectedData.value = selection;
};

const handleSelectionChange = selection => {
  selectedData.value = selection;
};

const insertStudentVisible = ref(false);

const handleInsert = () => {
  insertStudentVisible.value = true;
};

const handleCloseTab = value => {
  insertStudentVisible.value = value;
};

const currentPage = ref(1);

const pageSize = ref(10);

const total = ref(0);

const filteredData = ref([]);
/* ********************变量定义******************** */

/* ********************文件上传逻辑******************** */
const fileToUpload = ref(null); // 要上传的文件对象

const importdialogViaible = ref(false);

const fileName = ref(''); //文件名

const uploadRef = ref(null);

const handleUpload = () => {
  importdialogViaible.value = true;
};

const handleFileChange = file => {
  if (file) {
    fileName.value = file.name; // 显示文件名
    fileToUpload.value = file; // 保存文件对象
  }
};

const beforeUpload = file => {
  handleFileChange(file); // 在上传前处理文件变化
  return false; // 阻止默认上传行为
};

const submitUpload = async () => {
  if (fileToUpload.value) {
    const formData = new FormData();
    formData.append('file', fileToUpload.value);
    formData.append('classroomId', parseToken.obsid);
    const res = await TeacherInClassStore.importExcel(formData);
    if (res.code === 200) {
      ElMessage.success('文件上传成功！');
      importdialogViaible.value = false;
      location.reload();
      // getPeopleList();
    } else {
      ElMessage.error(res.msg);
    }
  } else {
    ElMessage.warning('请先选择一个文件！');
  }
};

const closeimportdialogViable = () => {
  importdialogViaible.value = false;
  fileName.value = '';
  fileToUpload.value = null;
};

/* ********************文件上传逻辑******************** */

/* ********************文件导出逻辑******************** */
const columns = ref([
  {
    prop: 'stuno',
    label: '学号'
  },
  {
    prop: 'userName',
    label: '姓名'
  },
  {
    prop: 'obsName',
    label: '专业'
  }
]);
const exportData = () => {
  // 获取选中的行
  const dataToExport = selectedData.value.length > 0 ? selectedData.value : tableData.value;
  // 检查是否有数据可导出
  if (dataToExport.length === 0) {
    ElMessage({
      type: 'info',
      message: '没有需要导出的内容'
    });
    return; // 退出函数，不再继续执行
  }

  ElMessageBox.confirm(
    selectedData.value.length > 0
      ? `是否要导出所勾选的 ${selectedData.value.length} 行记录？`
      : '是否要导出当前的全部记录？',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    }
  )
    .then(() => {
      console.log(dataToExport);
      exportTableToCSV(dataToExport, columns.value);
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消导出'
      });
    });
};
/* ********************文件导出逻辑******************** */

/* ********************初始化页面数据******************** */
const tableData = ref([]);
// 解构token拿到obsid
const token = sessionStorage.getItem('token');
// 得到obsid
const parseToken = parseJWT(token);
const TeacherInClassStore = useTeacherInClass();
const { stuList } = storeToRefs(TeacherInClassStore);
onMounted(async () => {
  TeacherInClassStore.fetchStudentList(parseToken).then(res => {
    // 此处只需给tableData增加两个是否参加评价的字段
    // filterdata是用于展示分页数据的真正绑定的是tableData中的数据
    tableData.value = stuList.value.map(item => ({
      ...item,
      attendDynamic: true,
      attendEnd: true
    }));
    filteredData.value = stuList.value;
    total.value = tableData.value.length;
  });
  request.course
    .get('/coursemangt/classroommangt/student/getStudentLevel')
    .then(res => {
      // 登录成功
      if (res.code === 200 && res.msg === '成功') {
        unitName.value = res.data;
      } else {
        ElMessage({
          type: 'error',
          message: '获取学生所在层级失败'
        });
      }
    })
    .catch(() => {});
});
// tableData.value = stuList.value;
// filteredData.value = stuList.value;
// total.value = tableData.value.length;
/* ********************初始化页面数据******************** */

/* ********************删除选中数据******************** */
const stuids = ref([]);
const handleDelete = async () => {
  stuids.value = selectedData.value.map(item => {
    console.log(item);
    return item.stuId;
  });
  console.log(stuids.value);
  await TeacherInClassStore.delStudentOne(parseToken.obsid, stuids.value);
  const res = await TeacherInClassStore.delStudentOne(parseToken.obsid, stuids.value);
  if (res.code === 200) {
    // 更新现有列表
    location.reload();
    ElMessage({
      type: 'success',
      message: '删除成功'
    });
    location.reload();
  } else {
    ElMessage({
      type: 'error',
      message: '删除失败'
    });
  }
};
/* ********************删除选中数据******************** */

/* ********************删除所有数据******************** */
const handleDelAll = async () => {
  const res = await TeacherInClassStore.delStudentAll(parseToken.obsid);
  if (res.code === 200) {
    ElMessage({
      type: 'success',
      message: '删除成功'
    });
    location.reload();
  } else {
    ElMessage({
      type: 'error',
      message: '删除失败'
    });
  }
};
/* ********************删除所有数据******************** */

/* ********************分页器******************** */
// 处理每页显示条目数改变
const handleSizeChange = newSize => {
  pageSize.value = newSize;
  // 重置当前页到第一页
  currentPage.value = 1;
};

// 处理当前页改变
const handleCurrentChange = newPage => {
  currentPage.value = newPage;
};

// 计算分页数据
const pagedData = computed(() => {
  return filteredData.value.slice(
    (currentPage.value - 1) * pageSize.value,
    currentPage.value * pageSize.value
  );
});

/* ********************分页器******************** */
</script>

<style lang="less" scoped>
.container {
  overflow: auto;
  height: 92vh;
  display: flex;
  flex-direction: column;
  -ms-overflow-style: none; /* IE 和 Edge */
  scrollbar-width: none; /* Firefox */
  .button {
    display: flex;
    padding-left: 10px;
  }
  .list {
    text-align: center;
  }
  .wrapper {
    overflow: auto;
    height: 67vh;
  }
}
</style>
