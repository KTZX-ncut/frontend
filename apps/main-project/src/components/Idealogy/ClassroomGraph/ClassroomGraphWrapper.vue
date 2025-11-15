<template>
  <ClassroomGraph v-if="currentRole === '课程负责人'" />
  <CourseGraph v-if="currentRole === '任课教师'" />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import ClassroomGraph from './ClassroomGraph.vue';
import CourseGraph from './CourseGraph.vue';
/* ********************变量定义******************** */
const currentRole = ref('');
// props定义
// 普通变量
// pinia状态管理

/* ********************方法定义******************** */
onMounted(() => {
  currentRole.value = JSON.parse(sessionStorage.getItem('users')).rolename;
});
</script>

<style lang="less" scoped></style>
