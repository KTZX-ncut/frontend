<template>
  <el-container style="height: 92vh">
    <el-header
      style="
        height: auto;
        padding: 5px 0px;
        width: 100%;
        text-align: left;
        background-color: #deebf7;
      "
    >
      <el-button type="success" style="margin-left: 0.8vw" @click="addKWA()">新增</el-button>
      <el-button type="danger" @click="deleteKWA">删除</el-button>
      <el-button type="primary">保存</el-button>
      <el-button type="warning" @click="exportExcel">导出Excel</el-button>
      <!-- <el-button type="success" @click="changeEl">修改属性</el-button> -->
      <el-input
        v-model="tableSearchData"
        style="margin-left: 0.8vw; width: 250px"
        placeholder="查找KWA"
      >
        <template #append><el-button :icon="Search" /></template>
      </el-input>
    </el-header>
    <el-main style="padding: 0">
      <el-table
        :data="filterTableData"
        style="height: 100%; width: 100%"
        v-model="tableSelected"
        @select="tableSelect"
        @select-all="tableSelectAll"
        element-loading-text="Loading..."
        v-loading="filterTableLoading"
        element-loading-background="rgba(0, 0, 0, 0.2)"
        stripe
      >
        <el-table-column align="center" type="selection" width="55"></el-table-column>
        <!-- <el-table-column prop="id" label="序码" width="100"></el-table-column> -->
        <el-table-column prop="name" label="名称" width="300">
          <template v-slot="row">
            {{ row.row.name }}
          </template>
        </el-table-column>

        <el-table-column align="center" prop="keywordname" label="关键字" min-width="140">
          <template v-slot="row">
            <el-popover :visible="row.row.keywordPopVisible" placement="right-end" width="600">
              <el-header
                style="height: auto; padding: 5px 0px; width: 100%; background-color: #eef3f6"
              >
                <div style="display: flex; justify-content: space-between">
                  <el-input
                    v-model="keywordSearchData"
                    style="margin-left: 0.8vw; width: 250px"
                    placeholder="查找关键字"
                  >
                    <template #append><el-button :icon="Search" /></template>
                  </el-input>
                  <el-button
                    style="margin-right: 10px"
                    :type="'danger'"
                    link
                    @click="row.row.keywordPopVisible = false"
                    >取消</el-button
                  >
                </div>
              </el-header>
              <el-table :data="filterKeywordData" height="300" stripe>
                <!-- <el-table-column prop="id" label="序码"></el-table-column> -->
                <el-table-column width="40">
                  <template v-slot="row">
                    <el-checkbox
                      v-model="kwdSelFlag[row.row.id]"
                      @change="chooseKeyword(row.row)"
                    />
                  </template>
                </el-table-column>
                <el-table-column>
                  <template v-slot="row">
                    {{ row.$index + 1 }}
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="名称" min-width="200"></el-table-column>
                <el-table-column prop="datavalue" label="权值">
                  <template v-slot="row">
                    {{ Number(row.row.datavalue).toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
              <div style="text-align: center">
                <el-button style="margin-top: 10px" type="success" @click="setKeyword(row)"
                  >确定</el-button
                >
              </div>
              <template #reference>
                <span>
                  {{ row.row.keywordname }}
                  <el-icon
                    color="dodgerblue"
                    class="edit-icon"
                    @click="openKeywordDictionary(row)"
                    size="16"
                  >
                    <Edit />
                  </el-icon>
                </span>
              </template>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column align="center" prop="abilityname" label="能力" min-width="140">
          <template v-slot="row">
            <el-popover :visible="row.row.abilityPopVisible" placement="right-end" width="600">
              <el-header
                style="height: auto; padding: 5px 0px; width: 100%; background-color: #eef3f6"
              >
                <div style="display: flex; justify-content: space-between">
                  <el-input
                    v-model="abilitySearchData"
                    style="margin-left: 0.8vw; width: 250px"
                    placeholder="查找能力"
                  >
                    <template #append><el-button :icon="Search" /></template>
                  </el-input>
                  <el-button
                    style="margin-right: 10px"
                    :type="'danger'"
                    link
                    @click="row.row.abilityPopVisible = false"
                    >取消</el-button
                  >
                </div>
              </el-header>
              <el-table :data="filterAbilityData" height="300" stripe>
                <!-- <el-table-column prop="id" label="序码"></el-table-column> -->
                <el-table-column width="40">
                  <template v-slot="row">
                    <el-checkbox v-model="abSelFlag[row.row.id]" @change="chooseAbility(row.row)" />
                  </template>
                </el-table-column>
                <el-table-column>
                  <template v-slot="row">
                    {{ row.$index + 1 }}
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="名称" min-width="200"></el-table-column>
                <el-table-column prop="datavalue" label="权值">
                  <template v-slot="row">
                    {{ Number(row.row.datavalue).toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
              <div style="text-align: center">
                <el-button style="margin-top: 10px" type="success" @click="setAbility(row)"
                  >确定</el-button
                >
              </div>
              <template #reference>
                <span>
                  {{ row.row.abilityname }}
                  <el-icon
                    color="dodgerblue"
                    class="edit-icon"
                    @click="openAbilityDictionary(row)"
                    size="16"
                  >
                    <Edit />
                  </el-icon>
                </span>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <!-- <el-table-column align="center" prop="vStore" label="属性 " min-width="140">
          <template #default="scope">
            <el-popover
              :visible="isShow && currentId === scope.row.id"
              placement="right-end"
              width="200"
            >
              <el-header style="height: auto; padding: 5px 0px; width: 100%">
                <div style="display: flex; justify-content: space-between">
                  <el-button
                    style="margin-right: 10px"
                    :type="'danger'"
                    link
                    @click="openV(row, true)"
                    >取消</el-button
                  >
                </div>
              </el-header>
              <el-tree
                ref="treeRef"
                show-checkbox
                default-expand-all
                style="max-width: 600px"
                :data="vStore.vList"
                :props="treeProps"
                @node-click="handleNodeclick"
              />
              <div style="text-align: center">
                <el-button style="margin-top: 10px" type="success" @click="setV(scope.row)"
                  >确定</el-button
                >
              </div>
              <template #reference>
                <div class="flex justify-center space-evenly align-center">
                  <template v-if="scope.row.v">
                    <div style="width: 80px" class="flex flex-wrap">
                      <template v-for="item in JSON.parse(scope.row.v)">
                        <el-tag style="margin-right: 2px" type="primary">{{ item.name }}</el-tag>
                      </template>
                    </div>
                  </template>
                  <el-icon color="dodgerblue" class="edit-icon" @click="openV(scope.row)" size="16">
                    <Edit />
                  </el-icon>
                </div>
              </template> -->
        <!-- <el-header
                style="height: auto; padding: 5px 0px; width: 100%; background-color: #eef3f6"
              >
                <div style="display: flex; justify-content: space-between">
                  <el-input
                    v-model="abilitySearchData"
                    style="margin-left: 0.8vw; width: 250px"
                    placeholder="查找能力"
                  >
                    <template #append><el-button :icon="Search" /></template>
                  </el-input>
                  <el-button
                    style="margin-right: 10px"
                    :type="'danger'"
                    link
                    @click="row.row.abilityPopVisible = false"
                    >取消</el-button
                  >
                </div>
              </el-header>
              <el-table :data="filterAbilityData" height="300" stripe>
                <el-table-column width="40">
                  <template v-slot="row">
                    <el-checkbox v-model="abSelFlag[row.row.id]" @change="chooseAbility(row.row)" />
                  </template>
                </el-table-column>
                <el-table-column>
                  <template v-slot="row">
                    {{ row.$index + 1 }}
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="名称" min-width="200"></el-table-column>
                <el-table-column prop="datavalue" label="权值">
                  <template v-slot="row">
                    {{ Number(row.row.datavalue).toFixed(2) }}
                  </template>
                </el-table-column>
              </el-table>
              <div style="text-align: center">
                <el-button style="margin-top: 10px" type="success" @click="setAbility(row)"
                  >确定</el-button
                >
              </div>
               -->
        <!-- </el-popover> -->
        <!-- </template> -->
        <!-- <template v-slot="row">
            
          </template> -->
        <!-- </el-table-column> -->
        <el-table-column align="center" prop="datavalue" label="权值">
          <!-- <template v-slot="row">
            <el-input v-if="row.row.editingDatavalue" style="width: 100%; height: 25px"
                      v-model="row.row.datavalue" :ref="el => setInputRef(el, row)"
                      @blur="handleBlur(row, 'editingDatavalue')"></el-input>
            <div v-else style="width: 100%; height: 25px" @dblclick="handleClick(row, 'editingDatavalue')">
              {{ row.row.datavalue }}
            </div>
          </template> -->
        </el-table-column>
        <el-table-column align="center" prop="importantlevelid" label="重要程度"></el-table-column>
      </el-table>
      <el-drawer
        v-model="showDrawer"
        destroy-on-close
        :show-close="false"
        direction="rtl"
        :before-close="handleClose"
        :size="'20%'"
      >
        <div>
          <el-tree
            :data="vStore.vList"
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
                style="display: flex; justify-content: space-between; flex: auto; text-align: left"
              >
                <el-popover
                  :visible="node.data.popVisible"
                  placement="right"
                  trigger="click"
                  popper-style="background-color: rgba(255, 255, 255, 0.5)"
                >
                  <el-button
                    style="margin-top: 6px; width: 100%"
                    type="success"
                    plain
                    round
                    @click="editNode(node.data)"
                    >编辑</el-button
                  ><br />
                  <el-button
                    style="margin-top: 6px; width: 100%"
                    type="primary"
                    plain
                    round
                    @click="addSiblingNode(node.data)"
                    >{{
                      Object.prototype.hasOwnProperty.call(node.data, 'typeId')
                        ? '新增属性'
                        : '新增类型'
                    }}</el-button
                  ><br />
                  <el-button
                    v-if="!Object.prototype.hasOwnProperty.call(node.data, 'typeId')"
                    style="margin-top: 6px; width: 100%"
                    type="primary"
                    plain
                    round
                    @click="addChildNode(node.data)"
                    >新增属性</el-button
                  >
                  <template v-if="!Object.prototype.hasOwnProperty.call(node.data, 'typeId')">
                    <br />
                  </template>
                  <!-- <el-button
                    style="margin-top: 6px; width: 100%"
                    type="danger"
                    plain
                    round
                    @click="confirmDeleteNodes(node.data)"
                    >删除</el-button
                  > -->
                  <template #reference>
                    <!-- 这里用一个临时量来存新节点，否则直接绑定node.data.obsname输入框会出问题 -->
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
                      <el-icon v-if="node.data.valueTagList" color="orange">
                        <Folder />
                      </el-icon>
                      <el-icon v-else color="dodgerblue">
                        <Document />
                      </el-icon>
                      {{ node.data.name }}
                    </div>
                  </template>
                </el-popover>

                <!-- <div style="width: 850px">
                  <div style="display: flex; flex: auto; justify-content: space-between">
                    <div
                      style="
                        min-width: 700px;
                        width: 100%;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                      "
                      v-bind:title="node.data.remark"
                    >
                      {{ node.data.name }}
                    </div>
                  </div>
                </div> -->
              </div>
            </template>
          </el-tree>
        </div>
      </el-drawer>
    </el-main>
  </el-container>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, onBeforeUnmount } from 'vue';
import { Edit, Search } from '@element-plus/icons-vue';
import _ from 'lodash';
import { ElMessage, ElMessageBox, ElTable } from 'element-plus';
import request from '../../utils/request';
import ExcelJS from 'exceljs';
import useV from '../../stores/vStore';

const courseid = ref('2c918af681fa6ea7018209a505c30672');

const tableData = ref([]); // KWA表数据

const tableSearchData = ref(''); // KWA表的搜索数据

const tempRowData = ref({});

const tableSelected = ref([]);

const filterTableData = computed(() =>
  // 实际显示的表格数据源
  tableData.value.filter(
    (
      data // 过滤掉不包含搜索框中字符的数据
    ) =>
      !tableSearchData.value ||
      data.name.toLowerCase().includes(tableSearchData.value.toLowerCase())
  )
);

const filterTableLoading = ref(false);

const keywordData = ref([]); //关键字表数据

const keywordSearchData = ref(''); // 关键字表的搜索数据

const filterKeywordData = computed(() =>
  // 实际显示的关键字表源数据
  keywordData.value.filter(
    (
      data // 过滤掉不包含搜索框中字符的数据
    ) =>
      !keywordSearchData.value ||
      data.name.toLowerCase().includes(keywordSearchData.value.toLowerCase())
  )
);

const abilityData = ref([]); // 能力表数据

const abilitySearchData = ref(''); // 能力表的搜索数据

const filterAbilityData = computed(() =>
  // 实际显示的能力表源数据
  abilityData.value.filter(
    (
      data // 过滤掉不包含搜索框中字符的数据
    ) =>
      !abilitySearchData.value ||
      data.name.toLowerCase().includes(abilitySearchData.value.toLowerCase())
  )
);

const selectedKeyword = ref(); // 记录某行哪一个关键字被选择了，防止每次打开表后不进行操作会导致原数据丢失

const selectedAbility = ref(); // 记录某行哪一个能力被选择了，防止每次打开表后不进行操作会导致原数据丢失

const openedKeywordPop = ref(null); // 记录哪行的关键字表被打开了

const openedAbilityPop = ref(null); // 记录哪行的能力表被打开了

/*************V*************/
const isShow = ref(false);

const nodeInput = ref(null);

const showDrawer = ref(false);

const vStore = useV();

const submitNodes = ref([]);

const currentId = ref();

const elRef = ref(null);

const nullNodeNum = ref(0);

const openV = (row, reset = false) => {
  console.log(row);
  if (!reset) {
    currentId.value = row.id;
  }
  isShow.value = !isShow.value;
};

const treeProps = ref({
  children: 'valueTagList', // 修改 children 为 subNodes
  label: 'name'
});

const treeRef = ref([]);

const setV = async row => {
  submitNodes.value = _.cloneDeep(treeRef.value.getCheckedNodes(true, false));
  console.log(submitNodes.value);
  isShow.value = !isShow.value;
  const { code, msg } = await vStore.fetchBindV(row.id, submitNodes.value);
  if (code === 200 && msg === 'success') {
    ElMessage({
      type: 'success',
      message: '绑定成功'
    });
    getKWAData();
  } else {
    ElMessage({
      type: 'error',
      message: msg
    });
  }
  // 置空原数组
  submitNodes.value.splice(0, submitNodes.value.length);
};

const changeEl = () => {
  showDrawer.value = !showDrawer.value;
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
    if (node.tempData !== node.name) {
      const editdata = ref({
        id: node.id,
        name: node.tempData,
        remark: node.remark,
        typeId: node.typeId
      });
      console.log(editdata.value);
      // typeId为undefined说明为根节点
      let code = 0;
      let msg = '';
      if (editdata.value.typeId) {
        const res = await vStore.fetchUpdateV(editdata.value);
        code = res.code;
        msg = res.msg;
      } else {
        const res = await vStore.fetchUpdateV(editdata.value, false);
        code = res.code;
        msg = res.msg;
      }

      if (code === 200 && msg === 'success') {
        ElMessage({
          type: 'success',
          message: `修改成功`
        });
        node.inputVisible = false;
        await vStore.fetchV();
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
  nullNodeNum.value += 1;
  addedNode.popVisible = false;
  let isValue;
  const added = ref({});
  // 新增节点
  if (Object.prototype.hasOwnProperty.call(addedNode, 'typeId')) {
    // 属性
    added.value = {
      name: '默认属性',
      typeId: addedNode.typeId,
      remark: ''
    };
    isValue = true;
  } else {
    // 类型
    added.value = {
      name: '默认类型',
      remark: ''
    };
    isValue = false;
  }
  // 发送请求
  const { code, msg } = await vStore.fetchCreate(added.value, isValue);
  if (code === 200 && msg === 'success') {
    ElMessage({
      type: 'success',
      message: '插入成功'
    });
  } else {
    ElMessage({
      type: 'error',
      message: msg
    });
  }
  await vStore.fetchV();
};

//下级新增事件
const addChildNode = async addedNode => {
  console.log(addedNode);
  nullNodeNum.value += 1;
  const newNodeData = ref({
    name: '默认属性',
    typeId: addedNode.id,
    remark: ''
  });

  const { code, msg } = await vStore.fetchCreate(newNodeData.value, true);
  if (code === 200 && msg === 'success') {
    elMsg('success', '创建成功');
  } else {
    elMsg('error', msg);
  }
  await vStore.fetchV();
};

const elMsg = (type, message) => ElMessage({ type, message });

const confirmDeleteNodes = deletedNode => {
  console.log(deletedNode);
  let isValue;
  let message;
  const storeIds = ref();
  // 第一次弹窗的提示信息
  if (Object.prototype.hasOwnProperty.call(deletedNode, 'valueTagList')) {
    message = `是否删除节点 "${deletedNode.name}"，及其子节点?`;
    isValue = false;
    storeIds.value = {
      id: deletedNode.id,
      valueList: deletedNode.valueTagList?.map(item => item.id) ?? []
    };
  } else {
    message = `是否删除节点 "${deletedNode.name}"?`;
    isValue = true;
    storeIds.value = deletedNode.id;
  }
  console.log(storeIds.value);
  // const message =
  //   deletedNode.valueTagList && deletedNode.valueTagList.length > 0
  //     ? `是否删除节点 "${deletedNode.name}"，及其子节点?`
  //     : `是否删除节点 "${deletedNode.name}"?`;
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
      // 如果用户点击了“确定”，则弹出二次确认
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
          // 如果用户在二次确认中点击“是”，则执行删除操作
          // deleteNodes(deletedNode);
          console.log('yes');
          if (isValue) {
            // 删除属性
            const { code, msg } = await vStore.fetchDelete(storeIds.value, true);
            if (code === 200 && msg === 'success') {
              elMsg('success', '删除成功');
            } else {
              elMsg('error', msg);
            }
            await vStore.fetchV();
          } else {
            // 删除类型
            // storeIds.value中此时id存的是类型id，valueTagList存的是属性id，先删除所有属性
            if (storeIds.value.valueList.length === 0) {
              const { code, msg } = await vStore.fetchDelete(storeIds.value.id, false);
              if (code === 200 && msg === 'success') elMsg('success', msg);
              await vStore.fetchV();
              return;
            }
            vStore
              .fetchDelete(storeIds.value.valueList, true)
              .then(async res => {
                if (res.code === 200 && res.msg === 'success') {
                  // 删除类型
                  const { code, msg } = await vStore.fetchDelete(storeIds.value.id, false);
                  if (code === 200 && msg === 'success') {
                    elMsg('success', '删除成功');
                    await vStore.fetchV();
                  } else {
                    elMsg('error', msg);
                  }
                } else {
                  elMsg('error', res.msg);
                }
              })
              .catch(error => {
                console.log(error);
              });
          }
        })
        .catch(() => {
          // 用户在二次确认中点击了“否”，关闭弹窗
          deletedNode.popVisible = false;
        });
    })
    .catch(() => {
      // 用户在第一次弹窗中点击了“取消”，关闭弹窗
      deletedNode.popVisible = false;
    });
};

const openedPopNode = ref({});

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
  if (openedPopNode.value && !event.target.closest('.el-popover')) {
    openedPopNode.value.popVisible = false;
    openedPopNode.value = {};
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

/*************导出excel*************/
const exportExcel = async () => {
  ElMessage.success('1');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // 添加列标题
  ElMessage.success('2');
  worksheet.columns = [
    { header: '名称', key: 'name', width: 40 },
    { header: '关键字', key: 'keywordname', width: 20 },
    { header: '能力', key: 'abilityname', width: 20 },
    { header: '权值', key: 'datavalue', width: 10 }
  ];
  filterTableData.value.forEach(item => worksheet.addRow(item));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/octet-stream' });

  // 使用原生浏览器 API 下载文件
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '基本教学目标.xlsx';
  link.click();

  // 释放资源
  URL.revokeObjectURL(link.href);
};

/*************数据初始化**************/

onMounted(async () => {
  filterTableLoading.value = true;
  // await vStore.fetchV();
  getKWAData();
  document.addEventListener('click', closePopNode);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closePopNode);
});

const getKWAData = async () => {
  try {
    const res = await request.evaluation.get('/evaluation/kwadict');
    if (res.code === 200) {
      tableData.value = res.data;
      initialize();
      filterTableLoading.value = false;
      console.log(res.data);
    } else {
      ElMessage.error(res.msg);
      filterTableLoading.value = false;
    }
  } catch (error) {
    ElMessage.error('获取KWA失败' + error);
    filterTableLoading.value = false;
  }
};

const initialize = () => {
  inputRefs.value = {};
  tableSelected.value = [];

  tableData.value.forEach(item => {
    item.keywordPopVisible = false;
    item.abilityPopVisible = false;
    item.editingDatavalue = false;
    item.datavalue = Number(item.datavalue).toFixed(2);
  });
};

/*****************KWA表函数*****************/
const handleClick = (row, field) => {
  nextTick(() => {
    tempRowData.value = Object.assign({}, row.row); // 存一份修改之前的数据用作比对
    row.row[field] = true;
    setTimeout(() => {
      if (inputRefs.value[row.row.id] && inputRefs.value[row.row.id].$refs.input) {
        inputRefs.value[row.row.id].$refs.input.focus();
      }
    }, 0);
  });
};

const handleBlur = (row, field) => {
  row.row[field] = false;
  row.row.datavalue = Number(row.row.datavalue).toFixed(2);
  if (row.row.abilityid && row.row.keywordid && !_.isEqual(tempRowData.value, row.row)) {
    // 当数据发生改变了再传数据给后端
    request.evaluation
      .post('/evaluation/kwadict/updateKwadict', row.row)
      .then(res => {
        if (res.code === 200) {
          getKWAData();
          ElMessage.success('修改成功');
        } else {
          ElMessage.error('res.msg');
        }
      })
      .catch(error => {
        ElMessage.error('修改失败' + error);
      });
  }
};

const inputRefs = ref({});

const setInputRef = (el, row) => {
  if (el) {
    inputRefs.value[row.row.id] = el;
  }
};

const addKWA = () => {
  // 新增KWA
  tableData.value.push({
    id: '',
    name: '未保存KWA',
    keywordid: '',
    abilityid: '',
    keywordname: '',
    abilityname: '',
    courseid: courseid.value,
    datavalue: Number(0.0).toFixed(2),
    keywordPopVisible: false,
    abilityPopVisible: false,
    editingDatavalue: false
  });
  ElMessage.warning({
    message: '新建的行仅当关键字和能力都不为空时才能被保存！',
    duration: 2500
  });
};

/*判定主表格中哪些行被选中*/
const tableSelect = selection => {
  tableSelected.value = selection;
};

const tableSelectAll = selection => {
  tableSelected.value = selection;
};

// 删除KWA
const deleteKWA = () => {
  if (!tableSelected.value.length) {
    ElMessage({
      type: 'warning',
      message: '未选择KWA',
      duration: 800
    });
    return;
  }
  ElMessageBox.confirm('选中的KWA将被删除，是否确定', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      let deletedIds = [];
      tableSelected.value.forEach(item => {
        deletedIds.push(item.id);
      });
      filterTableLoading.value = true;
      try {
        const res = await request.evaluation.post('/evaluation/kwadict/delete', deletedIds);
        if (res.code === 200) {
          getKWAData();
          ElMessage.success('删除成功');
          filterTableLoading.value = false;
        } else {
          ElMessage.error(res.msg);
          filterTableLoading.value = false;
        }
      } catch (error) {
        ElMessage.error('删除失败' + error);
        filterTableLoading.value = false;
      }
    })
    .catch(() => {
      // 取消删除
    });
};

