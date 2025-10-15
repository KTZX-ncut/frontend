import {
  createRouter,
  createWebHistory,
  onBeforeRouteLeave,
  createWebHashHistory,
  useRoute
} from 'vue-router';
import useMain from '../stores/useMain';
import { storeToRefs } from 'pinia';
const rolehome = [
  'teacherhomne',
  'adminhome',
  'superadminhome',
  'secretariatehome',
  'academicaffairshome',
  'deanhome',
  'departmenthome',
  'majormanagerhome',
  'coursemanagerhome',
  'professionhome',
  'assistanthome',
  'courseteacherhome',
  'studenthome',
  'page',
  'defaulthome'
];
// superadminhome 超级管理员首页
// secretariatehome 教学秘书首页
// academicaffairshome 教务处首页
// deanhome 学院负责人首页
// departmenthome 系主任首页
// majormanagerhome 专业负责人首页
// coursemanagerhome 课程负责人首页

const pathHeader = `/homes/:rolehome(${rolehome.join('|')})`;
const route = useRoute();

console.log('pathHeader', pathHeader);
const routes = [
  {
    path: '/login',
    name: 'Login',
    // component: () => import('../views/Login.vue')
    component: () => import('../views/redrawPages/Login.vue')
  },
  {
    path: '/homes/studenthome',
    name: 'StudentHomePage',
    // component: () => import('../views/studentHomePage.vue')
    component: () => import('../views/redrawPages/studentHomePage.vue')
  },
  {
    path: '/homes/studentcourses',
    name: 'StudentCoursePage',
    // component: () => import('../views/StudentCoursePage.vue'),
    component: () => import('../views/redrawPages/studentCoursePage.vue'),
    children: [
      // 学生端我的作业
      {
        path: 'exam/myhomework',
        component: () => import('../views/page/job/index.vue')
      },
      {
        path: 'exam/jobAnswer',
        component: () => import('../views/page/job/jobAnswer/index.vue')
      },
      {
        path: 'exam/jobWjList',
        component: () => import('../views/page/job/jobWjList/index.vue')
      },
      // 学生端实验
      {
        path: 'exam/myexperiment',
        component: () => import('../views/page/stuPractice/index.vue')
      },
      {
        path: 'exam/submitPractice',
        component: () => import('../views/page/stuPractice/submitPractice/index.vue')
      },
      // 学生端问卷
      {
        path: 'exam/myquestionnaire',
        component: () => import('../views/page/stuQues/index.vue')
      },
      {
        path: 'exam/detail',
        component: () => import('../views/page/stuQues/detail/index.vue')
      },
      {
        path: 'coursemangt/classroommangt/academiccalendar', // 实验大纲
        component: () => import('../components/course/Classroommangt/AcademiccalendarStu.vue')
      },
      {
        path: 'coursemangt/classroommangt/lessonplan', // 实验资源
        component: () => import('../components/course/Classroommangt/LessonPlanStu.vue')
      }
    ]
  },
  {
    path: '/homes/:rolehome(' + rolehome.join('|') + ')',
    name: 'Homepage',
    // component: () => import('../views/teacherHomePage.vue'),
    component: () => import('../views/redrawPages/teacherHomePage.vue'),
    // component: () => import('../views/Test.vue'),
    children: [
      {
        path: 'sysmangt/rolemangt',
        name: 'Rolemangt', //角色管理
        component: () => import('../components/admin/Rolemangt.vue')
      },
      {
        path: 'sysmangt/rolepurview',
        name: 'Rolepurview', //角色授权
        component: () => import('../components/admin/Rolepurview.vue')
      },
      {
        path: 'sysmangt/schoolmangt',
        name: 'SchoolMangt', // 学校配置
        component: () => import('../components/admin/SchoolMangt.vue')
      },
      {
        path: 'sysmangt/termmangt',
        name: 'TermsManagement', //学期管理
        component: () => import('../components/admin/TermMangt.vue')
      },
      {
        path: 'sysmangt/creatteachunit',
        name: 'Unitssmangt', //教学单位管理
        component: () => import('../components/admin/CreateTeachUnit.vue')
      },
      {
        path: 'sysmangt/peoplemangt',
        name: 'PeopleManagement', //人员管理
        component: () => import('../components/admin/Peoplemangt.vue')
      },
      {
        path: 'sysmangt/collegemangt',
        name: 'Collegecollegemangt', //学院管理
        component: () => import('../components/admin/Collegemangt.vue')
      },
      {
        path: 'sysmangt/departmentmangt',
        name: 'Departmentmangt', //部门管理
        component: () => import('../components/admin/Departmentmangt.vue')
      },
      {
        path: 'sysmangt/professionmangt',
        name: 'Professionmangt', //专业管理
        component: () => import('../components/admin/Professionmangt.vue')
      },
      {
        path: 'sysmangt/classmangt',
        name: 'Classmangt', //专业班级管理
        component: () => import('../components/admin/Classmangt.vue')
      },
      {
        path: 'coursemangt/coursemangt', // 课程管理
        name: 'CourseManagement',
        component: () => import('../components/course/Coursemangt.vue')
      },
      {
        path: 'coursemangt/classroom', // 课堂管理
        name: 'ClassRoomManagement',
        component: () => import('../components/course/Classroommangt.vue')
      },
      {
        path: 'evaluation/ability', // 能力字典
        name: 'AbilityDictionary',
        component: () => import('../components/course/AbilityDictionary.vue'),
        props: route => ({ badge: route.params.rolehome })
      },
      {
        path: 'coursemangt/instructionalprogram', // 教学大纲
        name: 'InstructionalProgrammangt',
        component: () => import('../components/course/InstructionalProgrammangt.vue')
        // component: () => import('../components/Idealogy/Idealogy.vue')
      },
      {
        path: 'coursemangt/courseresources', // 课程资源
        name: 'CourseResources',
        component: () => import('../components/course/Courseresources.vue')
      },

      {
        path: 'coursemangt/classroommangt/academiccalendar', // 教学日历
        name: 'AcademicCalendar',
        component: () => import('../components/course/Classroommangt/Academiccalendar.vue')
      },
      {
        path: 'coursemangt/classroommangt/lessonplan', // 课程教案
        name: 'LessonPlan',
        component: () => import('../components/course/Classroommangt/LessonPlan.vue')
      },
      {
        path: 'coursemangt/classroommangt/classStudentList', //课堂学生名单
        name: 'StudentsList',
        component: () => import('../components/course/Classroommangt/StudentsList.vue')
      },
      {
        path: 'coursemangt/pastCourse', // 复制往届课程
        name: 'PastCourse',
        component: () => import('../components/course/CopyPastCourseInfo.vue')
      },
      {
        path: 'coursemangt/classroommangt', // 课程负责人首页
        name: 'CourseManagerHomePage',
        component: () => import('../components/course/CourseManagerHomePage.vue')
      },
      {
        path: 'evasys/formative/keyword', // 形成性评价模型-关键字
        name: 'Keyword',
        meta: {
          keepAlive: true //添加这个作为标志符，表明该页面需要保留状态
        },
        component: () => import('../components/evaluation/Keyword.vue')
      },
      {
        //1004hhy修改
        path: 'evaluation/getability', // 形成性评价模型-能力
        name: 'Ability',
        meta: 1,
        component: () => import('../components/evaluation/Ability.vue')
      },
      {
        path: 'evasys/formative/teachingobjectives', // 形成性评价模型-基本教学目标
        name: 'TeachingObjectives',
        component: () => import('../components/evaluation/TeachingObjectives.vue')
      },
      {
        path: 'evasys/formative/knowledgeunit', // 形成性评价模型-知识单元
        name: 'KnowledgeUnit',
        component: () => import('../components/evaluation/KnowledgeUnit.vue')
      },
      {
        path: 'evaluation/dynamicEvaluation/portraitmangt', // 形成性评价模型-画像数据管理
        name: 'portraitmangt',
        component: () => import('../components/dynamicEvaluation/PortraitMangt/PortraitMangt.vue')
      },
      {
        path: 'dynamicmodel/graphlist', // 形成性评价模型-画像名单
        name: 'GraphList',
        component: () => import('../components/course/Classroommangt/StudentsList.vue')
      },
      {
        path: 'evasys/formative/KWAgraph', // 形成性评价模型-知识能力图谱
        name: 'KWAgraph',
        // component: () => import('../components/evaluation/graph.vue')
        component: () => import('../components/dynamicEvaluation/Visualize/VisualizeWrapper.vue')
      },
      {
        path: 'evasys/graph', // 形成性评价模型-图谱
        name: 'graph',
        component: () => import('../components/evaluation/graph.vue')
      },
      {
        path: 'evasys/formative/coursetarget', // 形成性评价模型-课程目标
        name: 'CourseTarget',
        component: () => import('../components/evaluation/CourseTarget.vue')
      },
      {
        path: 'evasys/formative/idealogy', // 形成性评价模型-思政价值
        name: 'Idealogy',
        component: () => import('../components/Idealogy/Idealogy.vue')
      },
      {
        path: 'evasys/accessible/coursetarget', // 达成性评价模型-课程目标
        name: 'CourseTarget',
        // component: () => import('../components/evaluation/CourseTarget.vue')
        component: () => import('../components/evaluation/evaluationNew/CourseAim.vue')
      },
      {
        path: 'evaluation/AssessmentItems',
        name: 'AssessmentItems',
        // component: () => import('../components/evaluation/AssessmentItems.vue')
        component: () =>
          import('../components/evaluation/evaluationNew/evaluationItem/EvaluationDesign.vue')
      },
      {
        path: 'evaluation/assessmentPlan', // 达成性评价模型-考核方案
        name: 'AssessmentTable',
        // component: () => import('../components/evaluation/AssessmentTable.vue')
        // component: () => import('../components/evaluation/evaluationNew/AsswssmentNew.vue')
        component: () => import('../components/evaluation/evaluationNew/AssessmentTable.vue')
      },
      {
        path: 'evaluation/dynamicEvaluation/studentReport', // 评估与画像-学生报告
        name: 'StudentReport',
        component: () => import('../components/dynamicEvaluation/StudentsReport/StudentsReport.vue')
      },
      {
        path: 'evaluation/dynamicEvaluation/studentGraph', // 评估与画像-学生画像
        name: 'StudentGraph',
        component: () =>
          // import('../components/dynamicEvaluation/StudentsGraph/StudentGraphWrapper.vue')
          import('../components/dynamicEvaluation/StudentsGraph/Wrapper.vue')
      },
      {
        path: 'evaluation/dynamicEvaluation/classroomGraph', // 评估与画像-课堂画像
        name: 'ClassroomGraph',
        component: () =>
          // import('../components/dynamicEvaluation/ClassroomGraph/ClassroomGraphWrapper.vue')
          import('../components/dynamicEvaluation/ClassroomGraph/Wrapper.vue')
      },
      {
        path: 'evaluation/dynamicEvaluation/academicTranscript', // 达成性评价-评价名单
        name: 'AcademicTranscript',
        component: () => import('../components/evaluation/AcademicTranscript.vue')
      },
      {
        path: 'evaluation/dynamicEvaluation/classroomReport', // 达成性评价-生成报告
        name: 'ClassroomReport',
        component: () => import('../components/evaluation/ClassroomReport.vue')
      },
      // 达成性评价画像名单
      {
        path: 'evaluation/graphList',
        name: 'attainmentGraphList',
        component: () => import('../components/course/Classroommangt/StudentsList.vue')
      },
      // 0822
      // 课程页
      {
        path: pathHeader + '/exam/coursequelib',
        component: () => import('../views/page/courseLib/index.vue')
      },
      {
        path: pathHeader + '/exam/coursequelib/type',
        component: () => import('../views/page/courseLib/type/index.vue')
      },
      {
        path: pathHeader + '/exam/coursequelib/sync',
        component: () => import('../views/page/courseLib/sync/index.vue')
      },
      // 课堂页
      {
        path: pathHeader + '/exam/classroomquelib',
        component: () => import('../views/page/classroomLib/index.vue')
      },
      {
        path: pathHeader + '/exam/classroomquelib/classroomQTS',
        component: () => import('../views/page/classroomLib/type/index.vue')
      },
      // 作业测试
      {
        path: pathHeader + '/exam/test/testmangt',
        component: () => import('../views/page/taskMgmt/index.vue')
      },
      {
        path: pathHeader + '/exam/test/past',
        component: () => import('../views/page/taskMgmt/prevTask/index.vue')
      },
      {
        path: pathHeader + '/exam/test/taskMgmt/view',
        component: () => import('../views/page/taskMgmt/view/index.vue')
      },
      {
        path: pathHeader + '/exam/test/tpAssembly',
        component: () => import('../views/page/taskMgmt/tpAssembly/index.vue')
      },
      {
        path: pathHeader + '/exam/test/taskList',
        component: () => import('../views/page/taskMgmt/taskList/index.vue')
      },
      {
        path: pathHeader + '/exam/test/assignGrading',
        component: () => import('../views/page/taskMgmt/assignGrading/index.vue')
      },
      // 实验
      {
        path: pathHeader + '/exam/experimental/labmangt',
        component: () => import('../views/page/practice/index.vue')
      },
      {
        path: pathHeader + '/exam/experimental/view',
        component: () => import('../views/page/practice/view/index.vue')
      },
      {
        path: pathHeader + '/exam/experimental/student',
        component: () => import('../views/page/practice/student/index.vue')
      },
      {
        path: pathHeader + '/exam/experimental/practiceInfo',
        component: () => import('../views/page/practice/info/index.vue')
      },
      {
        path: pathHeader + '/exam/experimental/correct',
        component: () => import('../views/page/practice/correct/index.vue')
      },
      // 问卷
      {
        path: pathHeader + '/exam/questionnaire',
        component: () => import('../views/page/ques/list/index.vue')
      },
      {
        path: pathHeader + '/exam/edit',
        component: () => import('../views/page/ques/edit/index.vue')
      },
      {
        path: pathHeader + '/exam/studentList',
        component: () => import('../views/page/ques/studentList/index.vue')
      },
      {
        path: pathHeader + '/exam/view',
        component: () => import('../views/page/ques/view/index.vue')
      },
      {
        path: pathHeader + '/exp/scoreList',
        component: () => import('../views/page/grade/list/index.vue')
      },
      {
        path: 'external-data/type-manage', // 达成性评价模型-外部数据类型新建
        name: 'ExternalDataTypeCreate',
        component: () => import('../components/evaluation/evaluationNew/ExternalDataTypeCreate.vue')
      },
      {
        path: 'external-data/data-import', // 达成性评价模型-外部数据导入功能
        name: 'ExternalDataImport',
        component: () => import('../components/evaluation/evaluationNew/ExternalDataImport.vue')
      },

    ]
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory('/'),
  routes
});

