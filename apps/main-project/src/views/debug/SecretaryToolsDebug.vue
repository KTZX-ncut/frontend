<template>
  <section class="debug-page">
    <header class="debug-header">
      <div>
        <h1>教学秘书调试台</h1>
      </div>
      <el-tag :type="hasToken ? 'success' : 'warning'" effect="plain">
        {{ hasToken ? '已检测到 token' : '未检测到 token' }}
      </el-tag>
    </header>

    <el-alert
      v-if="!hasToken"
      class="debug-alert"
      type="warning"
      show-icon
      :closable="false"
      title="当前没有登录 token，页面可以打开，但接口会按后端鉴权失败。请先正常登录教学秘书账号后再访问本页面。"
    />

    <el-tabs v-model="activeTab" class="debug-tabs">
      <el-tab-pane label="角色配置" name="roleAssign">
        <UserRoleAssign />
      </el-tab-pane>
      <el-tab-pane label="新增专业" name="profession">
        <SecretaryCreateProfession />
      </el-tab-pane>
      <el-tab-pane label="新增班级" name="class">
        <SecretaryCreateClass />
      </el-tab-pane>
      <el-tab-pane label="新增课程" name="course">
        <SecretaryCreateCourse />
      </el-tab-pane>
      <el-tab-pane label="新增课堂" name="classroom">
        <SecretaryCreateClassroom />
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import UserRoleAssign from '../../components/admin/UserRoleAssign.vue';
import SecretaryCreateProfession from '../../components/admin/SecretaryCreateProfession.vue';
import SecretaryCreateCourse from '../../components/admin/SecretaryCreateCourse.vue';
import SecretaryCreateClassroom from '../../components/admin/SecretaryCreateClassroom.vue';
import SecretaryCreateClass from '../../components/admin/SecretaryCreateClass.vue';

const activeTab = ref('roleAssign');
const hasToken = computed(() => Boolean(sessionStorage.getItem('token')));
</script>

<style scoped>
.debug-page {
  min-height: 100vh;
  background: #eef2f7;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #d8dee8;
}

.debug-header h1 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #111827;
}

.debug-header p {
  margin: 0;
  color: #6b7280;
}

.debug-alert {
  margin: 16px 20px 0;
}

.debug-tabs {
  margin: 16px 20px 0;
  padding: 16px;
  background: #fff;
  border: 1px solid #d8dee8;
  border-radius: 8px;
}
</style>
