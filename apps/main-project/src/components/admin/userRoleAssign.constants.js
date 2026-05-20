export const ROLE_KEYS = {
  PROFESSION_MANAGER: 'profession_manager',
  COURSE_MANAGER: 'course_manager',
  COURSE_TEACHER: 'course_teacher'
};

export const SCOPE_TYPES = {
  PROFESSION: 'profession',
  COURSE: 'course',
  CLASSROOM: 'classroom'
};

export const APPROVED_ROLE_KEYS = [
  ROLE_KEYS.PROFESSION_MANAGER,
  ROLE_KEYS.COURSE_MANAGER,
  ROLE_KEYS.COURSE_TEACHER
];

export const ROLE_SCOPE_LABELS = {
  [SCOPE_TYPES.PROFESSION]: '专业',
  [SCOPE_TYPES.COURSE]: '课程',
  [SCOPE_TYPES.CLASSROOM]: '课堂'
};

export const ROLE_SCOPE_MAP = {
  [ROLE_KEYS.PROFESSION_MANAGER]: SCOPE_TYPES.PROFESSION,
  [ROLE_KEYS.COURSE_MANAGER]: SCOPE_TYPES.COURSE,
  [ROLE_KEYS.COURSE_TEACHER]: SCOPE_TYPES.CLASSROOM
};

export const ASSIGNABLE_ROLE_DEFINITIONS = [
  {
    roleKey: ROLE_KEYS.PROFESSION_MANAGER,
    roleName: '专业负责人',
    scopeType: SCOPE_TYPES.PROFESSION,
    multipleAllowed: true,
    active: true
  },
  {
    roleKey: ROLE_KEYS.COURSE_MANAGER,
    roleName: '课程负责人',
    scopeType: SCOPE_TYPES.COURSE,
    multipleAllowed: true,
    active: true
  },
  {
    roleKey: ROLE_KEYS.COURSE_TEACHER,
    roleName: '课堂负责人',
    roleAliases: ['任课教师'],
    scopeType: SCOPE_TYPES.CLASSROOM,
    multipleAllowed: false,
    active: true
  }
];

export const ERROR_MESSAGES = {
  ROLE_NOT_ALLOWED: '该角色不在允许授权范围内',
  SCHOOL_NOT_ASSIGNABLE: '学校仅作为组织上下文展示，不能授权',
  SCOPE_TYPE_MISMATCH: '角色与范围类型不匹配',
  DUPLICATE_ASSIGNMENT: '该用户已拥有当前范围的该角色',
  CLASSROOM_TEACHER_EXISTS: '该课堂已有课堂负责人',
  USER_DISABLED: '该用户当前不可用',
  USER_NOT_TEACHER: '该用户不是教师账号',
  SCOPE_UNAVAILABLE: '该范围不可用',
  PERMISSION_DENIED: '当前账号无权进行角色配置'
};

export const ACTIVE_STATUS_VALUES = ['active', 'normal', 'enabled', '1', 1, true];
