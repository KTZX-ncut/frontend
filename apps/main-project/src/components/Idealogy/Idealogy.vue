<template>
  <el-header
    style="height: auto; padding: 5px 0px; width: 100%; background-color: #fff; display: flex"
  >
    <!-- <div class="searchInput">
      <el-input
        v-model.lazy="search"
        @input="debouncedQuerySearch"
        placeholder="输入属性名进行检索"
        class="input-with-select"
        style="width: 200px; margin-right: 0.8vw"
      ></el-input>
      <el-button type="primary" @click="querySearch">搜索</el-button>
    </div> -->
    <el-button
      v-if="char.rolename === '课程负责人'"
      @click="handleAddFirst"
      type="success"
      style="margin-left: 0.8vw !important"
      >新增一级节点</el-button
    >
    <!-- <el-button @click="handleDelAll" type="danger" style="margin-left: 0.8vw">删除</el-button> -->
  </el-header>
  <div v-if="!Llist">暂无数据，请联系课程负责人创建</div>
  <div v-else>
    <el-tree
      :data="Llist"
      :props="treeProps"
      node-key="id"
      :expand-on-click-node="true"
      ref="elRef"
      @node-click="handleNodeClick"
      :default-expanded-keys="expandedKeys"
      :default-expand-all="true"
      @node-drag-start="handleDragStart"
      @node-drag-end="handleDragEnd"
      @node-contextmenu="clickNode"
      @node-expand="openNode"
      @node-collapse="closeNode"
    >
      <template #default="{ node }">
        <div
          v-if="char.rolename === '课程负责人'"
          style="
            display: flex;
            justify-content: space-between;
            flex: auto;
            text-align: left;
            margin-top: 2px;
          "
        >
          <el-popover
            :visible="node.data.popVisible"
            placement="right"
            trigger="click"
            popper-style="background-color: rgba(255, 255, 255, 0.5)"
          >
            <div style="display: flex; flex-direction: column; gap: 8px">
              <el-button
                style="margin-top: 6px; width: 100%"
                type="success"
                plain
                round
                @click="editNode(node.data)"
                >编辑</el-button
              >
              <!-- TODO：新增类型是否要向任课负责人开放？ -->
              <el-button
                v-if="node.data.level === 1"
                style="margin-top: 6px; width: 100%"
                type="primary"
                plain
                round
                @click="addSiblingNode(node.data)"
                >新增类型</el-button
              >
              <el-button
                style="margin-top: 6px; width: 100%"
                type="primary"
                plain
                round
                @click="addChildNode(node.data)"
                >新增标签</el-button
              >
              <el-button
                style="margin-top: 6px; width: 100%"
                type="danger"
                plain
                round
                @click="confirmDeleteNodes(node.data)"
                >删除</el-button
              >
            </div>
            <template #reference>
              <el-input
                ref="nodeInput"
                v-if="node.data.inputVisible"
                v-model="node.data.tempData"
                @blur="handleBlurTree(node.data)"
                placeholder="请输入节点名称"
                @contextmenu.stop
                draggable="false"
                style="height: 25px; width: 200px"
              ></el-input>
              <div style="width: auto">
                <el-icon v-if="node.data.children" color="orange">
                  <Folder />
                </el-icon>
                <el-icon v-else color="dodgerblue">
                  <Document />
                </el-icon>
                {{ node.data.name }}
              </div>
            </template>
          </el-popover>
        </div>
        <div style="width: 850px" v-else>
          <div style="display: flex; flex: auto; justify-content: space-between">
            <div style="width: auto">
              <el-icon v-if="node.data.children" color="orange">
                <Folder />
              </el-icon>
              <el-icon v-else color="dodgerblue">
                <Document />
              </el-icon>
              {{ node.data.name }}
            </div>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import _ from 'lodash';
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import '@/assets/css/taildwind.css';
import useIdealogy from '../../stores/useIdealogy';
import { ElMessage, ElMessageBox } from 'element-plus';
import parseJWT from '@/utils/parseJWT.js';
import useIdealogyNew from '../../stores/idealogyNewStore';
import { storeToRefs } from 'pinia';
/* ********************变量定义******************** */
const elRef = ref(null);
const search = ref('');
const loading = ref(false);
const char = JSON.parse(sessionStorage.getItem('users'));

