<template>
  <div style="height: 100vh; background-color: rgb(238, 247, 255); min-width: 100vw">
    <el-container class="layout-container-demo">
      <el-header style="
          position: relative;
          text-align: right;
          font-size: 15px;
          height: 100px;
          width: 100vw;
          background-color: #fff;
          box-shadow: 0px 0px 15px 0px rgba(0, 30, 56, 0.07);
          z-index: 999;
        ">
        <template #default>
          <div class="header">
            <div class="inner flex justify-between" style="width: 1250px; height: 100%; margin: 0 auto">
              <div class="icon flex justify-center items-center">
                <img style="width: 29px; height: 47px; padding-right: 5px" referrerpolicy="no-referrer"
                  src="@/assets/images/redraw-images/icon.png" />
                <img style="width: 184px; height: 28px" referrerpolicy="no-referrer"
                  src="@/assets/images/redraw-images/title.png" />
                <span class="term" style="
                    font-size: 24px;
                    width: 116px;
                    height: 31px;
                    color: rgba(0, 120, 205, 1);
                    white-space: nowrap;
                    line-height: 31px;
                    font-family: MicrosoftYaHei;
                    margin-left: 33px;
                  ">{{ loginInfo.currentterm }}</span>
              </div>
              <div class="right flex justify-center items-center" style="height: 100%">
                <img referrerpolicy="no-referrer" src="@/assets/images/redraw-images/divider.png" />
                <div class="mainner flex justify-between items-center">
                  <div class="avatar flex justify-center items-center"
                    style="width: 60px; height: 60px; margin-left: 15px; margin-right: 5px">
                    <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                  </div>
                  <div class="text">
                    <div class="group_4">
                      <div class="top" style="margin-bottom: 5px">
                        <span style="
                            width: 144px;
                            height: 24px;
                            overflow-wrap: break-word;
                            color: rgba(27, 27, 27, 1);
                            font-size: 18px;
                            font-family: MicrosoftYaHei;
                            font-weight: normal;
                            text-align: left;
                            white-space: nowrap;
                            line-height: 24px;
                          ">{{ loginInfo.username }}</span>
                      </div>
                      <div class="bottom flex justify-between items-center">
                        <div style="
                            width: 62px;
                            height: 19px;
                            overflow-wrap: break-word;
                            color: rgba(0, 120, 205, 1);
                            font-size: 14px;
                            letter-spacing: 1.5px;
                            font-family: MicrosoftYaHei;
                            font-weight: normal;
                            text-align: right;
                            white-space: nowrap;
                            line-height: 19px;
                            margin-right: 5px;
                            overflow: hidden; /* 隐藏超出的部分 */
                            text-overflow: ellipsis;
                          ">
                          <el-tag type="primary">{{ loginInfo.rolename }}</el-tag>
                        </div>
                        <div style="
                            width: 31px;
                            height: 19px;
                            overflow-wrap: break-word;
                            color: rgba(1, 154, 72, 1);
                            font-size: 14px;
                            letter-spacing: 1.5px;
                            font-family: MicrosoftYaHei;
                            font-weight: normal;
                            text-align: right;
                            white-space: nowrap;
                            line-height: 19px;
                          ">
                          <el-tag type="success">在线</el-tag>
                        </div>
                      </div>

                      <div class="block_12"></div>
                    </div>
                  </div>
                  <!-- 下拉按钮 -->
                  <el-dropdown @visible-change="handleVisibleChange">
                    <img class="drop-down-icon" style="margin-left: 37px; width: 26px; height: 26px" referrerpolicy="no-referrer"
                      src="@/assets/images/redraw-images/dropdown.png" />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="openChangePwdDialog">修改密码</el-dropdown-item>
                        <el-dropdown-item>查看详情</el-dropdown-item>
                        <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </div>
          </div>
        </template>
        <!--右侧按钮-->
        <!-- <div
          style="
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 0;
          "
        >
          <div class="left-div" style="flex-grow: 1; display: flex; align-items: center">
            <img src="../assets/images/logo.png" style="height: 5.5vh" />
            <el-text style="font-size: calc(1vw + 6px); color: white; margin-left: 10px">
              自动化专业智能教学平台
            </el-text>
          </div>

          <div
            class="right-div"
            style="flex-grow: 1; display: flex; align-items: center; justify-content: flex-end"
          >
            <el-dropdown>
              <el-avatar
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
              />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>查看详情</el-dropdown-item>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-text style="font-size: calc(1vw + 3px); color: white; margin-left: 10px"
              >{{ loginInfo.username }}
            </el-text>
          </div>
        </div> -->
      </el-header>
      <el-container style="width: 1250px; height: 100vh; overflow-x: hidden; margin: 0 auto">
        <el-aside width="200px" style="
            height: 100%;
            background-color: #fff;
            box-shadow: 0px 0px 15px 0px rgba(0, 30, 56, 0.07);
          ">
          <!--左侧我的课程部分-->
          <div style="height: 100%; position: relative">
            <div v-if="isSHow" class="instrutor"></div>
            <el-scrollbar>
              <el-menu :default-active="defaultActive" class="courses-menu">
                <template v-for="menu in menus" :key="menu.id">
                  <el-menu-item :index="menu.url" @click="navigateTo(menu.id)">
                    <img src="@/assets/images/studentpage/course.png" class="course-icon" />
                    <span class="course-text" style="font-size: 17px">{{
                      menu.classroomName
                    }}</span>
                  </el-menu-item>
                </template>
              </el-menu>
              <!-- <el-menu :default-active="defaultActive">
                <template v-for="(menu, index) in filteredMenus">
                  <div>{{ menu }}</div>
                  二级菜单
                  <el-sub-menu
                    v-if="hasChildren(menu)"
                    :index="menu.id"
                    :key="menu.id"
                    style="border-top: 1px solid #efefef; position: relative"
                  >
                    <template #title>
                      0822有更改
                      <div class="titleBox" @click="navigateTo(menu.url)">
                        {{ menu.name }}
                      </div>
                    </template>
                    <template v-for="child in getChildrenMenus(menu)">
                      三级菜单
                      <el-sub-menu
                        v-if="hasChildren(child)"
                        :index="child.id"
                        :key="child.id"
                        style="border-top: 1px solid #efefef; position: relative"
                      >
                        <template #title>
                          <div class="childtitleBox" @click="navigateTo(child.url)">
                            {{ child.name }}
                          </div>
                        </template>
                        <el-menu-item
                          v-for="grandchild in getChildrenMenus(child)"
                          :index="grandchild.url"
                          :key="grandchild.id"
                          style="border-top: 1px solid #efefef"
                          @click="navigateTo(grandchild.url)"
                        >
                          <template #title>
                            <div class="childtitleBox">{{ grandchild.name }}</div>
                          </template>
                        </el-menu-item>
                      </el-sub-menu>
                      无三级菜单
                      <el-menu-item
                        v-else
                        :index="child.url"
                        :key="child.id"
                        style="border-top: 1px solid #efefef"
                        @click="navigateTo(child.url)"
                      >
                        <template #title>
                          <div class="childtitleBox">{{ child.name }}</div>
                        </template>
                      </el-menu-item>
                    </template>
                  </el-sub-menu>
                  无二级菜单
                  <el-menu-item
                    v-else
                    :index="menu.url"
                    :key="menu.id"
                    @click="navigateTo(menu.url)"
                    style="border-top: 1px solid #efefef"
                  >
                    <div class="titleBox">
                      {{ menu.name }}
                    </div>
                  </el-menu-item>
                </template>
              </el-menu> -->
            </el-scrollbar>
          </div>
          <!-- <div class="my-courses-container" style="margin-left: 20px; margin-top: 10px">
            <div class="header">
              <el-text style="color: white; font-size: large">我的课程</el-text>
            </div>
            <div class="content">
              <el-scrollbar style="max-height: calc(92vh - 200px)">
                <el-menu :default-active="defaultActive" class="courses-menu">
                  <template v-for="menu in menus" :key="menu.id">
                    <el-menu-item :index="menu.url" @click="navigateTo(menu.id)">
                      <img src="../assets/images/studentpage/course.png" class="course-icon" />
                      <span class="course-text">{{ menu.classroomName }}</span>
                    </el-menu-item>
                  </template>
                </el-menu>
              </el-scrollbar>
            </div>
          </div> -->
        </el-aside>

        <el-main style="-ms-overflow-style: none; /* IE 和 Edge */ scrollbar-width: none; /* Firefox */">
          <!--右侧内容部分-->
          <el-card style="max-width: 910px; margin-left: 30px; margin-top: 50px">
            <el-main style="-ms-overflow-style: none; /* IE 和 Edge */ scrollbar-width: none; /* Firefox */">
              <!--右侧内容部分-->
              <el-card style="max-width: 910px; margin-left: 30px; margin-top: 50px">
                <!-- 添加学生画像分析区域 -->
                <div class="student-profile-container" v-if="showStudentProfile">
                  <div class="profile-header">
                    <el-text style="font-size: 18px; font-weight: bold;">📊 学生画像分析 - {{ selectedStudentName }}</el-text>
                    <el-button type="primary" size="small" @click="regenerateProfile" :loading="isStreaming">重新生成</el-button>
                  </div>
                  <div class="profile-content">
                    <div class="suggestion-box">
                      <div class="suggestion-content" v-html="formattedProfileSuggestion"></div>
                      <div v-if="isStreaming" class="streaming-cursor">|</div>
                    </div>
                  </div>
                </div>

                <router-view></router-view>
              </el-card>
              <span style="...">北方工业大学2024&nbsp;CopyRight</span>
            </el-main>

            <router-view></router-view>
          </el-card>
          <span style="
              display: inline-block;
              width: 257px;
              height: 24px;
              overflow-wrap: break-word;
              color: rgba(85, 129, 173, 1);
              font-size: 18px;
              font-family: MicrosoftYaHei;
              font-weight: normal;
              text-align: left;
              white-space: nowrap;
              line-height: 24px;
              margin-top: 25px;
            ">北方工业大学2024&nbsp;CopyRight</span>
          <!-- <div class="right-content-container" style="margin-right: 20px; margin-top: 10px">
            <div class="header">
              <el-text style="color: white; font-size: large">课程详情</el-text>
            </div>
            <div class="content">
              在 el-main 区域显示路由组件

              <router-view></router-view>
            </div>
          </div> -->
        </el-main>
      </el-container>
    </el-container>
  </div>

  <el-dialog v-model="changePwdVisible" title="修改密码" width="420" align-center destroy-on-close>
    <el-form ref="changePwdRef" :model="pwdInfo" class="ml-[-1.5vw] grid gap-y-4 mt-2" :rules="changePwdRules"
      autocomplete="off">
      <el-form-item prop="currentPwd" class="ml-10 mr-10">
        <div class="flex items-center space-x-2 w-full">
          <span class="whitespace-nowrap mr-2 min-w-[90px]"><span class="text-red-500 mr-1">*</span>当前密码：</span>
          <el-input type="password" show-password v-model="pwdInfo.currentPwd" autocomplete="off" />
        </div>
      </el-form-item>
      <el-form-item prop="newPwd" class="ml-10 mr-10">
        <div class="flex items-center space-x-2 w-full">
          <span class="whitespace-nowrap mr-2 min-w-[90px]"><span class="text-red-500 mr-1">*</span>新密码：</span>
          <el-input type="password" show-password v-model="pwdInfo.newPwd" autocomplete="off" />
        </div>
      </el-form-item>
      <el-form-item prop="confirmPwd" class="ml-10 mr-10">
        <div class="flex items-center space-x-2 w-full">
          <span class="whitespace-nowrap mr-2 min-w-[90px]"><span class="text-red-500 mr-1">*</span>确认密码：</span>
          <el-input type="password" show-password v-model="pwdInfo.confirmPwd" autocomplete="off" />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button @click="changePwdVisible = false">取消</el-button>
        <el-button type="primary" @click="changePwd(changePwdRef)">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import '@/assets/css/taildwind.css';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '@/utils/request.js';
