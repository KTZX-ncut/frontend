import request from '../utils/request.js';
import { ROLE_KEYS, SCOPE_TYPES } from '../components/admin/userRoleAssign.constants.js';
import {
  normalizeBatchResult,
  normalizeBootstrap,
  normalizeScope,
  normalizeUser
} from '../components/admin/userRoleAssign.helpers.js';

const scopeCache = {
  [SCOPE_TYPES.PROFESSION]: [],
  [SCOPE_TYPES.COURSE]: [],
  [SCOPE_TYPES.CLASSROOM]: []
};
let roleCache = [];

const mockTeachers = [
  { id: 'mock-teacher-001', username: '张明', loginname: 'zhangming', jobNo: 'T001', obsid: 'mock-org-001', obsname: '软件工程系' },
  { id: 'mock-teacher-002', username: '李华', loginname: 'lihua', jobNo: 'T002', obsid: 'mock-org-001', obsname: '软件工程系' },
  { id: 'mock-teacher-003', username: '王磊', loginname: 'wanglei', jobNo: 'T003', obsid: 'mock-org-002', obsname: '计算机基础教研室' }
];

const mockScopeState = {
  [SCOPE_TYPES.PROFESSION]: [
    {
      __mock: true,
      id: 'mock-profession-001',
      obsid: 'mock-profession-001',
      proname: '软件工程',
      procode: '080902',
      parentName: '信息学院',
      responsiblePersonList: []
    },
    {
      __mock: true,
      id: 'mock-profession-002',
      obsid: 'mock-profession-002',
      proname: '计算机科学与技术',
      procode: '080901',
      parentName: '信息学院',
      responsiblePersonList: []
    }
  ],
  [SCOPE_TYPES.COURSE]: [
    {
      __mock: true,
      id: 'mock-course-001',
      courseChineseName: '数据结构',
      courseCode: 'CS101',
      professionName: '软件工程',
      termName: '全部',
      responsiblePersonList: []
    }
  ],
  [SCOPE_TYPES.CLASSROOM]: [
    {
      __mock: true,
      id: 'mock-classroom-001',
      classroomName: '数据结构 1 班',
      courseId: 'mock-course-001',
      courseChineseName: '数据结构',
      termName: '全部',
      teacherId: '',
      teacherName: ''
    },
    {
      __mock: true,
      id: 'mock-classroom-002',
      classroomName: '数据结构 2 班',
      courseId: 'mock-course-001',
      courseChineseName: '数据结构',
      termName: '全部',
      teacherId: '',
      teacherName: ''
    }
  ]
};

const mockCandidateTree = [
  {
    id: 'mock-org-001',
    obsname: '软件工程系',
    responsiblePerson: mockTeachers.slice(0, 2),
    children: [
      {
        id: 'mock-org-002',
        obsname: '计算机基础教研室',
        responsiblePerson: mockTeachers.slice(2),
        children: []
      }
    ]
  }
];

const assertSuccess = res => {
  if (res?.code !== undefined && res.code !== 200) {
    throw new Error(res.msg || '接口请求失败');
  }
  return res;
};

const withMockFlag = item => ({ ...item, mocked: Boolean(item.raw?.__mock || item.__mock) });

const flattenTree = nodes => {
  const result = [];
  const walk = list => {
    (list || []).forEach(node => {
      result.push(node);
      if (node.children?.length) walk(node.children);
    });
  };
  walk(nodes);
  return result;
};

const flattenTeacherTree = nodes => {
  const teachers = [];
  const seen = new Set();

  flattenTree(nodes).forEach(node => {
    (node.responsiblePerson || node.teacherList || []).forEach(teacher => {
      const normalized = normalizeUser({
        ...teacher,
        orgId: teacher.orgId || node.id || node.obsid,
        orgName: teacher.orgName || node.obsname || node.name,
        status: teacher.status ?? 'active',
        catelog: teacher.catelog ?? 2
      });
      if (normalized.userId && !seen.has(normalized.userId)) {
        seen.add(normalized.userId);
        teachers.push(normalized);
      }
    });
  });

  return teachers;
};

