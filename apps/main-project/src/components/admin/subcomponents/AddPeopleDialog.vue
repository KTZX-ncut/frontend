<template>
  <div style="padding: 0; margin: 0">
    <el-dialog
      :destroy-on-close="true"
      :show-close="false"
      :close-on-click-modal="false"
      style="width: 40vw"
      v-model="dialogVisible"
      @close="closeDialog"
    >
      <el-container style="margin-left: 0">
        <!-- 对话框头部区域 -->
        <el-tabs v-model="activeName" class="w-full" @tab-click="handleClick">
          <el-tab-pane label="输入人员" name="input">
            <el-header
              style="
                height: auto;
                padding: 2px 0px;
                width: 100%;
                display: flex;
                align-items: center;
              "
            >
            </el-header>
            <el-main style="padding-left: 0">
              <el-form ref="formRef" :model="newform" :rules="rules" label-width="100px">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="newform.username"></el-input>
                </el-form-item>
                <el-form-item label="登录名" prop="loginname">
                  <el-input v-model="newform.loginname"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="pwd">
                  <el-input type="password" v-model="newform.pwd" show-password></el-input>
                </el-form-item>
                <el-form-item :label="newform.catelog === '1' ? '学号' : '工号'" prop="personnelno">
                  <el-input v-model="newform.personnelno"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="newform.phone"></el-input>
                </el-form-item>
                <el-form-item label="人员类别" prop="catelog">
                  <el-radio-group v-model="newform.catelog">
                    <el-radio label="1">学生</el-radio>
                    <el-radio label="2">老师</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="状态">
                  <el-switch
                    v-model="newform.status"
                    :active-value="'1'"
                    :inactive-value="'0'"
                  ></el-switch>
                  <span style="margin-left: 10px; color: blue">{{
                    newform.status === '1' ? '正常' : '停用'
                  }}</span>
                </el-form-item>
                <el-form-item label="机构">
                  <el-cascader
                    ref="mycascaderRef"
                    v-model="newform.obsid"
                    :options="obsmenulist"
                    :props="{
                      value: 'id',
                      label: 'obsname',
                      children: 'children',
                      checkStrictly: true
                    }"
                    filterable
                    clearable
                    :show-all-levels="true"
                    :checkStrictly="true"
                    :rules="rules.obsid"
                  ></el-cascader>
                </el-form-item>
                <el-form-item label="备注">
                  <el-input type="textarea" v-model="newform.remark" maxlength="3000"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="info" large style="width: 40%" @click="closeDialog"
                    >取消</el-button
                  >
                  <el-button type="success" large style="width: 40%" @click="submitForm"
                    >新增</el-button
                  >
                </el-form-item>
              </el-form>
            </el-main>
          </el-tab-pane>
          <el-tab-pane label="从历史选择" name="history">
            <div v-if="activeName === 'history'">
              <div class="flex items-center justify-center gap-4 my-4">
                <el-input
                  v-model.lazy="searchKeyword"
                  @input="debouncedQuerySearch"
                  placeholder="请输入姓名关键字"
                  class="input-with-select"
                  style="width: 70%"
                ></el-input>
                <el-button type="primary" @click="querySearch">搜索</el-button>
              </div>
              <el-table
                :data="filteredData || []"
                style="width: 100%"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="index" label=""></el-table-column>
                <el-table-column type="selection" label=""></el-table-column>
                <el-table-column prop="username" label="用户名" width="100">
                  <template #default="{ row }">
                    <el-input
                      v-if="row.editingUsername"
                      :ref="el => setInputRef(el, row)"
                      style="width: 100%; height: 25px"
                      v-model="row.username"
                      @blur="handleBlur(row, 'editingUsername', 'username')"
                    ></el-input>
                    <div
                      v-else
                      style="width: 100%; height: 25px"
                      @dblclick="handleClick(row, 'editingUsername', 'username')"
                    >
                      {{ row.username }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="loginname" label="登录名称" width="100">
                  <template #default="{ row }">
                    <el-input
                      v-if="row.editingLoginname"
                      :ref="el => setInputRef(el, row)"
                      style="width: 100%; height: 25px"
                      v-model="row.loginname"
                      @blur="handleBlur(row, 'editingLoginname', 'loginname')"
                    ></el-input>
                    <div
                      v-else
                      style="width: 100%; height: 25px"
                      @dblclick="handleClick(row, 'editingLoginname', 'loginname')"
                    >
                      {{ row.loginname }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="pwd" label="密码" width="100">
                  <template #default="{ row }">
                    <el-input
                      v-if="row.editingPwd"
                      :ref="el => setInputRef(el, row)"
                      style="width: 100%; height: 25px"
                      v-model="row.pwd"
                      @blur="handleBlur(row, 'editingPwd', 'pwd')"
                    ></el-input>
                    <div
                      v-else
                      style="width: 100%; height: 25px"
                      @dblclick="handleClick(row, 'editingPwd', 'pwd')"
                    >
                      {{ row.pwd }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="personnelno" label="工号" width="120">
                  <template #default="{ row }">
                    <el-input
                      v-if="row.editingPersonnelno"
                      :ref="el => setInputRef(el, row)"
                      style="width: 100%; height: 25px"
                      v-model="row.personnelno"
                      @blur="handleBlur(row, 'editingPersonnelno', 'personnelno')"
                    ></el-input>
                    <div
                      v-else
                      style="width: 100%; height: 25px"
                      @dblclick="handleClick(row, 'editingPersonnelno', 'personnelno')"
                    >
                      {{ row.personnelno }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="phone" label="手机号" width="120">
                  <template #default="{ row }">
                    <el-input
                      v-if="row.editingPhone"
                      :ref="el => setInputRef(el, row)"
                      style="width: 100%; height: 25px"
                      v-model="row.phone"
                      @blur="handleBlur(row, 'editingPhone', 'phone')"
                    ></el-input>
                    <div
                      v-else
                      style="width: 100%; height: 25px"
                      @dblclick="handleClick(row, 'editingPhone', 'phone')"
                    >
                      {{ row.phone }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="catelog"
                  label="分类"
                  :formatter="formatColumn"
                ></el-table-column>
                <el-table-column label="状态" :formatter="formatColumn" width="150">
                  <template #default="{ row }">
                    <el-dropdown split-button trigger="click">
                      {{ row.status === '1' ? '正常' : '停用' }}
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item
                            @click="changeStatus(row, '1')"
                            :disabled="row.status === '1' ? true : false"
                            >正常</el-dropdown-item
                          >
                          <el-dropdown-item
                            @click="changeStatus(row, '0')"
                            :disabled="row.status === '0' ? true : false"
                            >停用</el-dropdown-item
                          >
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </template>
                </el-table-column>
                <el-table-column label="所属院系" width="150">
                  <template #default="{ row }">
                    <!-- <el-input style="width: 100%; height: 25px;" v-model="row.obsname"></el-input> -->
                    <el-cascader
                      v-model="row.obsid"
                      :ref="el => setCascaderRef(el, row)"
                      :options="obsmenulist"
                      :id="row.id"
                      :show-all-levels="false"
                      @change="value => handleObsChange(row, value)"
                      :props="{
                        value: 'id',
                        label: 'obsname',
                        children: 'children',
                        checkStrictly: true,
                        emitPath: false
                      }"
                      filterable
                    >
                    </el-cascader>
                    <!-- <div v-else style="width: 100%; height: 25px;"
									@click="handleClick(row, 'editingObsname', 'obsname')">
									{{ row.obsname }}
								</div> -->
                  </template>
                </el-table-column>
                <el-table-column label="备注" min-width="150">
                  <template #default="{ row }">
                    <el-input
                      v-if="row.editingRemark"
                      :ref="el => setInputRef(el, row)"
                      style="width: 100%; height: 25px"
                      v-model="row.remark"
                      @blur="handleBlur(row, 'editingRemark', 'remark')"
                    ></el-input>
                    <div
                      v-else
                      style="width: 100%; height: 25px"
                      @dblclick="handleClick(row, 'editingRemark', 'remark')"
                    >
                      {{ row.remark }}
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <el-button type="info" large style="width: 40%" @click="closeDialog">取消</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-container>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  defineExpose,
  computed,
  watch,
  nextTick,
  onMounted,
  getCurrentInstance
} from 'vue';
import request from '../../../utils/request.js';
import { ElMessage } from 'element-plus';
import { searchInTable } from '../../../utils/searchInTable.js';
import _ from 'lodash';
import { Document, Folder } from '@element-plus/icons-vue';
import Peoplemangt from '../Peoplemangt.vue';
import useTeacherInClass from '../../../stores/useTeacherInClass.js';

//显示弹窗组件
const dialogVisible = ref(false);

const activeName = ref('input');

const searchKeyword = ref('');

const filteredData = ref([]);

const CascaderRef = ref({});

const teacherStore = useTeacherInClass();

const oldData = ref();

const inputsRefs = ref({});

const clear = () => {
  filteredData.value = [];
  searchKeyword.value = '';
  activeName.value = 'input';
};

const debouncedQuerySearch = _.debounce(() => {
  querySearch();
}, 500);
const querySearch = () => {
  // 处理搜索逻辑
  if (searchKeyword.value.length >= 1 || searchKeyword.value.length === 0) {
    filteredData.value = searchInTable(teacherStore.peopleList, searchKeyword.value, 'username'); // 假设我们按 'username' 列搜索
  }
};

const setCascaderRef = (el, row) => {
  // 存储不同级联选择器的实例
  if (el) {
    CascaderRef.value[row.id] = el;
  }
};

const findObsById = (nodes, id) => {
  if (!nodes || !id) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findObsById(node.children, id);
    if (found) return found;
  }
  return null;
};

const handleBlur = (row, editingField = '', dataField = '') => {
  nextTick(async () => {
    row[editingField] = false;
    if (row[dataField] !== oldData.value) {
      // 数据改动了再提交

      if (editingField === 'editingPhone') {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(row[dataField])) {
          ElMessage.error('手机号格式不正确');
          row[dataField] = oldData.value;
          return;
        }
      }

      if (typeof row.obsname !== 'string') {
        // 判断是否是级联选择器失去焦点的事件，因为被其绑定的值会变成数组类型
        dataField = 'obsname';
        row.obsname = row.obsname[row.obsname.length - 1];
        CascaderRef.value[row.id].togglePopperVisible(); // 当选择级联选择器的任意选项后，关闭选择器
      }
      console.log({ id: row.id, [dataField]: row[dataField] });
      try {
        const res = await request.admin.post('/sysmangt/personnelmangt/update', {
          id: row.id,
          catelog: row.catelog,
          [dataField]: row[dataField]
        });
        if (res.code === 200) {
          ElMessage.success('修改成功');
        } else {
          ElMessage.error(res.msg);
        }
      } catch (error) {
        ElMessage.error('修改失败' + error);
      }
      oldData.value = null;
      getPeopleList();
    }
  });
};

const handleObsChange = async (row, obsid) => {
  if (!obsid || obsid === row._lastObsid) return;
  row._lastObsid = obsid;
  const selectedObs = findObsById(obsmenulist.value, obsid);
  try {
    const res = await request.admin.post('/sysmangt/personnelmangt/update', {
      id: row.id,
      catelog: row.catelog,
      obsid
    });
    if (res.code === 200) {
      row.obsname = selectedObs?.obsname || row.obsname;
      ElMessage.success('修改成功');
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('修改失败' + error);
  }
};

const handleClick = (row, editingField, dataField) => {
  nextTick(() => {
    row[editingField] = true;
    oldData.value = row[dataField];
    setTimeout(() => {
      if (inputsRefs.value[row.id] && inputsRefs.value[row.id].$refs.input) {
        inputsRefs.value[row.id].$refs.input.focus();
      }
    }, 0);
  });
};

const setInputRef = (el, row) => {
  if (el) {
    inputsRefs.value[row.id] = el;
  }
};

const changeStatus = async (row, value) => {
  row.status = value;
  try {
    const res = await request.admin.post('/sysmangt/personnelmangt/update', {
      id: row.id,
      catelog: row.catelog,
      status: value
    });
    if (res.code === 200) {
      ElMessage.success('修改成功');
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('修改失败' + error);
  }
};

const newform = reactive({
  username: '',
  loginname: '',
  pwd: '123456',
  personnelno: '',
  phone: '',
  catelog: '', // default value
  status: '1', // default to '有效'
  obsid: '',
  obsname: '',
  remark: ''
});

const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  loginname: [{ required: true, message: '请输入登录名', trigger: 'blur' }],
  pwd: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  personnelno: [{ required: true, message: '请输入学号/工号', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  catelog: [{ required: true, message: '请选择人员类别', trigger: 'change' }],
  obsid: [{ required: true, message: '请选择机构', trigger: 'change' }]
});

const formRef = ref(null);
const obsmenulist = ref([]);

const findObsNameById = (nodes, id) => {
  if (!nodes || !id) return '';
  for (const node of nodes) {
    if (node.id === id) return node.obsname;
    const childName = findObsNameById(node.children, id);
    if (childName) return childName;
  }
  return '';
};

const getSelectedObsName = () => {
  const selectedObsId = Array.isArray(newform.obsid)
    ? newform.obsid[newform.obsid.length - 1]
    : newform.obsid;
  return findObsNameById(obsmenulist.value, selectedObsId) || newform.obsname;
};

//初始化，用于接受父组件传来的值，并发送请求获取菜单
function init(form, oriobsmenulist) {
  dialogVisible.value = true;
  obsmenulist.value = oriobsmenulist.value;
  // console.log(123)
  // console.log(oriobsmenulist.value)
  //将父组件中的form传入子组件中的form
  for (const key in form) {
    if (newform.hasOwnProperty(key)) {
      newform[key] = form[key];
    }
  }
  // fetchData();
  console.log(newform);
}

const emit = defineEmits(['formSubmitted']);

//将init函数暴露给父组件
defineExpose({ init });

const submitForm = () => {
  formRef.value.validate(valid => {
    if (valid) {
      const selectedObsName = getSelectedObsName();
      if (!selectedObsName) {
        ElMessage.error('请选择机构');
        return;
      }
      const { obsid, ...dataToSend } = newform;
      dataToSend.obsid = Array.isArray(obsid) ? obsid[obsid.length - 1] : obsid;
      dataToSend.obsname = selectedObsName;
      console.log(dataToSend);
      // 表单验证通过，处理表单提交逻辑
      request.admin
        .post('/sysmangt/personnelmangt/create', dataToSend)
        .then(res => {
          if (res.code === 200) {
            ElMessage({
              type: 'success',
              message: '新增人员成功'
            });
            emit('formSubmitted');
            closeDialog();
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch(error => {
          ElMessage({
            type: 'error',
            message: '新增人员成功'
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
  clear();
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
  margin-right: 5vw;
}

/* Adjust the negative margin to align with the header */
.tree-with-header .el-tree {
  margin-top: -30px;
}
</style>
