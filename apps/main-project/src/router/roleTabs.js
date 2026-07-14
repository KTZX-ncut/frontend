/**
 * ========================================================================
 * 角色侧边栏菜单配置
 * ========================================================================
 *
 * 【各角色菜单结构】
 *
 * ■ 教学秘书 (SECRETARIATE)
 *   - 学期管理
 *   - 教学单位管理
 *   - 人员管理
 *   - 角色管理
 *   - 角色授权
 *   - 学校配置
 *   - 角色配置
 *   - 专业配置
 *   - 课堂信息管理（组）
 *     - 教学日历
 *     - 课程教案
 *     - 课堂学生名单
 *
 * ■ 专业负责人 (MAJOR_MANAGER) / 专业 (PROFESSION)
 *   - 课程管理
 *   - 课堂管理
 *   - 能力字典
 *
 * ■ 课程负责人 (COURSE_MANAGER)
 *   - 教学大纲
 *   - 课程资源
 *   - 配置课程信息
 *   - 课程题库（组）
 *     - 题型设定
 *     - 题库同步
 *   - 形成性评价模型（组）
 *     - 关键字
 *     - 能力
 *     - 基本教学目标
 *     - 知识单元
 *     - 知识能力图谱
 *   - 达成性评价模型（组）
 *     - 课程目标
 *     - 考核项设计
 *     - 考核方案
 *   - 思政价值评价（组）
 *     - 价值标签
 *     - 思政知识单元
 *   - 评估与画像（组）
 *     - 形成性评价（子组）：学生报告、学生画像、课堂画像
 *     - 达成性评价（子组）：评价结果、生成报告
 *     - 思政评价（子组）：学生画像、课堂画像
 *     - 总体评价（已注释）
 *
 * ■ 任课教师 (COURSE_TEACHER) / 教师 (TEACHER / TEACHER_LEGACY)
 *   - 教学大纲
 *   - 课堂信息管理（组）
 *     - 教学日历
 *     - 课程教案
 *     - 课堂学生名单
 *   - 课程资源
 *   - 课程题库
 *   - 课堂题库（组）
 *     - 题型设定
 *   - 作业测试（组）
 *     - 作业测试
 *     - 往届作业
 *   - 实验实践（组）
 *     - 实验管理
 *   - 问卷发布
 *   - 外部数据管理（组）
 *     - 外部数据类型
 *     - 外部数据导入
 *   - 形成性评价模型（组）
 *     - 知识单元
 *     - 知识能力图谱
 *     - 画像名单
 *     - 画像数据管理
 *     - 知识能力图谱（旧）
 *   - 达成性评价模型（组）
 *     - 考核方案
 *     - 画像名单
 *   - 思政价值评价（组）
 *     - 画像名单
 *     - 价值标签
 *     - 画像数据管理
 *   - 评估与画像（组）
 *     - 形成性评价（子组）：学生报告、学生画像、课堂画像
 *     - 达成性评价（子组）：评价结果、生成报告
 *     - 思政评价（子组）：学生画像、课堂画像
 *
 * ========================================================================
 * 【如何新增菜单/子级菜单】
 *
 * 1. 新增一个独立 tab（一级菜单项）：
 *    (1) 在 AppTabEnum 中新增枚举值，如: MY_TAB: 'MY_TAB'
 *    (2) 在 APP_TAB_CONFIG 中添加配置: [AppTabEnum.MY_TAB]: { name: '显示名称', routeName: '路由name' }
 *    (3) 确保 router/index.js 中已注册对应的 routeName
 *    (4) 在 ROLE_MENU_TREE_CONFIG 对应角色数组中添加 AppTabEnum.MY_TAB
 *
 * 2. 新增一个分组（带子菜单的折叠项）：
 *    使用 group(groupKey, name, children) 创建：
 *      const MY_GROUP = group('MY_GROUP_KEY', '分组名称', [
 *        AppTabEnum.CHILD_TAB_1,
 *        AppTabEnum.CHILD_TAB_2
 *      ]);
 *    然后在 ROLE_MENU_TREE_CONFIG 对应角色数组中添加 MY_GROUP
 *
 * 3. 新增三级菜单（组内嵌套子组）：
 *    在 group 的 children 中嵌套 group：
 *      const PARENT = group('PARENT_KEY', '父级', [
 *        group('CHILD_GROUP_KEY', '子分组', [
 *          AppTabEnum.TAB_A,
 *          AppTabEnum.TAB_B
 *        ]),
 *        AppTabEnum.TAB_C
 *      ]);
 *
 * 4. 同一 tab 在不同角色中显示不同子项时：
 *    创建带 _FOR_XXX 后缀的变体常量，如 FORMATIVE_EVALUATION_MODEL_FOR_TEACHER
 *    在各角色配置中引用对应的变体
 *
 * ========================================================================
 */

export const RoleHomeEnum = Object.freeze({
  TEACHER: 'teacherhomne',
  TEACHER_LEGACY: 'teacherhome',
  ADMIN: 'adminhome',
  SUPER_ADMIN: 'superadminhome',
  SECRETARIATE: 'secretariatehome',
  ACADEMIC_AFFAIRS: 'academicaffairshome',
  DEAN: 'deanhome',
  DEPARTMENT: 'departmenthome',
  MAJOR_MANAGER: 'majormanagerhome',
  COURSE_MANAGER: 'coursemanagerhome',
  PROFESSION: 'professionhome',
  ASSISTANT: 'assistanthome',
  COURSE_TEACHER: 'courseteacherhome',
  DEFAULT: 'defaulthome'
});

