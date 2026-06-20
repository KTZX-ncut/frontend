<template>
  <div style="height: 92vh; display: flex; flex-direction: column">
    <el-header
      style="height: auto; padding: 5px 0px; width: 100%; background-color: #deebf7; display: flex"
    >
      <el-button type="primary" v-blur-on-click style="margin-left: 0.8vw" @click="importClassroom"
        >导入课堂列表
      </el-button>
      <!--      <el-button type="primary" v-blur-on-click style="margin-left: 0.8vw;" @click="addClassroom">新增课堂</el-button>-->
      <el-button type="danger" v-blur-on-click style="margin-left: 0.8vw" @click="deleteClassroom"
        >删除课堂
      </el-button>
    </el-header>
    <div style="max-height: 100%; height: 100%; overflow: auto">
      <AddClassroomDialog
        v-show="AdddialogVisible"
        ref="AddDialogShow"
        @formSubmitted="getClassRoomList"
      />
      <EditClassroomDialog
        v-show="EditdialogVisible"
        ref="EditDialogShow"
        @formSubmitted="getClassRoomList"
      />

      <el-table
        :data="classroomList"
        style="table-layout: auto; width: 100%; height: 100%"
        ref="classroomTable"
        @selection-change="handleSelectionChange"
        stripe
        border
        :span-method="arraySpanMethod"
      >
        <el-table-column type="selection" min-width="27px"></el-table-column>
        <el-table-column width="49">
          <template v-slot="row">{{ row.$index + 1 }}</template>
        </el-table-column>

        <el-table-column prop="courseChineseName" label="课程名称" min-width="140">
          <template class="name-con" #default="{ row }">
            <el-tooltip :content="row.courseChineseName" placement="top" :hide-after="0.002">
              <div style="width: 100%; height: 25px" class="dynamic-font-size">
                {{ row.courseChineseName }}
              </div>
            </el-tooltip>
            <el-icon class="edit-icon" style="font-size: 14px" @click="addClassroom(row)">
              <CirclePlusFilled />
            </el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="classroomName" label="课堂名称" min-width="160">
          <template #default="{ row }">
            <div v-if="row.classroomName">
              <el-tooltip :content="row.classroomName" placement="top">
                <div class="dynamic-font-size" style="width: 100%; height: 25px">
                  {{ row.classroomName }}
                </div>
              </el-tooltip>
            </div>
            <div v-else>
              <!-- 如果没有 classroomName，可以选择不渲染任何内容 -->
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="teacherName" label="主讲教师" min-width="120">
          <template #default="{ row }">
            <div style="width: 100%; height: 25px">
              {{ row.teacherName }}
            </div>
          </template>
        </el-table-column>
        <!--这个字段不展示v-if="false"-->
        <el-table-column v-if="false" prop="teacherId" label="主讲教师ID" min-width="120">
          <template #default="{ row }">
            <div style="width: 100%; height: 25px">
              {{ row.teacherId }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="labTeacher" label="实验教师" min-width="70">
          <template #default="{ row }">
            <div style="width: 100%; height: 25px">
              {{ row.labTeacher }}
            </div>
          </template>
        </el-table-column>
        <!--这个字段不展示-->
        <el-table-column v-if="false" prop="labTeacherId" label="实验教师ID">
          <template #default="{ row }">
            <div style="width: 100%; height: 25px">
              {{ row.labTeacherId }}
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="practiceTeacher" label="实践教师" min-width="90">
          <template #default="{ row }">
            <div style="width: 100%; height: 25px">
              {{ row.practiceTeacher }}
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="false" prop="practiceTeacherId" label="实践教师ID" min-width="90">
          <template #default="{ row }">
            <div style="width: 100%; height: 25px">
              {{ row.practiceTeacherId }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="teachTime" label="讲授学时" min-width="90">
          <template #default="{ row }">
            <div style="width: 100%; height: 25px">
              {{ row.teachTime }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="labTime" label="实验学时" min-width="90">
          <template #default="{ row }">
            <div style="width: 100%; height: 25px">
              {{ row.labTime }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="practiceTime" label="实践学时" min-width="90">
          <template #default="{ row }">
            <div style="width: 100%; height: 25px">
              {{ row.practiceTime }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="" label="编辑" min-width="50">
          <template #default="{ row }">
            <el-icon class="edit-icon" @click="editClassroom(row)">
              <Edit />
            </el-icon>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { Edit, Plus, CirclePlusFilled } from '@element-plus/icons-vue';
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import request from '../../utils/request.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import { exportTableToCSV } from '../../utils/exportTableToCSV.js';
import AddClassroomDialog from './subcomponents/AddClassroomDialog.vue';
import EditClassroomDialog from './subcomponents/EditClassroomDialog.vue';

const classroomList = ref([]);
const classroomTable = ref(null);
const getClassRoomList = async () => {
  await request.course
    .get('/coursemangt/classroom')
    .then(res => {
      // 登录成功
      if (res.code === 200) {
        classroomList.value = initialize(res.data);
        console.log(classroomList.value);
      } else {
        ElMessage({
          type: 'error',
          message: '获取课堂列表失败'
        });
      }
    })
    .catch(() => {});
};

function initialize(data) {
  let result = [];

  data.forEach(course => {
    const { id: courseId, courseChineseName, classroomReqList, ...courseMeta } = course;
    const classrooms = classroomReqList || [];

    if (classrooms.length === 0) {
      // 如果没有课堂信息，直接添加课程信息
      result.push({
        ...courseMeta,
        courseId,
        courseChineseName,
        classroomName: '',
        teacherId: '',
        teacherName: '',
        creator: '',
        labTeacherId: '',
        labTeacher: '',
        practiceTeacherId: '',
        practiceTeacher: '',
        teachTime: null,
        labTime: null,
        practiceTime: null
      });
    } else {
      // 有课堂信息时，处理每个课堂
      classrooms.forEach(classroom => {
        let processedClassroom = {
          ...courseMeta,
          courseId,
          courseChineseName,
          ...classroom,
          termId: classroom.termId || courseMeta.termId,
          termName: classroom.termName || courseMeta.termName
        };
        result.push(processedClassroom);
      });
    }
  });

  return result;
}

const arraySpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 2) {
    // 合并courseChineseName列
    const courseChineseName = row.courseChineseName;
    const currentRow = classroomList.value[rowIndex];
    if (rowIndex > 0) {
      const prevRow = classroomList.value[rowIndex - 1];
      if (prevRow.courseChineseName === currentRow.courseChineseName) {
        return [0, 0];
      }
    }
    let rowspan = 1;
    for (let i = rowIndex + 1; i < classroomList.value.length; i++) {
      const nextRow = classroomList.value[i];
      if (nextRow.courseChineseName === currentRow.courseChineseName) {
        rowspan++;
      } else {
        break;
      }
    }
    return [rowspan, 1];
  }
  return [1, 1];
};

const AdddialogVisible = ref(false);
const AddDialogShow = ref(null);
const EditdialogVisible = ref(false);
const EditDialogShow = ref(null);
const importClassroom = () => {};

const addClassroom = row => {
  const courseinfo = {
    courseid: row.courseId,
    coursename: row.courseChineseName,
    course: row
  };
  AdddialogVisible.value = true; // 打开弹窗
  AddDialogShow.value.init(courseinfo);
};

const selectedRows = ref([]);
const selectedClassroomId = ref([]);

const handleSelectionChange = selection => {
  selectedRows.value = selection;
};

const editClassroom = row => {
  console.log('beforerow', row);
  EditdialogVisible.value = true; // 打开弹窗
  EditDialogShow.value.init(row);
};

const deleteClassroom = () => {
  if (selectedRows.value.length === 0) {
    ElMessage({
      type: 'info',
      message: '尚未选中任何行'
    });

    return;
  }

  const selectedClassrooms = selectedRows.value.filter(row => row.id);
  const selectedClassroomIds = selectedClassrooms.map(row => row.id);
  const selectedClassroomNames = selectedClassrooms.map(row => row.classroomName);

  if (selectedClassrooms.length === 0) {
    ElMessage({
      type: 'info',
      message: '所选内容中没有包括课堂'
    });
    // 确保消息显示后再清空选中行

    return;
  }

  const message =
    selectedClassroomNames.length > 0
      ? `所选内容中包括 ${selectedClassroomNames.length} 个课堂： ${selectedClassroomNames.join(
          '，'
        )}  是否删除？`
      : `是否要删除勾选的 ${selectedClassroomIds.length} 条记录？`;

  ElMessageBox.confirm(message, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  })
    .then(() => {
      const deleteClassroomList = ref(selectedClassroomIds);
      console.log(deleteClassroomList.value);

      request.course
        .post('/coursemangt/classroom/delete', deleteClassroomList.value)
        .then(res => {
          if (res.code === 200) {
            ElMessage({
              type: 'success',
              message: '删除课堂成功'
            });
            getClassRoomList();
          }
        })
        .catch(error => {
          ElMessage({
            type: 'error',
            message: '删除课堂失败，请稍后尝试'
          });
        });
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除'
      });
    });
};