import { ElMessage } from 'element-plus';
import { useProfileStore } from '@/stores/profileStore.js';
import { FormInstance } from 'element-plus';

// 获取Store
const profileStore = useProfileStore();
const defaultActive = ref('');
const router = useRouter(); // 获取路由实例

const imageUrl = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png');

// 学生画像相关
const showStudentProfile = ref(true);
const isStreaming = ref(false);
const selectedStudentName = ref('刘镇武');
const profileSuggestionText = ref('');

// 清除登录信息的方法
function clearLoginInfo() {
  // 清除其他可能存储的信息
  sessionStorage.removeItem('users');
  sessionStorage.removeItem('isLoggedIn');
}

// 登出的方法
const handleLogout = () => {
  clearLoginInfo();
  router.push({ name: 'Login' }); // 假设您的登录路由的名字是 'Login'
};

const menus = ref([]);

const loginInfo = reactive({
  username: profileStore.profilename,
  rolename: profileStore.profilerolename,
  catelog: profileStore.profilecatelog,
  currentterm: profileStore.currentterm
});

// 计算属性来处理动态 homeurl
const homeurl = computed(() => profileStore.profilehomeurl);

const courseinfo = ref({});
// 路由导航
const navigateTo = id => {
  console.log(id);
  request.admin
    .get('/homes/switchstucourse?id=' + id)
    .then(res => {
      // 登录成功

      if (res.code === 200) {
        courseinfo.value = res.data;
        profileStore.setToken(courseinfo.value.token);
        sessionStorage.setItem('token', courseinfo.value.token);

        // router.push(courseinfo.value.courseChineseName);

        router.push({
          path: '/homes/studentcourses',
          query: {
            courseChineseName: courseinfo.value.courseChineseName
          }
        });
      }
    })
    .catch(error => {
      // 获取失败

      ElMessage({
        type: 'error',
        message: '获取导航失败'
      });
    });
};