const openedPopNode = ref({});
const updateData = reactive({
  id: '',
  vname: '',
  remark: '',
  courseId: ''
});

const delList = ref([]);

const IdealogyNewStore = useIdealogyNew();
const { fetchList, fetchUpdateLabel, fetchAddParent, fetchAddSame, fetchAddChild, fetchDelLabel } =
  IdealogyNewStore;
const { Llist } = storeToRefs(IdealogyNewStore);

const nodeInput = ref(null);

// 学生列表表头定义
const studentTitles = [
  { prop: 'userName', label: '姓名' },
  { prop: 'stuNo', label: '学号' },
  { prop: 'obsName', label: '班级' }
];

/* ********************方法定义******************** */
const debouncedQuerySearch = _.debounce(() => {
  querySearch();
}, 500);

const querySearch = async () => {
  if (search.value.length >= 1 || search.value.length === 0) {
    loading.value = true;
    await IdealogyStore.fetchFuzzyQuery({
      fuzzyQuery: true,
      vname: search.value
      // courseId: addData.courseId
    });
    loading.value = false;
  }
};

const handleNodeClick = (data, node, event) => {
  // 在这里添加你的其他节点点击逻辑（如果有的话）

  // 关闭弹窗
  if (openedPopNode.value && openedPopNode.value.popVisible) {
    openedPopNode.value.popVisible = false;
    openedPopNode.value = {}; // 重置 openedPopNode
  }
};

const clickNode = (event, node, dom) => {
  // 右键节点触发
  //event为必须参数鼠标点击对象，node为节点的数据是可选参数，dom是当前节点的DOM元素也是可选参数
  if (openedPopNode.value) {
    openedPopNode.value.popVisible = false; // 防止多个弹出框一块显示，不好看
    openedPopNode.value = {};
  }
  node.popVisible = true;
  openedPopNode.value = node;
};

const editNode = node => {
  node.tempData = node.name;
  node.inputVisible = true;
  node.popVisible = false;
  nextTick(() => {
    if (nodeInput.value && nodeInput.value.$refs.input) {
      const inputElement = nodeInput.value.$refs.input;
      inputElement.focus();
      const len = inputElement.value.length;
      inputElement.setSelectionRange(len, len);
    }
  });
};

const handleBlurTree = async node => {
  nextTick(async () => {
    node.popVisible = false;
    console.log(node.tempData);
    if (node.tempData !== node.name) {
      const editdata = ref({
        id: node.id,
        vname: node.tempData
      });
      console.log(editdata.value);
      // 更新标签
      const { code, msg } = await fetchUpdateLabel(editdata.value);

      if (code === 200) {
        ElMessage({
          type: 'success',
          message: `修改成功`
        });
        node.inputVisible = false;
        await fetchList();
      } else {
        ElMessage({
          type: 'error',
          message: msg
        });
      }
    } else {
      ElMessage({
        type: 'info',
        message: '无修改字段'
      });
    }
    node.inputVisible = false;
  });
};

const addSiblingNode = async addedNode => {
  // 发送请求
  const { code, msg } = await fetchAddSame({ id: addedNode.id });
  if (code === 200) {
    ElMessage({
      type: 'success',
      message: '新增类型成功'
    });
  } else {
    ElMessage({
      type: 'error',
      message: msg
    });
  }
  await fetchList();
};