export const RoleNameEnum = Object.freeze({
  SUPER_ADMIN: '超级管理员',
  ADMIN: '管理员',
  SECRETARIATE: '教学秘书',
  ACADEMIC_AFFAIRS: '教务处',
  DEAN: '学院负责人',
  DEPARTMENT: '系主任',
  MAJOR_MANAGER: '专业负责人',
  COURSE_MANAGER: '课程负责人',
  COURSE_TEACHER: '任课教师',
  ASSISTANT: '助教'
});

export const AppTabEnum = Object.freeze({
  ROLE_MANAGEMENT: 'ROLE_MANAGEMENT',
  ROLE_PURVIEW: 'ROLE_PURVIEW',
  USER_ROLE_ASSIGN: 'USER_ROLE_ASSIGN',
  SCHOOL_MANAGEMENT: 'SCHOOL_MANAGEMENT',
  TERM_MANAGEMENT: 'TERM_MANAGEMENT',
  TEACH_UNIT_MANAGEMENT: 'TEACH_UNIT_MANAGEMENT',
  PEOPLE_MANAGEMENT: 'PEOPLE_MANAGEMENT',
  COLLEGE_MANAGEMENT: 'COLLEGE_MANAGEMENT',
  DEPARTMENT_MANAGEMENT: 'DEPARTMENT_MANAGEMENT',
  PROFESSION_MANAGEMENT: 'PROFESSION_MANAGEMENT',
  CLASS_MANAGEMENT: 'CLASS_MANAGEMENT',
  SECRETARY_PROFESSION_CREATE: 'SECRETARY_PROFESSION_CREATE',
  SECRETARY_CLASS_CREATE: 'SECRETARY_CLASS_CREATE',
  SECRETARY_COURSE_CREATE: 'SECRETARY_COURSE_CREATE',
  SECRETARY_CLASSROOM_CREATE: 'SECRETARY_CLASSROOM_CREATE',
  COURSE_MANAGEMENT: 'COURSE_MANAGEMENT',
  CLASSROOM_MANAGEMENT: 'CLASSROOM_MANAGEMENT',
  ABILITY_DICTIONARY: 'ABILITY_DICTIONARY',
  INSTRUCTIONAL_PROGRAM: 'INSTRUCTIONAL_PROGRAM',
  COURSE_RESOURCES: 'COURSE_RESOURCES',
  ACADEMIC_CALENDAR: 'ACADEMIC_CALENDAR',
  LESSON_PLAN: 'LESSON_PLAN',
  CLASS_STUDENT_LIST: 'CLASS_STUDENT_LIST',
  COURSE_MANAGER_HOME: 'COURSE_MANAGER_HOME',
  PAST_COURSE: 'PAST_COURSE',
  FORMATIVE_KEYWORD: 'FORMATIVE_KEYWORD',
  FORMATIVE_ABILITY: 'FORMATIVE_ABILITY',
  FORMATIVE_TEACHING_OBJECTIVES: 'FORMATIVE_TEACHING_OBJECTIVES',
  FORMATIVE_KNOWLEDGE_UNIT: 'FORMATIVE_KNOWLEDGE_UNIT',
  FORMATIVE_PORTRAIT_MANAGEMENT: 'FORMATIVE_PORTRAIT_MANAGEMENT',
  FORMATIVE_GRAPH_LIST: 'FORMATIVE_GRAPH_LIST',
  FORMATIVE_KWA_GRAPH: 'FORMATIVE_KWA_GRAPH',
  FORMATIVE_GRAPH: 'FORMATIVE_GRAPH',
  FORMATIVE_COURSE_TARGET: 'FORMATIVE_COURSE_TARGET',
  FORMATIVE_IDEALOGY: 'FORMATIVE_IDEALOGY',
  VALUE_LABEL: 'VALUE_LABEL',
  VALUE_KNOWLEDGE_UNIT: 'VALUE_KNOWLEDGE_UNIT',
  IDEALOGY_PORTRAIT_LIST: 'IDEOLOGY_PORTRAIT_LIST',
  IDEALOGY_PORTRAIT_DATA: 'IDEOLOGY_PORTRAIT_DATA',
  IDEALOGY_STUDENT_PORTRAIT: 'IDEOLOGY_STUDENT_PORTRAIT',
  IDEALOGY_CLASSROOM_PORTRAIT: 'IDEOLOGY_CLASSROOM_PORTRAIT',
  ATTAINMENT_COURSE_TARGET: 'ATTAINMENT_COURSE_TARGET',
  ASSESSMENT_ITEMS: 'ASSESSMENT_ITEMS',
  ASSESSMENT_PLAN: 'ASSESSMENT_PLAN',
  STUDENT_REPORT: 'STUDENT_REPORT',
  STUDENT_GRAPH: 'STUDENT_GRAPH',
  CLASSROOM_GRAPH: 'CLASSROOM_GRAPH',
  ACADEMIC_TRANSCRIPT: 'ACADEMIC_TRANSCRIPT',
  CLASSROOM_REPORT: 'CLASSROOM_REPORT',
  ATTAINMENT_GRAPH_LIST: 'ATTAINMENT_GRAPH_LIST',
  EXTERNAL_DATA_TYPE_CREATE: 'EXTERNAL_DATA_TYPE_CREATE',
  EXTERNAL_DATA_IMPORT: 'EXTERNAL_DATA_IMPORT',
  COURSE_QUESTION_LIB: 'COURSE_QUESTION_LIB',
  COURSE_QUESTION_TYPE: 'COURSE_QUESTION_TYPE',
  COURSE_QUESTION_SYNC: 'COURSE_QUESTION_SYNC',
  CLASSROOM_QUESTION_LIB: 'CLASSROOM_QUESTION_LIB',
  CLASSROOM_QUESTION_TYPE: 'CLASSROOM_QUESTION_TYPE',
  TEST_MANAGEMENT: 'TEST_MANAGEMENT',
  TEST_PAST: 'TEST_PAST',
  LAB_MANAGEMENT: 'LAB_MANAGEMENT',
  QUESTIONNAIRE: 'QUESTIONNAIRE',
  SCORE_LIST: 'SCORE_LIST',
  OVERALL_EVALUATION: 'OVERALL_EVALUATION'
});