//--------修改密码
const changePwdVisible = ref(false);
const pwdInfo = ref({
  currentPwd: '',
  newPwd: '',
  confirmPwd: ''
});
const changePwdRef = ref<FormInstance>();

const openChangePwdDialog = () => {
  pwdInfo.value = {
    currentPwd: '',
    newPwd: '',
    confirmPwd: ''
  };
  changePwdVisible.value = true;
}

const validateNew = (rule: any, value: String, callback: any) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else {
    if (value.length < 3 || value.length > 15) callback(new Error('密码长度在3到15个字符之间'));
    callback()
  }
}
const validateConfirm = (rule: any, value: String, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== pwdInfo.value.newPwd) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const changePwdRules = ref({
  currentPwd: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPwd: [{ required: true, validator: validateNew, trigger: 'blur' }],
  confirmPwd: [{ required: true, validator: validateConfirm, trigger: 'blur' }]
});

const changePwd = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      try {
        const res = await request.admin.get(`/homes/studentChangePwd?currentPwd=${pwdInfo.value.currentPwd}&newPwd=${pwdInfo.value.newPwd}`);
        if (res.code === 200) {
          ElMessage.success("修改成功");
          changePwdVisible.value = false;
        } else ElMessage.error(res.msg);
      } catch (error) {
        ElMessage.error("修改失败" + error);
      }
    } else {
      return;
    }
  })

}

const handleVisibleChange = (visible) => {
  const dropDown = document.querySelector('.drop-down-icon');
  if (visible) dropDown.style.transform = 'rotate(180deg)';
  else {
    dropDown.style.transform = 'rotate(0deg)';
  }
}

