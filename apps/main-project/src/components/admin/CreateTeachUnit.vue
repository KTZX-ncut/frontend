<template>
  <el-container style="height: 92vh">
    <!-- 头部操作栏 -->
    <el-header
      style="
        height: auto;
        padding: 5px 0;
        width: 100%;
        background-color: #deebf7;
        display: flex;
        align-items: center;
        justify-content: flex-start;
      "
    >
      <el-button type="success" v-blur-on-click style="margin-left: 0.8vw" @click="exportData">导出</el-button>
      <el-button type="primary" v-blur-on-click @click="changeTreeExpand" style="margin-left: 0.8vw">展开/收起全部</el-button>
      <el-button
        type="success"
        v-blur-on-click
        style="margin-left: 0.8vw"
        :disabled="!canEditSelected"
        @click="bannerEdit"
      >编辑</el-button>
      <el-button
        type="primary"
        v-blur-on-click
        style="margin-left: 0.8vw"
        :disabled="!canAddSiblingSelected"
        @click="bannerAddSibling"
      >同级新增</el-button>
      <el-button
        type="primary"
        v-blur-on-click
        style="margin-left: 0.8vw"
        :disabled="!canAddChildSelected"
        @click="bannerAddChild"
      >下级新增</el-button>
      <el-button
        type="danger"
        v-blur-on-click
        style="margin-left: 0.8vw"
        :disabled="!canDeleteSelected"
        @click="bannerDelete"
      >删除</el-button>
      <el-button type="primary" v-blur-on-click style="margin-left: 0.8vw" @click="openHistoryTermDialog">复制</el-button>
    </el-header>

    <el-dialog v-model="historyTermDialogVisible" title="历史学期" width="640px">
      <el-table :data="historyTermList" style="width: 100%">
        <el-table-column type="index" width="60" label="#" />
        <el-table-column prop="termname" label="学期名称" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button type="primary" link @click="copyFromTerm(row)">复制学期</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 主体内容 -->
    <el-main style="padding: 0">
      <!-- 表头标题栏 -->
      <div
        style="
          height: 25px;
          display: flex;
          justify-content: space-between;
          flex: auto;
          color: gray;
          background-color: whitesmoke;
          min-width: 1236px;
        "
      >
        <div style="width: 385px">名称</div>
        <div style="width: 850px">
          <div style="display: flex; flex: auto; justify-content: space-between">
            <div style="width: 200px; border-right: 1px solid #bbbbbb; border-left: 1px solid #bbbbbb">层级码</div>
            <div style="width: 700px; flex: 1">备注</div>
          </div>
        </div>
      </div>

      <!-- 树容器 -->
      <div class="tree-container" style="height: calc(100% - 25px); overflow: auto; min-width: 1236px">
        <el-tree
          :data="treeData"
          draggable
          :props="defaultProps"
          node-key="id"
          highlight-current
          :current-node-key="selectedNode?.id"
          :expand-on-click-node="true"
          ref="nodeExpand"
          @node-click="handleNodeClick"
          :default-expanded-keys="expandedKeys"
          :default-expand-all="expandAll"
          @node-drag-start="handleDragStart"
          @node-drag-end="handleDragEnd"
          @node-contextmenu="clickNode"
          @node-expand="openNode"
          @node-collapse="closeNode"
        >
          <template #default="{ node }">
            <div style="display: flex; justify-content: space-between; flex: auto; text-align: left">
              <!-- 弹窗按钮区域 -->
              <el-popover
                :visible="node.data.popVisible"
                placement="right"
                popper-style="background-color: rgba(255, 255, 255, 0.5)"
              >
                <el-button style="margin-top: 6px; width: 100%" type="success" plain round @click="editNode(node.data)">编辑</el-button><br />
                <el-button style="margin-top: 6px; width: 100%" type="primary" plain round @click="addSiblingNode(node.data)">同级新增</el-button><br />
                <el-button style="margin-top: 6px; width: 100%" type="primary" plain round @click="addChildNode(node.data)">下级新增</el-button><br />
                <el-button style="margin-top: 6px; width: 100%" type="danger" plain round @click="confirmDeleteNodes(node.data)">删除</el-button>

                <template #reference>
                  <el-input
                    ref="nodeInput"
                    v-if="node.data.inputVisible"
                    v-model="node.data.tempData"
                    @blur="handleBlur(node.data)"
                    placeholder="请输入节点名称"
                    @contextmenu.stop
                    draggable="false"
                    style="height: 25px; width: 200px"
                  ></el-input>
                  <div style="width: auto">
                    <el-icon v-if="node.data.children" color="orange"><Folder /></el-icon>
                    <el-icon v-else color="dodgerblue"><Document /></el-icon>
                    {{ node.data.obsname }}
                  </div>
                </template>
              </el-popover>

              <!-- 右侧信息区域 -->
              <div style="width: 850px">
                <div style="display: flex; flex: auto; justify-content: space-between">
                  <div style="width: 200px">{{ node.data.levelcode }}</div>
                  <div
                    style="
                      min-width: 700px;
                      width: 100%;
                      overflow: hidden;
                      white-space: nowrap;
                      text-overflow: ellipsis;
                    "
                    :title="node.data.remark"
                  >
                    {{ node.data.remark }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
    </el-main>
  </el-container>
</template>

<script lang="ts" setup>
import { Document, Folder } from '@element-plus/icons-vue';
import {
  ElMessage,
  ElMessageBox,
  ElMessageBoxOptions,
} from 'element-plus';
import type Node from 'element-plus/es/components/tree/src/model/node';
import type { DragEvents } from 'element-plus/es/components/tree/src/model/useDragNode';
import type { NodeDropType } from 'element-plus/es/components/tree/src/tree.type';
import { ref, reactive, onMounted, nextTick, onBeforeUnmount, toRaw, computed } from 'vue';
import request from '../../utils/request';
import { exportTreeToCSV } from '../../utils/exportTreeToCSV';

// 树数据
const treeData = ref([]);
const expandedKeys = ref([]); // 展开的节点键值
const nodeExpand = ref(null);

const selectedNode = ref<any | null>(null);
const nullNodeNum = ref(0);
const historyTermDialogVisible = ref(false);
const historyTermList = ref<any[]>([]);

// 展开/收起控制
const expandAll = ref(false);
const changeTreeExpand = () => {
  expandAll.value = !expandAll.value;
  expandedKeys.value = [];
  const allNodes = nodeExpand.value.store._getAllNodes();
  allNodes.forEach((n) => {
    n.expanded = expandAll.value;
    if (expandAll.value) expandedKeys.value.push(n.key);
  });
};

// 初始化配置
const defaultProps = {
  children: 'children',
  label: 'obsname',
  expanded: 'expanded'
};

// 查找节点
const findNodeById = (nodes, id) => {
  if (!nodes || !id) return null;
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 同步选中节点
const syncSelectedNode = (nodes) => {
  if (selectedNode.value?.id) {
    const found = findNodeById(nodes, selectedNode.value.id);
    if (found) {
      selectedNode.value = found;
      return;
    }
  }
  selectedNode.value = nodes && nodes.length > 0 ? nodes[0] : null;
};

// 权限计算
const canEditSelected = computed(() => !!selectedNode.value && selectedNode.value.pid !== '0');
const canAddSiblingSelected = computed(() => !!selectedNode.value && selectedNode.value.pid !== '0');
const canAddChildSelected = computed(() => !!selectedNode.value);
const canDeleteSelected = computed(() => !!selectedNode.value && selectedNode.value.pid !== '0');

// 按钮事件
const bannerEdit = () => {
  if (!selectedNode.value) return;
  editNode(selectedNode.value);
};
const bannerAddSibling = () => {
  if (!selectedNode.value) return;
  addSiblingNode(selectedNode.value);
};
const bannerAddChild = () => {
  if (!selectedNode.value) return;
  addChildNode(selectedNode.value);
};
const bannerDelete = () => {
  if (!selectedNode.value) return;
  confirmDeleteNodes(selectedNode.value);
};

const openHistoryTermDialog = async () => {
  await getHistoryTermList();
  historyTermDialogVisible.value = true;
};

const getHistoryTermList = async () => {
  try {
    const res = await request.course.get('/coursemangt/course/allterm');
    if (res.code === 200) {
      historyTermList.value = res.data || [];
      return;
    }
    ElMessage.error(res.msg || '获取历史学期失败');
  } catch (error) {
    ElMessage.error('获取历史学期失败');
  }
};

const copyFromTerm = async (term) => {
  const termId = term.term_id ?? term.id;
  if (!termId) {
    ElMessage.error('未找到学期ID');
    return;
  }
  try {
    const res = await request.admin.post('/sysmangt/units/copy', { copyTerm: termId });
    if (res.code === 200) {
      ElMessage.success('复制学期成功');
      historyTermDialogVisible.value = false;
      getTreeData();
      return;
    }
    ElMessage.error(res.msg || '复制学期失败');
  } catch (error) {
    ElMessage.error('复制学期失败');
  }
};

// 获取初始数据
const getTreeData = () => {
  request.admin.get('/sysmangt/units').then(res => {
    if (res.code === 200) {
      treeData.value = res.data;
      nullNodeNum.value = 0;
      initialize(treeData.value);
      syncSelectedNode(treeData.value);
      console.log('getTreeData 被触发', treeData.value);
    }
  }).catch(() => {
    ElMessage({ type: 'error', message: '获取教学单位失败' });
  });
};

// 初始化节点状态
const initialize = (nodes) => {
  nodes.forEach(node => {
    node.popVisible = false;
    node.inputVisible = false;
    node.tempData = '';
    if (node.children && node.children.length > 0) {
      initialize(node.children);
    }
  });
};

// 删除确认
const confirmDeleteNodes = (deletedNode) => {
  const message =
    deletedNode.children && deletedNode.children.length > 0
      ? `是否删除节点 "${deletedNode.obsname}" 及其子节点？`
      : `是否删除节点 "${deletedNode.obsname}"？`;

  ElMessageBox.confirm(message, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessageBox.confirm('确定要删除该节点吗？', '请再次确认', {
      confirmButtonText: '是',
      cancelButtonText: '否',
      type: 'warning'
    }).then(() => {
      deleteNodes(deletedNode);
    }).catch(() => {});
  }).catch(() => {});
};

// 批量删除
const deleteNodes = (deletedNode) => {
  let idlist = [];
  if (deletedNode.children && deletedNode.children.length > 0) {
    idlist = findChildNodes(deletedNode.children, [deletedNode.id]);
  } else {
    idlist.push(deletedNode.id);
  }

  request.admin.post('/sysmangt/units/delete', idlist).then(res => {
    if (res.code === 200) {
      ElMessage({ type: 'success', message: `节点 "${deletedNode.obsname}" 已删除` });
      getTreeData();
      idlist.forEach(id => {
        const index = expandedKeys.value.indexOf(id);
        if (index > -1) expandedKeys.value.splice(index, 1);
      });
    } else if (res.code === 404) {
      ElMessage({ type: 'error', message: '批量删除教学单位出错' });
    }
  }).catch(() => {
    ElMessage({ type: 'error', message: '删除节点失败' });
  });
};

// 查找子节点
const findChildNodes = (nodes, array = []) => {
  nodes.forEach(item => {
    array.push(item.id);
    if (item.children && item.children.length > 0) {
      array = findChildNodes(item.children, array);
    }
  });
  return array;
};

// 导出功能
const columns = [
  { prop: 'obsname', label: '教学单位名称' },
  { prop: 'obsdeep', label: '深度' },
  { prop: 'orderno', label: '序号' },
  { prop: 'levelcode', label: '层级代码' }
];
const exportData = () => {
  exportTreeToCSV(treeData.value, columns);
};

// 展开/收起逻辑
const openNode = (nodeData, node) => {
  if (!expandedKeys.value.includes(node.key)) {
    expandedKeys.value.push(node.key);
  }
};

const removeExpandedKeys = (node) => {
  if (node.childNodes && node.childNodes.length > 0) {
    node.childNodes.forEach(childNode => {
      removeExpandedKeys(childNode);
    });
  }
  const index = expandedKeys.value.indexOf(node.key);
  if (index > -1) expandedKeys.value.splice(index, 1);
};

const closeNode = (nodeData, node) => {
  removeExpandedKeys(node);
};

// 新增节点
const addSiblingNode = async (addedNode) => {
  nullNodeNum.value += 1;
  const newNodeData = {
    id: addedNode.id,
    pid: addedNode.pid,
    obsdeep: addedNode.obsdeep.toString(),
    type: '1',
    smObs: { obsname: '未命名节点', remark: '' }
  };
  request.admin.post('/sysmangt/units/create', newNodeData).then(res => {
    if (res.code === 200) {
      ElMessage({ type: 'success', message: '新增同级教学单位成功' });
      getTreeData();
    } else {
      ElMessage.error(res.msg);
    }
  }).catch(() => {
    ElMessage({ type: 'error', message: '新增同级教学单位失败' });
  });
};

const addChildNode = (addedNode) => {
  nullNodeNum.value += 1;
  const newNodeData = {
    id: addedNode.id,
    pid: addedNode.pid,
    obsdeep: addedNode.obsdeep.toString(),
    type: '2',
    smObs: { obsname: '未命名节点', remark: '' }
  };
  request.admin.post('/sysmangt/units/create', newNodeData).then(res => {
    if (res.code === 200) {
      ElMessage({ type: 'success', message: '新增下级教学单位成功' });
      expandedKeys.value.push(addedNode.id);
      getTreeData();
    } else {
      ElMessage.error(res.msg);
    }
  }).catch(() => {
    ElMessage({ type: 'error', message: '新增下级教学单位失败' });
  });
};

// 拖拽处理
const parentData = ref({ parentNode: null, childrenIndex: null });

const handleDragStart = (draggingNode, ev) => {
  findParent(draggingNode.data);
};

const handleDragEnd = (draggingNode, dropNode, dropType, ev) => {
  if (dropType === 'none') return;

  if (parentData.value.parentNode && parentData.value.parentNode.children.length === 0) {
    delete parentData.value.parentNode.children;
  }

  if (dropType === 'before') {
    insertDraggingNode(draggingNode.data, dropNode.data, 'before');
    deleteOldDraggingNode(draggingNode.data);
  } else if (dropType === 'inner') {
    if (!dropNode.data.children) dropNode.data.children = [];
    dropNode.data.children.push(draggingNode.data);
    deleteOldDraggingNode(draggingNode.data);
  } else if (dropType === 'after') {
    insertDraggingNode(draggingNode.data, dropNode.data, 'after');
    deleteOldDraggingNode(draggingNode.data);
  }

  parentData.value = { parentNode: null, childrenIndex: null };
};

const findParent = (childNode, nodes = treeData.value, parent = null) => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].obsname === childNode.obsname) {
      parentData.value = { parentNode: parent, childrenIndex: i };
      return true;
    }
    if (nodes[i].children && nodes[i].children.length > 0) {
      if (findParent(childNode, nodes[i].children, nodes[i])) return true;
    }
  }
  return false;
};