export const AppMenuGroupEnum = Object.freeze({
  EXAM_QUESTION_LIB: 'EXAM_QUESTION_LIB',
  FORMATIVE_EVALUATION_MODEL: 'FORMATIVE_EVALUATION_MODEL',
  ATTAINMENT_EVALUATION_MODEL: 'ATTAINMENT_EVALUATION_MODEL',
  IDEOLOGY_EVALUATION: 'IDEOLOGY_EVALUATION',
  EVALUATION_AND_PORTRAIT: 'EVALUATION_AND_PORTRAIT',
  TEST: 'TEST',
  PRACTICE: 'PRACTICE',
  EXTERNAL_DATA: 'EXTERNAL_DATA'
});

export const APP_TAB_CONFIG = Object.freeze({
  [AppTabEnum.ROLE_MANAGEMENT]: { name: '角色管理', routeName: 'Rolemangt' },
  [AppTabEnum.ROLE_PURVIEW]: { name: '角色授权', routeName: 'Rolepurview' },
  [AppTabEnum.USER_ROLE_ASSIGN]: { name: '角色配置', routeName: 'UserRoleAssign' },
  [AppTabEnum.SCHOOL_MANAGEMENT]: { name: '学校配置', routeName: 'SchoolMangt' },
  [AppTabEnum.TERM_MANAGEMENT]: { name: '学期管理', routeName: 'TermsManagement' },
  [AppTabEnum.TEACH_UNIT_MANAGEMENT]: { name: '教学单位管理', routeName: 'Unitssmangt' },
  [AppTabEnum.PEOPLE_MANAGEMENT]: { name: '人员管理', routeName: 'PeopleManagement' },
  [AppTabEnum.COLLEGE_MANAGEMENT]: { name: '学院管理', routeName: 'Collegecollegemangt' },
  [AppTabEnum.DEPARTMENT_MANAGEMENT]: { name: '部门管理', routeName: 'Departmentmangt' },
  [AppTabEnum.PROFESSION_MANAGEMENT]: { name: '专业配置', routeName: 'SecretaryCreateProfession' },
  [AppTabEnum.CLASS_MANAGEMENT]: { name: '专业班级管理', routeName: 'Classmangt' },
  [AppTabEnum.SECRETARY_PROFESSION_CREATE]: { name: '新增专业', routeName: 'SecretaryCreateProfession' },
  [AppTabEnum.SECRETARY_CLASS_CREATE]: { name: '新增班级', routeName: 'SecretaryCreateClass' },
  [AppTabEnum.SECRETARY_COURSE_CREATE]: { name: '新增课程', routeName: 'SecretaryCreateCourse' },
  [AppTabEnum.SECRETARY_CLASSROOM_CREATE]: { name: '新增课堂', routeName: 'SecretaryCreateClassroom' },
  [AppTabEnum.COURSE_MANAGEMENT]: { name: '课程管理', routeName: 'CourseManagement' },
  [AppTabEnum.CLASSROOM_MANAGEMENT]: { name: '课堂管理', routeName: 'ClassRoomManagement' },
  [AppTabEnum.ABILITY_DICTIONARY]: { name: '能力字典', routeName: 'AbilityDictionary' },
  [AppTabEnum.INSTRUCTIONAL_PROGRAM]: { name: '教学大纲', routeName: 'InstructionalProgrammangt' },
  [AppTabEnum.COURSE_RESOURCES]: { name: '课程资源', routeName: 'CourseResources' },
  [AppTabEnum.ACADEMIC_CALENDAR]: { name: '教学日历', routeName: 'AcademicCalendar' },
  [AppTabEnum.LESSON_PLAN]: { name: '课程教案', routeName: 'LessonPlan' },
  [AppTabEnum.CLASS_STUDENT_LIST]: { name: '课堂学生名单', routeName: 'StudentsList' },
  [AppTabEnum.COURSE_MANAGER_HOME]: { name: '课堂信息管理', routeName: 'CourseManagerHomePage' },
  [AppTabEnum.PAST_COURSE]: { name: '配置课程信息', routeName: 'PastCourse' },
  [AppTabEnum.FORMATIVE_KEYWORD]: { name: '关键字', routeName: 'Keyword' },
  [AppTabEnum.FORMATIVE_ABILITY]: { name: '能力', routeName: 'Ability' },
  [AppTabEnum.FORMATIVE_TEACHING_OBJECTIVES]: { name: '基本教学目标', routeName: 'TeachingObjectives' },
  [AppTabEnum.FORMATIVE_KNOWLEDGE_UNIT]: { name: '知识单元', routeName: 'KnowledgeUnit' },
  [AppTabEnum.FORMATIVE_PORTRAIT_MANAGEMENT]: { name: '画像数据管理', routeName: 'portraitmangt' },
  [AppTabEnum.FORMATIVE_GRAPH_LIST]: { name: '画像名单', routeName: 'GraphList' },
  [AppTabEnum.FORMATIVE_KWA_GRAPH]: { name: '知识能力图谱', routeName: 'KWAgraph' },
  [AppTabEnum.FORMATIVE_GRAPH]: { name: '知识能力图谱（旧）', routeName: 'graph' },
  [AppTabEnum.FORMATIVE_COURSE_TARGET]: { name: '课程目标', routeName: 'FormativeCourseTarget' },
  [AppTabEnum.FORMATIVE_IDEALOGY]: { name: '思政价值', routeName: 'Idealogy-dy' },
  [AppTabEnum.VALUE_LABEL]: { name: '价值标签', routeName: 'Idealogy' },
  [AppTabEnum.VALUE_KNOWLEDGE_UNIT]: { name: '思政知识单元', routeName: 'IdealogyKnowledgeUnit' },
  [AppTabEnum.IDEALOGY_PORTRAIT_LIST]: { name: '画像名单', routeName: 'IdealogyList' },
  [AppTabEnum.IDEALOGY_PORTRAIT_DATA]: { name: '画像数据管理', routeName: 'IdealogyDatamanage' },
  [AppTabEnum.IDEALOGY_STUDENT_PORTRAIT]: { name: '学生画像', routeName: 'IdealogyStudentPortrait' },
  [AppTabEnum.IDEALOGY_CLASSROOM_PORTRAIT]: { name: '课堂画像', routeName: 'IdealogyClassroomPortraita' },
  [AppTabEnum.ATTAINMENT_COURSE_TARGET]: { name: '课程目标', routeName: 'AttainmentCourseTarget' },
  [AppTabEnum.ASSESSMENT_ITEMS]: { name: '考核项设计', routeName: 'AssessmentItems' },
  [AppTabEnum.ASSESSMENT_PLAN]: { name: '考核方案', routeName: 'AssessmentTable' },
  [AppTabEnum.STUDENT_REPORT]: { name: '学生报告', routeName: 'StudentReport' },
  [AppTabEnum.STUDENT_GRAPH]: { name: '学生画像', routeName: 'StudentGraph' },
  [AppTabEnum.CLASSROOM_GRAPH]: { name: '课堂画像', routeName: 'ClassroomGraph' },
  [AppTabEnum.ACADEMIC_TRANSCRIPT]: { name: '评价结果', routeName: 'AcademicTranscript' },
  [AppTabEnum.CLASSROOM_REPORT]: { name: '生成报告', routeName: 'ClassroomReport' },
  [AppTabEnum.ATTAINMENT_GRAPH_LIST]: { name: '画像名单', routeName: 'attainmentGraphList' },
  [AppTabEnum.EXTERNAL_DATA_TYPE_CREATE]: { name: '外部数据类型', routeName: 'ExternalDataTypeCreate' },
  [AppTabEnum.EXTERNAL_DATA_IMPORT]: { name: '外部数据导入', routeName: 'ExternalDataImport' },
  [AppTabEnum.COURSE_QUESTION_LIB]: { name: '课程题库', routeName: 'CourseQuestionLib' },
  [AppTabEnum.COURSE_QUESTION_TYPE]: { name: '题型设定', routeName: 'CourseQuestionLibType' },
  [AppTabEnum.COURSE_QUESTION_SYNC]: { name: '题库同步', routeName: 'CourseQuestionLibSync' },
  [AppTabEnum.CLASSROOM_QUESTION_LIB]: { name: '课堂题库', routeName: 'ClassroomQuestionLib' },
  [AppTabEnum.CLASSROOM_QUESTION_TYPE]: { name: '题型设定', routeName: 'ClassroomQuestionLibType' },
  [AppTabEnum.TEST_MANAGEMENT]: { name: '作业测试', routeName: 'TestManagement' },
  [AppTabEnum.TEST_PAST]: { name: '往届作业', routeName: 'PastTestManagement' },
  [AppTabEnum.LAB_MANAGEMENT]: { name: '实验管理', routeName: 'LabManagement' },
  [AppTabEnum.QUESTIONNAIRE]: { name: '问卷发布', routeName: 'Questionnaire' },
  [AppTabEnum.SCORE_LIST]: { name: '成绩', routeName: 'ScoreList' },
  // [AppTabEnum.OVERALL_EVALUATION]: { name: '总体评价', routeName: 'attainmentGraphList' }
});