// 学生画像数据
const mockStudentProfileData = {
  "学生个性化学习评价报告": {
    "生成时间": "2026-03-26T15:49:25.743724",
    "学生ID": "S001",
    "一、学习特质摘要": {
      "班级整体状态描述（或学生个体状态）": "学生张三在数据结构课程中，当前章节为树与二叉树，课程难度较高。班级平均掌握水平为0.65，张三在班级中排名前30%。张三的学习风格为稳健型，潜力评级为A级，学习敏锐度高，知识迁移能力强。近期表现波动较大，参与度趋势持续下降，整体风险等级为中风险。",
      "关键数据指标（均值、分布、趋势等）": {
        "知识点掌握度": {
          "链表": 0.85,
          "栈": 0.78,
          "队列": 0.72,
          "树": 0.55,
          "图": 0.48,
          "排序": 0.82
        },
        "SPI分数": 0.51,
        "SPI趋势": [0.72, 0.68, 0.62, 0.58, 0.51],
        "PEIR": 0.68,
        "适应指数": 0.72,
        "知识迁移率": 0.75,
        "答题稳定性": 0.82,
        "作业平均分": 0.73,
        "课堂参与频率": 0.45,
        "挑战偏好": 0.62,
        "班级平均掌握水平": 0.65
      },
      "需要关注的重点（风险学生、薄弱知识点等）": {
        "风险学生": "张三（风险等级：中风险）",
        "薄弱知识点": ["树结构", "图算法"],
        "近期表现": "波动较大",
        "参与度趋势": "持续下降"
      }
    },
    "二、知识点掌握分析": {
      "归因分析报告": {
        "学生信息": "张三",
        "课程": "数据结构（树与二叉树章节）",
        "整体风险等级": "中风险",
        "分析维度": [
          {
            "识别出的关键问题": "对抽象数据结构（树、图）掌握度显著偏低，且近期表现波动大",
            "归因分析": [
              {
                "归因原因": "概念抽象性过高导致认知负荷超载",
                "理论依据": "认知负荷理论",
                "典型表现": "树（0.55）和图（0.48）的掌握度远低于链表（0.85）、排序（0.82）等相对具体或算法性知识；知识迁移率高（0.75）但SPI分数低（0.51），表明其具备迁移能力，但在当前抽象概念上受阻，可能反复查看定义仍难以举一反三。",
                "引用知识库条目": "概念抽象性过高（认知负荷理论）：典型表现包括学生反复查看同一概念定义、相似概念混淆不清、难以举一反三。"
              },
              {
                "归因原因": "前序知识（如指针、递归）可能存在薄弱环节，影响树结构的知识建构",
                "理论依据": "知识建构理论",
                "典型表现": "树与图是建立在链表、栈等基础上的更复杂结构。张三链表掌握度（0.85）高，但栈（0.78）、队列（0.72）略有下降，可能暗示在运用这些基础结构构建树（如二叉树遍历需要栈/队列思想）时出现知识链条断裂。其“稳健型”学习风格和“潜力评级A级”与当前薄弱点形成反差，更指向特定知识链缺口而非能力不足。",
                "引用知识库条目": "前序知识缺失（知识建构理论）：典型表现包括基础题频繁出错、需要频繁回顾前置内容、知识链条断裂感明显。"
              }
            ]
          },
          {
            "识别出的关键问题": "课堂参与频率低（0.45）且趋势持续下降，与高潜力（A级）和高知识迁移能力（0.75）不匹配",
            "归因分析": [
              {
                "归因原因": "教学节奏或内容深度与张三的“稳健型”学习风格及高敏锐度可能不适配",
                "理论依据": "差异化教学理论",
                "典型表现": "课堂参与频率仅0.45且趋势持续下降（SPI趋势从0.72降至0.51），但挑战偏好为0.62（中等偏上），说明他并非回避挑战，可能因课堂节奏过快/过慢或讲解方式与其“稳健型”风格（偏好扎实、循序渐进）不符，导致参与动力下降，课后需要更多自我补习（可能反映在作业平均分0.73尚可，但课堂即时参与低）。",
                "引用知识库条目": "教学节奏不适配（差异化教学理论）：典型表现包括课堂参与度逐渐下降、课后需要大量补习、对课堂内容反应滞后。"
              }
            ]
          },
          {
            "识别出的关键问题": "在薄弱知识点（树、图）上练习密度或针对性练习可能不足",
            "归因分析": [
              {
                "归因原因": "针对抽象复杂结构的技能练习不足，导致“理解”无法转化为“熟练应用”",
                "理论依据": "技能习得理论",
                "典型表现": "张三答题稳定性高（0.82），说明其习惯的解题模式稳定，但在树（0.55）、图（0.48）上得分低，且SPI持续下降，可能表现为面对这些需要大量练习才能内化的抽象结构时，解题速度慢、需提示或无法独立完成复杂题目，尽管他可能理解基本概念（知识迁移率0.75）。",
                "引用知识库条目": "练习密度不足（技能习得理论）：典型表现包括理解概念但无法独立完成题目、解题速度明显偏慢、需要提示才能继续。"
              }
            ]
          }
        ],
        "综合评价与建议": [
          {
            "建议模板": "针对抽象数据结构（树、图）掌握困难的问题，推荐你尝试将树和图的操作与已知的链表、栈/队列进行对比和关联练习，这有助于利用你较高的知识迁移能力，降低新知识的抽象度，构建更连贯的知识网络。",
            "对应问题": "概念抽象性过高、前序知识衔接不畅"
          },
          {
            "建议模板": "建议重点关注课堂参与度持续下降的模块，可以尝试课前预习树/图的关键概念，并带着具体问题（如递归遍历的实现细节）参与课堂讨论或提问，这有助于让你的‘稳健型’学习风格提前适应课堂节奏，提升课堂学习的针对性和投入度。",
            "对应问题": "教学节奏不适配"
          },
          {
            "建议模板": "针对树和图算法练习不足的问题，推荐你尝试进行分步骤、高重复性的专项练习（如二叉树的各种遍历代码反复手写），这有助于将抽象的结构知识转化为稳定的程序性技能，提高解题的熟练度和自信心。",
            "对应问题": "练习密度不足"
          }
        ]
      }
    },
    "三、行为趋势与预警": {
      "干预建议": {
        "班级层面建议": [
          {
            "建议内容": "在树与二叉树章节教学中，系统引入‘数据结构家族树’可视化工具，将树结构类比为家族关系（根节点如祖父，子节点如父辈，叶节点如孙辈），并动态演示二叉树遍历过程（如先序遍历像‘家族聚会点名’）。",
            "对应归因": "概念抽象性过高导致认知负荷超载",
            "策略来源": "类比教学法、可视化呈现",
            "实施要点": "1. 课前制作‘数据结构家族树’动画，将树节点标注为家庭成员角色；2. 课堂演示时，用不同颜色高亮显示遍历路径；3. 引导学生对比链表（线性关系）与树（分支关系）的异同。"
          },
          {
            "建议内容": "设计‘前序知识衔接小测验’，在讲授树结构前，通过5分钟选择题快速检测指针、递归、栈/队列的应用掌握情况，并根据结果分组进行针对性回顾练习。",
            "对应归因": "前序知识（如指针、递归）可能存在薄弱环节，影响树结构的知识建构",
            "策略来源": "知识建构理论",
            "实施要点": "1. 测验包含指针操作、递归调用栈、队列模拟等基础题；2. 按测验得分分组，低分组由助教带领复习基础代码片段；3. 高分组尝试用栈实现递归遍历的模拟。"
          },
          {
            "建议内容": "采用‘分层任务卡’课堂练习模式，针对树遍历、图搜索等难点，提供基础版（填空代码）、进阶版（补全算法）、挑战版（独立设计）三档任务，学生根据自身节奏选择完成。",
            "对应归因": "教学节奏或内容深度与‘稳健型’学习风格及高敏锐度可能不适配",
            "策略来源": "差异化教学理论",
            "实施要点": "1. 每类任务明确标注所需前置知识；2. 允许学生在课堂中切换任务档位；3. 教师巡回指导时，重点观察选择基础版的学生是否存在知识链断裂。"
          }
        ],
        "个体层面建议": [
          {
            "建议内容": "为张三定制‘树结构代码脚手架’练习包，将二叉树遍历分解为‘节点定义-递归框架-访问操作’三步，每步提供部分代码模板和测试用例，要求其反复补全并运行验证。",
            "对应归因": "针对抽象复杂结构的技能练习不足，导致‘理解’无法转化为‘熟练应用’",
            "策略来源": "技能习得理论",
            "实施要点": "1. 练习包包含10组渐进式题目，每组需手写代码3遍；2. 设置计时任务，记录每次完成时间；3. 提供链表遍历代码作为对比参考，强化知识迁移。"
          },
          {
            "建议内容": "安排张三参与‘课堂概念映射员’角色，在树结构课程中负责将教师讲解的抽象术语（如‘度’、‘深度’）对应到可视化动画中的具体部分，并每周提交一份‘概念生活化案例’笔记（如用公司组织架构图解释树层次）。",
            "对应归因": "概念抽象性过高导致认知负荷超载；课堂参与频率低",
            "策略来源": "可视化呈现、生活化案例引入",
            "实施要点": "1. 课前提供动画素材和术语列表；2. 课中指定其操作动画演示工具；3. 笔记需包含至少2个自创的生活类比，并标注与代码实现的关联点。"
          },
          {
            "建议内容": "与张三签订‘薄弱点突破合约’，每周完成3次‘树图专项练习’，每次包含：1道递归遍历手写（限时5分钟）、1道图邻接表构建（联系链表知识）、1道综合应用题（如二叉树查找树验证）。练习后立即进行错因自评（标注‘前序知识不足’或‘练习不熟’）。",
            "对应归因": "前序知识衔接不畅；练习密度不足",
            "策略来源": "知识建构理论、技能习得理论",
            "实施要点": "1. 合约明确练习频率和自评要求；2. 提供错题归类模板，引导其识别知识链断裂点；3. 每周教师复核自评结果，针对性补充前置知识微课。"
          }
        ]
      }
    },
    "四、个性化学习建议": {
      "润色后评价": {
        "班级层面评价与建议": [
          {
            "评价": "在概念理解方面，班级整体展现出对数据结构逻辑关系的好奇心与探索潜力，同时对于高度抽象的概念，如树与二叉树的结构，还存在认知负荷较高的提升空间。",
            "建议": "目前班级对抽象结构的理解处于初步建构阶段，相信通过引入‘数据结构家族树’可视化工具，将树结构类比为生动的家族关系（如根节点类比祖父），并动态演示遍历过程（如先序遍历像‘家族聚会点名’），可以进一步降低认知门槛，促进形象化理解。实施时，可课前制作动画，课中用颜色高亮路径，并引导学生对比链表与树的异同，以强化分支关系的认知。"
          },
          {
            "评价": "在知识衔接方面，同学们已具备线性结构的基础，展现出良好的知识迁移意识，同时对于树结构所依赖的前序知识（如指针、递归）可能存在薄弱环节，影响了新知识的顺利建构。",
            "建议": "目前知识链的连贯性有待加强，相信通过设计‘前序知识衔接小测验’，在讲授树结构前进行5分钟快速检测，并根据结果分组进行针对性回顾练习，可以进一步夯实基础，扫清学习障碍。实施时，测验可涵盖指针、递归、栈/队列应用；低分组由助教带领复习基础代码，高分组可尝试用栈模拟递归遍历，实现差异化巩固。"
          },
          {
            "评价": "在教学节奏适配方面，班级呈现出多元的学习风格与敏锐度，展现出较强的学习适应性潜力，同时统一的课堂节奏与内容深度可能尚未完全兼顾每位同学的最优学习路径。",
            "建议": "目前课堂练习的个性化程度有提升空间，相信通过采用‘分层任务卡’模式，针对树遍历、图搜索等难点提供基础版（填空）、进阶版（补全）、挑战版（设计）三档任务，让学生根据自身节奏选择完成，可以进一步激发每位同学的潜能。实施时，每类任务需明确前置知识，允许课堂中灵活切换档位，教师可重点观察选择基础版的同学，确保知识链的完整性。"
          }
        ],
        "个体层面评价与建议（以张三为例）": [
          {
            "评价": "在知识应用转化方面，你对树结构的理解已展现出清晰的逻辑思维，同时将理解转化为熟练的代码实现能力，还有通过针对性练习来加强的提升空间。",
            "建议": "目前你在抽象结构的技能应用上处于理解向熟练过渡的阶段，相信通过定制‘树结构代码脚手架’练习包，将二叉树遍历分解为‘节点定义-递归框架-访问操作’三步，并提供部分代码模板与测试用例供反复补全验证，可以进一步促进技能的内化与自动化。实施时，练习包可包含10组渐进题目，设置计时任务记录进步，并提供链表遍历代码作为对比，强化知识迁移。"
          },
          {
            "评价": "在课堂参与与概念建构方面，你具备将抽象概念与具体事物关联的潜力，同时对于高抽象度的术语，可能存在认知负荷较高、课堂参与频率可进一步提升的空间。",
            "建议": "目前你对抽象术语的具象化联系处于发展期，相信通过担任‘课堂概念映射员’，在课程中负责将教师讲解的术语（如‘度’、‘深度’）对应到可视化动画的具体部分，并每周提交一份‘概念生活化案例’笔记（如用公司组织架构图解释树层次），可以进一步降低认知负荷，提升学习投入度。实施时，课前可提供素材与术语列表，课中指定你操作演示工具，笔记要求包含自创类比并标注与代码的关联。"
          },
          {
            "评价": "在知识巩固与练习策略方面，你已意识到练习的重要性，并展现出突破薄弱点的意愿，同时在练习的系统性、密度以及与前置知识的衔接上，还有通过结构化计划来优化的空间。",
            "建议": "目前你在知识链的巩固与熟练度上处于持续积累阶段，相信通过签订‘薄弱点突破合约’，每周完成3次‘树图专项练习’（包括递归遍历手写、图邻接表构建、综合应用），并立即进行错因自评（标注‘前序知识不足’或‘练习不熟’），可以进一步实现针对性突破。实施时，合约需明确频率与自评要求，提供错题归类模板帮你识别断裂点，教师每周复核并补充针对性微课，形成学习闭环。"
          }
        ]
      }
    },
    "五、建议依据说明": {
      "自评报告": {
        "归因分析溯源": {
          "班级层面归因溯源": [
            {
              "生成内容中的归因": "在概念理解方面，班级整体展现出对数据结构逻辑关系的好奇心与探索潜力，同时对于高度抽象的概念，如树与二叉树的结构，还存在认知负荷较高的提升空间。",
              "对应的知识库条目": "知识库条目1.1：学生认知负荷理论。该条目指出，处理高度抽象、信息量大或结构复杂的新概念时，学生的认知负荷会显著增加，影响理解效率。此处归因直接应用了该理论，将‘树与二叉树’识别为高抽象度概念，并指出其导致的‘认知负荷较高’问题。"
            },
            {
              "生成内容中的归因": "在知识衔接方面，同学们已具备线性结构的基础，展现出良好的知识迁移意识，同时对于树结构所依赖的前序知识（如指针、递归）可能存在薄弱环节，影响了新知识的顺利建构。",
              "对应的知识库条目": "知识库条目1.3：知识建构的连贯性原理。该条目强调，新知识的有效学习依赖于对相关前序知识的牢固掌握，前序知识的薄弱会形成‘知识链断裂点’。此处归因识别了‘指针、递归’作为关键前序知识，并指出其薄弱是影响‘新知识顺利建构’的直接原因。"
            },
            {
              "生成内容中的归因": "在教学节奏适配方面，班级呈现出多元的学习风格与敏锐度，展现出较强的学习适应性潜力，同时统一的课堂节奏与内容深度可能尚未完全兼顾每位同学的最优学习路径。",
              "对应的知识库条目": "知识库条目1.2：学习者个体差异理论。该条目说明，学生在学习风格、知识基础、接受速度上存在显著差异，统一的教学节奏难以满足所有学生的需求。此处归因应用了该理论，从‘多元的学习风格与敏锐度’出发，推导出统一教学节奏与个性化需求之间的矛盾。"
            }
          ],
          "个体层面归因溯源（以张三为例）": [
            {
              "生成内容中的归因": "在知识应用转化方面，你对树结构的理解已展现出清晰的逻辑思维，同时将理解转化为熟练的代码实现能力，还有通过针对性练习来加强的提升空间。",
              "对应的知识库条目": "知识库条目2.1：知识技能转化阶段模型。该模型将技能掌握分为理解、应用、熟练、自动化等阶段，并指出从‘理解’到‘熟练应用’需要大量针对性练习。此处归因将学生状态定位在‘理解清晰’但‘代码实现’未达熟练，符合该模型描述的中间过渡阶段特征。"
            },
            {
              "生成内容中的归因": "在课堂参与与概念建构方面，你具备将抽象概念与具体事物关联的潜力，同时对于高抽象度的术语，可能存在认知负荷较高、课堂参与频率可进一步提升的空间。",
              "对应的知识库条目": "知识库条目2.2：具象化认知与参与度关联。该条目指出，学生对高抽象术语的认知负荷会降低其课堂互动意愿和频率，而建立具象化关联是降低负荷、提升参与的有效途径。此处归因将‘高抽象度术语’与‘认知负荷较高’及‘参与频率’下降联系起来，直接应用了该关联原理。"
            },
            {
              "生成内容中的归因": "在知识巩固与练习策略方面，你已意识到练习的重要性，并展现出突破薄弱点的意愿，同时在练习的系统性、密度以及与前置知识的衔接上，还有通过结构化计划来优化的空间。",
              "对应的知识库条目": "知识库条目2.3：练习的有效性要素。该条目强调，有效的练习需具备系统性（有计划）、足够密度（高频次）和针对性（衔接薄弱点与前置知识），缺乏结构化计划会导致练习低效。此处归因从学生‘有意愿但效果不足’的现象出发，归因到练习在‘系统性、密度、衔接’等有效性要素上的缺失。"
            }
          ]
        },
        "建议生成溯源": {
          "班级层面建议溯源": [
            {
              "生成内容中的建议": "目前班级对抽象结构的理解处于初步建构阶段，相信通过引入‘数据结构家族树’可视化工具，将树结构类比为生动的家族关系（如根节点类比祖父），并动态演示遍历过程（如先序遍历像‘家族聚会点名’），可以进一步降低认知门槛，促进形象化理解。实施时，可课前制作动画，课中用颜色高亮路径，并引导学生对比链表与树的异同，以强化分支关系的认知。",
              "对应的策略库条目": "策略库条目A.1：可视化与类比教学法。该策略主张利用可视化工具和生动类比（如家族关系），将抽象概念具象化，以降低认知负荷。本建议的核心‘家族树’工具和‘家族聚会点名’类比，以及‘颜色高亮路径’的动态演示，均直接源自此策略。附加的‘对比异同’活动则参考了策略库条目A.3（对比辨析法）以深化理解。"
            },
            {
              "生成内容中的建议": "目前知识链的连贯性有待加强，相信通过设计‘前序知识衔接小测验’，在讲授树结构前进行5分钟快速检测，并根据结果分组进行针对性回顾练习，可以进一步夯实基础，扫清学习障碍。实施时，测验可涵盖指针、递归、栈/队列应用；低分组由助教带领复习基础代码，高分组可尝试用栈模拟递归遍历，实现差异化巩固。",
              "对应的策略库条目": "策略库条目A.2：诊断性前测与差异化复习。该策略的核心是使用前测诊断前序知识掌握情况，并依据结果进行分组差异化教学与复习。本建议的‘前序知识衔接小测验’、‘根据结果分组’、‘低分组复习基础’、‘高分组尝试进阶’完整体现了该策略的流程。‘用栈模拟递归’的进阶任务则融合了策略库条目B.2（知识迁移与变式练习）。"
            },
            {
              "生成内容中的建议": "目前课堂练习的个性化程度有提升空间，相信通过采用‘分层任务卡’模式，针对树遍历、图搜索等难点提供基础版（填空）、进阶版（补全）、挑战版（设计）三档任务，让学生根据自身节奏选择完成，可以进一步激发每位同学的潜能。实施时，每类任务需明确前置知识，允许课堂中灵活切换档位，教师可重点观察选择基础版的同学，确保知识链的完整性。",
              "对应的策略库条目": "策略库条目A.3：分层任务与自主选择。该策略旨在通过设计不同难度的分层任务（如基础、进阶、挑战），并允许学生根据自身情况选择，实现个性化学习路径。本建议的‘分层任务卡’、‘三档任务’、‘根据自身节奏选择’是其直接应用。‘明确前置知识’和‘教师重点观察基础版同学’则参考了策略库条目A.2中的针对性支持理念。"
            }
          ],
          "个体层面建议溯源（以张三为例）": [
            {
              "生成内容中的建议": "目前你在抽象结构的技能应用上处于理解向熟练过渡的阶段，相信通过定制‘树结构代码脚手架’练习包，将二叉树遍历分解为‘节点定义-递归框架-访问操作’三步，并提供部分代码模板与测试用例供反复补全验证，可以进一步促进技能的内化与自动化。实施时，练习包可包含10组渐进题目，设置计时任务记录进步，并提供链表遍历代码作为对比，强化知识迁移。",
              "对应的策略库条目": "策略库条目B.1：脚手架式技能训练。该策略强调将复杂技能分解为可控步骤（如本建议的‘三步分解’），提供部分模板（‘代码脚手架’）和支持（‘测试用例’），让学生在支撑下练习直至独立完成。‘渐进题目’、‘计时任务’体现了策略库条目B.3（刻意练习与反馈）的原则。‘提供链表代码对比’则再次应用了策略库条目A.3（对比辨析法）。"
            },
            {
              "生成内容中的建议": "目前你对抽象术语的具象化联系处于发展期，相信通过担任‘课堂概念映射员’，在课程中负责将教师讲解的术语（如‘度’、‘深度’）对应到可视化动画的具体部分，并每周提交一份‘概念生活化案例’笔记（如用公司组织架构图解释树层次），可以进一步降低认知负荷，提升学习投入度。实施时，课前可提供素材与术语列表，课中指定你操作演示工具，笔记要求包含自创类比并标注与代码的关联。",
              "对应的策略库条目": "策略库条目B.2：角色扮演与产出式学习。该策略通过赋予学生特定角色（如‘概念映射员’）和产出任务（如‘提交案例笔记’），促使其主动加工和输出知识，从而加深理解、提升参与。本建议的核心角色与任务设计直接源于此。‘自创类比’要求进一步强化了策略库条目A.1（类比教学法）中的学生主动建构环节。"
            },
            {
              "生成内容中的建议": "目前你在知识链的巩固与熟练度上处于持续积累阶段，相信通过签订‘薄弱点突破合约’，每周完成3次‘树图专项练习’（包括递归遍历手写、图邻接表构建、综合应用），并立即进行错因自评（标注‘前序知识不足’或‘练习不熟’），可以进一步实现针对性突破。实施时，合约需明确频率与自评要求，提供错题归类模板帮你识别断裂点，教师每周复核并补充针对性微课，形成学习闭环。",
              "对应的策略库条目": "策略库条目B.3：元认知与契约式学习。该策略结合了元认知训练（错因自评、错题归类）和契约学习法（签订合约），帮助学生明确目标、监控过程、反思原因，形成自主学习闭环。本建议的‘合约’、‘错因自评’、‘错题归类模板’、‘学习闭环’是其典型体现。‘专项练习’的内容设计则呼应了策略库条目B.1（针对性技能训练）。"
            }
          ]
        },
        "话术润色溯源": {
          "评价话术模板": "评价话术模板：'在[能力/领域]方面，[对象]已展现出/具备[积极表现或潜力]，同时对于[具体挑战点]，还存在[待提升方面]的提升空间。' 此模板用于结构化评价，先肯定优势或潜力，再指出具体挑战和提升方向，符合鼓励性、发展性评价原则。生成内容中所有‘评价’部分均严格遵循此模板结构。",
          "建议话术模板": "建议话术模板：'目前[对象]在[领域]上处于[发展阶段描述]，相信通过[具体策略/方法名称]，[简要说明策略如何操作]，可以进一步[预期效果]。实施时，[补充1-2个关键操作细节]。' 此模板用于提出具体、可操作、有预期的建议。生成内容中所有‘建议’部分均采用此模板，确保了建议的清晰度和可执行性。",
          "衔接与语气": "使用了'相信通过...可以进一步...'等表达，体现支持性与发展性视角，而非指令性语气，符合现代教育评价的引导性话语风格。"
        },
        "一致性评估结论": {
          "结论": "生成内容在归因、建议、话术三个层面与预设知识库、策略库、话术模板保持了高度一致性，所有生成项均有明确的溯源依据，逻辑自洽，可解释性强。",
          "具体表现": "1. **归因一致性**：每条归因均准确对应知识库中关于认知负荷、知识连贯性、个体差异、技能转化阶段、具象化认知、练习有效性等核心理论条目，分析精准。\n2. **建议一致性**：每条建议的核心策略均源自策略库，如可视化类比、诊断前测、分层任务、脚手架训练、角色扮演、元认知契约等，并进行了合理的组合与情境化扩展。\n3. **话术一致性**：评价与建议的表述严格遵循既定的话术模板，结构统一，语气得当，体现了专业性、鼓励性和可操作性。\n4. **内在逻辑一致性**：针对每个归因点（如‘认知负荷高’），都给出了直接对应的策略建议（如‘可视化类比降低负荷’），形成了‘问题归因-策略应对’的紧密闭环，无矛盾或脱节之处。"
        }
      }
    },
    "备注": "本建议基于教育评价知识库生成，可根据实际情况调整"
  }
}