const findScope = (scopeType, scopeId) =>
  scopeCache[scopeType]?.find(item => item.scopeId === scopeId || item.id === scopeId);

const toProfessionScope = item =>
  normalizeScope({
    ...item,
    scopeId: item.obsid || item.id,
    scopeType: SCOPE_TYPES.PROFESSION,
    scopeName: item.proname || item.obsname || item.name,
    scopeCode: item.procode || item.code,
    parentName: item.parentName || item.collegeName,
    status: item.status ?? 'active'
  });

const toCourseScope = item =>
  normalizeScope({
    ...item,
    scopeId: item.id,
    scopeType: SCOPE_TYPES.COURSE,
    scopeName: item.courseChineseName || item.courseName,
    scopeCode: item.courseCode,
    parentId: item.professionId,
    parentName: item.professionName,
    termId: item.termId,
    termName: item.termName,
    status: item.status ?? 'active'
  });

const flattenClassroomResponse = data => {
  const rows = [];
  (data || []).forEach(course => {
    const classrooms = course.classroomReqList || [];
    classrooms.forEach(classroom => {
      rows.push({
        ...classroom,
        courseId: course.id || classroom.courseId,
        courseChineseName: course.courseChineseName || classroom.courseChineseName
      });
    });
  });
  return rows;
};

const toClassroomScope = item =>
  normalizeScope({
    ...item,
    scopeId: item.id,
    scopeType: SCOPE_TYPES.CLASSROOM,
    scopeName: item.classroomName,
    parentId: item.courseId,
    parentName: item.courseChineseName || item.courseName,
    termId: item.termId,
    termName: item.termName,
    status: item.status ?? 'active'
  });

const toAuthorizedUser = (user, role, scope) => ({
  assignmentId: `${role.roleId}-${scope.scopeId}-${user.id || user.userId}`,
  userId: user.id || user.userId,
  displayName: user.username || user.displayName || user.teacherName,
  loginName: user.loginName || user.loginname,
  personNo: user.personNo || user.jobNo,
  orgId: user.obsid || user.orgId,
  orgName: user.obsname || user.orgName,
  status: user.status ?? 'active',
  roleId: role.roleId,
  roleName: role.roleName,
  scopeId: scope.scopeId,
  scopeType: scope.scopeType,
  scopeName: scope.scopeName,
  termId: scope.termId,
  termName: scope.termName
});

const getRoleByScopeType = scopeType => {
  if (scopeType === SCOPE_TYPES.PROFESSION) return roleCache.find(role => role.roleKey === ROLE_KEYS.PROFESSION_MANAGER);
  if (scopeType === SCOPE_TYPES.COURSE) return roleCache.find(role => role.roleKey === ROLE_KEYS.COURSE_MANAGER);
  return roleCache.find(role => role.roleKey === ROLE_KEYS.COURSE_TEACHER);
};

const getCandidateTree = async scopeType => {
  try {
    if (scopeType === SCOPE_TYPES.PROFESSION) {
      const res = assertSuccess(await request.admin.get('/sysmangt/professionmangt/professionRP'));
      return res.data || [];
    }
    if (scopeType === SCOPE_TYPES.COURSE) {
      const res = assertSuccess(await request.course.post('/coursemangt/course/courseRP'));
      return res.data || [];
    }
    const res = assertSuccess(await request.course.get('/coursemangt/classroom/teacher'));
    return res.data || [];
  } catch (error) {
    return mockCandidateTree;
  }
};

const executeBatch = async (userIds, executor) => {
  const items = [];
  for (const userId of userIds) {
    try {
      const res = await executor(userId);
      items.push({
        userId,
        success: res?.code === 200,
        message: res?.code === 200 ? '操作成功' : res?.msg || '操作失败'
      });
    } catch (error) {
      items.push({
        userId,
        success: false,
        message: error?.message || '操作失败'
      });
    }
  }
  return normalizeBatchResult({ items });
};

const executeMockBatch = (userIds, executor) =>
  normalizeBatchResult({
    items: userIds.map(userId => {
      executor(userId);
      return {
        userId,
        success: true,
        message: '本地演示数据已更新'
      };
    })
  });