const LEGACY_MENU_URL_TO_TAB_KEY = Object.freeze({
  '/sysmangt/rolemangt': AppTabEnum.ROLE_MANAGEMENT,
  '/sysmangt/rolepurview': AppTabEnum.ROLE_PURVIEW,
  '/sysmangt/userroleassign': AppTabEnum.USER_ROLE_ASSIGN,
  '/sysmangt/schoolmangt': AppTabEnum.SCHOOL_MANAGEMENT,
  '/sysmangt/termmangt': AppTabEnum.TERM_MANAGEMENT,
  '/sysmangt/creatteachunit': AppTabEnum.TEACH_UNIT_MANAGEMENT,
  '/sysmangt/peoplemangt': AppTabEnum.PEOPLE_MANAGEMENT,
  '/sysmangt/collegemangt': AppTabEnum.COLLEGE_MANAGEMENT,
  '/sysmangt/departmentmangt': AppTabEnum.DEPARTMENT_MANAGEMENT,
  '/sysmangt/professionmangt': AppTabEnum.PROFESSION_MANAGEMENT,
  '/sysmangt/classmangt': AppTabEnum.CLASS_MANAGEMENT,
  '/sysmangt/secretary/professioncreate': AppTabEnum.SECRETARY_PROFESSION_CREATE,
  '/sysmangt/secretary/classcreate': AppTabEnum.SECRETARY_CLASS_CREATE,
  '/sysmangt/secretary/coursecreate': AppTabEnum.SECRETARY_COURSE_CREATE,
  '/sysmangt/secretary/classroomcreate': AppTabEnum.SECRETARY_CLASSROOM_CREATE,
  '/coursemangt/coursemangt': AppTabEnum.COURSE_MANAGEMENT,
  '/coursemangt/classroom': AppTabEnum.CLASSROOM_MANAGEMENT,
  '/evaluation/ability': AppTabEnum.ABILITY_DICTIONARY,
  '/coursemangt/instructionalprogram': AppTabEnum.INSTRUCTIONAL_PROGRAM,
  '/coursemangt/courseresources': AppTabEnum.COURSE_RESOURCES,
  '/coursemangt/classroommangt/academiccalendar': AppTabEnum.ACADEMIC_CALENDAR,
  '/coursemangt/classroommangt/lessonplan': AppTabEnum.LESSON_PLAN,
  '/coursemangt/classroommangt/classStudentList': AppTabEnum.CLASS_STUDENT_LIST,
  '/coursemangt/classroommangt': AppTabEnum.COURSE_MANAGER_HOME,
  '/coursemangt/pastCourse': AppTabEnum.PAST_COURSE,
  '/evasys/formative/keyword': AppTabEnum.FORMATIVE_KEYWORD,
  '/evaluation/getability': AppTabEnum.FORMATIVE_ABILITY,
  '/evasys/formative/teachingobjectives': AppTabEnum.FORMATIVE_TEACHING_OBJECTIVES,
  '/evasys/formative/knowledgeunit': AppTabEnum.FORMATIVE_KNOWLEDGE_UNIT,
  '/evaluation/dynamicEvaluation/portraitmangt': AppTabEnum.FORMATIVE_PORTRAIT_MANAGEMENT,
  '/dynamicmodel/graphlist': AppTabEnum.FORMATIVE_GRAPH_LIST,
  '/evasys/formative/KWAgraph': AppTabEnum.FORMATIVE_KWA_GRAPH,
  '/evasys/graph': AppTabEnum.FORMATIVE_GRAPH,
  '/evasys/formative/coursetarget': AppTabEnum.FORMATIVE_COURSE_TARGET,
  '/evasys/formative/idealogy': AppTabEnum.FORMATIVE_IDEALOGY,
  '/evaluation/valueLabel': AppTabEnum.VALUE_LABEL,
  '/evaluation/valueKnowledgeUnit': AppTabEnum.VALUE_KNOWLEDGE_UNIT,
  '/sizheng/portraitList': AppTabEnum.IDEALOGY_PORTRAIT_LIST,
  '/sizheng/portraitData': AppTabEnum.IDEALOGY_PORTRAIT_DATA,
  '/evaluation/studentPortrait': AppTabEnum.IDEALOGY_STUDENT_PORTRAIT,
  '/evaluation/classroomPortrait': AppTabEnum.IDEALOGY_CLASSROOM_PORTRAIT,
  '/evasys/accessible/coursetarget': AppTabEnum.ATTAINMENT_COURSE_TARGET,
  '/evaluation/AssessmentItems': AppTabEnum.ASSESSMENT_ITEMS,
  '/evaluation/assessmentPlan': AppTabEnum.ASSESSMENT_PLAN,
  '/evaluation/dynamicEvaluation/studentReport': AppTabEnum.STUDENT_REPORT,
  '/evaluation/dynamicEvaluation/studentGraph': AppTabEnum.STUDENT_GRAPH,
  '/evaluation/dynamicEvaluation/classroomGraph': AppTabEnum.CLASSROOM_GRAPH,
  '/evaluation/dynamicEvaluation/academicTranscript': AppTabEnum.ACADEMIC_TRANSCRIPT,
  '/evaluation/dynamicEvaluation/classroomReport': AppTabEnum.CLASSROOM_REPORT,
  '/evaluation/graphList': AppTabEnum.ATTAINMENT_GRAPH_LIST,
  '/external-data/type-manage': AppTabEnum.EXTERNAL_DATA_TYPE_CREATE,
  '/external-data/data-import': AppTabEnum.EXTERNAL_DATA_IMPORT,
  '/exam/coursequelib': AppTabEnum.COURSE_QUESTION_LIB,
  '/exam/coursequelib/type': AppTabEnum.COURSE_QUESTION_TYPE,
  '/exam/coursequelib/sync': AppTabEnum.COURSE_QUESTION_SYNC,
  '/exam/classroomquelib': AppTabEnum.CLASSROOM_QUESTION_LIB,
  '/exam/classroomquelib/classroomQTS': AppTabEnum.CLASSROOM_QUESTION_TYPE,
  '/exam/test/testmangt': AppTabEnum.TEST_MANAGEMENT,
  '/exam/test/past': AppTabEnum.TEST_PAST,
  '/exam/experimental/labmangt': AppTabEnum.LAB_MANAGEMENT,
  '/exam/questionnaire': AppTabEnum.QUESTIONNAIRE,
  '/exp/scoreList': AppTabEnum.SCORE_LIST
});