const insertDraggingNode = (draggingNode, dropNode, dropType) => {
  findParent(dropNode);
  if (dropType === 'before') dropType = 0;
  else if (dropType === 'after') dropType = 1;

  if (!parentData.value.parentNode) {
    treeData.value.splice(parentData.value.childrenIndex + dropType, 0, draggingNode);
  } else {
    parentData.value.parentNode.children.splice(
      parentData.value.childrenIndex + dropType,
      0,
      draggingNode
    );
  }
};

const deleteOldDraggingNode = (draggingNode) => {
  findParent(draggingNode);
  if (!parentData.value.parentNode) {
    treeData.value.splice(parentData.value.childrenIndex, 1);
  } else {
    parentData.value.parentNode.children.splice(parentData.value.childrenIndex, 1);
  }
};

// 右键弹窗
const openedPopNode = ref({});
const clickNode = (event, node, dom) => {
  if (openedPopNode.value) {
    openedPopNode.value.popVisible = false;
    openedPopNode.value = {};
  }
  selectedNode.value = node;
  if (node.pid === '0') return;
  node.popVisible = true;
  openedPopNode.value = node;
};

const closePopNode = (event) => {
  if (openedPopNode.value && !event.target.closest('.el-popover')) {
    openedPopNode.value.popVisible = false;
    openedPopNode.value = {};
  }
};

