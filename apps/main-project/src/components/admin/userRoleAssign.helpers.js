import {
  ACTIVE_STATUS_VALUES,
  APPROVED_ROLE_KEYS,
  ASSIGNABLE_ROLE_DEFINITIONS,
  ERROR_MESSAGES,
  ROLE_SCOPE_MAP
} from './userRoleAssign.constants.js';

const firstValue = (source, keys, fallback = '') => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
};

export const isActiveStatus = status => ACTIVE_STATUS_VALUES.includes(status);

export const normalizeRole = role => {
  const roleName = firstValue(role, ['roleName', 'rolename', 'name']);
  const roleDefinition = ASSIGNABLE_ROLE_DEFINITIONS.find(
    item => item.roleName === roleName || item.roleAliases?.includes(roleName)
  );
  const roleKey = firstValue(role, ['roleKey', 'key'], roleDefinition?.roleKey);

  return {
    roleId: firstValue(role, ['roleId', 'roleid', 'id']),
    roleKey,
    roleName: roleDefinition?.roleName || roleName || '',
    scopeType: firstValue(role, ['scopeType'], roleDefinition?.scopeType || ROLE_SCOPE_MAP[roleKey]),
    multipleAllowed: role?.multipleAllowed ?? roleDefinition?.multipleAllowed ?? true,
    active: role?.active ?? isActiveStatus(role?.status ?? 'active')
  };
};

export const normalizeBootstrap = data => {
  const roles = Array.isArray(data?.roles) ? data.roles : [];
  return {
    school: {
      id: firstValue(data?.school || {}, ['id', 'schoolId', 'obsid']),
      name: firstValue(data?.school || {}, ['name', 'schoolName', 'obsname'], '学校')
    },
    roles: roles.map(normalizeRole).filter(role => role.roleId && APPROVED_ROLE_KEYS.includes(role.roleKey))
  };
};

export const normalizeScope = scope => ({
  scopeId: firstValue(scope, ['scopeId', 'id', 'obsid', 'courseId', 'classroomId']),
  scopeType: firstValue(scope, ['scopeType', 'type']),
  scopeName: firstValue(scope, ['scopeName', 'name', 'obsname', 'courseName', 'classroomName', 'proname']),
  scopeCode: firstValue(scope, ['scopeCode', 'code', 'courseCode', 'procode']),
  parentId: firstValue(scope, ['parentId', 'pid', 'courseId']),
  parentName: firstValue(scope, ['parentName', 'parentname', 'collegeName', 'courseName']),
  termId: firstValue(scope, ['termId', 'termid']),
  termName: firstValue(scope, ['termName', 'termname']),
  status: firstValue(scope, ['status'], 'active'),
  disabledReason: firstValue(scope, ['disabledReason', 'reason'])
});

export const normalizeUser = user => ({
  userId: firstValue(user, ['userId', 'userid', 'id']),
  displayName: firstValue(user, ['displayName', 'username', 'name', 'realname']),
  loginName: firstValue(user, ['loginName', 'loginname', 'usercode', 'account']),
  personNo: firstValue(user, ['personNo', 'jobNo', 'workno', 'number']),
  catelog: firstValue(user, ['catelog']),
  orgId: firstValue(user, ['orgId', 'obsid']),
  orgName: firstValue(user, ['orgName', 'obsname']),
  status: firstValue(user, ['status'], 'active'),
  statusText: firstValue(user, ['statusText', 'statusName'])
});

export const normalizeAssignment = assignment => {
  const user = normalizeUser(assignment);
  return {
    ...user,
    assignmentId: firstValue(assignment, ['assignmentId', 'roleUserId', 'id']),
    roleId: firstValue(assignment, ['roleId', 'roleid']),
    roleName: firstValue(assignment, ['roleName', 'rolename']),
    scopeId: firstValue(assignment, ['scopeId', 'obsid']),
    scopeType: firstValue(assignment, ['scopeType']),
    scopeName: firstValue(assignment, ['scopeName', 'obsname']),
    termId: firstValue(assignment, ['termId', 'termid']),
    termName: firstValue(assignment, ['termName', 'termname']),
    createdAt: firstValue(assignment, ['createdAt', 'createtime'])
  };
};

export const normalizeAssignmentsPayload = data => ({
  roleId: data?.roleId || '',
  scopeId: data?.scopeId || '',
  authorizedUsers: (data?.authorizedUsers || data?.assignedUsers || []).map(normalizeAssignment),
  addableUsers: (data?.addableUsers || data?.availableUsers || []).map(normalizeUser)
});

export const normalizeBatchResult = data => {
  const items = Array.isArray(data?.items) ? data.items : [];
  const normalizedItems = items.map(item => ({
    userId: firstValue(item, ['userId', 'userid']),
    assignmentId: firstValue(item, ['assignmentId', 'roleUserId']),
    success: Boolean(item?.success),
    reasonCode: firstValue(item, ['reasonCode', 'code']),
    message: firstValue(item, ['message', 'msg'], item?.success ? '操作成功' : ERROR_MESSAGES[item?.reasonCode] || '操作失败')
  }));

  return {
    successCount: data?.successCount ?? normalizedItems.filter(item => item.success).length,
    failureCount: data?.failureCount ?? normalizedItems.filter(item => !item.success).length,
    items: normalizedItems
  };
};

export const getStatusText = row => {
  if (row?.disabledReason) return row.disabledReason;
  if (row?.statusText) return row.statusText;
  return isActiveStatus(row?.status) ? '正常' : '不可用';
};

export const getFailureMessage = item => item.message || ERROR_MESSAGES[item.reasonCode] || '操作失败';