const group = (groupKey, name, children) => ({ groupKey, name, children });

const FORMATIVE_EVALUATION_MODEL = group(
  AppMenuGroupEnum.FORMATIVE_EVALUATION_MODEL,
  '形成性评价模型',
  [
    AppTabEnum.FORMATIVE_KEYWORD,
    AppTabEnum.FORMATIVE_ABILITY,
    AppTabEnum.FORMATIVE_TEACHING_OBJECTIVES,
    AppTabEnum.FORMATIVE_KNOWLEDGE_UNIT,
    AppTabEnum.FORMATIVE_KWA_GRAPH
  ]
);

const FORMATIVE_EVALUATION_MODEL_FOR_TEACHER = group(
  AppMenuGroupEnum.FORMATIVE_EVALUATION_MODEL,
  '形成性评价模型',
  [
    AppTabEnum.FORMATIVE_KNOWLEDGE_UNIT,
    AppTabEnum.FORMATIVE_KWA_GRAPH,
    AppTabEnum.FORMATIVE_GRAPH_LIST,
    AppTabEnum.FORMATIVE_PORTRAIT_MANAGEMENT,
    AppTabEnum.FORMATIVE_GRAPH
  ]
);

const ATTAINMENT_EVALUATION_MODEL = group(
  AppMenuGroupEnum.ATTAINMENT_EVALUATION_MODEL,
  '达成性评价模型',
  [AppTabEnum.ATTAINMENT_COURSE_TARGET, AppTabEnum.ASSESSMENT_ITEMS, AppTabEnum.ASSESSMENT_PLAN]
);

