<template>
  <el-container style="height: 92vh">
    <el-header style="
        height: auto;
        padding: 5px 0px;
        width: 100%;
        text-align: left;
        background-color: #deebf7;
      ">
      <el-button type="warning" style="margin-left: 0.8vw" @click="openCopyDialog">复制能力</el-button>
      <!-- <el-button type="success" style="margin-left: 0.8vw; cursor: not-allowed;">新增</el-button> -->
      <el-button type="primary" style="margin-left: 0.8vw" @click="openDictionary">从能力字典选择</el-button>
      <el-button type="danger" @click="openDeleteDialog">删除</el-button>
      <el-button type="primary">保存</el-button>
      <el-input v-model="tableSearchData" style="margin-left: 0.8vw; width: 250px" placeholder="查找能力">
        <template #append><el-button :icon="Search" /></template>
      </el-input>
    </el-header>
    <CopyModelDialog ref="copyDialogRef" copy-type="ability" @copy-success="getAbility" />
    <el-main style="padding: 0">
      <!----------------------------------确认删除的弹框-------------------------------------->
      <el-dialog v-model="deleteDialogVisible" width="450" destroy-on-close>
        <template #header="{ titleId, titleClass }">
          <div v-if="!relatedKWA.length" style="text-align: left; margin-bottom: -15px">
            <div :id="titleId" :class="titleClass" style="font-size: 15px">
              <el-button link type="warning">
                <el-icon size="20" style="padding-bottom: 3px; box-sizing: border-box">
                  <WarningFilled />
                </el-icon>
              </el-button>
              是否要删除选中的能力
            </div>
          </div>
        </template>
        <div v-if="relatedKWA.length > 0" style="text-align: left">
          <div style="margin-bottom: 5px">
            <el-text type="danger" style="display: flex">
              <div>将删除的能力与以下KWA有关，请先删除相关的KWA</div>
            </el-text>
          </div>
          <el-table :data="relatedKWA" style="width: 100%; height: 300px" stripe border>
            <el-table-column label="KWA名称" prop="name" />
          </el-table>
        </div>
        <template #footer>
          <div v-if="!relatedKWA.length" class="dialog-footer">
            <el-button @click="deleteDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="deleteAbility()"> 确认 </el-button>
          </div>
        </template>
      </el-dialog>
      <!-------------------------------------------------------------------------------------->

      <el-table :data="filterTableData" style="height: 100%; width: 100%" v-model="tableSelected" size="large"
        v-loading="tableLoading" element-loading-text="Loading..." element-loading-background="rgba(0, 0, 0, 0.2)"
        @select="filterTableSelect" @select-all="filterTableSelectAll" stripe>
        <el-table-column type="selection" width="55"></el-table-column>
        <!-- <el-table-column prop="id" label="序码" width="60"></el-table-column> -->
        <el-table-column width="50">
          <template v-slot="row">
            {{ row.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="350">
          <template v-slot="row">
            {{ row.row.name }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="datavalue" label="数值" width="100">
          <template v-slot="row">
            {{ Number(row.row.datavalue).toFixed(2) }}
          </template>
        </el-table-column> -->
        <el-table-column prop="importantlevel" label="重要程度" width="150"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="113">
          <template v-slot="row">
            {{ row.row.remark }}
          </template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>

  <el-dialog v-model="abilityDictionaryVisible" width="1000" style="height: 360px; max-width: 1000px; overflow: auto"
    :close-on-click-modal="false" :show-close="false" destroy-on-close align-center>
    <template #header="{ titleId }">
      <el-header style="height: auto; padding: 5px 0px; width: 100%" :id="titleId">
        <div style="display: flex; justify-content: space-between">
          <div>
            <el-button type="success" @click="changeAbilities">保存</el-button>
          </div>
          <el-button link type="danger" @click="closeDictionary">
            <el-icon size="20" class="el-icon--left">
              <CloseBold />
            </el-icon>
          </el-button>
        </div>
      </el-header>
      <el-cascader-panel style="width: fit-content; margin-top: 20px" :options="dictionaryData" :props="props"
        v-model="dictionarySelected" />
    </template>
  </el-dialog>
</template>

<script setup>
import parseJWT from '@/utils/parseJWT.js';
import { CloseBold, Search, WarningFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, nextTick, onMounted, ref } from 'vue';
import _ from 'lodash';
import request from '../../utils/request';
import CopyModelDialog from '../course/subcomponents/CopyModelDialog.vue';

const courseid = ref('2c918af681fa6ea7018209a505c30672');

const tableSearchData = ref(''); // 主界面搜索框数据

const data = ref([]); //模拟后端返回的数据

const tableData = ref([]); // 主界面表格数据

const tableSelected = ref([]); // 记录主界面的表格选择

const tableLoading = ref(true);

const dictionarySelected = ref([]); // 记录能力字典中选择的数据
const dictionarySelected_backup = ref([]); // 记录能力字典中选择的数据备份用于不保存情况下关闭弹窗后数据恢复

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

const abilityDictionaryVisible = ref(false); // 关键字字典弹窗是否显示

const props = {
  multiple: true,
  label: 'name',
  value: 'id'
};

const dictionaryData = ref([]); //能力字典数据

const deleteDialogVisible = ref(false);

const relatedKWA = ref([]);

const copyDialogRef = ref(null);
function openCopyDialog() { copyDialogRef.value?.init(); }

// const inputRefs = ref({});

/******************预处理数据******************/

const getAbility = () => {
  request.evaluation
    // .get(`/evaluation/getability?courseid=${courseid.value}`)
    //1004hhy修改将接口由 `/evaluation/getability?courseid=${courseid.value}` 改为`/evaluation/getability`
    .get(`/evaluation/getability`)
    .then(res => {
      if (res.code === 200) {
        data.value = res.data;
        // console.log(res.data);
        tableData.value = [];
        initialize();
        tableLoading.value = false;
      } else if (res.code === 404) {
        ElMessage.error(res.msg);
      }
    })
    .catch(error => {
      ElMessage.error('获取能力失败' + error);
      tableLoading.value = false;
    });
};

const splicedId = (node, namePath = [], idPath = []) => {
  // 将树形结构数据的id拼接起来,DFS
  let result = [];
  const currentNamePath = [...namePath, node.name]; // 存储叶子节点全路径的name，用于在el-table中展示数据
  const currentIdPath = [...idPath, node.id]; // 存储叶子节点全路径的id，用于能力字典弹窗中记录哪些是存在于该课程的能力表中的

  if (!node.children || node.children.length === 0) {
    tableData.value.push({
      // 在这里初始化每个表格行的数据，将叶子节点全路径的name用'/'拼接起来作为每行的能力名称
      id: node.id,
      name: currentNamePath.join('/'),
      datavalue: node.datavalue,
      importantlevel: node.importantlevel,
      remark: node.remark
    });
    return [currentIdPath];
  }

  node.children.forEach(item => {
    result = result.concat(splicedId(item, currentNamePath, currentIdPath));
  });

  return result;
};

const initialize = () => {
  dictionarySelected.value = dictionarySelected_backup.value = [];
  tableSelected.value = [];

  data.value.forEach(item => {
    dictionarySelected.value = dictionarySelected.value.concat(splicedId(item)); // 初始化能力字典弹框中哪些能力被勾选了
  });

  tableData.value.forEach(item => {
    item.datavalue = Number(item.datavalue).toFixed(2);
  });
};
/*********************************************/

onMounted(() => {
  getAbility();
});

/*************判定主页面哪些行被选中************/
const filterTableSelect = selection => {
  tableSelected.value = selection;
};

const filterTableSelectAll = selection => {
  tableSelected.value = selection;
};
/*********************************************/

const getRelatedKwas = async (deletedIds) => {
  relatedKWA.value = [];
  try {
    const res = await request.evaluation.post(`/evaluation/getability/getCourseKwaByGetabilityId`, deletedIds);
    if (res.code === 200) {
      relatedKWA.value = res.data;
    } else if (res.code === 404) {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('获取相关KWA失败' + error);
  }
};

const openDeleteDialog = () => {
  if (tableSelected.value.length === 0) {
    ElMessage({
      type: 'warning',
      message: '未选择能力',
      duration: 800
    });
    return;
  }
  console.log(tableSelected.value);

  let deletedIds = [];
  tableSelected.value.forEach(item => {
    deletedIds.push(item.id);
  });

  getRelatedKwas(deletedIds);

  deleteDialogVisible.value = true;
};

const deleteAbility = async () => {
  // console.log(tableSelected.value);
  let deletedIds = [];
  tableSelected.value.forEach(item => {
    deletedIds.push(item.id);
  });

  try {
    const res = await request.evaluation.post(`/evaluation/getability/delete`, deletedIds);
    if (res.code === 200) {
      tableLoading.value = true;
      getAbility();
      ElMessage.success('删除成功');
      // console.log(tableSelected.value);
    } else if (res.code === 404) {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('删除失败' + error);
  }

  deleteDialogVisible.value = false;
};

/*************能力字典弹窗相关*************/
const openDictionary = () => {
  relatedKWA.value = [];
  dictionarySelected_backup.value = dictionarySelected.value;
  // console.log(dictionarySelected.value);
  request.evaluation.get('/evaluation/getability/allability')
    //1004hhy修改，此处为形成性评价模型-能力页面，调用获取能力接口，即'/evaluation/getability/allability'
    // .get('/evaluation/ability?courseId=' + parseJWT(sessionStorage.getItem('token')).obsid)
    .then(res => {
      if (res.code === 200) {
        dictionaryData.value = res.data;
        // console.log(dictionaryData.value);
      } else {
        ElMessage.error(res.msg);
      }
    })
    .catch(error => {
      ElMessage.error('获取能力字典数据失败' + error);
    });

  abilityDictionaryVisible.value = true;
};

const closeDictionary = () => {
  abilityDictionaryVisible.value = false;
  dictionarySelected.value = dictionarySelected_backup.value; // 防止用户改变了选中的能力但是没有点保存导致数据错乱
  dictionarySelected_backup.value = [];
  // console.log(dictionarySelected.value);
};

const changeAbilities = async () => {
  // console.log(dictionarySelected.value);

  if (_.isEqual(dictionarySelected.value, dictionarySelected_backup.value)) return;

  let oldIds = []; // 存储未改变弹窗选择前的数据
  dictionarySelected_backup.value.forEach(item => {
    oldIds.push(item[item.length - 1]);
  });
  // console.log(oldIds);

  let newIds = []; // 存储改变弹窗选择后的数据
  dictionarySelected.value.forEach(item => {
    newIds.push(item[item.length - 1]);
  });
  // console.log(newIds);

  let oldSet = new Set(oldIds); // 将两个数组转换为set容器，使得可以在O(1)的时间内查找相应元素
  let newSet = new Set(newIds);

  let addedIds = [...newSet].filter(item => !oldSet.has(item));
  let deletedIds = [...oldSet].filter(item => !newSet.has(item));

  tableLoading.value = true;

  if (deletedIds.length) {
    await getRelatedKwas(deletedIds);
    if (relatedKWA.value.length) {
      deleteDialogVisible.value = true;
      tableLoading.value = false;
      abilityDictionaryVisible.value = false;
      dictionarySelected.value = dictionarySelected_backup.value;
      return;
    }

    try {
      const res = await request.evaluation.post(`/evaluation/getability/delete?courseid=${courseid.value}`, deletedIds);
      if (res.code === 200) {
      } else if (res.code === 404) {
        deleteFlag = false;
        ElMessage.error(res.msg);
      }
    } catch (error) {
      deleteFlag = false;
      ElMessage.error('删除失败' + error);
    }
  }

  if (addedIds.length) {
    try {
      const res = await request.evaluation.post(`/evaluation/getability/insert?courseid=${courseid.value}`, addedIds);
      if (res.code === 200) {
      } else if (res.code === 404) {
        addFlag = false;
        ElMessage.error(res.msg);
      }
    } catch (error) {
      addFlag = false;
      ElMessage.error('新增失败' + error);
    }
  }

  getAbility();
  dictionarySelected_backup.value = [];
  abilityDictionaryVisible.value = false;
};
/****************************************/
</script>

<style scoped></style>