// 格式化建议为HTML
const formatProfileSuggestionToHtml = (data) => {
  let html = '';

  // 学生画像摘要
  if (data['👤 学生画像摘要']) {
    html += '<div class="suggestion-section">';
    html += '<h4>👤 学生画像摘要</h4>';
    html += `<p>${data['👤 学生画像摘要']}</p>`;
    html += '</div>';
  }

  // 知识点掌握分析
  if (data['📚 知识点掌握分析']) {
    html += '<div class="suggestion-section">';
    html += '<h4>📚 知识点掌握分析</h4>';

    if (data['📚 知识点掌握分析']['优势领域（掌握率 ≥80%）']) {
      html += '<p><strong>✅ 优势领域：</strong></p><ul>';
      data['📚 知识点掌握分析']['优势领域（掌握率 ≥80%）'].forEach(item => {
        html += `<li>${item}</li>`;
      });
      html += '</ul>';
    }

    if (data['📚 知识点掌握分析']['薄弱环节（掌握率 ≤50%）']) {
      html += '<p><strong>⚠️ 薄弱环节：</strong></p><ul>';
      data['📚 知识点掌握分析']['薄弱环节（掌握率 ≤50%）'].forEach(item => {
        html += `<li><strong>${item.知识点}</strong> (${item.掌握率}) - ${item.可能原因}</li>`;
      });
      html += '</ul>';
    }
    html += '</div>';
  }

  // 行为与趋势预警
  if (data['⚠️ 行为与趋势预警']) {
    html += '<div class="suggestion-section">';
    html += '<h4>⚠️ 行为与趋势预警</h4>';
    html += '<ul>';
    data['⚠️ 行为与趋势预警'].forEach(item => {
      html += `<li>${item}</li>`;
    });
    html += '</ul>';
    html += '</div>';
  }

  // 个性化优化建议
  if (data['🎯 个性化优化建议']) {
    html += '<div class="suggestion-section">';
    html += '<h4>🎯 个性化优化建议</h4>';

    if (data['🎯 个性化优化建议']['给学生的建议']) {
      html += '<p><strong>📝 给学生的建议：</strong></p><ol>';
      data['🎯 个性化优化建议']['给学生的建议'].forEach(item => {
        html += `<li>${item}</li>`;
      });
      html += '</ol>';
    }

    if (data['🎯 个性化优化建议']['给教师/助教的建议']) {
      html += '<p><strong>👨‍🏫 给教师/助教的建议：</strong></p><ol>';
      data['🎯 个性化优化建议']['给教师/助教的建议'].forEach(item => {
        html += `<li>${item}</li>`;
      });
      html += '</ol>';
    }
    html += '</div>';
  }

  return html;
};