const ATTAINMENT_EVALUATION_MODEL_FOR_TEACHER = group(
  AppMenuGroupEnum.ATTAINMENT_EVALUATION_MODEL,
  '达成性评价模型',
  [AppTabEnum.ASSESSMENT_PLAN, AppTabEnum.ATTAINMENT_GRAPH_LIST]
);

const IDEOLOGY_EVALUATION = group(AppMenuGroupEnum.IDEOLOGY_EVALUATION, '思政价值评价', [
  AppTabEnum.VALUE_LABEL,
  AppTabEnum.VALUE_KNOWLEDGE_UNIT
]);

const IDEOLOGY_EVALUATION_FOR_TEACHER = group(AppMenuGroupEnum.IDEOLOGY_EVALUATION, '思政价值评价', [
  AppTabEnum.IDEALOGY_PORTRAIT_LIST,
  AppTabEnum.VALUE_LABEL,
  AppTabEnum.IDEALOGY_PORTRAIT_DATA
]);

const EVALUATION_AND_PORTRAIT = group(AppMenuGroupEnum.EVALUATION_AND_PORTRAIT, '评估与画像', [
  group('EVAL_FORMATIVE_PORTRAIT', '形成性评价', [
    AppTabEnum.STUDENT_REPORT,
    AppTabEnum.STUDENT_GRAPH,
    AppTabEnum.CLASSROOM_GRAPH
  ]),
  group('EVAL_ATTAINMENT_PORTRAIT', '达成性评价', [
    AppTabEnum.ACADEMIC_TRANSCRIPT,
    AppTabEnum.CLASSROOM_REPORT
  ]),
  group('EVAL_IDEOLOGY_PORTRAIT', '思政评价', [
    AppTabEnum.IDEALOGY_STUDENT_PORTRAIT,
    AppTabEnum.IDEALOGY_CLASSROOM_PORTRAIT
  ]),
  AppTabEnum.OVERALL_EVALUATION
]);

const EVALUATION_AND_PORTRAIT_FOR_TEACHER = group(AppMenuGroupEnum.EVALUATION_AND_PORTRAIT, '评估与画像', [
  group('EVAL_FORMATIVE_PORTRAIT', '形成性评价', [
    AppTabEnum.STUDENT_REPORT,
    AppTabEnum.STUDENT_GRAPH,
    AppTabEnum.CLASSROOM_GRAPH
  ]),
  group('EVAL_ATTAINMENT_PORTRAIT', '达成性评价', [
    AppTabEnum.ACADEMIC_TRANSCRIPT,
    AppTabEnum.CLASSROOM_REPORT
  ]),
  group('EVAL_IDEOLOGY_PORTRAIT', '思政评价', [
    AppTabEnum.IDEALOGY_STUDENT_PORTRAIT,
    AppTabEnum.IDEALOGY_CLASSROOM_PORTRAIT
  ])
]);

const EXAM_QUESTION_LIB_FOR_COURSE = group(AppMenuGroupEnum.EXAM_QUESTION_LIB, '考试题库', [
  group('COURSE_QUESTION_LIB_SETTINGS', '课程题库配置', [
    AppTabEnum.COURSE_QUESTION_TYPE,
    AppTabEnum.COURSE_QUESTION_SYNC
  ])
]);

const EXAM_QUESTION_LIB_FOR_TEACHER = group(AppMenuGroupEnum.EXAM_QUESTION_LIB, '考试题库', [
  group('COURSE_QUESTION_LIB_SETTINGS', '课程题库配置', [
    AppTabEnum.COURSE_QUESTION_TYPE,
    AppTabEnum.COURSE_QUESTION_SYNC
  ]),
  group('CLASSROOM_QUESTION_LIB_SETTINGS', '课堂题库配置', [AppTabEnum.CLASSROOM_QUESTION_TYPE])
]);

const TEST_GROUP = group(AppMenuGroupEnum.TEST, '作业测试', [
  AppTabEnum.TEST_MANAGEMENT,
  AppTabEnum.TEST_PAST
]);

const PRACTICE_GROUP = group(AppMenuGroupEnum.PRACTICE, '实验实践', [
  AppTabEnum.LAB_MANAGEMENT
]);

const CLASSROOM_QUESTION_LIB_GROUP = group('CLASSROOM_QUESTION_LIB_GROUP', '课堂题库', [
  AppTabEnum.CLASSROOM_QUESTION_TYPE
]);

const CLASSROOM_INFO_GROUP = group('CLASSROOM_INFO_MANAGEMENT', '课堂信息管理', [
  AppTabEnum.ACADEMIC_CALENDAR,
  AppTabEnum.LESSON_PLAN,
  AppTabEnum.CLASS_STUDENT_LIST
]);

const EXTERNAL_DATA_GROUP = group(AppMenuGroupEnum.EXTERNAL_DATA, '外部数据管理', [
  AppTabEnum.EXTERNAL_DATA_TYPE_CREATE,
  AppTabEnum.EXTERNAL_DATA_IMPORT
]);