const addChildNode = async addedNode => {
  // 如果level === 1说明新增标签是下级新增
  // 不是说明新增标签是同级新增
  if (addedNode.level === 1) {
    const { code, msg } = await fetchAddChild({ id: addedNode.id });
    if (code === 200) {
      ElMessage({
        type: 'success',
        message: '新增标签成功'
      });
    } else {
      ElMessage({
        type: 'error',
        message: msg
      });
    }
    await fetchList();
    return;
  }
  addSiblingNode(addedNode);
};

const handleAddFirst = async () => {
  const { code, msg } = await fetchAddParent();
  if (code === 200) {
    ElMessage({
      type: 'success',
      message: '新增标签成功'
    });
  } else {
    ElMessage({
      type: 'error',
      message: msg
    });
  }
  await fetchList();
};

const confirmDeleteNodes = deletedNode => {
  console.log(deletedNode);
  let message;
  // 第一次弹窗的提示信息
  if (Object.prototype.hasOwnProperty.call(deletedNode, 'children')) {
    message = `是否删除节点 "${deletedNode.name}"，及其子节点?`;
  } else {
    message = `是否删除节点 "${deletedNode.name}"?`;
  }
  ElMessageBox.confirm(
    message, // 第一次弹窗提示
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 如果用户点击了"确定"，则弹出二次确认
      ElMessageBox.confirm(
        `确定要删除该节点吗？`, // 二次确认提示
        '请再次确认',
        {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning'
        }
      )
        .then(async () => {
          // 如果用户在二次确认中点击"是"，则执行删除操作
          // deleteNodes(deletedNode);
          console.log('yes');
          const { code, msg } = await fetchDelLabel({ id: deletedNode.id });
          if (code === 200) {
            ElMessage({
              type: 'success',
              message: '删除成功'
            });
          } else {
            ElMessage({
              type: 'error',
              message: msg
            });
          }
          await fetchList();
        })
        .catch(() => {
          // 用户在二次确认中点击了"否"，关闭弹窗
          deletedNode.popVisible = false;
        });
    })
    .catch(() => {
      // 用户在第一次弹窗中点击了"取消"，关闭弹窗
      deletedNode.popVisible = false;
    });
};

const handleDelAll = async () => {
  if (!delList.value.length) {
    ElMessage.info('未选择属性');
    return;
  }
  const { data } = await IdealogyStore.fetchDelIdea(delList.value);
  if (data) {
    await IdealogyStore.fetchIdeaList();
    ElMessage.success('删除成功');
    return;
  }
  ElMessage.error('删除失败');
};

const handelAdd = async () => {
  if (addData.vname === '') {
    ElMessage.info('属性名不能为空');
    return;
  }
  const { code, msg } = await IdealogyStore.fetchAddIdea(addData);
  if (code === 200) {
    await IdealogyStore.fetchIdeaList();
    return ElMessage.success('新增成功');
  }
  ElMessage.error(msg);
};

const handleHide = async scope => {
  if (updateData.remark === scope.row.remark && updateData.vname === scope.row.vname) {
    ElMessage({
      type: 'info',
      message: '暂无修改'
    });
    return;
  }
  updateData.id = scope.row.id;
  if (updateData.vname === scope.row.vname) {
    delete updateData.vname;
  }
  const { code, msg } = await IdealogyStore.fetchUpdIdea(updateData);
  await IdealogyStore.fetchIdeaList();
  if (code === 200) return ElMessage.success('修改成功');
  ElMessage.error(msg);
};

onMounted(async () => {
  const token = parseJWT(sessionStorage.getItem('token'));
  loading.value = true;
  await fetchList();
  // await IdealogyStore.fetchIdeaList(token.obsid);
  loading.value = false;
  addData.courseId = token.obsid;
  updateData.courseId = token.obsid;
});
</script>

<style scoped>
:deep(.el-input) {
  margin-top: 2px;
  margin-bottom: 2px;
}

:deep(.el-button + .el-button) {
  margin-left: 0px;
}
</style>
