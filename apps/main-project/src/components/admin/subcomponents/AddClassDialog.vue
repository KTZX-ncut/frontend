<template>
  <div style="padding:0;margin:0;">
    <el-dialog
        :destroy-on-close="true" :show-close="false" :close-on-click-modal="false"
        style="width:40vw;" v-model="dialogVisible" @close="closeDialog">
      <el-container style="margin-left:0">
        <!-- 对话框头部区域 -->
        <el-header style="height: auto; padding: 2px 0px; width:100%; display: flex; align-items: center;">
        </el-header>
        <el-main>
          <el-form ref="formRef" :model="newform"  :rules="rules" label-width="100px">
            <el-form-item label="选择专业" prop="id">
<!--              <el-input v-model=""></el-input>-->
              <el-select-v2
                  v-model="newform.id"
                  :options="options"
                  placeholder="选择专业"
              />
            </el-form-item>
            <el-form-item label="班级名称" prop="classname">
              <el-input v-model="newform.classname" placeholder="请输入班级名"></el-input>
            </el-form-item>
            <!--            <el-form-item label="年级" prop="grade">-->
            <!--              <el-input  v-model="newform.grade"></el-input>-->
            <!--            </el-form-item>-->
            <el-form-item label="年级" prop="grade">
              <el-select v-model="newform.grade" placeholder="请选择年级">
                <el-option
                    v-for="year in recentYears"
                    :key="year"
                    :label="year"
                    :value="year">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="newform.remark" placeholder="请输入备注"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="info" large style="width: 40%" @click="closeDialog">取消</el-button>
              <el-button type="success"  large style="width: 40%"  @click="submitForm">新增</el-button>
            </el-form-item>
          </el-form>
        </el-main>
      </el-container>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, defineExpose, computed, watch, nextTick, onMounted, getCurrentInstance} from 'vue';

import {ElMessage} from "element-plus";
import {Document, Folder} from "@element-plus/icons-vue";
import Classmangt from "../Classmangt.vue"
import request from "../../../utils/request.js";

//显示弹窗组件
const dialogVisible = ref(false);
const newform = reactive({
  id: '',
  classname: '',
  grade: '',
  remark: ''
});

const recentYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
});

const rules = reactive({
  id: [{ required: true, message: '请选择专业', trigger: 'blur' }],
  classname: [{ required: true, message: '请输入班级名', trigger: 'blur' }],
  grade: [{ required: true, message: '请输入年级', trigger: 'blur' }],
});

const formRef = ref(null);
const professionList = ref([]);
const options = ref([]);
//初始化，用于接受父组件传来的值，并发送请求获取菜单
function init(oriprofessionList) {
  dialogVisible.value = true;
  professionList.value = oriprofessionList.value;
  options.value = oriprofessionList.map(item => ({
    value: item.id, // 设置value为id
    label: item.obsname // 设置label为obsname
  }));
}

const emit = defineEmits(['formSubmitted']);


//将init函数暴露给父组件
defineExpose({ init });

const submitForm = () => {


  formRef.value.validate((valid) => {
    if (valid) {
      console.log(newform);
      // // 表单验证通过，处理表单提交逻辑
      request.admin.post('/sysmangt/classmangt/create', newform)
          .then(res => {
            if (res.code === 200) {
              ElMessage({
                type: 'success',
                message: '新增班级成功'
              });
              emit('formSubmitted');
              closeDialog();

            }
          }).catch(error => {
        ElMessage({
          type: 'error',
          message: '新增班级失败'
        });
      });
    } else {
      // 表单验证未通过
      ElMessage({
        type: 'error',
        message: '请输入正确的信息'
      });
    }
  });
};


//关闭对话框方法
const closeDialog = () => {
  dialogVisible.value = false;
};


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
  margin-right:5vw;
}

/* Adjust the negative margin to align with the header */
.tree-with-header .el-tree {
  margin-top: -30px;
}

</style>
