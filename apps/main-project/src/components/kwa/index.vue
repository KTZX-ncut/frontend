<template>
  <div class="bgd-kwa">
    <el-form label-position="left" :model="form" label-width="80px" v-if="['courseLibSearch', 'classroomLibSearch'].includes(type)">
      <el-form-item label="关键字 " class="kwa-form-item" v-if="keywordOptions.length">
        <custom-checkbox-group
          v-model="form.keyIds"
          :options="keywordOptions"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="能力" class="kwa-form-item" v-if="abilityOptions.length">
        <custom-checkbox-group
          v-model="form.abilityIds"
          :options="abilityOptions"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="题型" class="kwa-form-item" v-if="queTypeOptions.length">
        <custom-checkbox-group
          v-model="form.queTypeIds"
          :options="[{ label: '全部', value: '0' }, ...queTypeOptions]"
          @change="handleQueTypeChange"
          :isQuestionType="true"
        />
      </el-form-item>

      <el-form-item label="价值" class="kwa-form-item" v-if="valueTreeData && valueTreeData.length">
        <value-tab-checkbox-group
          v-model="form.vids"
          :tree-data="valueTreeData"
          @change="handleChange"
        />
      </el-form-item>
      
    </el-form>

    <el-form v-if="['courseLibaAdd', 'classroomLibAdd'].includes(type)" label-position="left" :model="form" label-width="60px">
      <el-form-item label="关键字 " v-if="kwaTreeOptions.length">
        <custom-checkbox-group
          v-model="form.treeIds"
          :options="kwaTreeOptions"
          :max="1"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="能力" v-if="abilityList && abilityList.length">
        <custom-checkbox-group
          v-model="form.abilityItems"
          :options="abilityListOptions"
          :max="1"
          @change="addHandleChange"
        />
      </el-form-item>
    </el-form>

    <el-form v-if="['taskKwa'].includes(type)" label-position="left" :model="form" label-width="60px">
      <el-form-item label="关键字 " v-if="keywordOptions.length">
        <custom-checkbox-group
          v-model="form.keyIds"
          :options="keywordOptions"
          @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="能力" v-if="abilityOptions.length">
        <custom-checkbox-group
          v-model="form.abilityIds"
          :options="abilityOptions"
          @change="handleChange"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, computed } from "vue";
import { courseLibKwaMap, courseLibKwaTree, courseLibType, taskKwa, courseLibVTree } from "@/api/courseLib";
import { classroomLibKwaTree, classroomLibKwaMap, classroomLibType } from "@/api/classroomLib.js";
import CustomCheckboxGroup from '../CustomCheckboxGroup/index.vue';
import ValueTabCheckboxGroup from '../ValueTabCheckboxGroup/index.vue';
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
console.log("kea-props", props);
const { type, defaultValue } = props;
const form = ref({
  queTypeIds: ['0'], // 设置默认值为 "全部"
  vids: [] // 价值选中的ID数组
});
const kwaMap = ref(null);
const kwaTree = ref(null);
const courseType = ref(null);
const abilityList = ref([]);
const valueTreeData = ref([]);

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
          console.log("form.value.abilityItems", form.value.abilityItems);
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

// 价值
const getCourseLibValue = () => {
  if (["classroomLibSearch", "courseLibSearch"].includes(type)) {
    courseLibVTree().then((res) => {
      if (res.code === "200") {
        valueTreeData.value = res.data || [];
      }
    });
  }
};

const handleQueTypeChange = (value) => {
  if (value.includes('0')) {
    // 如果选择了"全部"，设置为 ['0'] 用于显示选中状态
    form.value.queTypeIds = ['0'];
    // 但向父组件发送空数组
    emit("kwa-event", { ...form.value, queTypeIds: [] });
  } else {
    emit("kwa-event", form.value);
  }
};

const handleChange = (changeValue) => {
  console.log("changeValue", changeValue);
  // 获取添加kwa能力
  if (["classroomLibAdd", "courseLibaAdd"].includes(type) && form.value.treeIds) {
    abilityList.value = [];
    form.value.abilityItem = [];
    form.value.abilityItems = [];
    emit("kwa-event", []);
    form.value.treeIds?.forEach((item) => {
      let list = kwaTree.value.find((kwa) => kwa.keyId === item)?.abilityList || [];
      abilityList.value = [...abilityList.value, ...list];
    });
  }

  if (["taskKwa", "courseLibSearch", "classroomLibSearch"].includes(type)) {
    emit("kwa-event", form.value);
  }
};
const addHandleChange = (arr) => {
  const newArr = arr?.map((arrItem) => {
    if (arrItem) {
      const { fullName, kwaId } = arrItem;
      return {
        kwaName: fullName,
        kwaId,
      };
    }
  });
  console.log("newArr", newArr);
  emit("kwa-event", newArr);
};

// Add computed properties for options
const keywordOptions = computed(() => {
  return Object.entries(kwaMap.value?.keyMap || {}).map(([key, value]) => ({
    label: value,
    value: key
  }));
});

const abilityOptions = computed(() => {
  return Object.entries(kwaMap.value?.abilityMap || {}).map(([key, value]) => ({
    label: value,
    value: key
  }));
});

const queTypeOptions = computed(() => {
  return (courseType.value || []).map(item => ({
    label: item.name,
    value: item.queTypeId
  }));
});

const kwaTreeOptions = computed(() => {
  return (kwaTree.value || []).map(item => ({
    label: item.name,
    value: item.keyId
  }));
});

const abilityListOptions = computed(() => {
  return (abilityList.value || []).map(item => ({
    label: item.name,
    value: item
  }));
});

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
.bgd-kwa .el-form-item__content {
  text-align: left;
}
.bgd-kwa .el-form-item__label {
  font-family: MicrosoftYaHei;
  font-size: 16px;
  color: #1b1b1b;
}
</style>
<style lang="scss" scoped>
.bgd-kwa {
  padding-top: 22px;
  padding-bottom: 12px;
  border-bottom: 2px solid #93d2ff;
}
.kwa-form-item {
  background: rgba(39, 165, 255, 0.07);
  border-radius: 10px;
  padding: 17px 22px;
  margin-bottom: 10px;
}
</style>