const findMockTeacher = userId => flattenTeacherTree(mockCandidateTree).find(item => item.userId === userId);

const isMockScope = scope => Boolean(scope?.mocked || scope?.raw?.__mock);

const addMockAssignment = (scope, userId) => {
  const user = findMockTeacher(userId);
  if (!user) return;

  if (scope.scopeType === SCOPE_TYPES.CLASSROOM) {
    scope.raw.teacherId = user.userId;
    scope.raw.teacherName = user.displayName;
    scope.teacherId = user.userId;
    scope.teacherName = user.displayName;
    return;
  }

  scope.raw.responsiblePersonList = scope.raw.responsiblePersonList || [];
  if (scope.raw.responsiblePersonList.some(item => (item.id || item.userid || item.userId) === userId)) return;
  scope.raw.responsiblePersonList.push({
    id: user.userId,
    userid: user.userId,
    username: user.displayName,
    loginname: user.loginName,
    jobNo: user.personNo,
    obsid: user.orgId,
    obsname: user.orgName,
    status: 'active'
  });
};

const removeMockAssignment = (scope, userId) => {
  if (scope.scopeType === SCOPE_TYPES.CLASSROOM) {
    scope.raw.teacherId = '';
    scope.raw.teacherName = '';
    scope.teacherId = '';
    scope.teacherName = '';
    return;
  }

  scope.raw.responsiblePersonList = (scope.raw.responsiblePersonList || []).filter(
    item => (item.id || item.userid || item.userId) !== userId
  );
};

export const getRoleAssignBootstrap = async () => {
  let school = { name: '学校' };
  try {
    const res = await request.admin.get('/sysmangt/schoolmangt');
    school = {
      id: res.data?.id || res.data?.obsid,
      name: res.data?.obsname || res.data?.schoolName || '学校'
    };
  } catch (error) {
    school = { name: '学校' };
  }
  const roleRes = await request.admin.get('/sysmangt/rolemangt');
  if (roleRes?.code !== 200) {
    throw new Error(roleRes?.msg || '获取角色列表失败');
  }
  const bootstrap = normalizeBootstrap({ school, roles: roleRes.data || [] });
  roleCache = bootstrap.roles;
  return bootstrap;
};

export const listRoleScopes = async ({ scopeType, keyword = '' }) => {
  let list = [];
  if (scopeType === SCOPE_TYPES.PROFESSION) {
    try {
      const res = assertSuccess(await request.admin.get('/sysmangt/professionmangt'));
      list = (res.data || []).map(item => withMockFlag({ ...toProfessionScope(item), raw: item }));
    } catch (error) {
      list = mockScopeState[SCOPE_TYPES.PROFESSION].map(item => withMockFlag({ ...toProfessionScope(item), raw: item }));
    }
  } else if (scopeType === SCOPE_TYPES.COURSE) {
    try {
      const res = assertSuccess(await request.course.get('/coursemangt/course'));
      list = (res.data || []).map(item => withMockFlag({ ...toCourseScope(item), raw: item }));
    } catch (error) {
      list = mockScopeState[SCOPE_TYPES.COURSE].map(item => withMockFlag({ ...toCourseScope(item), raw: item }));
    }
  } else {
    try {
      const res = assertSuccess(await request.course.get('/coursemangt/classroom'));
      list = flattenClassroomResponse(res.data || []).map(item => withMockFlag({ ...toClassroomScope(item), raw: item }));
    } catch (error) {
      list = mockScopeState[SCOPE_TYPES.CLASSROOM].map(item => withMockFlag({ ...toClassroomScope(item), raw: item }));
    }
  }

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filtered = normalizedKeyword
    ? list.filter(item =>
        [item.scopeName, item.scopeCode, item.parentName, item.termName]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(normalizedKeyword))
      )
    : list;

  scopeCache[scopeType] = filtered;
  return filtered;
};