// 计算属性
const formattedProfileSuggestion = computed(() => {
  if (!profileSuggestionText.value) return '';
  if (profileSuggestionText.value.includes('<div>')) {
    return profileSuggestionText.value;
  }
  try {
    const data = JSON.parse(profileSuggestionText.value);
    return formatProfileSuggestionToHtml(data);
  } catch {
    return profileSuggestionText.value.replace(/\n/g, '<br>');
  }
});

// 模拟流式输出
const mockProfileStreamOutput = async () => {
  isStreaming.value = true;
  profileSuggestionText.value = '';

  const jsonString = JSON.stringify(mockStudentProfileData, null, 2);
  const chunks = jsonString.split('');

  for (let i = 0; i < chunks.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 10));
    profileSuggestionText.value += chunks[i];
  }

  isStreaming.value = false;
};

// 重新生成
const regenerateProfile = async () => {
  await mockProfileStreamOutput();
  ElMessage.success('学生画像已重新生成');
};

// 钩子函数用来刷新后重新获取数据

onMounted(() => {
  const storedUserInfo = sessionStorage.getItem('users');
  if (storedUserInfo) {
    const userInfo = JSON.parse(storedUserInfo);

    // 更新用户信息到 Pinia

    profileStore.setProfileInfo(
      userInfo.username,
      userInfo.rolename,
      userInfo.catelog,
      userInfo.homeurl,
      userInfo.token,
      userInfo.currentterm
    );
    loginInfo.username = profileStore.profilename;
    loginInfo.rolename = profileStore.profilerolename;
    loginInfo.catelog = profileStore.profilecatelog;
  } else {
    // 如果没有存储的用户信息，可以重定向到登录页面或显示提示信息

    sessionStorage.removeItem('users');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('token');
    router.push({ name: 'Login' });
  }

  // 获取完 Pinia 中的数据后重新重定向到父页面
  router.push(homeurl.value);

  // 获取菜单栏的数据
  request.admin
    .post('/homes/studenthome')
    .then(res => {
      // 登录成功
      if (res.code === 200) {
        menus.value = res.data;
      }
    })
    .catch(error => {
      // 获取失败

      ElMessage({
        type: 'error',
        message: '获取导航失败'
      });
    });
  mockProfileStreamOutput();
});
</script>
<style lang="less" scoped>
.wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  flex-wrap: nowrap;

  .item {
    font-family: monospace;
    /* 等宽字体 */
    font-size: 16px;
    margin-bottom: 30px;
    height: 35px;
    line-height: 35px;
    width: 100%;
    cursor: pointer;
    text-align: center;
    color: #fff;
    font-weight: 400;
    transition: background-color 0.5s ease, color 0.5s ease;

    &:hover {
      background-color: #2ecc71;
      /* 悬停时背景颜色 */
      color: #ecf0f1;
      /* 悬停时文字颜色 */
    }
  }
}