const createNewKWA = async data => {
  filterTableLoading.value = true;
  try {
    const res = await request.evaluation.post('/evaluation/kwadict/create', data);
    if (res.code === 200) {
      getKWAData();
      ElMessage.success('新增成功');
    } else {
      ElMessage.error(res.msg);
      filterTableLoading.value = false;
    }
  } catch (error) {
    ElMessage.error('新增失败' + error);
    filterTableLoading.value = false;
  }
};

/*******************************************/

/**************关键字表格的函数***************/

const kwdSelFlag = ref({}); // 存储关键字表格每一行是否被选中的标志

const openKeywordDictionary = row => {
  // console.log(row.row);
  if (openedKeywordPop.value) openedKeywordPop.value.keywordPopVisible = false; // 关掉其他打开的popover
  if (openedAbilityPop.value) openedAbilityPop.value.abilityPopVisible = false;
  keywordSearchData.value = '';
  row.row.keywordPopVisible = true;
  openedKeywordPop.value = row.row;
  openedAbilityPop.value = null;

  request.evaluation
    .get(`/evaluation/keywords`)
    .then(res => {
      if (res.code === 200) {
        keywordData.value = res.data;

        let selectedKeywordIndex = -1; // 记录当前显示的关键字在关键字表中的下标
        for (let i = 0; i < keywordData.value.length; i++) {
          kwdSelFlag.value[keywordData.value[i].id] = false;
          if (keywordData.value[i].id === row.row.keywordid) {
            selectedKeyword.value = keywordData.value[i]; // 保存当前用户选择的关键字，防止用户取消勾选导致表格单元置空
            selectedKeywordIndex = i;
            kwdSelFlag.value[keywordData.value[i].id] = true;
          }
        }
      } else {
        ElMessage.error(res.msg);
      }
    })
    .catch(error => {
      ElMessage.error('获取课程关键字失败' + error);
    });
};