const handleNodeClick = (data, node, event) => {
  selectedNode.value = data;
  if (openedPopNode.value?.popVisible) {
    openedPopNode.value.popVisible = false;
    openedPopNode.value = {};
  }
};

onBeforeUnmount(() => {
  document.removeEventListener('click', closePopNode);
});

// 编辑节点
const nodeInput = ref(null);
const editNode = (node) => {
  node.tempData = node.obsname;
  node.inputVisible = true;
  node.popVisible = false;
  nextTick(() => {
    if (nodeInput.value?.$refs?.input) {
      const inputElement = nodeInput.value.$refs.input;
      inputElement.focus();
      const len = inputElement.value.length;
      inputElement.setSelectionRange(len, len);
    }
  });
};

const handleBlur = (node) => {
  nextTick(() => {
    node.popVisible = false;
    if (node.tempData !== node.obsname) {
      const editData = {
        id: node.id,
        obsname: node.tempData,
        obsdeep: node.obsdeep,
        remark: ''
      };
      request.admin.post('/sysmangt/units/update', editData).then(res => {
        if (res.code === 200) {
          ElMessage({ type: 'success', message: '修改教学单位名称成功' });
          getTreeData();
        }
      }).catch(() => {
        ElMessage({ type: 'error', message: '修改教学单位名称失败' });
      });
    } else {
      ElMessage({ type: 'info', message: '无修改字段' });
    }
    node.inputVisible = false;
  });
};

onMounted(() => {
  getTreeData();
  document.addEventListener('click', closePopNode);
});
</script>

<style scoped>
/* 隐藏滚动条 */
.tree-container::-webkit-scrollbar {
  display: none;
}
</style>