export const ROLE_MENU_TREE_CONFIG = Object.freeze({
  [RoleHomeEnum.SECRETARIATE]: [
    // AppTabEnum.TERM_MANAGEMENT,
    AppTabEnum.TEACH_UNIT_MANAGEMENT,
    AppTabEnum.PEOPLE_MANAGEMENT,
    // AppTabEnum.ROLE_MANAGEMENT,
    // AppTabEnum.ROLE_PURVIEW,
    AppTabEnum.SCHOOL_MANAGEMENT,
    AppTabEnum.USER_ROLE_ASSIGN,
    AppTabEnum.PROFESSION_MANAGEMENT,
    // CLASSROOM_INFO_GROUP
  ],
  [RoleHomeEnum.MAJOR_MANAGER]: [
    AppTabEnum.COURSE_MANAGEMENT,
    AppTabEnum.CLASSROOM_MANAGEMENT,
    AppTabEnum.ABILITY_DICTIONARY
  ],
  [RoleHomeEnum.PROFESSION]: [
    AppTabEnum.COURSE_MANAGEMENT,
    AppTabEnum.CLASSROOM_MANAGEMENT,
    AppTabEnum.ABILITY_DICTIONARY
  ],
  [RoleHomeEnum.COURSE_MANAGER]: [
    AppTabEnum.INSTRUCTIONAL_PROGRAM,
    AppTabEnum.COURSE_RESOURCES,
    // AppTabEnum.PAST_COURSE,
    group('COURSE_QUESTION_LIB_GROUP', '课程题库', [
      AppTabEnum.COURSE_QUESTION_TYPE,
      AppTabEnum.COURSE_QUESTION_SYNC
    ]),
    // EXAM_QUESTION_LIB_FOR_COURSE,
    FORMATIVE_EVALUATION_MODEL,
    ATTAINMENT_EVALUATION_MODEL,
    IDEOLOGY_EVALUATION,
    EVALUATION_AND_PORTRAIT
  ],
  [RoleHomeEnum.COURSE_TEACHER]: [
    AppTabEnum.INSTRUCTIONAL_PROGRAM,
    CLASSROOM_INFO_GROUP,
    AppTabEnum.COURSE_RESOURCES,
    AppTabEnum.COURSE_QUESTION_LIB,
    CLASSROOM_QUESTION_LIB_GROUP,
    // EXAM_QUESTION_LIB_FOR_TEACHER,
    TEST_GROUP,
    PRACTICE_GROUP,
    AppTabEnum.QUESTIONNAIRE,
    EXTERNAL_DATA_GROUP,
    FORMATIVE_EVALUATION_MODEL_FOR_TEACHER,
    ATTAINMENT_EVALUATION_MODEL_FOR_TEACHER,
    IDEOLOGY_EVALUATION_FOR_TEACHER,
    EVALUATION_AND_PORTRAIT_FOR_TEACHER
  ],
  [RoleHomeEnum.TEACHER]: [
    AppTabEnum.INSTRUCTIONAL_PROGRAM,
    CLASSROOM_INFO_GROUP,
    AppTabEnum.COURSE_RESOURCES,
    AppTabEnum.COURSE_QUESTION_LIB,
    CLASSROOM_QUESTION_LIB_GROUP,
    // EXAM_QUESTION_LIB_FOR_TEACHER,
    TEST_GROUP,
    PRACTICE_GROUP,
    AppTabEnum.QUESTIONNAIRE,
    EXTERNAL_DATA_GROUP,
    FORMATIVE_EVALUATION_MODEL_FOR_TEACHER,
    ATTAINMENT_EVALUATION_MODEL_FOR_TEACHER,
    IDEOLOGY_EVALUATION_FOR_TEACHER,
    EVALUATION_AND_PORTRAIT_FOR_TEACHER
  ],
  [RoleHomeEnum.TEACHER_LEGACY]: [
    AppTabEnum.INSTRUCTIONAL_PROGRAM,
    CLASSROOM_INFO_GROUP,
    AppTabEnum.COURSE_RESOURCES,
    AppTabEnum.COURSE_QUESTION_LIB,
    CLASSROOM_QUESTION_LIB_GROUP,
    // EXAM_QUESTION_LIB_FOR_TEACHER,
    TEST_GROUP,
    PRACTICE_GROUP,
    AppTabEnum.QUESTIONNAIRE,
    EXTERNAL_DATA_GROUP,
    FORMATIVE_EVALUATION_MODEL_FOR_TEACHER,
    ATTAINMENT_EVALUATION_MODEL_FOR_TEACHER,
    IDEOLOGY_EVALUATION_FOR_TEACHER,
    EVALUATION_AND_PORTRAIT_FOR_TEACHER
  ],
  [RoleHomeEnum.DEFAULT]: []
});

// 后续新增角色或追加 tab 时，优先在这里加配置，避免改动核心菜单生成逻辑。
export const ROLE_MENU_TREE_EXTENSION_CONFIG = Object.freeze({});

const ROLE_NAME_TO_HOME = Object.freeze({
  [RoleNameEnum.SUPER_ADMIN]: RoleHomeEnum.SUPER_ADMIN,
  [RoleNameEnum.ADMIN]: RoleHomeEnum.ADMIN,
  [RoleNameEnum.SECRETARIATE]: RoleHomeEnum.SECRETARIATE,
  [RoleNameEnum.ACADEMIC_AFFAIRS]: RoleHomeEnum.ACADEMIC_AFFAIRS,
  [RoleNameEnum.DEAN]: RoleHomeEnum.DEAN,
  [RoleNameEnum.DEPARTMENT]: RoleHomeEnum.DEPARTMENT,
  [RoleNameEnum.MAJOR_MANAGER]: RoleHomeEnum.MAJOR_MANAGER,
  [RoleNameEnum.COURSE_MANAGER]: RoleHomeEnum.COURSE_MANAGER,
  [RoleNameEnum.COURSE_TEACHER]: RoleHomeEnum.COURSE_TEACHER,
  [RoleNameEnum.ASSISTANT]: RoleHomeEnum.ASSISTANT
});