:deep(.el-container) {
  background-color: rgb(238, 247, 255);
}

:deep(.el-sub-menu__title),
:deep(.el-menu-item) {
  font-size: 16px;

  &:hover {
    background-color: #eee;
  }
}

:deep(.el-sub-menu.is-opened .el-menu-item) {
  background-color: #e5e5e5;

  &:hover {
    background-color: #eee;
  }
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(212, 240, 255, 1) !important;
}

.header {
  width: 100%;
  height: 100%;
  background: url('@/assets/images/redraw-images/bg2.png') 100% no-repeat;
  background-size: 100% 100%;

  :deep(.el-avatar):hover {
    outline: none !important;
  }
}

.customTooltip * {
  color: #4a4a4a;
  font-size: 18px;
}

.customTooltip .introjs-tooltip-title {
  color: #0a41c9;
}

.instrutor {
  position: absolute;
  z-index: 999;
  width: 160px;
  height: 55px;
  padding: 0 20px;
  text-align: center;
  line-height: 55px;
}

// .childtitleBox,
// .titleBox {
//   width: 177px;
//   height: 60px;
//   // margin: 0 auto;
//   position: absolute;
//   left: 0;
// }

// .childtitleBox {
//   left: 20px;
// }

.layout-container-demo .el-header {
  position: relative;
  color: var(--el-text-color-primary);
}

