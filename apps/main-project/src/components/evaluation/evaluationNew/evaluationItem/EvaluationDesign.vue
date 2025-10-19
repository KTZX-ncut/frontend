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
      <el-input class="mb-2" v-model="addData.score" placeholder="分数" />
      <el-input v-model="addData.percent" placeholder="百分比" />
    </el-popover>
    <!-- <el-button @click="handleDelAll" type="danger" style="margin-left: 0.8vw">删除</el-button> -->
    <el-button @click="handleSaveAll" type="danger" style="margin-left: 0.8vw">保存</el-button>
    <el-button @click="handleBatchUpdate" type="primary" style="margin-left: 0.8vw"
      >批量更新</el-button
    >
    <el-button @click="handleRefresh" type="primary" style="margin-left: 0.8vw">刷新</el-button>
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
            <el-tag
              v-if="isAutoDistributed[scope.row.id]"
              type="info"
              size="small"
              style="margin-left: 8px"
            >
              未更新
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="百分比">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-input-number
              :model-value="percentMap[scope.row.id] || 0"
              @update:model-value="value => updatePercent(scope.row.id, value)"
              :min="0"
              :max="100"
              :precision="0"
              size="small"
              style="width: 100px"
              @change="validatePercentSum"
            />
            <span style="margin-left: 5px">%</span>
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
          <el-button size="small" @click="handleDelete(scope)" type="danger"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import useEvaluationNew from '../../../../stores/useEvaluationNew';
import parseJWT from '../../../../utils/parseJWT';
import { ElMessage, ElMessageBox } from 'element-plus';
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

const generateUUI = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const percentMap = ref({});

// 跟踪哪些项目的百分比是自动分配的（未更新到后端）
const isAutoDistributed = ref({});

// 更新百分比的方法
const updatePercent = (id, value) => {
  percentMap.value[id] = value;
  // 手动修改百分比时，清除自动分配标记
  if (isAutoDistributed.value[id]) {
    delete isAutoDistributed.value[id];
  }
};

// 本地新增的数据列表
const localAddedItems = ref([]);

// 使用 computed 合并服务器数据和本地新增数据
const exemList = computed(() => {
  const allItems = [...typeList.value, ...localAddedItems.value];
  return allItems;
});

// 计算百分比总和是否为100%
const isPercentValid = computed(() => {
  if (exemList.value.length === 0) return true;
  const totalPercent = Object.values(percentMap.value).reduce(
    (sum, percent) => sum + Number(percent || 0),
    0
  );
  return totalPercent === 100; // 严格等于100%
});

// 获取当前百分比总和
const totalPercent = computed(() => {
  return Object.values(percentMap.value).reduce((sum, percent) => sum + Number(percent || 0), 0);
});

const addData = reactive({
  typeName: '',
  remark: '',
  score: 0,
  percent: 0
});

const updateData = reactive({
  typeName: '',
  remark: '',
  score: 0
});

// 百分比校验函数
const validatePercentSum = () => {
  const total = Object.values(percentMap.value).reduce(
    (sum, percent) => sum + Number(percent || 0),
    0
  );
  if (total !== 100) {
    ElMessage.warning(`当前百分比总和为${total}%，请确保总和为100%`);
  }
};

// 自动分配百分比
const autoDistributePercent = itemCount => {
  if (itemCount === 0) return [];

  const base = Math.floor(100 / itemCount); // 基础整数部分
  const remainder = 100 % itemCount; // 余数

  const percents = new Array(itemCount).fill(base);

  // 将余数分配给前几个项目
  for (let i = 0; i < remainder; i++) {
    percents[i] += 1;
  }

  return percents;
};

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

  // 更新服务器数据（不包括百分比）
  const data = await fetchUpdateType({
    id: scope.row.id,
    categoryName: updateData.typeName,
    categoryDescription: updateData.remark,
    score: updateData.score
  });

  if (data.code === 200) {
    await fetchType({ courseId, current: 1, size: -1 });
    // 重新初始化百分比映射，以后端数据为准
    typeList.value.forEach(t => {
      percentMap.value[t.id] = t.percent * 100;
    });
    ElMessage.success('修改成功');
  } else {
    ElMessage.error(data.msg);
  }
};

