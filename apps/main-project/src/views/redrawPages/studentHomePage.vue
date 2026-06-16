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
                <span style="font-size: 22px; font-weight: bold; color: #0078cd; letter-spacing: 2px; white-space: nowrap;">数字产业学院教学平台</span>
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
</style>