export const getScopeAssignments = async ({ roleId, scopeId, scopeType }) => {
  const scope = findScope(scopeType, scopeId);
  const role = roleCache.find(item => item.roleId === roleId) || getRoleByScopeType(scopeType);
  const authorizedUsers = [];

  if (scopeType === SCOPE_TYPES.PROFESSION || scopeType === SCOPE_TYPES.COURSE) {
    const rawUsers = scope?.responsiblePersonList || scope?.raw?.responsiblePersonList || [];
    rawUsers.forEach(user => authorizedUsers.push(toAuthorizedUser(user, role, scope)));
  } else if (scope?.teacherId || scope?.raw?.teacherId) {
    authorizedUsers.push(
      toAuthorizedUser(
        {
          id: scope.teacherId || scope.raw.teacherId,
          username: scope.teacherName || scope.raw.teacherName,
          status: 'active'
        },
        role,
        scope
      )
    );
  }

  const authorizedIds = new Set(authorizedUsers.map(user => user.userId));
  const candidateTree = await getCandidateTree(scopeType);
  const addableUsers = flattenTeacherTree(candidateTree).filter(user => !authorizedIds.has(user.userId));

  return {
    roleId,
    scopeId,
    authorizedUsers,
    addableUsers: scopeType === SCOPE_TYPES.CLASSROOM && authorizedUsers.length > 0 ? [] : addableUsers
  };
};

export const searchAddableTeachers = async ({ keyword = '', roleId, scopeId, scopeType }) => {
  const data = await getScopeAssignments({ roleId, scopeId, scopeType });
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return data.addableUsers;
  return data.addableUsers.filter(user =>
    [user.displayName, user.loginName, user.personNo, user.orgName]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(normalizedKeyword))
  );
};

export const assignRoleUsers = async ({ roleId, scopeType, scopeId, userIds }) => {
  const scope = findScope(scopeType, scopeId);
  if (isMockScope(scope)) {
    return executeMockBatch(userIds, userId => addMockAssignment(scope, userId));
  }

  if (scopeType === SCOPE_TYPES.PROFESSION) {
    return executeBatch(userIds, userid =>
      request.admin.post('/sysmangt/professionmangt/professionRP/create', {
        userid,
        obsid: scopeId,
        roleid: roleId
      })
    );
  }

  if (scopeType === SCOPE_TYPES.COURSE) {
    const res = await request.course.post(
      '/coursemangt/course/courseRP/create',
      userIds.map(userid => ({ userid, obsid: scopeId, roleid: roleId }))
    );
    return normalizeBatchResult({
      items: userIds.map(userId => ({
        userId,
        success: res?.code === 200,
        message: res?.code === 200 ? '新增成功' : res?.msg || '新增失败'
      }))
    });
  }

  const userId = userIds[0];
  const candidateTree = await getCandidateTree(scopeType);
  const teacher = flattenTeacherTree(candidateTree).find(item => item.userId === userId);
  return executeBatch([userId], () =>
    request.course.post('/coursemangt/classroom/update', {
      ...(scope?.raw || {}),
      id: scopeId,
      teacherId: userId,
      teacherName: teacher?.displayName || ''
    })
  );
};

export const removeRoleUsers = async ({ roleId, scopeType, scopeId, userIds }) => {
  const scope = findScope(scopeType, scopeId);
  if (isMockScope(scope)) {
    return executeMockBatch(userIds, userId => removeMockAssignment(scope, userId));
  }

  if (scopeType === SCOPE_TYPES.PROFESSION) {
    return executeBatch(userIds, userid =>
      request.admin.post('/sysmangt/professionmangt/professionRP/delete', {
        userid,
        obsid: scopeId,
        roleid: roleId
      })
    );
  }

  if (scopeType === SCOPE_TYPES.COURSE) {
    return executeBatch(userIds, userid =>
      request.course.post('/coursemangt/course/courseRP/delete', {
        userid,
        obsid: scopeId,
        roleid: roleId
      })
    );
  }

  return executeBatch(userIds, () =>
    request.course.post('/coursemangt/classroom/update', {
      ...(scope?.raw || {}),
      id: scopeId,
      teacherId: '',
      teacherName: ''
    })
  );
};
