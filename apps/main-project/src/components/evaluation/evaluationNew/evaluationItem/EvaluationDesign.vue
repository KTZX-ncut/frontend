<template>
  <el-header
    style="height: auto; padding: 5px 0px; width: 100%; background-color: #fff; display: flex"
  >
    <div class="searchInput">
      <el-input
        v-model.lazy="search"
        @input="debouncedQuerySearch"
        placeholder="输入属性名进行检索"
        class="input-with-select"
        style="width: 200px; margin-right: 0.8vw"
      ></el-input>
      <el-button type="primary" @click="querySearch">搜索</el-button>
    </div>
    <el-popover
      class="box-item"
      content="Left Top prompts info"
      placement="left-start"
      trigger="click"
      @hide="handelAdd"
    >
      <template #reference>
        <el-button type="success" style="margin-left: 0.8vw">新增</el-button>
      </template>
      <el-input class="mb-2" v-model="addData.typeName" placeholder="类别名称" />
      <el-input class="mb-2" v-model="addData.remark" placeholder="备注" />
      <el-input v-model="addData.score" placeholder="分数" />
    </el-popover>
    <el-button @click="handleDelAll" type="danger" style="margin-left: 0.8vw">删除</el-button>
    <el-button @click="handleSaveAll" type="danger" style="margin-left: 0.8vw">保存</el-button>
    <el-button @click="handleSavePercent" type="danger" style="margin-left: 0.8vw"
      >更新百分比</el-button
    >
    <div style="margin-left: auto; display: flex; align-items: center">
      <span :style="{ color: isPercentValid ? '#67C23A' : '#F56C6C' }">
        百分比总和: {{ totalPercent }}%
      </span>
    </div>
  </el-header>

  <div v-if="!exemList.length">暂无数据</div>
  <div v-else>
    <el-table
      v-loading="loading"
      :data="exemList"
      @select="handleSelect"
      @selectAll="handleSelectAll"
      style="width: 100%"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="考核项类别">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <span>{{ scope.row.categoryName }}</span>
            <el-tag v-if="scope.row.isLocal" type="warning" size="small" style="margin-left: 8px">
              未保存
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="百分比">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <span>{{ percentMap.get(scope.row.id) || 0 }}%</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="备注">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <span>{{ scope.row.categoryDescription }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="总分">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <span>{{ scope.row.score }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300px">
        <template #default="scope">
          <el-popover
            class="box-item"
            content="Left Top prompts info"
            placement="left-start"
            trigger="click"
            @hide="handleHide(scope)"
            @show="
              () => {
                updateData.remark = scope.row.categoryDescription;
                updateData.typeName = scope.row.categoryName;
                updateData.score = scope.row.score;
              }
            "
          >
            <template #reference>
              <el-button size="small"> 修改 </el-button>
            </template>
            <el-input class="mb-2" v-model="updateData.typeName" placeholder="属性名" />
            <el-input class="mb-2" v-model="updateData.remark" placeholder="备注" />
            <el-input v-model="updateData.score" placeholder="分数" />
          </el-popover>
          <el-popover
            class="box-item"
            content="Left Top prompts info"
            placement="left-start"
            trigger="click"
            @hide="handlePercent(scope)"
          >
            <template #reference>
              <el-button size="small"> 百分比 </el-button>
            </template>
            <el-input class="mb-2" v-model="percent" placeholder="百分比" />
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import useEvaluationNew from '../../../../stores/useEvaluationNew';
import parseJWT from '../../../../utils/parseJWT';
import { ElMessage } from 'element-plus';
import { message } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import _, { update } from 'lodash';

/* ********************变量定义******************** */
// props定义
// 普通变量
// pinia状态管理
const loading = ref(false);
const search = ref('');
const delList = ref([]);
const evaluationStore = useEvaluationNew();
const { fetchType, fetchAddType, fetchDelList, fuzzyQuery, fetchUpdateType } = evaluationStore;
const { typeList } = storeToRefs(evaluationStore);
const courseId = parseJWT(sessionStorage.getItem('token')).obsid;

const percent = ref();

const handlePercent = scope => {
  console.log(percent);
  if (!percent.value) {
    ElMessage({
      type: 'warning',
      message: '百分比不能为空'
    });
    return;
  }
  percentMap.value.set(scope.row.id, Number(percent.value));
  percent.value = null;
};

const generateUUI = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const percentMap = ref(new Map());

// 本地新增的数据列表
const localAddedItems = ref([]);

const handleSavePercent = async () => {
  const totalPercent = [...percentMap.value.values()].reduce((sum, percent) => sum + percent, 0);
  if (totalPercent !== 100) {
    ElMessage({
      type: 'error',
      message: '加和应为100'
    });
    return;
  }

  const allPromise = [...percentMap.value.keys()].map(k => {
    return fetchUpdateType({
      id: k,
      percent: percentMap.value.get(k) / 100
    });
  });

  const results = await Promise.all(allPromise);
  console.log(results);

  // 检查是否所有保存都成功
  const allSuccess = results.every(result => result.msg === 'success');

  if (allSuccess) {
    // 重新获取服务器数据
    await fetchType({ courseId, current: 1, size: -1 });
    ElMessage.success('更新成功');
  } else {
    ElMessage.error('部分数据保存失败');
  }
};

// 使用 computed 合并服务器数据和本地新增数据，并计算百分比
const exemList = computed(() => {
  const allItems = [...typeList.value, ...localAddedItems.value];

  return allItems;
});

// 计算百分比总和是否为100%
const isPercentValid = computed(() => {
  if (exemList.value.length === 0) return true;
  const totalPercent = [...percentMap.value.values()].reduce((sum, percent) => sum + percent, 0);
  return totalPercent === 100; // 严格等于100%
});

// 获取当前百分比总和
const totalPercent = computed(() => {
  return [...percentMap.value.values()].reduce((sum, percent) => sum + Number(percent), 0);
});

const addData = reactive({
  typeName: '',
  remark: '',
  score: 0
});
const updateData = reactive({
  typeName: '',
  remark: '',
  score: 0,
  percent: 0
});

const debouncedQuerySearch = _.debounce(() => {
  querySearch();
}, 500);

const querySearch = async () => {
  if (search.value.length >= 1 || search.value.length === 0) {
    loading.value = true;
    await fuzzyQuery({
      fuzzyQuery: true,
      categoryName: search.value,
      courseId: addData.courseId
    });
    loading.value = false;
  }
};

const handleHide = async scope => {
  if (
    updateData.remark === scope.row.categoryDescription &&
    updateData.typeName === scope.row.categoryName &&
    updateData.score === scope.row.score
  ) {
    ElMessage({
      type: 'info',
      message: '暂无修改'
    });
    return;
  }

  const score = Number(updateData.score);
  if (!(score > 0 && score <= 100)) {
    ElMessage({
      type: 'warning',
      message: '分数应在0-100之间'
    });
    return;
  }

  const item = scope.row;

  if (item.isLocal) {
    // 修改本地新增项
    const index = localAddedItems.value.findIndex(localItem => localItem.id === item.id);
    if (index > -1) {
      localAddedItems.value[index] = {
        ...localAddedItems.value[index],
        categoryName: updateData.typeName,
        categoryDescription: updateData.remark,
        score: score
      };

      ElMessage.success('修改成功');
    }
    return;
  }

  // 更新除了百分比以外字段
  updateData.id = scope.row.id;
  if (updateData.typeName === scope.row.categoryName) {
    delete updateData.typeName;
  }

  const data = await fetchUpdateType({
    id: updateData.id,
    categoryName: updateData.typeName,
    categoryDescription: updateData.remark,
    score: updateData.score
  });

  await fetchType({ courseId, current: 1, size: -1 });
  if (data.code === 200) return ElMessage.success('修改成功');
  ElMessage.error(data.msg);
};

const handleSelect = selection => {
  delList.value = selection.map(i => i.id);
  console.log(delList.value);
};

const handleSelectAll = selection => {
  delList.value = selection.map(i => i.id);
  console.log(delList.value);
};

const handleDelAll = async () => {
  if (!delList.value.length) {
    ElMessage.info('未选择类型名');
    return;
  }

  // 分离本地项和服务器项
  const localIds = [];
  const serverIds = [];
  const ids = [];

  delList.value.forEach(id => {
    ids.push(id);
    if (id.toString().startsWith('local')) {
      localIds.push(id);
    } else {
      serverIds.push(id);
    }
  });

  try {
    // 删除本地项
    if (localIds.length > 0) {
      localIds.forEach(id => {
        const index = localAddedItems.value.findIndex(item => item.id === id);
        if (index > -1) {
          localAddedItems.value.splice(index, 1);
        }
      });
    }

    // 删除服务器项
    if (serverIds.length > 0) {
      const data = await fetchDelList({ idList: serverIds });
      if (data.msg !== 'success') {
        ElMessage.error('删除服务器数据失败');
        return;
      }
      await fetchType({ courseId, current: 1, size: -1 });
    }

    // 清空选择列表
    delList.value = [];
    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error('删除失败：' + error.message);
  } finally {
    ids.map(id => {
      percentMap.value.delete(id);
    });
  }
};

const handleSaveAll = async () => {
  if (localAddedItems.value.length === 0) {
    ElMessage.info('没有需要保存的数据');
    return;
  }

  // 验证百分比总和是否为100%
  if (!isPercentValid.value) {
    ElMessage.error(`百分比总和必须为100%，当前总和为${totalPercent.value}%`);
    return;
  }

  loading.value = true;

  try {
    // 获取当前计算后的百分比数据
    const itemsToSave = exemList.value.filter(item => item.isLocal);
    console.log(itemsToSave);

    // 批量保存所有本地新增的项目，包含百分比
    const savePromises = itemsToSave.map(item => {
      // console.log(percentMap.value.get(item.id) / 100);
      return fetchAddType({
        courseId,
        categoryName: item.categoryName,
        categoryDescription: item.categoryDescription,
        score: item.score,
        percent: percentMap.value.get(item.id) / 100 // 发送计算后的百分比
      });
    });

    const results = await Promise.allSettled(savePromises);
    console.log(results);

    // 检查是否所有保存都成功
    const allSuccess = results.every(result => result.value.msg === 'success');

    if (allSuccess) {
      // 清空本地新增列表
      localAddedItems.value = [];
      // 重新获取服务器数据
      await fetchType({ courseId, current: 1, size: -1 });
      percentMap.value.clear();
      typeList.value.map(t => {
        percentMap.value.set(t.id, t.percent * 100);
      });
      ElMessage.success('保存成功');
    } else {
      ElMessage.error('部分数据保存失败');
    }
  } catch (error) {
    ElMessage.error('保存失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

function splitEvenlyInt(arr) {
  const len = arr.length;
  if (len === 0) return [];

  const base = Math.floor(100 / len);
  const remainder = 100 % len;

  return arr.map((_, i) => (i < remainder ? base + 1 : base));
}

const handleDelete = async scope => {
  const item = scope.row;

  if (item.isLocal) {
    // 删除本地新增项
    const index = localAddedItems.value.findIndex(localItem => localItem.id === item.id);
    if (index > -1) {
      localAddedItems.value.splice(index, 1);
      ElMessage.success('删除成功');
    }

    percentMap.value.delete(item.id);
    return;
  }

  // 删除服务器数据
  console.log(scope);
  let delList = [scope.row.id];
  const data = await fetchDelList({ idList: delList });
  if (data.msg === 'success') {
    await fetchType({ courseId, current: 1, size: -1 });
    return ElMessage.success('删除成功');
  }
  ElMessage.error('删除失败');
  // 删除对应百分比
  percentMap.value.delete(item.id);
};

const handelAdd = async () => {
  const score = Number(addData.score);
  if (!(addData.typeName && addData.score && score > 0 && score <= 100)) {
    ElMessage({
      type: 'warning',
      message: '考核项类型名称，考核项类型总分不可为空，且数据总分应在0-100之间'
    });
    return;
  }

  // 添加到本地列表，生成临时ID
  const newItem = {
    id: 'local' + generateUUI(), // 临时ID
    categoryName: addData.typeName,
    categoryDescription: addData.remark,
    score: score,
    isLocal: true, // 标记为本地新增项
    percent: 0
  };
  percentMap.value.set(newItem.id, 0);

  localAddedItems.value.push(newItem);

  // 清空表单
  addData.typeName = '';
  addData.remark = '';
  addData.score = 0;

  ElMessage.success('已添加到列表，点击保存按钮提交');
};

onMounted(async () => {
  await fetchType({ courseId, current: 1, size: -1 });
  typeList.value.map(t => {
    percentMap.value.set(t.id, t.percent * 100);
  });
});

/* ********************方法定义******************** */
</script>

<style lang="less" scoped></style>
