<template>
  <div class="value-tab-checkbox-group">
    <!-- Tab页：一级父节点 -->
    <div class="tab-container">
      <div
        v-for="(category, index) in categories"
        :key="category.id"
        :class="['tab-item', { active: activeTabId === category.id }]"
        @click="handleTabClick(category.id)"
      >
        {{ category.vname }}
      </div>
    </div>
    
    <!-- 复选框：二级子节点 -->
    <div class="checkbox-container" v-if="currentSubs.length">
      <div
        v-for="(item, index) in currentSubs"
        :key="item.id"
        :class="['checkbox-item', { active: isSelected(item.id) }]"
        @click="handleCheckboxClick(item.id)"
      >
        {{ item.vname }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  treeData: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

// 一级父节点（分类）
const categories = computed(() => {
  return props.treeData.filter(item => item.level === 1 && !item.parentId);
});

// 当前选中的tab
const activeTabId = ref(null);

// 当前tab下的子节点
const currentSubs = computed(() => {
  if (!activeTabId.value) {
    // 如果没有选中tab，返回第一个tab的子节点
    const firstCategory = categories.value[0];
    if (firstCategory && firstCategory.subs) {
      activeTabId.value = firstCategory.id;
      return (firstCategory.subs || []).filter(item => item.level === 2);
    }
    return [];
  }
  const category = props.treeData.find(item => item.id === activeTabId.value && item.level === 1);
  return (category?.subs || []).filter(item => item.level === 2);
});

// 初始化：默认选中第一个tab
watch(
  () => props.treeData,
  (newData) => {
    if (newData && newData.length && !activeTabId.value) {
      const firstCategory = categories.value[0];
      if (firstCategory) {
        activeTabId.value = firstCategory.id;
      }
    }
  },
  { immediate: true }
);

const isSelected = (value) => {
  return props.modelValue.includes(value);
};

const handleTabClick = (tabId) => {
  activeTabId.value = tabId;
};

const handleCheckboxClick = (value) => {
  let newValue = [...props.modelValue];
  const index = newValue.indexOf(value);

  if (index === -1) {
    // 选中
    newValue.push(value);
  } else {
    // 取消选中
    newValue.splice(index, 1);
  }

  emit("update:modelValue", newValue);
  emit("change", newValue);
};
</script>

<style lang="scss" scoped>
.value-tab-checkbox-group {
  .tab-container {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    flex-wrap: wrap;

    .tab-item {
      padding: 0 10px;
      font-family: MicrosoftYaHei;
      font-size: 14px;
      color: #707070;
      line-height: 19px;
      cursor: pointer;
      background: #ffffff;
      border-radius: 13px;
      border: 1px solid #d2d2d2;
      min-height: 19px;
      display: flex;
      align-items: center;
      white-space: nowrap;
      user-select: none;

      &:hover {
        background: #f5f7fa;
      }

      &.active {
        background: #27a5ff;
        color: white;
        border: 1px solid #27a5ff;
      }
    }
  }

  .checkbox-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .checkbox-item {
      padding: 0 10px;
      font-family: MicrosoftYaHei;
      font-size: 14px;
      color: #707070;
      line-height: 19px;
      cursor: pointer;
      background: #ffffff;
      border-radius: 13px;
      border: 1px solid #d2d2d2;
      min-height: 19px;
      display: flex;
      align-items: center;

      &:hover {
        background: #f5f7fa;
      }

      &.active {
        background: #27a5ff;
        color: white;
        border: 1px solid #27a5ff;
      }
    }
  }
}
</style>

