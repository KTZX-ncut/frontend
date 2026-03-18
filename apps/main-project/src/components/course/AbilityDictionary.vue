<template>
  <el-container style="height: 92vh">
    <el-header style="
        height: auto;
        padding: 5px 0px;
        width: 100%;
        background-color: #deebf7;
        display: flex;
        align-items: center;
      ">
      <el-button type="primary" style="margin-left: 0.8vw" @click="exportData">导出到Excel</el-button>
      <el-button type="danger" @click="changeTreeExpand" style="margin-left: 0.8vw">全部展开/关闭</el-button>
      <el-button type="success" style="margin-left: 0.8vw">保存</el-button>
      <el-button type="primary" @click="create1stNode" style="margin-left: 0.8vw;">新增一级节点</el-button>
      <!-- <el-button type="success" @click="openPreProfessionDialog" class="ml-[0.8vw]">复制历史数据</el-button> -->
    </el-header>

    <el-main style="padding: 0">
      <div style="
          height: 25px;
          display: flex;
          justify-content: space-between;
          flex: auto;
          text-align: center;
          background-color: whitesmoke;
          min-width: 1190px;
          color: gray;
        ">
        <div style="min-width: 340px">名称</div>
        <div style="min-width: 850px; width: 59vw">
          <div style="display: flex; flex: auto; justify-content: space-between">
            <div style="
                width: 150px;
                border-right: 1px solid #bbbbbb;
                border-left: 1px solid #bbbbbb;
                color: gray;
              ">
              系数
            </div>
            <div style="min-width: 750px; width: 100%">备注</div>
          </div>
        </div>
      </div>
      <div class="tree-container" style="height: calc(100% - 25px); overflow: auto; min-width: 1190px">
        <el-tree :data="treeData" draggable node-key="id" :props="defaultProps" :expand-on-click-node="false"
          ref="nodeExpand" :default-expand-all="expandAll" :default-expanded-keys="expandedKeys" @node-drag-start=""
          @node-drag-end="" @node-contextmenu="clickNode" @node-expand="openNode" @node-collapse="closeNode">
          <template #default="{ node }">
            <div style="display: flex; justify-content: space-between; flex: auto; text-align: left">
              <el-popover :visible="node.data.popVisible" placement="right"
                popper-style="background-color: rgba(255, 255, 255, 0.5)">
                <el-button style="margin-top: 6px; width: 100%" type="primary" plain round
                  @click="addSiblingNode(node.data)">同级新增</el-button><br />
                <el-button style="margin-top: 6px; width: 100%" type="primary" plain round
                  @click="addChildNode(node.data)">下级新增</el-button><br />
                <el-button style="margin-top: 6px; width: 100%" type="danger" plain round
                  @click="confirmDeleteNodes(node.data)">删除</el-button>
                <template #reference>
                  <el-input v-if="node.data.editingName" v-model="node.data.name"
                    @blur="blurInput(node.data, 'editingName')" placeholder="请输入节点名称" @contextmenu.stop
                    draggable="false" style="height: 20px; width: 150px"
                    :ref="el => setInputRef(el, node.data)"></el-input>
                  <div v-else style="width: 150px; height: 20px" @dblclick="handleClick(node.data, 'editingName')">
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

              <div style="min-width: 850px; width: 59vw">
                <div style="display: flex; flex: auto; justify-content: space-between">
                  <div style="width: 150px; text-align: center; height: 100%; overflow: hidden"
                    @dblclick="handleClick(node.data, 'editingDatavalue')">
                    <el-input v-if="node.data.editingDatavalue" v-model="node.data.datavalue"
                      @blur="blurInput(node.data, 'editingDatavalue')" placeholder="请输入数值" @contextmenu.stop
                      draggable="false" style="height: 20px; width: 100%"
                      :ref="el => setInputRef(el, node.data)"></el-input>
                    <div style="width: 100%; height: 20px" v-else>{{ node.data.datavalue }}</div>
                  </div>
                  <div style="
                      min-width: 750px;
                      width: 100%;
                      height: 100%;
                      overflow: hidden;
                      white-space: nowrap;
                      text-overflow: ellipsis;
                    " v-bind:title="node.data.remark" @dblclick="handleClick(node.data, 'editingRemark')">
                    <el-input v-if="node.data.editingRemark" v-model="node.data.remark"
                      @blur="blurInput(node.data, 'editingRemark')" placeholder="请输入备注" @contextmenu.stop
                      draggable="false" style="height: 20px; width: 100%"
                      :ref="el => setInputRef(el, node.data)"></el-input>
                    <div v-else style="
                        width: 100%;
                        height: 20px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                      " v-bind:title="node.data.remark">
                      {{ node.data.remark }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
    </el-main>
  </el-container>

  <el-dialog v-model="preProfessionDialogVisible" title="历史字典数据" width="650" align-center destroy-on-close>
    <div class="px-[20px] pb-[10px]">
      <div style="text-align: left; margin: 10px 0;">
        <span style="font-size: 14px; margin-right: 5px;">学期</span>
        <el-select v-model="termId" @change="chooseTerm" style="width: 240px;" placeholder="请选择历史学期">
          <el-option v-for="item in termList" :key="item.id" :label="item.termname" :value="item.id" />
        </el-select>
      </div>

      <el-table class="custom-table" :data="professionData" style="width: 100%; height: 45vh;">
        <template #empty>当前学期无对应能力字典数据</template>
        <el-table-column type="index" label="" width="55" />
        <el-table-column property="procode" label="专业代码" width="200" />
        <el-table-column property="proname" label="专业名称" width="200" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button class="custom-nav-button custom-nav-button-success" @click="copy(row)">复制字典数据</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
import parseJWT from '@/utils/parseJWT.js';
import exportCode from '@/assets/js/commonData.js';
import useAbility from '@/stores/useAbility.js';
import { Folder, Document } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '../../utils/request';
import '@/assets/css/taildwind.css';

const defaultProps = {
  children: 'children',
  label: 'name'
};

const props = defineProps({
  badge: {
    type: String
  }
});

const treeData = ref([]);

const nodeExpand = ref(null);

const expandAll = ref(false);

const expandedKeys = ref([]); // 默认展开的节点的key的数组

const openedPopNode = ref({}); // 记录哪个节点的弹出框被打开了

/*************预处理数据************/
const id = ref(1);

const initialize = nodes => {
  nodes?.forEach(node => {
    node.popVisible = false;
    node.editingName = false;
    node.editingDatavalue = false;
    node.editingRemark = false;
    // node.id = id.value ++;

    if (node.children && node.children.length > 0) {
      initialize(node.children); // 递归子节点
    }
  });
};

const getData = res => {
  if (res.code === 200) {
    treeData.value = res.data;
    initialize(treeData.value);
    // console.log(treeData.value);
  }
};

// 声明ability钩子
const abilityStore = useAbility();
const getTreeData = async () => {
  switch (props.badge) {
    case exportCode.PROFESSIONHOME:
      await abilityStore.fetchProfessionAbility();
      getData(abilityStore.initializeData);
      break;
    case exportCode.COURSEMANAGERHOME:
      await abilityStore.fetchCourseAbility();
      getData(abilityStore.initializeData);
      break;
    default:
      console.log('暂未处理');
  }
};

onMounted(() => {
  // initialize(treeData.value);
  const router = useRoute();
  console.log(router);
  getTreeData();
  document.addEventListener('click', closePopNode);
});
/**********************************/

/*****************控制树节点展开****************/
const changeTreeExpand = () => {
  expandAll.value = !expandAll.value;
  expandedKeys.value = [];
  let length = nodeExpand.value.store._getAllNodes().length;
  let allNodes = nodeExpand.value.store._getAllNodes();
  for (let i = 0; i < length; i++) {
    allNodes[i].expanded = expandAll.value;
    if (expandAll.value) expandedKeys.value.push(allNodes[i].key);
  }
  // console.log(expandedKeys.value)
};

const openNode = (nodeData, node) => {
  // console.log(node);
  if (!expandedKeys.value.includes(node.key)) {
    expandedKeys.value.push(node.key);
  }
  // console.log(expandedKeys.value)
};

const closeNode = (nodeData, node) => {
  removeExpandedKeys(node);
};

const removeExpandedKeys = node => {
  // 首先递归地移除所有子节点的ID
  if (node.childNodes && node.childNodes.length > 0) {
    node.childNodes.forEach(childNode => {
      removeExpandedKeys(childNode);
    });
  }

  // 然后移除当前节点的ID
  const index = expandedKeys.value.indexOf(node.key);
  if (index > -1) {
    expandedKeys.value.splice(index, 1);
  }
};
/********************************************/

/************ 与弹出框显示有关 **********/

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

const closePopNode = event => {
  // 检查点击事件是否在弹窗内部
  // 如果不是，则关闭弹窗
  if (openedPopNode.value) {
    openedPopNode.value.popVisible = false;
    openedPopNode.value = {};
  }
};

onBeforeUnmount(() => {
  document.removeEventListener('click', closePopNode);
});
/***************************************/

/************对结点的操作************/
const handleClick = (node, field) => {
  nextTick(() => {
    node[field] = true;
    setTimeout(() => {
      if (inputRefs.value[node.id] && inputRefs.value[node.id].$refs.input) {
        inputRefs.value[node.id].$refs.input.focus();
      }
    }, 0);
  });
};

/***********************************/

/**************新增节点*************/
const create1stNode = async () => {
  const postData = {
    id: '',
    pid: '0',
    abilitydeep: 0,
    type: '1',
    cmAbility: {
      name: '未命名节点',
      remark: ''
    }
  }

  try {
    const res = await request.evaluation.post('/evaluation/ability/create', postData);
    if (res.code === 200) {
      getTreeData();
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('新增失败' + error);
  }
}

const addSiblingNode = node => {
  console.log(node);
  const newNode = {
    id: node.id,
    pid: node.pid,
    abilitydeep: node.abilitydeep,
    type: '1',
    cmAbility: {
      name: '未命名节点',
      remark: '',
    }
  };
  // console.log(newNode);
  request.evaluation
    .post('/evaluation/ability/create', newNode)
    .then(res => {
      if (res.code === 200) {
        // console.log('first');
        getTreeData();
      }
    })
    .catch(error => {
      ElMessage.error('新增失败' + error);
    });

  node.popVisible = false;
};

const addChildNode = node => {
  const newNode = {
    id: node.id,
    pid: node.pid,
    abilitydeep: node.abilitydeep,
    type: '0',
    cmAbility: {
      name: '未命名节点',
      remark: '',
    }
  };
  // console.log(newNode);
  request.evaluation
    .post('/evaluation/ability/create', newNode)
    .then(res => {
      if (res.code === 200) {
        expandedKeys.value.push(node.id); //将该节点id追加到展开的id中
        getTreeData();
      }
    })
    .catch(error => {
      ElMessage.error('新增失败' + error);
    });

  node.popVisible = false;
};
/***********************************/

/*****************删除节点***************/
const confirmDeleteNodes = node => {
  ElMessageBox.confirm(`是否删除"${node.name}"能力及其下属所有能力?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      let deletedNodes = [];
      if (node.children && node.children.length > 0) {
        deletedNodes = findChildNodes(node.children, [node.id]);
      } else deletedNodes.push(node.id);
      // console.log(deletedNodes);

      request.evaluation
        .post('/evaluation/ability/delete', deletedNodes)
        .then(res => {
          if (res.code === 200) {
            getTreeData();

            deletedNodes.forEach(id => {
              // 删除被删除节点的默认展开数据
              let index = -1;
              index = expandedKeys.value.indexOf(id);
              if (index > -1) expandedKeys.value.splice(index, 1);
            });
            // console.log(expandedKeys.value);
          } else {
            ElMessage({
              type: 'error',
              message: res.msg
            });
          }
        })
        .catch(error => {
          ElMessage.error('删除失败' + error);
        });
    })
    .catch(() => { });
  node.popVisible = false;
};

const findChildNodes = (nodes, array = []) => {
  // 查找某一节点的所有子节点id
  nodes.forEach(item => {
    array.push(item.id);
    if (item.children && item.children.length > 0) {
      array = findChildNodes(item.children, array);
    }
  });
  return array;
};
/****************************************/

/***************与输入框显示有关***************/

const inputRefs = ref({});

const setInputRef = (el, node) => {
  if (el) {
    inputRefs.value[`${node.id}`] = el;
  }
};

const blurInput = async (node, field) => {
  node[field] = false;
  console.log(node);
  const postData = {
    id: node.id,
    name: node.name
  };

  try {
    const res = await request.evaluation.post(`/evaluation/ability/update`, postData);
    if (res.code === 200) {
      ElMessage.success('修改成功');
    } else ElMessage.error(res.msg);
  } catch (error) {
    ElMessage.error(res.msg);
  }
};

/********************************************/

/******************复制历史数据****************/
const preProfessionDialogVisible = ref(false);
const termList = ref(null);
const termId = ref(null);
const professionData = ref([
  {
    id: '1',
    procode: '1',
    proname: 'a'
  },
  {
    id: '2',
    procode: '2',
    proname: 'b'
  },
  {
    id: '3',
    procode: '3',
    proname: 'c'
  },
  {
    id: '4',
    procode: '4',
    proname: 'd'
  },
  {
    id: '5',
    procode: '5',
    proname: 'e'
  },
  {
    id: '6',
    procode: '6',
    proname: 'f'
  },
  {
    id: '1',
    procode: '1',
    proname: 'a'
  },
  {
    id: '2',
    procode: '2',
    proname: 'b'
  },
  {
    id: '3',
    procode: '3',
    proname: 'c'
  },
  {
    id: '4',
    procode: '4',
    proname: 'd'
  },
  {
    id: '5',
    procode: '5',
    proname: 'e'
  },
  {
    id: '6',
    procode: '6',
    proname: 'f'
  },
]);

const openPreProfessionDialog = async () => {
  preProfessionDialogVisible.value = true;
  try {
    const res = await request.course.get(`/coursemangt/course/allterm`);
    if (res.code === 200) {
      termList.value = res.data;
      termId.value = termList.value[0].id;
      // await chooseTerm(termId.value);
    } else ElMessage.error(res.msg);
  } catch (error) {
    ElMessage.error('获取历史学期失败' + error);
  }
}

const chooseTerm = async (termId) => {
  try {
    const res = await request.evaluation.get(`/evaluation/ability/getPreProfession?termId=${termId}`);
    if (res.code === 200) {
      console.log(res.data);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('获取历史专业失败' + error);
  }
}
</script>

<style scoped>
/* 去掉滚动条 */
.tree-container::-webkit-scrollbar {
  /* 针对Chrome, Safari, Edge, 和 Opera */
  display: none;
}

.element {
  /* 针对Firefox */
  scrollbar-width: none;
}

.element {
  /* 针对IE和Edge旧版本 */
  -ms-overflow-style: none;
}

/*************/
</style>
