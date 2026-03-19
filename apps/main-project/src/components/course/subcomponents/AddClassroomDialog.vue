<template>
  <div style="padding: 0; margin: 0">
    <el-dialog
      :destroy-on-close="true"
      :show-close="false"
      :close-on-click-modal="false"
      style="width: 50vw"
      v-model="AdddialogVisible"
      @close="closeDialog"
    >
      <el-container style="margin-left: 0">
        <el-header
          style="height: auto; padding: 2px 0px; width: 100%; display: flex; align-items: center"
        >
        </el-header>
        <el-main>
          <el-form ref="formRef" :model="newform" :rules="rules" label-width="120px">
            <el-form-item label="课程名称" prop="">
              <el-input disabled v-model="newform.courseChineseName"></el-input>
            </el-form-item>
            <el-form-item label="课堂名称" prop="classroomName">
              <el-input v-model="newform.classroomName" placeholder="请输入课堂名称"></el-input>
            </el-form-item>
            <el-form-item label="讲授学时" prop="teachTime">
              <el-input v-model="newform.teachTime" placeholder="请输入讲授学时"></el-input>
            </el-form-item>
            <el-form-item label="实验学时" prop="labTime">
              <el-input v-model="newform.labTime" placeholder="请输入实验学时"></el-input>
            </el-form-item>
            <el-form-item label="实践学时" prop="practiceTime">
              <el-input v-model="newform.practiceTime" placeholder="请输入实践学时"></el-input>
            </el-form-item>

            <el-form-item label="主讲教师" prop="teacherId">
              <el-cascader
                ref="mainteacherref"
                v-model="newform.teacherId"
                :options="teacherlist"
                placeholder="请选择主讲教师"
                :props="{ value: 'id', label: 'label', children: 'children', emitPath: false }"
                filterable
                clearable
                :show-all-levels="false"
                @focus="fetchData"
                change-on-select
                @change="value => handleCascaderChange('mainteacher', value)"
                style="width: 100%"
              >
              </el-cascader>
            </el-form-item>
            <el-form-item label="实验教师" prop="labTeacherId">
              <el-cascader
                ref="labteacherref"
                v-model="newform.labTeacherId"
                :options="teacherlist"
                placeholder="请选择实验教师"
                :props="{ value: 'id', label: 'label', children: 'children', emitPath: false }"
                filterable
                clearable
                :show-all-levels="false"
                @focus="fetchData"
                change-on-select
                @change="value => handleCascaderChange('labteacher', value)"
                style="width: 100%"
              >
              </el-cascader>
            </el-form-item>
            <el-form-item label="实践教师" prop="practiceTeacherId">
              <el-cascader
                ref="practiceteacherref"
                v-model="newform.practiceTeacherId"
                :options="teacherlist"
                placeholder="请选择实践教师"
                :props="{ value: 'id', label: 'label', children: 'children', emitPath: false }"
                filterable
                clearable
                :show-all-levels="false"
                @focus="fetchData"
                change-on-select
                @change="value => handleCascaderChange('practiceteacher', value)"
                style="width: 100%"
              >
              </el-cascader>
            </el-form-item>

            <el-form-item style="display: flex; justify-content: center; gap: 20px">
              <el-button type="info" large style="width: 40%" @click="closeDialog">取消</el-button>
              <el-button type="success" large style="width: 40%" @click="submitForm"
                >新增</el-button
              >
            </el-form-item>
          </el-form>
        </el-main>
      </el-container>
    </el-dialog>
  </div>
</template>