// onBeforeRouteLeave((to, from, next) => {
//     // 检查用户是否已经登录
//     const isLoggedIn = sessionStorage.getItem('isLoggedIn');
//
//     // 如果用户从登录页面离开，且没有登录标志，则清除sessionStorage中的用户信息
//     if (from.path === '/login' && !isLoggedIn) {
//         sessionStorage.removeItem('users');
//     }
//
//     next();
// });

// router.beforeEach((to, from, next) => {
//   const MainStore = useMain();
//   const { selectedRoute } = storeToRefs(MainStore);
//   // 如果当前路由与选中的路由不一致，则根据 URL 跳转
//   console.log(to.path);
//   if (to.path !== selectedRoute.value && selectedRoute.value !== '') {
//     // MainStore.setSelectedRoute(to.path);
//     next(selectedRoute.value);
//   }
//   next();
// });

// router.beforeEach((to, from, next) => {
//   // 尝试从 sessionStorage 中获取用户信息
//   const storedUserInfo = sessionStorage.getItem('users');

//   // 检查目标路由是否需要认证（假设需要认证的路由有一个'meta'字段）
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
//   const MainStore = useMain();
//   const { selectedRoute } = storeToRefs(MainStore);
//   // 如果当前路由与选中的路由不一致，则根据 URL 跳转
//   console.log(to);
//   if (
//     Object.keys(to.query).length === 0 &&
//     to.path !== selectedRoute.value &&
//     selectedRoute.value !== ''
//   ) {
//     // 如果当前路由与选中的路由不一致，则根据 URL 跳转
//     console.log(to.path);
//     // MainStore.setSelectedRoute(to.path);
//     next(selectedRoute.value);
//     return;
//   }
//   if (requiresAuth && !storedUserInfo) {
//     // 是否要将当前路由保存到MainStore中
//     MainStore.setSelectedRoute(to.path);
//     // 如果目标路由需要认证，但没有存储的用户信息，则重定向到登录页面
//     next({ name: 'Login' });
//     return;
//   }
//   next();
// });

router.beforeEach((to, from, next) => {
  // 尝试从 sessionStorage 中获取用户信息
  const storedUserInfo = sessionStorage.getItem('users');

  const token = sessionStorage.getItem('token');

  // 检查目标路由是否需要认证（假设需要认证的路由有一个'meta'字段）
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const MainStore = useMain();
  const { selectedRoute } = storeToRefs(MainStore);
  // 如果当前路由与选中的路由不一致，则根据 URL 跳转
  console.log(to);
  MainStore.setTarget(to.fullPath);
  if (
    !from.path.includes('exam') &&
    to.path !== selectedRoute.value &&
    selectedRoute.value !== ''
  ) {
    // 如果当前路由与选中的路由不一致，则根据 URL 跳转
    console.log(to.path);
    // MainStore.setSelectedRoute(to.path);
    next(selectedRoute.value);
    return;
  }
  if (requiresAuth && !storedUserInfo) {
    // 如果目标路由需要认证，但没有存储的用户信息，则重定向到登录页面
    next({ name: 'Login' });
    return;
  }

  if (!token && !storedUserInfo && to.path !== '/login') {
    next('login');
    return;
  }
  next();
});
export default router;
