<template>
  <div class="bgd-kwa">
    <el-form label-position="left" :model="form" label-width="60px" v-if="['courseLibSearch', 'classroomLibSearch'].includes(type)">
      <el-form-item label="关键字 ">
        <el-checkbox-group @change="handleChange" v-model="form.keyIds">
          <el-checkbox v-for="(value, key, i) in kwaMap?.keyMap" class="custom-checkbox" :label="key" :key="i">{{ value }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="能力">
        <el-checkbox-group v-model="form.abilityIds" @change="handleChange">
          <el-checkbox v-for="(value, key, i) in kwaMap?.abilityMap" class="custom-checkbox" :label="key" :key="i">{{ value }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="题型">
        <el-checkbox class="custom-checkbox" label="0" style="margin-right: 30px" @change="queTypeIdAll">全部</el-checkbox>
        <el-checkbox-group v-model="form.queTypeIds" @change="handleChange">
          <el-checkbox class="custom-checkbox" v-for="(item, i) in courseType" :label="item.queTypeId" :key="i">{{ item.name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>

    <el-form v-if="['courseLibaAdd', 'classroomLibAdd'].includes(type)" label-position="left" :model="form" label-width="60px">
      <el-form-item label="关键字 ">
        <el-checkbox-group :max="1" @change="handleChange" v-model="form.treeIds">
          <el-checkbox class="custom-checkbox" v-for="(item, i) in kwaTree" :key="i" :label="item.keyId">{{ item.name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="能力" v-if="abilityList && abilityList.length">
        <el-checkbox-group @change="addHandleChange" v-model="form.abilityItems" :max="1">
          <el-checkbox class="custom-checkbox" v-for="(item, i) in abilityList" :key="i" :label="item">{{ item.name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="价值" v-if="valueTreeData && valueTreeData.length">
        <div>
           <!-- Tab页：一级父节点 -->
          <div class="value-tab-container">
            <div
              v-for="category in valueCategories"
              :key="category.id"
              :class="['value-tab-item', { active: activeValueTabId === category.id }]"
              @click="handleValueTabClick(category.id)"
            >
              {{ category.vname }}
            </div>
          </div>
          
          <!-- 复选框：二级子节点 -->
          <div class="value-checkbox-container" v-if="currentValueSubs.length">
            <el-checkbox-group v-model="form.vids" @change="addHandleValueChange" :max="1">
              <el-checkbox 
                class="custom-checkbox" 
                v-for="item in currentValueSubs" 
                :key="item.id" 
                :label="item.id"
              >
                {{ item.vname }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <el-form v-if="['taskKwa'].includes(type)" label-position="left" :model="form" label-width="60px">
      <el-form-item label="关键字 ">
        <el-checkbox-group @change="handleChange" v-model="form.keyIds">
          <el-checkbox class="custom-checkbox" v-for="(value, key, i) in kwaMap?.keyMap" :label="key" :key="i">{{ value }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="能力">
        <el-checkbox-group v-model="form.abilityIds" @change="handleChange">
          <el-checkbox class="custom-checkbox" v-for="(value, key, i) in kwaMap?.abilityMap" :label="key" :key="i">{{ value }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, computed } from "vue";
import { courseLibKwaMap, courseLibKwaTree, courseLibType, taskKwa, courseLibVTree } from "@/api/courseLib";
import { classroomLibKwaTree, classroomLibKwaMap, classroomLibType } from "@/api/classroomLib.js";
const emit = defineEmits(["child-event"]);
const props = defineProps({
  type: {
    type: String,
    default: "",
  },
  defaultValue: {
    type: Array,
    defautl: null,
  },
});
const { type, defaultValue } = props;
const form = ref({});
const kwaMap = ref(null);
const kwaTree = ref(null);
const courseType = ref(null);
const abilityList = ref([]);
const valueTreeData = ref([]);
const activeValueTabId = ref(null);

// 一级父节点（价值分类）
const valueCategories = computed(() => {
  return (valueTreeData.value || []).filter(item => item.level === 1 && !item.parentId);
});

// 当前tab下的子节点
const currentValueSubs = computed(() => {
  if (!activeValueTabId.value) {
    // 如果没有选中tab，返回第一个tab的子节点
    const firstCategory = valueCategories.value[0];
    if (firstCategory && firstCategory.subs) {
      activeValueTabId.value = firstCategory.id;
      return (firstCategory.subs || []).filter(item => item.level === 2);
    }
    return [];
  }
  const category = valueTreeData.value.find(item => item.id === activeValueTabId.value && item.level === 1);
  return (category?.subs || []).filter(item => item.level === 2);
});

const handleValueTabClick = (tabId) => {
  activeValueTabId.value = tabId;
  // 切换tab时清空选中的价值
  form.value.vids = [];
  addHandleValueChange([]);
};

const init = () => {
  form.value = {};
  emit("kwa-event", form.value);
};

const getCourseLibKwa = () => {
  // 课程列表搜索kwa
  if (type === "courseLibSearch") {
    courseLibKwaMap().then((res) => {
      if (res.code === "200") {
        kwaMap.value = res.data;
      }
    });
  }

  // 课程、课堂列表搜索kwa
  if (type === "classroomLibSearch") {
    classroomLibKwaMap().then((res) => {
      if (res.code === "200") {
        kwaMap.value = res.data;
      }
    });
  }
  // 添加题kwa
  if (["classroomLibAdd", "courseLibaAdd"].includes(type)) {
    const api = type === "courseLibaAdd" ? courseLibKwaTree : classroomLibKwaTree;
    api().then((res) => {
      if (res.code === "200") {
        kwaTree.value = res.data;
        if (defaultValue && defaultValue.length) {
          // kwaTree.
          const kwaIds = defaultValue?.map((obj) => obj.kwaId);
          let kwaTreeArr = kwaTree.value.map((obj) => {
            const arr = obj.abilityList.filter((f) => kwaIds.includes(f.kwaId));
            if (arr && arr.length) {
              return {
                keyId: obj.keyId,
                kwas: arr,
                abilityList: obj.abilityList,
              };
            }
          });
          // 过滤掉垃圾数据
          kwaTreeArr = kwaTreeArr.filter((item) => item);
          // 能力数据
          abilityList.value =
            kwaTreeArr
              ?.map((obj) => {
                if (obj?.abilityList) return obj.abilityList;
              })
              ?.flat() || [];
          // 关键字回显数据
          form.value.treeIds = kwaTreeArr?.map((kwa) => kwa?.keyId) || [];
          // 能力回显数据
          form.value.abilityItems =
            kwaTreeArr
              ?.map((obj) => {
                if (obj?.kwas) return obj.kwas;
              })
              ?.flat() || [];
          addHandleChange(form.value.abilityItems);
        }
      }
    });
  }
  //
  if (type === "taskKwa") {
    taskKwa().then((res) => {
      if (res.code === "200") {
        kwaMap.value = res.data;
      }
    });
  }
};
// 题型
const getCourseLibType = () => {
  if (["classroomLibSearch", "courseLibSearch"].includes(type)) {
    // classroomLibSearch: 课程题库，courseLibSearch: 课堂题库
    const libTypeApi = type === "classroomLibSearch" ? classroomLibType : courseLibType;
    libTypeApi().then((res) => {
      if (res.code === "200") {
        courseType.value = res.data?.filter((f) => f.status);
      }
    });
  }
};

const queTypeIdAll = (value) => {
  if (value) {
    const queTypeIds = courseType.value.map((course) => course.queTypeId);
    form.value.queTypeIds = [...queTypeIds];
  } else {
    form.value.queTypeIds = [];
  }
  emit("kwa-event", form.value);
};

const handleChange = (changeValue) => {
  // 获取添加kwa能力
  if (["classroomLibAdd", "courseLibaAdd"].includes(type) && form.value.treeIds) {
    abilityList.value = [];
    form.value.abilityItem = [];
    form.value.abilityItems = [];
    form.value.vids = [];
    emit("kwa-event", []);
    form.value.treeIds?.forEach((item) => {
      let list = kwaTree.value.find((kwa) => kwa.keyId === item)?.abilityList || [];
      abilityList.value = [...abilityList.value, ...list];
    });
    abilityList.value
  }

  if (["taskKwa", "courseLibSearch", "classroomLibSearch"].includes(type)) {
    emit("kwa-event", form.value);
  }
};

const kwaEvent = ref([]);
const addHandleChange = (arr) => {
  const newArr = arr?.map((arrItem) => {
    if (arrItem) {
      const { fullName, kwaId } = arrItem;
      return {
        kwaName: fullName,
        kwaId,
        // 移除 vid 字段
      };
    }
  });
  kwaEvent.value = newArr;
  // 统一发送包含 kwas 和 vids 的对象
  emitKwaAndVids();
};

const addHandleValueChange = (vids) => {
  form.value.vids = vids;
  // 统一发送包含 kwas 和 vids 的对象
  emitKwaAndVids();
};

// 同时发送 kwas 和 vids
const emitKwaAndVids = () => {
  // 直接发送 kwas 数组和 vids 数组，它们是同级别的
  // 注意：虽然 vids 是数组，但只保存一个值
  const result = {
    kwas: kwaEvent.value || [],
    vids: form.value.vids && form.value.vids.length > 0 ? [form.value.vids[0]] : []
  };
  emit("kwa-event", result);
};

// 价值
const getCourseLibValue = () => {
  if (["classroomLibAdd", "courseLibaAdd"].includes(type)) {
    courseLibVTree().then((res) => {
      if (res.code === "200") {
        valueTreeData.value = res.data || [];
        // 默认选中第一个tab
        if (valueCategories.value.length > 0 && !activeValueTabId.value) {
          activeValueTabId.value = valueCategories.value[0].id;
        }
        
        // 复显价值 - 从 defaultValue 中提取 vid
        // defaultValue 可能是旧格式 [{ kwaId, kwaName, vid }] 或新格式 { kwas: [], vids: [] }
        if (defaultValue) {
          let vidToRestore = null;
          // 检查是否是旧格式（数组，包含 vid）
          if (Array.isArray(defaultValue) && defaultValue.length > 0 && defaultValue[0]?.vid) {
            vidToRestore = defaultValue[0].vid;
          } 
          // 检查是否是新格式（对象，包含 vids）
          else if (defaultValue && typeof defaultValue === 'object' && !Array.isArray(defaultValue) && defaultValue.vids && defaultValue.vids.length > 0) {
            vidToRestore = defaultValue.vids[0];
          }
          
          if (vidToRestore && valueTreeData.value.length > 0) {
            // 延迟执行，确保数据加载完成后再复显
            setTimeout(() => {
              // 从树形数据中找到对应的 vid，并设置对应的tab
              const findVidInTree = (tree, targetVid) => {
                for (const item of tree) {
                  if (item.id === targetVid || item.id === String(targetVid)) {
                    // 如果是子节点，需要找到父节点并设置active tab
                    if (item.level === 2 && item.parentId) {
                      activeValueTabId.value = item.parentId;
                    }
                    return item.id;
                  }
                  if (item.subs && item.subs.length > 0) {
                    const found = findVidInTree(item.subs, targetVid);
                    if (found) {
                      // 如果找到了，且当前项是父节点，设置active tab
                      if (item.level === 1) {
                        activeValueTabId.value = item.id;
                      }
                      return found;
                    }
                  }
                }
                return null;
              };
              const vid = findVidInTree(valueTreeData.value, vidToRestore);
              if (vid) {
                form.value.vids = [vid];
                // 如果已经有 kwas 数据，触发一次 emit 以同步数据
                if (kwaEvent.value && kwaEvent.value.length > 0) {
                  emitKwaAndVids();
                }
              }
            }, 300);
          }
        }
      }
    });
  }
};


onMounted(() => {
  getCourseLibKwa();
  getCourseLibType();
  getCourseLibValue();
});
// 导出函数
defineExpose({
  init,
});
</script>

<style>
.bgd-kwa .el-form-item {
  margin-bottom: 15px !important;
}
.bgd-kwa .el-form-item__content {
  text-align: left;
}

/* 价值tab和复选框样式 */
.value-tab-container {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.value-tab-item {
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
}

.value-tab-item:hover {
  background: #f5f7fa;
}

.value-tab-item.active {
  background: #27a5ff;
  color: white;
  border: 1px solid #27a5ff;
}

.value-checkbox-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
