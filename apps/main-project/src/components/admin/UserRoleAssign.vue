<template>
  <section class="role-assign-page" v-loading="loading.bootstrap">
    <header class="page-header">
      <div>
        <h2>用户角色配置</h2>
        <p>{{ school.name }} · 教学秘书角色授权</p>
      </div>
      <el-button :icon="Refresh" @click="refreshCurrentScope" :disabled="!selectedScopeId" :loading="loading.assignments">
        刷新
      </el-button>
    </header>

    <div class="control-band">
      <el-form label-position="top" class="selector-form">
        <el-form-item label="授权角色">
          <el-radio-group v-model="selectedRoleId" @change="handleRoleChange">
            <el-radio-button
              v-for="role in displayRoles"
              :key="role.roleId"
              :label="role.roleId"
              :disabled="!role.active"
            >
              {{ role.roleName }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="scopeLabel">
          <div class="scope-row">
            <el-input
              v-model="scopeKeyword"
              :prefix-icon="Search"
              :placeholder="`搜索${scopeLabel}`"
              clearable
              :disabled="!selectedRole"
              @keyup.enter="loadScopes"
              @clear="loadScopes"
            />
            <el-button type="primary" :icon="Search" :disabled="!selectedRole" :loading="loading.scopes" @click="loadScopes">
              查询
            </el-button>
          </div>
          <el-select
            v-model="selectedScopeId"
            class="scope-select"
            :placeholder="selectedRole ? `请选择${scopeLabel}` : '请先选择授权角色'"
            :disabled="!selectedRole || loading.scopes"
            filterable
            @change="handleScopeChange"
          >
            <el-option
              v-for="scope in scopes"
              :key="scope.scopeId"
              :label="formatScopeLabel(scope)"
              :value="scope.scopeId"
              :disabled="!isActiveStatus(scope.status)"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <aside class="summary-panel">
        <div class="summary-item">
          <span>当前角色</span>
          <strong>{{ selectedRole?.roleName || '-' }}</strong>
        </div>
        <div class="summary-item">
          <span>授权范围</span>
          <strong>{{ selectedScope ? formatScopeLabel(selectedScope) : '-' }}</strong>
        </div>
        <div class="summary-item">
          <span>人数规则</span>
          <strong>{{ selectedRole?.multipleAllowed === false ? '同一课堂仅 1 人' : '同一范围可多人' }}</strong>
        </div>
      </aside>
    </div>

    <el-alert
      v-if="resultSummary"
      class="result-alert"
      :type="resultSummary.failureCount ? 'warning' : 'success'"
      :closable="true"
      show-icon
      @close="resultSummary = null"
    >
      <template #title>
        {{ resultSummary.operationLabel }}完成：成功 {{ resultSummary.successCount }} 项，失败 {{ resultSummary.failureCount }} 项
      </template>
      <ul v-if="resultSummary.failureCount" class="failure-list">
        <li v-for="item in failedResultItems" :key="`${item.userId}-${item.reasonCode}`">
          {{ getUserDisplayName(item.userId) }}：{{ getFailureMessage(item) }}
        </li>
      </ul>
    </el-alert>

    <el-empty v-if="!selectedRole" description="请选择要配置的授权角色" />
    <el-empty v-else-if="!selectedScopeId" :description="`请选择${scopeLabel}`" />

    <div v-else class="tables-grid">
      <section class="table-panel">
        <div class="table-toolbar">
          <div>
            <h3>已授权用户</h3>
            <p>{{ authorizedUsers.length }} 人</p>
          </div>
          <el-button
            type="danger"
            :icon="Delete"
            :disabled="!selectedAuthorizedRows.length"
            :loading="loading.remove"
            @click="confirmRemoveSelected"
          >
            批量移除
          </el-button>
        </div>
        <el-table
          :data="authorizedUsers"
          empty-text="当前范围暂无已授权用户"
          @selection-change="selectedAuthorizedRows = $event"
          border
        >
          <el-table-column type="selection" width="42" />
          <el-table-column prop="displayName" label="姓名" min-width="110" />
          <el-table-column label="登录/工号" min-width="130">
            <template #default="{ row }">{{ row.loginName || row.personNo || '-' }}</template>
          </el-table-column>
          <el-table-column prop="orgName" label="所属组织" min-width="140" show-overflow-tooltip />
          <el-table-column prop="roleName" label="角色" min-width="110" />
          <el-table-column label="范围" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">{{ row.scopeName || selectedScope?.scopeName || '-' }}</template>
          </el-table-column>
          <el-table-column label="学期/上下文" min-width="130">
            <template #default="{ row }">{{ row.termName || selectedScope?.termName || '全部' }}</template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="isActiveStatus(row.status) ? 'success' : 'warning'" effect="plain">
                {{ getStatusText(row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button text type="danger" :icon="Delete" @click="confirmRemoveRows([row])">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section class="table-panel">
        <div class="table-toolbar">
          <div>
            <h3>可新增用户</h3>
            <p>{{ addableUsers.length }} 人</p>
          </div>
          <div class="add-actions">
            <el-input
              v-model="userKeyword"
              :prefix-icon="Search"
              placeholder="搜索姓名、账号或工号"
              clearable
              @keyup.enter="loadAddableUsers"
              @clear="loadAddableUsers"
            />
            <el-button :icon="Search" :loading="loading.users" @click="loadAddableUsers">搜索</el-button>
            <el-button
              type="primary"
              :icon="Plus"
              :disabled="!canAssignSelected"
              :loading="loading.assign"
              @click="submitAssignSelected"
            >
              新增授权
            </el-button>
          </div>
        </div>
        <el-table
          :data="addableUsers"
          empty-text="当前范围暂无可新增用户"
          @selection-change="selectedAddableRows = $event"
          border
        >
          <el-table-column type="selection" width="42" :selectable="isAddableSelectable" />
          <el-table-column prop="displayName" label="姓名" min-width="110" />
          <el-table-column label="登录/工号" min-width="130">
            <template #default="{ row }">{{ row.loginName || row.personNo || '-' }}</template>
          </el-table-column>
          <el-table-column prop="orgName" label="所属组织" min-width="150" show-overflow-tooltip />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="isActiveStatus(row.status) ? 'success' : 'warning'" effect="plain">
                {{ getStatusText(row) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Plus, Refresh, Search } from '@element-plus/icons-vue';
import {
  assignRoleUsers,
  getRoleAssignBootstrap,
  getScopeAssignments,
  listRoleScopes,
  removeRoleUsers,
  searchAddableTeachers
} from '../../api/userRoleAssign.js';
import {
  APPROVED_ROLE_KEYS,
  ROLE_SCOPE_LABELS,
  ROLE_SCOPE_MAP,
  SCOPE_TYPES
} from './userRoleAssign.constants.js';
import {
  getFailureMessage,
  getStatusText,
  isActiveStatus
} from './userRoleAssign.helpers.js';

const loading = ref({
  bootstrap: false,
  scopes: false,
  assignments: false,
  users: false,
  assign: false,
  remove: false
});

const school = ref({ name: '学校' });
const roles = ref([]);
const scopes = ref([]);
const authorizedUsers = ref([]);
const addableUsers = ref([]);
const selectedRoleId = ref('');
const selectedScopeId = ref('');
const scopeKeyword = ref('');
const userKeyword = ref('');
const selectedAuthorizedRows = ref([]);
const selectedAddableRows = ref([]);
const resultSummary = ref(null);

const displayRoles = computed(() =>
  roles.value
    .filter(role => APPROVED_ROLE_KEYS.includes(role.roleKey))
    .slice()
    .sort((left, right) => APPROVED_ROLE_KEYS.indexOf(left.roleKey) - APPROVED_ROLE_KEYS.indexOf(right.roleKey))
);

const selectedRole = computed(() => displayRoles.value.find(role => role.roleId === selectedRoleId.value));
const selectedScope = computed(() => scopes.value.find(scope => scope.scopeId === selectedScopeId.value));
const scopeType = computed(() => selectedRole.value?.scopeType || ROLE_SCOPE_MAP[selectedRole.value?.roleKey]);
const scopeLabel = computed(() => ROLE_SCOPE_LABELS[scopeType.value] || '授权范围');

const hasClassroomTeacher = computed(() =>
  selectedRole.value?.scopeType === SCOPE_TYPES.CLASSROOM && authorizedUsers.value.some(user => isActiveStatus(user.status))
);

const canAssignSelected = computed(() => {
  if (!selectedRole.value || !selectedScopeId.value || !selectedAddableRows.value.length) return false;
  if (hasClassroomTeacher.value) return false;
  if (selectedRole.value.multipleAllowed === false && selectedAddableRows.value.length > 1) return false;
  return selectedAddableRows.value.every(row => isActiveStatus(row.status));
});

const failedResultItems = computed(() => resultSummary.value?.items?.filter(item => !item.success) || []);

const setLoading = (key, value) => {
  loading.value = { ...loading.value, [key]: value };
};

const loadBootstrap = async () => {
  setLoading('bootstrap', true);
  try {
    const data = await getRoleAssignBootstrap();
    school.value = data.school;
    roles.value = data.roles;
    selectedRoleId.value = data.roles.find(role => role.active)?.roleId || data.roles[0]?.roleId || '';
    if (selectedRoleId.value) {
      await loadScopes();
    }
  } catch (error) {
    ElMessage.error(error?.message || '获取角色配置入口数据失败');
  } finally {
    setLoading('bootstrap', false);
  }
};

const loadScopes = async () => {
  if (!selectedRole.value) return;
  setLoading('scopes', true);
  selectedScopeId.value = '';
  authorizedUsers.value = [];
  addableUsers.value = [];
  selectedAuthorizedRows.value = [];
  selectedAddableRows.value = [];
  try {
    scopes.value = await listRoleScopes({
      scopeType: scopeType.value,
      keyword: scopeKeyword.value
    });
    if (scopes.value.some(scope => scope.mocked)) {
      ElMessage.warning(`当前${scopeLabel.value}列表使用本地演示数据，仅用于跑通页面流程`);
    }
  } catch (error) {
    scopes.value = [];
    ElMessage.error(error?.message || `获取${scopeLabel.value}列表失败`);
  } finally {
    setLoading('scopes', false);
  }
};

const loadAssignments = async () => {
  if (!selectedRole.value || !selectedScopeId.value) return;
  setLoading('assignments', true);
  selectedAuthorizedRows.value = [];
  selectedAddableRows.value = [];
  try {
    const data = await getScopeAssignments({
      roleId: selectedRole.value.roleId,
      scopeId: selectedScopeId.value,
      scopeType: scopeType.value
    });
    authorizedUsers.value = data.authorizedUsers;
    addableUsers.value = data.addableUsers;
  } catch (error) {
    authorizedUsers.value = [];
    addableUsers.value = [];
    ElMessage.error(error?.message || '获取授权用户列表失败');
  } finally {
    setLoading('assignments', false);
  }
};

const loadAddableUsers = async () => {
  if (!selectedRole.value || !selectedScopeId.value) return;
  setLoading('users', true);
  try {
    addableUsers.value = await searchAddableTeachers({
      keyword: userKeyword.value,
      roleId: selectedRole.value.roleId,
      scopeId: selectedScopeId.value,
      scopeType: scopeType.value
    });
    selectedAddableRows.value = [];
  } catch (error) {
    ElMessage.error(error?.message || '搜索可新增用户失败');
  } finally {
    setLoading('users', false);
  }
};

const handleRoleChange = async () => {
  selectedScopeId.value = '';
  scopeKeyword.value = '';
  userKeyword.value = '';
  resultSummary.value = null;
  await loadScopes();
};

const handleScopeChange = async () => {
  resultSummary.value = null;
  await loadAssignments();
};

const refreshCurrentScope = async () => {
  await loadAssignments();
};

const formatScopeLabel = scope => {
  const parts = [scope.scopeName || scope.scopeId];
  if (scope.scopeCode) parts.push(scope.scopeCode);
  if (scope.parentName) parts.push(scope.parentName);
  if (scope.termName) parts.push(scope.termName);
  return parts.filter(Boolean).join(' / ');
};

const isAddableSelectable = row => {
  if (!isActiveStatus(row.status)) return false;
  if (hasClassroomTeacher.value) return false;
  return true;
};

const buildPayload = rows => ({
  roleId: selectedRole.value.roleId,
  scopeType: selectedRole.value.scopeType,
  scopeId: selectedScopeId.value,
  userIds: rows.map(row => row.userId)
});

const submitAssignSelected = async () => {
  if (!canAssignSelected.value) {
    ElMessage.warning(hasClassroomTeacher.value ? '该课堂已有课堂负责人' : '请选择可新增用户');
    return;
  }
  setLoading('assign', true);
  try {
    const result = await assignRoleUsers(buildPayload(selectedAddableRows.value));
    resultSummary.value = { ...result, operationLabel: '新增授权' };
    ElMessage[result.failureCount ? 'warning' : 'success'](
      `新增授权完成：成功 ${result.successCount} 项，失败 ${result.failureCount} 项`
    );
    await loadAssignments();
  } catch (error) {
    ElMessage.error(error?.message || '新增授权失败');
  } finally {
    setLoading('assign', false);
  }
};

const confirmRemoveSelected = () => confirmRemoveRows(selectedAuthorizedRows.value);

const confirmRemoveRows = async rows => {
  if (!rows.length) return;
  try {
    await ElMessageBox.confirm(
      `确认移除选中的 ${rows.length} 个角色授权？移除后目标用户下次登录或刷新角色列表将不再看到该角色。`,
      '移除角色授权',
      {
        confirmButtonText: '确认移除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    await submitRemoveRows(rows);
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error('移除确认处理失败');
    }
  }
};

const submitRemoveRows = async rows => {
  setLoading('remove', true);
  try {
    const result = await removeRoleUsers(buildPayload(rows));
    resultSummary.value = { ...result, operationLabel: '移除授权' };
    ElMessage[result.failureCount ? 'warning' : 'success'](
      `移除授权完成：成功 ${result.successCount} 项，失败 ${result.failureCount} 项`
    );
    await loadAssignments();
  } catch (error) {
    ElMessage.error(error?.message || '移除授权失败');
  } finally {
    setLoading('remove', false);
  }
};

const getUserDisplayName = userId => {
  const user = [...authorizedUsers.value, ...addableUsers.value].find(item => item.userId === userId);
  return user?.displayName || userId;
};

onMounted(loadBootstrap);
</script>

<style scoped>
.role-assign-page {
  min-height: 100%;
  padding: 16px;
  background: #f5f7fb;
  color: #1f2937;
}

.page-header,
.control-band,
.table-panel {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
}

.page-header h2,
.table-toolbar h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.page-header p,
.table-toolbar p,
.summary-item span {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.control-band {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  margin-top: 14px;
  padding: 16px 18px;
}

.selector-form {
  min-width: 0;
}

.scope-row,
.add-actions {
  display: flex;
  gap: 8px;
  width: 100%;
}

.scope-select {
  width: 100%;
  margin-top: 8px;
}

.summary-panel {
  display: grid;
  gap: 10px;
  align-content: start;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.summary-item {
  min-width: 0;
}

.summary-item strong {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  color: #111827;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-alert {
  margin-top: 14px;
}

.failure-list {
  margin: 6px 0 0;
  padding-left: 18px;
}

.tables-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 14px;
}

.table-panel {
  min-width: 0;
  padding: 14px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.add-actions {
  max-width: 680px;
}

@media (max-width: 920px) {
  .control-band {
    grid-template-columns: 1fr;
  }

  .table-toolbar,
  .scope-row,
  .add-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