const handleSelect = selection => {
  delList.value = selection.map(i => i.id);
};

const handleSelectAll = selection => {
  delList.value = selection.map(i => i.id);
};

const handleDelAll = async () => {
  if (!delList.value.length) {
    ElMessage.info('未选择类型名');
    return;
  }

  try {
    await ElMessageBox.confirm('确定要删除选中的项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 分离本地项和服务器项
    const localIds = [];
    const serverIds = [];

    delList.value.forEach(id => {
      if (id.toString().startsWith('local')) {
        localIds.push(id);
      } else {
        serverIds.push(id);
      }
    });

    // 删除本地项
    if (localIds.length > 0) {
      localIds.forEach(id => {
        const index = localAddedItems.value.findIndex(item => item.id === id);
        if (index > -1) {
          localAddedItems.value.splice(index, 1);
        }
        delete percentMap.value[id];
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
      serverIds.forEach(id => {
        delete percentMap.value[id];
      });
    }

    // 重新分配剩余项目的百分比
    const remainingItems = exemList.value;
    if (remainingItems.length > 0) {
      const newPercents = autoDistributePercent(remainingItems.length);
      remainingItems.forEach((item, index) => {
        percentMap.value[item.id] = newPercents[index];
        // 标记为自动分配（未更新到后端），但排除本地新增项
        if (!item.isLocal) {
          isAutoDistributed.value[item.id] = true;
        }
      });
    }

    delList.value = [];
    ElMessage.success('删除成功，已重新分配百分比');
  } catch (error) {
    // 用户取消删除
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
    const itemsToSave = exemList.value.filter(item => item.isLocal);

    // 批量保存所有本地新增的项目
    const savePromises = itemsToSave.map(item => {
      return fetchAddType({
        courseId,
        categoryName: item.categoryName,
        categoryDescription: item.categoryDescription,
        score: item.score,
        percent: percentMap.value[item.id] / 100
      });
    });

    const results = await Promise.allSettled(savePromises);

    // 检查是否所有保存都成功
    const allSuccess = results.every(result => result.value && result.value.msg === 'success');

    if (allSuccess) {
      // 清空本地新增列表
      localAddedItems.value = [];
      // 重新获取服务器数据
      await fetchType({ courseId, current: 1, size: -1 });
      // 重新初始化百分比映射
      percentMap.value = {};
      typeList.value.forEach(t => {
        percentMap.value[t.id] = t.percent * 100;
      });
      // 清除所有自动分配标记
      isAutoDistributed.value = {};
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

// 批量更新百分比
const handleBatchUpdate = async () => {
  // 检查是否存在未保存的本地项目
  if (localAddedItems.value.length > 0) {
    ElMessage.error(
      `当前存在${localAddedItems.value.length}个未保存的本地项目，请先保存后再进行批量更新`
    );
    return;
  }

  // 验证百分比总和是否为100%
  if (!isPercentValid.value) {
    ElMessage.error(`百分比总和必须为100%，当前总和为${totalPercent.value}%`);
    return;
  }

  try {
    await ElMessageBox.confirm('确定要批量更新所有项目的百分比吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    loading.value = true;

    // 只更新服务器数据的百分比
    const serverItems = exemList.value.filter(item => !item.isLocal);

    if (serverItems.length === 0) {
      ElMessage.info('没有需要更新的服务器数据');
      return;
    }

    const updatePromises = serverItems.map(item => {
      return fetchUpdateType({
        id: item.id,
        percent: percentMap.value[item.id] / 100
      });
    });

    const results = await Promise.allSettled(updatePromises);

    // 检查是否所有更新都成功
    const allSuccess = results.every(result => result.value && result.value.msg === 'success');

    if (allSuccess) {
      await fetchType({ courseId, current: 1, size: -1 });
      // 重新初始化百分比映射
      percentMap.value = {};
      typeList.value.forEach(t => {
        percentMap.value[t.id] = t.percent * 100;
      });
      // 保持本地新增项的百分比
      localAddedItems.value.forEach(item => {
        if (!percentMap.value[item.id]) {
          percentMap.value[item.id] = 0;
        }
      });
      // 清除所有自动分配标记
      isAutoDistributed.value = {};
      ElMessage.success('批量更新成功');
    } else {
      ElMessage.error('部分数据更新失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('更新失败：' + error.message);
    }
  } finally {
    loading.value = false;
  }
};

const handleDelete = async scope => {
  try {
    await ElMessageBox.confirm('确定要删除这个项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const item = scope.row;

    if (item.isLocal) {
      // 删除本地新增项
      const index = localAddedItems.value.findIndex(localItem => localItem.id === item.id);
      if (index > -1) {
        localAddedItems.value.splice(index, 1);
        delete percentMap.value[item.id];

        // 重新分配剩余项目的百分比
        const remainingItems = exemList.value;
        if (remainingItems.length > 0) {
          const newPercents = autoDistributePercent(remainingItems.length);
          remainingItems.forEach((item, index) => {
            percentMap.value[item.id] = newPercents[index];
            // 标记为自动分配（未更新到后端），但排除本地新增项
            if (!item.isLocal) {
              isAutoDistributed.value[item.id] = true;
            }
          });
        }

        ElMessage.success('删除成功，已重新分配百分比');
      }
      return;
    }

    // 删除服务器数据
    const data = await fetchDelList({ idList: [item.id] });
    if (data.msg === 'success') {
      await fetchType({ courseId, current: 1, size: -1 });
      delete percentMap.value[item.id];

      // 重新分配剩余项目的百分比
      const remainingItems = exemList.value;
      if (remainingItems.length > 0) {
        const newPercents = autoDistributePercent(remainingItems.length);
        remainingItems.forEach((item, index) => {
          percentMap.value[item.id] = newPercents[index];
          // 标记为自动分配（未更新到后端），但排除本地新增项
          if (!item.isLocal) {
            isAutoDistributed.value[item.id] = true;
          }
        });
      }

      ElMessage.success('删除成功，已重新分配百分比');
    } else {
      ElMessage.error('删除失败');
    }
  } catch (error) {
    // 用户取消删除
  }
};

const handelAdd = async () => {
  const score = Number(addData.score);
  const percent = Number(addData.percent);

  if (!(addData.typeName && addData.score && score > 0 && score <= 100)) {
    ElMessage({
      type: 'warning',
      message: '考核项类型名称，考核项类型总分不可为空，且数据总分应在0-100之间'
    });
    return;
  }

  if (!(percent >= 0 && percent <= 100)) {
    ElMessage({
      type: 'warning',
      message: '百分比应在0-100之间'
    });
    return;
  }

  // 检查新增后百分比总和是否会超过100%
  const currentTotal = Object.values(percentMap.value).reduce((sum, p) => sum + Number(p || 0), 0);
  if (currentTotal + percent > 100) {
    ElMessage({
      type: 'error',
      message: `新增后百分比总和将为${currentTotal + percent}%，超过100%，可以先将百分比设置为0`
    });
    return;
  }

  // 添加到本地列表，生成临时ID
  const newItem = {
    id: 'local' + generateUUI(),
    categoryName: addData.typeName,
    categoryDescription: addData.remark,
    score: score,
    isLocal: true,
    percent: 0
  };

  percentMap.value[newItem.id] = percent;
  localAddedItems.value.push(newItem);

  // 清空表单
  addData.typeName = '';
  addData.remark = '';
  addData.score = 0;
  addData.percent = 0;

  ElMessage.success('已添加到列表，点击保存按钮提交');
};

// 刷新表单状态
const handleRefresh = async () => {
  try {
    loading.value = true;

    // 清空本地新增的数据
    localAddedItems.value = [];

    // 重新获取服务器数据
    await fetchType({ courseId, current: 1, size: -1 });

    // 重新初始化百分比映射，以后端数据为准
    percentMap.value = {};
    typeList.value.forEach(t => {
      percentMap.value[t.id] = t.percent * 100;
    });

    // 清除所有自动分配标记
    isAutoDistributed.value = {};

    // 清空搜索条件
    search.value = '';

    ElMessage.success('刷新成功');
  } catch (error) {
    ElMessage.error('刷新失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchType({ courseId, current: 1, size: -1 });
  typeList.value.forEach(t => {
    percentMap.value[t.id] = t.percent * 100;
  });
});

/* ********************方法定义******************** */
</script>

<style lang="less" scoped></style>