export const resolveRoleHome = (rolehome, rolename = '') => {
  if (rolehome && ROLE_MENU_TREE_CONFIG[rolehome]) return rolehome;
  const matchedRoleName = Object.keys(ROLE_NAME_TO_HOME).find(name => rolename.includes(name));
  return matchedRoleName ? ROLE_NAME_TO_HOME[matchedRoleName] : RoleHomeEnum.DEFAULT;
};

export const getVisibleTabKeys = ({ rolehome, rolename, bffTabKeys } = {}) => {
  if (Array.isArray(bffTabKeys) && bffTabKeys.length > 0) return [...new Set(bffTabKeys)];
  const resolvedRoleHome = resolveRoleHome(rolehome, rolename);
  return flattenMenuTreeToTabKeys([
    ...(ROLE_MENU_TREE_CONFIG[resolvedRoleHome] || []),
    ...(ROLE_MENU_TREE_EXTENSION_CONFIG[resolvedRoleHome] || [])
  ]);
};

export const createMenuByTabKeys = tabKeys => {
  return tabKeys
    .map((tabKey, index) => {
      const tab = APP_TAB_CONFIG[tabKey];
      if (!tab) return null;
      return {
        id: tabKey,
        pid: '1',
        name: tab.name,
        routeName: tab.routeName,
        orderno: index + 1,
        tabKey,
        children: []
      };
    })
    .filter(Boolean);
};

const createMenuByGroup = (menuNode, index) => {
  const children = (menuNode.children || [])
    .map(createMenuFromConfigNode)
    .filter(Boolean)
    .sort((a, b) => (a.orderno || 0) - (b.orderno || 0));
  if (children.length === 0) return null;
  return {
    id: menuNode.groupKey,
    pid: '1',
    name: menuNode.name,
    orderno: index + 1,
    groupKey: menuNode.groupKey,
    children
  };
};

const createMenuFromConfigNode = (menuNode, index = 0) => {
  if (typeof menuNode === 'string') return createMenuByTabKey(menuNode, null, index);
  if (menuNode?.groupKey) return createMenuByGroup(menuNode, index);
  if (menuNode?.tabKey) return createMenuByTabKey(menuNode.tabKey, menuNode, index);
  return null;
};

const createMenusByMenuTree = menuTree => {
  return menuTree
    .map(createMenuFromConfigNode)
    .filter(Boolean)
    .sort((a, b) => (a.orderno || 0) - (b.orderno || 0));
};

const flattenMenuTreeToTabKeys = menuTree => {
  const tabKeys = [];
  const walk = node => {
    if (typeof node === 'string') {
      tabKeys.push(node);
      return;
    }
    if (node?.tabKey) {
      tabKeys.push(node.tabKey);
      return;
    }
    if (Array.isArray(node?.children)) node.children.forEach(walk);
  };
  menuTree.forEach(walk);
  return [...new Set(tabKeys)];
};

const normalizeLegacyMenuUrl = url => {
  if (!url) return '';
  const path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0].replace(/\/$/, '');
  const withoutHome = path.replace(/^\/homes\/[^/]+/, '');
  return withoutHome.startsWith('/') ? withoutHome : `/${withoutHome}`;
};

const createMenuByTabKey = (tabKey, fallbackMenu, index) => {
  const tab = APP_TAB_CONFIG[tabKey];
  if (!tab) return null;
  return {
    id: tabKey,
    pid: fallbackMenu?.pid || '1',
    name: tab.name || fallbackMenu?.name,
    routeName: tab.routeName,
    orderno: fallbackMenu?.orderno ?? index + 1,
    tabKey,
    children: []
  };
};

const createMenuFromLegacyMenu = (legacyMenu, index) => {
  const children = Array.isArray(legacyMenu?.children)
    ? legacyMenu.children
        .map(createMenuFromLegacyMenu)
        .filter(Boolean)
        .sort((a, b) => (a.orderno || 0) - (b.orderno || 0))
    : [];
  const tabKey = LEGACY_MENU_URL_TO_TAB_KEY[normalizeLegacyMenuUrl(legacyMenu?.url)];

  if (tabKey) {
    return {
      ...createMenuByTabKey(tabKey, legacyMenu, index),
      children
    };
  }

  if (children.length === 0) return null;

  return {
    id: legacyMenu.id,
    pid: legacyMenu.pid || '1',
    name: legacyMenu.name,
    orderno: legacyMenu.orderno ?? index + 1,
    children
  };
};

export const getRoleMenusFromLegacyMenus = legacyMenus => {
  if (!Array.isArray(legacyMenus)) return [];
  return legacyMenus
    .map(createMenuFromLegacyMenu)
    .filter(Boolean)
    .sort((a, b) => (a.orderno || 0) - (b.orderno || 0));
};

export const getRoleMenus = ({ rolehome, rolename, bffTabKeys } = {}) => {
  if (Array.isArray(bffTabKeys) && bffTabKeys.length > 0) {
    return createMenuByTabKeys(bffTabKeys);
  }
  const resolvedRoleHome = resolveRoleHome(rolehome, rolename);
  return createMenusByMenuTree([
    ...(ROLE_MENU_TREE_CONFIG[resolvedRoleHome] || []),
    ...(ROLE_MENU_TREE_EXTENSION_CONFIG[resolvedRoleHome] || [])
  ]);
};