.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}

.layout-container-demo .el-menu {
  border-right: none;
}

.layout-container-demo .el-main {
  padding: 0;
}

.layout-container-demo .toolbar {
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader img,
.avatar-uploader .avatar-uploader-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 确保图片覆盖整个区域 */
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.drop-down-icon {
  transition: transform 0.2s ease;
  outline: none;
  cursor: pointer;
}
.student-profile-container {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: white;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.profile-content {
  padding: 16px;
}

.suggestion-box {
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.7;
  color: #2c3e50;
  text-align: left;
}

.suggestion-content {
  white-space: pre-wrap;
  word-break: break-word;
  text-align: left;
}

.suggestion-content :deep(.suggestion-section) {
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.suggestion-content :deep(h4) {
  margin: 0 0 10px 0;
  color: #0064B1;
  font-size: 16px;
  font-weight: bold;
  text-align: left;
}

.suggestion-content :deep(p) {
  margin: 8px 0;
  line-height: 1.6;
  text-align: left;
}

.suggestion-content :deep(ul),
.suggestion-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
  text-align: left;
}

.suggestion-content :deep(li) {
  margin: 4px 0;
  text-align: left;
}

.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 20px;
  background-color: #0064B1;
  margin-left: 4px;
  animation: blink 1s infinite;
  vertical-align: middle;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
