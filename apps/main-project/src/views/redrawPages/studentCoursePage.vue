<template>
  <div style="height: 100vh; background-color: rgb(238, 247, 255); min-width: 100vw">
    <el-container class="layout-container-demo" style="height: 100%">
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
                  ">{{ courseChineseName }}</span>
              </div>
              <div class="right flex justify-center items-center" style="height: 100%">
                <div @click="handleCourseSelect" class="jump-course-select" style="">
                  返回课堂列表
                </div>
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
                  <!-- <el-dropdown @visible-change="handleVisibleChange">
                    <img
                      style="margin-left: 37px; width: 26px; height: 26px"
                      referrerpolicy="no-referrer"
                      src="@/assets/images/redraw-images/dropdown.png"
                    />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item>查看详情</el-dropdown-item>
                        <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown> -->
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
            <el-text style="font-size: calc(1vw + 10px); color: white; margin-left: 10px"
              >{{ courseChineseName }}
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
          <!-- 使用 el-scrollbar 包裹 el-menu，设置高度为 70% -->

          <!--页面左侧导航栏-->
          <div style="height: 100%; position: relative">
            <div v-if="isSHow" class="instrutor"></div>
            <el-scrollbar>
              <el-menu :default-active="defaultActive">
                <template v-for="menu in filteredMenus">
                  <el-sub-menu v-if="hasChildren(menu)" :index="menu.id" :key="menu.id"
                    style="border-top: 1px solid #efefef; overflow: hidden; display: inline-block">
                    <template #title>
                      <img style="vertical-align: baseline" src="@/assets/images/studentpage/course.png"
                        class="course-icon" />
                      <span style="font-size: 17px">{{ menu.name }}</span>
                    </template>
                    <el-menu-item v-for="child in getChildrenMenus(menu)" :index="child.url" :key="child.id"
                      style="border-top: 1px solid #efefef" @click="navigateTo(child.url)">
                      <img style="vertical-align: middle" src="@/assets/images/studentpage/course.png"
                        class="course-icon" />
                      <span style="font-size: 17px">{{ child.name }}</span>
                    </el-menu-item>
                  </el-sub-menu>
                  <el-menu-item v-else :index="menu.url" :key="menu.id" @click="navigateTo(menu.url)"
                    style="border-top: 1px solid #efefef">
                    <img style="vertical-align: middle" src="@/assets/images/studentpage/course.png"
                      class="course-icon" />
                    <span style="font-size: 17px">{{ menu.name }}</span>
                  </el-menu-item>
                </template>
              </el-menu>
            </el-scrollbar>
          </div>
          <!-- <div style="height: calc(92vh - 150px)">
            <el-scrollbar>
              <el-menu :default-active="defaultActive">
                <template v-for="menu in filteredMenus">
                  <el-sub-menu
                    v-if="hasChildren(menu)"
                    :index="menu.id"
                    :key="menu.id"
                    style="border-top: 1px solid #efefef"
                  >
                    <template #title>
                      <span>{{ menu.name }}</span>
                    </template>
                    <el-menu-item
                      v-for="child in getChildrenMenus(menu)"
                      :index="child.url"
                      :key="child.id"
                      style="border-top: 1px solid #efefef"
                      @click="navigateTo(child.url)"
                    >
                      <span>{{ child.name }}</span>
                    </el-menu-item>
                  </el-sub-menu>
                  <el-menu-item
                    v-else
                    :index="menu.url"
                    :key="menu.id"
                    @click="navigateTo(menu.url)"
                    style="border-top: 1px solid #efefef"
                  >
                    <span>{{ menu.name }}</span>
                  </el-menu-item>
                </template>
              </el-menu>
            </el-scrollbar>
          </div> -->
        </el-aside>

        <el-main style="-ms-overflow-style: none; /* IE 和 Edge */ scrollbar-width: none; /* Firefox */">
          <!-- 在 el-main 区域显示路由组件 -->
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
import { ref, reactive, computed, onMounted, toRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '@/utils/request.js';
import '@/assets/css/taildwind.css';
import { ElMessage } from 'element-plus';
import { Menu as IconMenu, Message, Setting, Plus, Platform, Right } from '@element-plus/icons-vue';
import type { UploadProps } from 'element-plus';
import { useProfileStore } from '@/stores/profileStore.js';

//获取Stroe
const profileStore = useProfileStore();

const defaultActive = ref('');
const router = useRouter(); // 获取路由实例
const route = useRoute();
const courseChineseName = ref('');

// 清除登录信息的方法
function clearLoginInfo() {
  // 清除其他可能存储的信息
  sessionStorage.removeItem('users');
  sessionStorage.removeItem('isLoggedIn');
}

//登出的方法

const handleLogout = () => {
  clearLoginInfo();
  router.push({ name: 'Login' });
};

// 默认显示菜单
// const defaultActive = ref('');

const menus = ref([]);

const loginInfo = reactive({
  username: profileStore.profilename,
  rolename: profileStore.profilerolename,
  catelog: profileStore.profilecatelog,
  currentterm: profileStore.currentterm
});

//0310将homeurl修改为响应式计算属性，这样下面的profileStore中的值变了这边也会自动变，解决拼接地址存在问题情况

const homeurl = computed(() => profileStore.profilehomeurl);
const excludedPids = ['0', '102'];

//过滤器
const filteredMenus = computed(() => {
  return (
    menus.value
      .filter(menu => !excludedPids.includes(menu.pid))
      //0311加入菜单按顺序排列
      .sort((a, b) => a.orderno - b.orderno)
  );
});

//过滤节点是否有孩子节点
const hasChildren = menu => {
  // console.log(menu);
  if (menu.children && menu.children.length > 0) return true;
  return false;
};
//获取节点的孩子节点
const getChildrenMenus = menu => {
  return menu.children;
};
//路由导航
const navigateTo = url => {
  //前面拼一个/表示绝对路径
  console.log(homeurl.value + url);
  router.push('/homes/studentcourses' + url);
};

const getmenu = () => {
  request.admin
    .post(`/homes/studentmenu`)
    .then(res => {
      console.log(res);
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
// 跳转到课程选择
const handleCourseSelect = () => {
  // /homes/studenthome
  router.push('/homes/studenthome');
};

const handleVisibleChange = (visible) => {
  const dropDown = document.querySelector('.drop-down-icon');
  if (visible) dropDown.style.transform = 'rotate(180deg)';
  else {
    dropDown.style.transform = 'rotate(0deg)';
  }
}

//钩子函数用来刷新后重新获取数据

onMounted(() => {
  courseChineseName.value = <string>route.query.courseChineseName || '未提供课程名称';
  getmenu();
});
</script>

<style scoped>
.header {
  position: relative;
  left: auto;
  top: auto;
  transform: none;
  width: 100%;
  height: 100%;
  background: url('@/assets/images/redraw-images/bg2.png') 100% no-repeat;
  background-size: 100% 100%;
}

.header .inner {
  width: min(78.125rem, calc(100vw - 3rem)) !important;
  max-width: 100%;
  gap: 24px;
}

.header .icon {
  min-width: 0;
  flex: 1;
  justify-content: flex-start;
}

.header .icon .term {
  width: auto !important;
  max-width: 34vw;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header .right {
  min-width: 0;
  flex: 0 1 auto;
}

.header .right > img {
  flex: 0 0 auto;
}

.mainner {
  min-width: 0;
  max-width: min(26.875rem, 42vw);
  gap: 10px;
}

.mainner .avatar {
  flex: 0 0 2.875rem;
  width: 2.875rem !important;
  height: 2.875rem !important;
  margin-left: 12px !important;
}

.mainner .text {
  min-width: 0;
  flex: 1 1 auto;
}

.group_4,
.top,
.bottom {
  min-width: 0;
}

.top span {
  display: block;
  width: auto !important;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bottom {
  justify-content: flex-start !important;
  flex-wrap: wrap;
  gap: 6px;
}

.bottom > div {
  width: auto !important;
  height: auto !important;
  max-width: 100%;
  overflow: visible !important;
  text-align: left !important;
  line-height: 1 !important;
}

.bottom :deep(.el-tag) {
  max-width: 100%;
  height: auto;
  min-height: 24px;
  white-space: normal;
  line-height: 18px;
  padding: 2px 8px;
}

.drop-down-icon {
  flex: 0 0 auto;
  margin-left: 8px !important;
}

.layout-container-demo > .el-container {
  width: min(78.125rem, calc(100vw - 3rem)) !important;
  max-width: 100%;
}

.layout-container-demo .el-main {
  min-width: 0;
  overflow-x: hidden;
}

@media (max-width: 900px) {
  .header .inner {
    width: calc(100vw - 1.5rem) !important;
    gap: 12px;
  }
  .header .icon img:nth-of-type(2) {
    display: none;
  }
  .header .icon .term {
    max-width: 28vw;
    margin-left: 8px !important;
    font-size: 20px !important;
  }
  .mainner {
    max-width: 58vw;
  }
  .mainner .avatar {
    margin-left: 8px !important;
    margin-right: 0 !important;
  }
  .layout-container-demo > .el-container {
    width: calc(100vw - 1.5rem) !important;
  }
}

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

.jump-course-select {
  white-space: nowrap;
  line-height: 31px;
  font-family: MicrosoftYaHei;
  margin-right: 10px;
  cursor: pointer;
  color: #0078cd;
}

.jump-course-select:hover {
  color: #0078cd;
}

.drop-down-icon {
  transition: transform 0.2s ease;
  outline: none;
  cursor: pointer;
}
</style>