const chooseKeyword = data => {
  if (selectedKeyword.value) kwdSelFlag.value[selectedKeyword.value.id] = false;
  selectedKeyword.value = data;
};

const setKeyword = row => {
  let created = false; // 判断该行数据是否在数据库里
  if (row.row.abilityid && row.row.keywordid) created = true; // 如果当前行的关键字和能力在选择前不为空则说明这条数据存在于数据库中
  row.row.keywordname = selectedKeyword.value.name;
  const oldKeyword = row.row.keywordid;
  row.row.keywordid = selectedKeyword.value.id;
  if (row.row.abilityid && row.row.keywordid) {
    if (!created) {
      createNewKWA(row.row);
    } else if (created && oldKeyword !== selectedKeyword.value.id) {
      // 数据变化了再传给后端
      request.evaluation
        .post('/evaluation/kwadict/updateKwadict', row.row)
        .then(res => {
          if (res.code === 200) {
            getKWAData();
            ElMessage.success('修改成功');
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch(error => {
          ElMessage.error('保存失败' + error);
        });
    }
  }

  selectedKeyword.value = {};
  row.row.keywordPopVisible = false;
};

/*******************************************/

/**************能力表格的函数***************/

const abSelFlag = ref({}); // 存储能力表格中每一行是否被勾选的标志

const openAbilityDictionary = row => {
  // 打开能力弹框
  // console.log(row.row)
  if (openedKeywordPop.value) openedKeywordPop.value.keywordPopVisible = false; // 关掉其他打开的popover
  if (openedAbilityPop.value) openedAbilityPop.value.abilityPopVisible = false;
  abilitySearchData.value = '';
  row.row.abilityPopVisible = true;
  openedKeywordPop.value = null;
  openedAbilityPop.value = row.row;

  request.evaluation
    .get(`/evaluation/kwadict/getabilitydict`)
    .then(res => {
      if (res.code === 200) {
        abilityData.value = res.data;
        // console.log(abilityData.value);
        let selectedAbilityIndex = -1; // 记录当前显示的能力在能力表中的下标
        for (let i = 0; i < abilityData.value.length; i++) {
          abSelFlag.value[abilityData.value[i].id] = false;
          if (abilityData.value[i].id === row.row.abilityid) {
            selectedAbility.value = abilityData.value[i]; // 保存当前选择的能力，以防止用户取消勾选后关闭弹框导致表格单元置空
            selectedAbilityIndex = i;
            abSelFlag.value[abilityData.value[i].id] = true;
          }
        }
      } else {
        ElMessage.error(res.msg);
      }
    })
    .catch(error => {
      ElMessage.error('获取课程能力失败' + error);
    });
};

const chooseAbility = data => {
  // 记录哪个能力被选择
  if (selectedAbility.value) abSelFlag.value[selectedAbility.value.id] = false;
  selectedAbility.value = data;
  // console.log(row.name);
};

const setAbility = row => {
  // 点击确定后将选择的能力赋值给KWA表数据
  let created = false; // 判断该行数据是否在数据库里
  if (row.row.abilityid && row.row.keywordid) created = true; // 如果当前行的关键字和能力在选择前不为空则说明这条数据存在于数据库中
  row.row.abilityname = selectedAbility.value.name;
  const oldAbility = row.row.abilityid;
  row.row.abilityid = selectedAbility.value.id;
  console.log(row.row);
  if (row.row.abilityid && row.row.keywordid) {
    if (!created) {
      createNewKWA(row.row);
    } else if (created && oldAbility !== selectedAbility.value.id) {
      // 数据变化了再传给后端
      request.evaluation
        .post('/evaluation/kwadict/updateKwadict', row.row)
        .then(res => {
          if (res.code === 200) {
            getKWAData();
            ElMessage.success('修改成功');
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch(error => {
          ElMessage.error('保存失败' + error);
        });
    }
  }
  selectedAbility.value = {};
  row.row.abilityPopVisible = false;
};

/*******************************************/
</script>

<style scoped>
:deep(.el-tree-node) {
  font-size: 16px;
}

.edit-icon {
  cursor: pointer;
}

.el-table {
  background-color: #fff;
}
</style>