<script setup>
import { defineExpose, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../../../utils/request.js';
import { useProfileStore } from '../../../stores/profileStore.js';

const username = ref('');
const profileStore = useProfileStore();
username.value = profileStore.profilename;

const AdddialogVisible = ref(false);
const formRef = ref(null);

const mainteachername = ref('');
const labteachername = ref('');
const practiceteachername = ref('');

const teacherlist = ref([]);
const alreadyteacheridlist = ref([]);

const newform = reactive({
  courseid: '',
  courseChineseName: '',
  classroomName: '',
  teachTime: '',
  labTime: '',
  practiceTime: '',
  teacherId: '',
  labTeacherId: '',
  practiceTeacherId: ''
});

const resetForm = () => {
  newform.courseid = '';
  newform.courseChineseName = '';
  newform.classroomName = '';
  newform.teachTime = '';
  newform.labTime = '';
  newform.practiceTime = '';
  newform.teacherId = '';
  newform.labTeacherId = '';
  newform.practiceTeacherId = '';
  mainteachername.value = '';
  labteachername.value = '';
  practiceteachername.value = '';
};

const emit = defineEmits(['formSubmitted']);
defineExpose({ init });

const validateSelectField = message => {
  return (rule, value, callback) => {
    if (value === undefined || value === null || value === '') {
      callback(new Error(message));
      return;
    }
    callback();
  };
};

const rules = reactive({
  classroomName: [{ required: true, message: '请输入课堂名称', trigger: 'blur' }],
  teachTime: [{ required: true, message: '请输入讲授时长', trigger: 'blur' }],
  labTime: [{ required: true, message: '请输入实验时长', trigger: 'blur' }],
  practiceTime: [{ required: true, message: '请输入实践时长', trigger: 'blur' }],
  teacherId: [{ validator: validateSelectField('请输入主讲教师'), trigger: ['change', 'blur'] }],
  labTeacherId: [{ validator: validateSelectField('请输入实验教师'), trigger: ['change', 'blur'] }],
  practiceTeacherId: [
    { validator: validateSelectField('请输入实践教师'), trigger: ['change', 'blur'] }
  ]
});

function init(courseinfo) {
  resetForm();
  console.log(courseinfo);
  AdddialogVisible.value = true;
  newform.courseid = courseinfo.courseid;
  newform.courseChineseName = courseinfo.coursename;
}

const fetchData = () => {
  request.course
    .post('/coursemangt/course/courseRP')
    .then(res => {
      if (res.code === 200) {
        teacherlist.value = formatDataForCascader(res.data, alreadyteacheridlist.value);
        console.log('Formatted teacher list:', teacherlist.value); // 打印格式化后的数据
      }
    })
    .catch(error => {
      ElMessage({
        type: 'error',
        message: '获取列表失败'
      });
    });
};

const formatDataForCascader = (nodes, selectedTeacherIds) => {
  const formatNode = node => {
    const formattedNode = {
      ...node,
      label: node.obsname
    };
    if (node.children && node.children.length > 0) {
      formattedNode.children = node.children.map(formatNode).filter(child => child !== null);
    }
    if (node.responsiblePerson && node.responsiblePerson.length > 0) {
      const filteredTeachers = node.responsiblePerson.filter(
        teacher => !selectedTeacherIds.includes(teacher.id)
      );
      if (filteredTeachers.length > 0) {
        formattedNode.children = (formattedNode.children || []).concat(
          filteredTeachers.map(teacher => ({
            id: teacher.id,
            label: teacher.username,
            isLeaf: true
          }))
        );
      }
    }
    return formattedNode.children && formattedNode.children.length > 0 ? formattedNode : null;
  };
  return nodes.map(formatNode).filter(node => node !== null);
};

const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

const handleCascaderChange = (data, value) => {
  const fieldMap = {
    mainteacher: 'teacherId',
    labteacher: 'labTeacherId',
    practiceteacher: 'practiceTeacherId'
  };
  const field = fieldMap[data] || '';
  if (value !== undefined && value !== null && value !== '') {
    const lastSelectedNode = findNodeById(teacherlist.value, value);
    if (lastSelectedNode) {
      if (data === 'mainteacher') {
        newform.teacherId = lastSelectedNode.id;
        mainteachername.value = lastSelectedNode.label;
      } else if (data === 'labteacher') {
        newform.labTeacherId = lastSelectedNode.id;
        labteachername.value = lastSelectedNode.label;
      } else if (data === 'practiceteacher') {
        newform.practiceTeacherId = lastSelectedNode.id;
        practiceteachername.value = lastSelectedNode.label;
      }
    }
  } else {
    // 如果没有选中任何节点，可以根据需求清空 teacherid 或设置为默认值
    if (data === 'mainteacher') {
      newform.teacherId = '';
      mainteachername.value = '';
    } else if (data === 'labteacher') {
      newform.labTeacherId = '';
      labteachername.value = '';
    } else if (data === 'practiceteacher') {
      newform.practiceTeacherId = '';
      practiceteachername.value = '';
    }
  }
  if (field) {
    formRef.value?.validateField(field);
  }
};

const closeDialog = () => {
  formRef.value?.clearValidate();
  AdddialogVisible.value = false;
};

async function submitForm() {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm('是否确认新增', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    });

    // 用户确认后执行以下代码
    const newClassroomform = ref({
      courseId: newform.courseid,
      classroomName: newform.classroomName,
      creatorName: username.value,
      teacherId: newform.teacherId,
      teacherName: mainteachername.value,
      labTeacherId: newform.labTeacherId,
      labTeacher: labteachername.value,
      practiceTeacherId: newform.practiceTeacherId,
      practiceTeacher: practiceteachername.value,
      teachTime: newform.teachTime,
      labTime: newform.labTime,
      practiceTime: newform.practiceTime
    });

    console.log(newClassroomform.value);
    // 接下来可以加入发送请求的代码
    const courseResponse = await request.course.post(
      '/coursemangt/classroom/create',
      newClassroomform.value
    );
    if (courseResponse.code === 200) {
      // 处理响应
      ElMessage({
        type: 'success',
        message: '新增课堂成功'
      });

      emit('formSubmitted');
      closeDialog();
    } else {
      throw new Error('新增课程失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      // 如果用户取消，则不显示错误消息
      ElMessage({
        type: 'error',
        // message: error.message || '操作取消'
        message: '插入失败'
      });
    }
  }
}

onMounted(() => {
  // 可以选择在挂载时预先加载数据
  fetchData();
});
</script>

<style scoped>
/*覆盖el-dialog__header的样式*/
::v-deep(.el-dialog__header) {
  padding-top: 0;
  padding-bottom: 0;
}

/*覆盖el-dialog__body 的样式*/
::v-deep(.el-dialog__body) {
  padding-top: 5px;
  padding-bottom: 5px;
}

/*修改树状节点样式*/
.custom-tree-node {
  display: flex;
  justify-content: space-between; /* This will push the checkbox-container to the right */
  align-items: center;
  width: 100%; /* Ensure the tree node takes full width */
}

/*修改点击框样式*/
.checkbox-container {
  display: flex;
  gap: 8vw;
  margin-right: 5vw;
}

/* Adjust the negative margin to align with the header */
.tree-with-header .el-tree {
  margin-top: -30px;
}
</style>