onMounted(() => {
  getClassRoomList();
});
</script>

<style scoped>
::v-deep(.el-table .cell) {
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-icon:hover {
  color: rgb(0, 115, 255) !important;
  cursor: pointer;
}

.user-bubbles {
  display: flex;
  flex-wrap: wrap;
  gap: 5px; /* 气泡之间的间距 */
  justify-content: center; /* 居中对齐所有的气泡 */
  align-items: center; /* 垂直居中（如果你的行高较高的话） */
}

.user-bubble {
  background-color: #e6f7ff; /* 气泡的背景颜色 */
  border-radius: 15px; /* 边框圆角，使其看起来像气泡 */
  padding: 5px 10px; /* 内边距 */
  font-size: 14px; /* 文本大小 */
  cursor: pointer; /* 鼠标悬停时的手形指针 */
  white-space: nowrap; /* 防止文本换行 */
}

.more-users {
  background-color: #e4e6eb;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
}

.edit-icon {
  cursor: pointer; /* 鼠标悬停时变成手形指针 */
  white-space: nowrap; /* 防止文本换行 */
  margin-left: 8px; /* 与名字标签的间距 */
}

.edit-icon:hover {
  color: #409eff; /* 悬浮时的颜色 */
}

.dynamic-font-size {
  font-size: calc(3px + 0.8vw); /* 根据视口宽度动态计算字体大小 */
  overflow: hidden; /* 隐藏溢出的文本 */
  text-overflow: ellipsis; /* 用省略号表示被裁剪的文本 */
  white-space: nowrap; /* 不允许文本换行 */
}
</style>
