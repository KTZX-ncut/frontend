<template>
  <div class="page flex flex-col">
    <div class="section_1 flex-col relative">
      <div class="inner relative flex-col">
        <img
          class="image_1 absolute"
          referrerpolicy="no-referrer"
          src="@/assets/images/redraw-images/title.png"
        />
        <div class="absolute block_1 flex flex-row justify-between items-center">
          <div
            style="width: 11.25vw; color: rgba(39, 165, 255, 1);"
            @click="() => switchRole(loginForm.catelog, '1')"
            :class="
              loginForm.catelog === '1'
                ? 'text-wrapper_1 flex flex-col cursor-pointer justify-center items-center h-full'
                : 'flex all flex-row cursor-pointer justify-center items-center h-full'
            "
          >
            <span class="text_1">学生登录</span>
          </div>
          <div
            @click="() => switchRole(loginForm.catelog, '2')"
            style="width: 11.25vw; color: rgba(39, 165, 255, 1);"
            :class="
              loginForm.catelog === '2'
                ? 'text-wrapper_1 flex flex-col cursor-pointer justify-center items-center h-full'
                : 'flex all flex-row cursor-pointer justify-center items-center h-full'
            "
          >
            <span class="text_2">教师登录</span>
          </div>
        </div>
        <div v-if="!isText" class="wrapper absolute">
          <div class="login-pannel flex">
            <!--切换账号登录-->

            <el-form :model="loginForm" :rules="rules" ref="ruleFormRef" size="large">
              <el-form-item prop="loginname">
                <el-input
                  :prefix-icon="User"
                  placeholder="请输入用户名"
                  v-model="loginForm.loginname"
                  :rules="rules.loginname"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="pwd">
                <el-input
                  :prefix-icon="Lock"
                  placeholder="请输入密码"
                  v-model="loginForm.pwd"
                  :rules="rules.pwd"
                  show-password
                ></el-input>
              </el-form-item>
            </el-form>
          </div>

          <div @click="login" class="text-wrapper_2 flex flex-col cursor-pointer absolute">
            <span style="color: #0177cc" class="text_5 cursor-pointer">登录</span>
          </div>
          <img
            class="image_2 absolute"
            referrerpolicy="no-referrer"
            src="@/assets/images/redraw-images/bar.png"
          />
          <div
            class="text-wrapper_3 flex flex-col cursor-pointer justify-center items-center absolute"
          >
            <span
              @click="
                () => {
                  isText = !isText;
                }
              "
              class="text_6"
              style="color: #fff"
              >短信验证密码登录</span
            >
          </div>
          <span class="text_8 absolute">or</span>
        </div>

        <div v-else class="wrapper absolute">
          <div class="login-pannel flex">
            <!--切换账号登录-->

            <el-form :model="loginwithText" :rules="rules" ref="ruleFormRef" size="large">
              <el-form-item prop="phone">
                <el-input
                  :prefix-icon="Phone"
                  placeholder="请输入手机号"
                  v-model="loginwithText.telephone"
                >
                </el-input>
              </el-form-item>
              <el-form-item prop="captcha">
                <el-input
                  :prefix-icon="Message"
                  placeholder="请输入手机验证码"
                  v-model="loginwithText.message"
                >
                </el-input>
                <el-button class="text">获取短信验证码</el-button>

                <!-- 弹窗登录-->
              </el-form-item>
            </el-form>
          </div>

          <div @click="login" class="text-wrapper_2 flex flex-col cursor-pointer absolute">
            <span style="color: #0177cc" class="text_5">登录</span>
          </div>
          <img
            class="image_2 absolute"
            referrerpolicy="no-referrer"
            src="@/assets/images/redraw-images/bar.png"
          />

          <div
            @click="
              () => {
                isText = !isText;
              }
            "
            class="text-wrapper_3 flex flex-row cursor-pointer justify-center items-center absolute"
          >
            <span class="text_6" style="color: #fff">账号密码登录</span>
          </div>
          <span class="text_8 absolute">or</span>
        </div>
      </div>
      <span class="text_7 flex" style="color: #5581ad">北方工业大学&#64;2024版权所有</span>
    </div>

    <el-dialog
      class="role-dialog"
      :modelValue="showRoleModal"
      :show-close="false"
      :close-on-click-modal="false"
    >
      <template #header>
        <div class="role-dialog-title">选择角色</div>
      </template>
      <div v-if="roleStep === 1">
        <el-radio-group v-model="selectedRoleId" class="role-radio-group">
          <div class="role-option-list">
            <el-radio
              v-for="role in otherRoles"
              :key="getRoleOptionKey(role)"
              class="role-option-card"
              :label="getRoleOptionKey(role)"
            >
              <div class="role-option-name">{{ role.rolename }}</div>
            </el-radio>
          </div>
        </el-radio-group>
        <div class="role-category-list">
          <div
            v-if="courseManagerRoles.length"
            class="role-category-item"
            @click="enterRoleCategory('课程负责人')"
          >
            <span>课程负责人</span>
            <span class="role-category-arrow">›</span>
          </div>
          <div
            v-if="courseTeacherRoles.length"
            class="role-category-item"
            @click="enterRoleCategory('任课教师')"
          >
            <span>任课教师</span>
            <span class="role-category-arrow">›</span>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="role-filter role-filter-head">
          <el-button text :icon="ArrowLeft" @click="backToRoleList">返回</el-button>
          <span>{{ activeCategory }}</span>
        </div>
        <div class="role-filter role-filter-selects">
          <el-select v-model="filterYear" placeholder="选择年份" clearable size="default">
            <el-option v-for="y in filterYearOptions" :key="y" :label="y + '年'" :value="y" />
          </el-select>
          <el-select v-model="filterSeason" placeholder="选择学期" clearable size="default">
            <el-option label="春季学期" value="春季学期" />
            <el-option label="秋季学期" value="秋季学期" />
          </el-select>
        </div>
        <el-radio-group v-model="selectedRoleId" class="role-radio-group">
          <div class="role-option-list">
            <el-radio
              v-for="role in filteredCategoryRoles"
              :key="getRoleOptionKey(role)"
              class="role-option-card"
              :label="getRoleOptionKey(role)"
            >
              <div class="role-option-name">{{ role.rolename }}</div>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
      <template #footer>
        <div class="button role-dialog-actions">
          <el-button class="cancel" @click="showRoleModal = false">取消</el-button>
          <el-button class="confirm" type="primary" @click="confirmRole">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import '@/assets/css/taildwind.css';
import { ref, reactive, getCurrentInstance, onMounted, computed } from 'vue';
import { User, Lock, Edit, Phone, MessageBox, Message, ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request.js';
import router from '@/router/index.js';
import { useProfileStore } from '@/stores/profileStore.js';
import useInstructor from '@/stores/InstructorStore.js';
import { storeToRefs } from 'pinia';
import useHistory from '../../stores/useHistory';

/* ********************变量定义******************** */
const isText = ref(false);
const profileStore = useProfileStore();
const instrutorStore = useInstructor();
const { isDefaultTerm } = storeToRefs(instrutorStore);
const historyStore = useHistory();

// 创建获取当前学期id函数
const getCurrentTermId = () => {
  request.course.get('/coursemangt/course/currenttermId').then(res => {
    console.log(res.data);
    if (res.data === null) {
      // console.log('wsnd');
      instrutorStore.changeDefaultTerm(true);
    }
    // sessionStorage.setItem('currentTermId', res.data);
    // console.log(res);
  });
};

//构造登录表单
const loginForm = reactive({
  loginname: '',
  pwd: '',
  catelog: '1',
  loginway: '1'
});

const loginwithText = reactive({
  telephone: '',
  message: '',
  loginway: '2',
  catelog: '1'
});

const loginuserFrom = ref({
  id: '',
  roleid: '',
  obsid: '',
  obsdeep: '',
  catelog: ''
});

//学生登录/老师登录（true为学生登录）
const StudentOrTeacher = ref(true);
//调用getCurrentInstance()方法来获取当前组件实例的代理对象
const { proxy } = getCurrentInstance();

const switchRole = (value, catelog) => {
  // console.log(value);
  // if (value === '1') {
  //   loginForm.catelog = '2';
  // } else if (value === '2') {
  //   loginForm.catelog = '1';
  // }
  loginForm.catelog = catelog;
};

//弹窗是否显示
const showRoleModal = ref(false);

//点击切换学生登录/教师登录
const handleClick = (tab, event) => {
  const iAgree = document.querySelector('.form_footer');
  if (iAgree) {
    if (loginForm.catelog === '2') {
      // 教师登录
      StudentOrTeacher.value = true;
      iAgree.style.display = 'none';
    } else if (loginForm.catelog === '1') {
      // 学生登录

      StudentOrTeacher.value = false;
      iAgree.style.display = 'block';
    }
  }
};

const roledata = reactive({});
const selectedRoleId = ref(null);

const roleStep = ref(1);
const activeCategory = ref('');
const filterYear = ref('');
const filterSeason = ref('');

const filterYearOptions = computed(() => {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = current - 2; y <= current + 4; y++) years.push(String(y));
  return years;
});

const FILTERABLE_ROLE_SUFFIXES = ['课程负责人', '任课教师'];

const courseManagerRoles = computed(() =>
  (roledata.simpleRoleList || []).filter(role => (role.rolename || '').endsWith('课程负责人'))
);

const courseTeacherRoles = computed(() =>
  (roledata.simpleRoleList || []).filter(role => (role.rolename || '').endsWith('任课教师'))
);

const otherRoles = computed(() =>
  (roledata.simpleRoleList || []).filter(role => {
    const name = role.rolename || '';
    return !FILTERABLE_ROLE_SUFFIXES.some(suffix => name.endsWith(suffix));
  })
);

const filteredCategoryRoles = computed(() => {
  const source = activeCategory.value === '课程负责人' ? courseManagerRoles.value : courseTeacherRoles.value;
  if (!filterYear.value && !filterSeason.value) return source;
  const termPrefix = `${filterYear.value}${filterSeason.value}`;
  return source.filter(role => (role.rolename || '').startsWith(termPrefix));
});

const enterRoleCategory = category => {
  activeCategory.value = category;
  filterYear.value = '';
  filterSeason.value = '';
  roleStep.value = 2;
};

const backToRoleList = () => {
  roleStep.value = 1;
  activeCategory.value = '';
  filterYear.value = '';
  filterSeason.value = '';
};
//默认选择第一个角色序号
// const selectedRoleId = ref(data.simpleRoleList[0].roleid);

const getRoleOptionKey = role =>
  [role.roleid, role.obsid, role.obsdeep].filter(item => item !== undefined && item !== null).join('|');

const rules = reactive({
  loginname: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '用户名长度在3到15个字符之间', trigger: 'blur' }
  ],
  pwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, max: 15, message: '密码长度在3到15个字符之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/, // 正则表达式校验手机号
      message: '请输入有效的手机号',
      trigger: 'blur'
    }
  ],
  captcha: [
    { required: true, message: '验证码不能为空', trigger: 'blur' },
    {
      pattern: /^\d{6}$/, // 正则表达式校验6位数字
      message: '验证码必须是6位数字',
      trigger: 'blur'
    }
  ]
});
//登录
const login = () => {
  console.log('loginForm', loginForm);
  // 验证表单输入
  proxy.$refs.ruleFormRef.validate(valid => {
    if (valid) {
      //请求登录接口
      request.admin
        .post('/login', loginForm)
        .then(res => {
          // 登录成功
          if (res.code === 400) {
            ElMessage({
              type: 'error',
              message: res.msg
            });
          } else if (res.code === 200) {
            console.log(res.data);
            //处理不同角色的跳转逻辑
            const rolesCount = res.data.rolescount;
            loginuserFrom.value.id = res.data.userid;
            loginuserFrom.value.catelog = res.data.catelog;

            const logincatelog = res.data.catelog;

            console.log('logincatelog', logincatelog);
            if (logincatelog === '1') {
              console.log(res.data);
              setprofile(res.data);
              router.push(res.data.homeurl);
            } else {
              if (rolesCount === 1) {
                loginuserFrom.value.roleid = res.data.simpleRoleList[0].roleid;
                loginuserFrom.value.obsid = res.data.simpleRoleList[0].obsid;
                loginuserFrom.value.obsdeep = res.data.simpleRoleList[0].obsdeep;
                userlogin();
              } else {
                Object.assign(roledata, res.data);
                //打开弹窗选择角色
                roleStep.value = 1;
                showRoleModal.value = true;
              }
            }
          } else if (res.code === 404) {
            ElMessage({
              type: 'error',
              message: res.msg
            });
          } else ElMessage.error(res.msg);
        })
        .catch(error => {
          // 登录失败

          ElMessage({
            type: 'error',
            message: `登录失败 ${error}`
          });
        });
    } else {
      // 输入无效

      ElMessage({
        type: 'error',
        message: '用户名或密码错误'
      });
    }
  });
};

//弹窗选择角色信息

const confirmRole = () => {
  // const selectedRole = roledata.simpleRoleList.find(role => role.roleid === selectedRoleId.value);
  const selectedRole = roledata.simpleRoleList.find(
    role => getRoleOptionKey(role) === selectedRoleId.value
  );
  if (selectedRole) {
    loginuserFrom.value.roleid = selectedRole.roleid;
    loginuserFrom.value.obsid = selectedRole.obsid;
    loginuserFrom.value.obsdeep = selectedRole.obsdeep;
  }
  userlogin();
  showRoleModal.value = false;
};
//二次请求
const userlogin = () => {
  console.log('userlogin');
  request.admin
    .post('/login/user', loginuserFrom.value)
    .then(res => {
      console.log(res);
      if (res.code === 200) {
        console.log('userlogin_success');
        setprofile(res.data);
        // sessionStorage.setItem('nowUsr', JSON.stringify({}));
        // historyStore.setUsr('');
        router.push(res.data.homeurl).then(() => {
          window.location.reload(); // 在导航后强制刷新页面
        });
      } else if (res.code === 404) {
        router.push('/login');
      }
    })
    .catch(error => {
      // 登录失败

      ElMessage({
        type: 'error',
        message: '登录失败'
      });
    });
};

//存入本地 sessionStorage

const setprofile = data => {
  profileStore.setProfileInfo(
    data.username,
    data.rolename,
    data.catelog,
    data.homeurl,
    data.token,
    data.currentterm
  );
  const userInfo = {
    username: data.username,
    rolename: data.rolename,
    catelog: data.catelog,
    homeurl: data.homeurl,
    token: data.token,
    currentterm: data.currentterm
  };
  
  sessionStorage.setItem('users', JSON.stringify(userInfo));
  sessionStorage.setItem('isLoggedIn', 'true');
  sessionStorage.setItem('token', data.token);
};

onMounted(() => {
  sessionStorage.removeItem('users');
  sessionStorage.removeItem('currentTermId');
  getCurrentTermId();
});

/* ********************方法定义******************** */
</script>

<style lang="less" scoped>
.text {
  position: absolute;
  right: 3%;
  background-color: rgba(39, 165, 255, 0.15);
  border-radius: 7px;
  height: 42px;
  width: 140px;
  color: rgba(39, 165, 255, 1);
}
.confirm {
  width: 300px;
  height: 50px;
  border: 2px solid #27a5ff;
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
}
.cancel {
  width: 300px;
  height: 50px;
  border: 2px solid #27a5ff;
  border-radius: 10px;
  color: #27a5ff;
  font-size: 16px;
}
:deep(.el-radio) {
  margin-bottom: 0 !important;
}
:deep(.el-radio-group) {
  width: 100%;
  margin: 0;
}
:deep(.role-dialog) {
  width: min(720px, calc(100vw - 32px));
  max-height: calc(100vh - 48px);
  border-radius: 18px;
  overflow: hidden;
}
:deep(.role-dialog .el-dialog__header) {
  padding: 22px 28px 14px !important;
  margin-right: 0;
  background: linear-gradient(180deg, #f5fbff 0%, #ffffff 100%);
  border-bottom: 1px solid rgba(39, 165, 255, 0.16);
}
:deep(.role-dialog .el-dialog__body) {
  padding: 18px 28px 8px;
  max-height: min(560px, calc(100vh - 210px));
  overflow: auto;
}
:deep(.role-dialog .el-dialog__footer) {
  padding: 18px 28px 24px;
  border-top: 1px solid #edf4fb;
}
.role-dialog-title {
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  text-align: center;
}
.role-radio-group {
  display: block;
}
.role-option-list {
  display: grid;
  gap: 12px;
  max-height: 360px;
  overflow: auto;
  padding: 2px 4px 2px 2px;
}
.role-option-card {
  width: 100%;
  min-height: 58px;
  margin-right: 0;
  padding: 0 16px;
  border: 1px solid #e3edf7;
  border-radius: 8px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  :deep(.el-radio__label) {
    min-width: 0;
    flex: 1;
  }
  &:hover {
    border-color: #8ecfff;
    background: #f7fcff;
    box-shadow: 0 8px 18px rgba(0, 120, 205, 0.08);
  }
  &.is-checked {
    border-color: #27a5ff;
    background: #eff9ff;
  }
}
.role-option-name {
  color: #4b5563;
  font-size: 17px;
  line-height: 24px;
  white-space: normal;
  word-break: break-word;
}
.role-dialog-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  width: min(520px, 100%);
  margin: 0 auto;
  .el-button {
    width: 100%;
    margin-left: 0;
  }
}
.role-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 0;
  .el-select {
    width: 160px;
  }
}
.role-filter-head {
  justify-content: space-between;
  margin-bottom: 14px;
  color: #374151;
  font-size: 20px;
  font-weight: 700;
}
.role-filter-selects {
  flex-wrap: wrap;
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 8px;
  background: #f6fbff;
}
.role-category-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #edf4fb;
}
.role-category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 64px;
  padding: 14px 18px;
  font-size: 17px;
  color: #374151;
  border: 1px solid #dcecff;
  border-radius: 8px;
  background: linear-gradient(135deg, #f4fbff 0%, #ffffff 100%);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  &:hover {
    border-color: #67bdff;
    box-shadow: 0 10px 24px rgba(0, 120, 205, 0.1);
    transform: translateY(-1px);
  }
}
.role-category-arrow {
  font-size: 24px;
  color: #27a5ff;
}
.wrapper {
  width: 425px;
  top: 250px;
}
.image_1 {
  top: 35px;
  left: 50%;
  transform: translateX(-50%);
}
.inner {
  width: 425px;
  height: 540px;
  margin: 200px 0 0 1075px;
}
.radio-wrap {
  width: 646px;
  max-height: 442px;
}
.radio-wrap::-webkit-scrollbar {
  width: 8px; /* 垂直滚动条宽度 */
  height: 8px; /* 水平滚动条高度 */
}
/* 滚动条上的滑块 */
.radio-wrap::-webkit-scrollbar-thumb {
  background-color: rgba(64, 158, 254, 0.5); /* 半透明灰色 */
  border-radius: 4px;
}

/* 滚动条轨道 */
.radio-wrap::-webkit-scrollbar-track {
  background: #f0f0f0; /* 浅灰色 */
}
.page {
  position: relative;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  // display: flex;
}

:deep(.el-dialog) {
  border-radius: 10px;
}

:deep(.el-dialog__header) {
  padding-bottom: 0 !important;
}

:deep(.el-dialog__footer) {
  display: flex !important;
}

.el-form {
  width: 444px;
  height: 54px;
  // margin: 16px 0 0 1068px;
  .el-form-item {
    :deep(.el-input__wrapper) {
      border: 2px solid rgba(204, 218, 226, 1);
      border-radius: 10px;
      box-shadow: 0px 1px 0px 0px rgba(255, 255, 255, 0.5);
      height: 54px;
    }
    .el-input {
      :deep(.el-input__prefix) {
        width: 14px;
        height: 16px; /* 调整图标大小 */
        margin-right: 15px; /* 调整图标与文本之间的间距 */
      }
    }
  }
}

.section_1 {
  position: relative;
  width: 1920px;
  height: 1080px;
  background: url('@/assets/images/redraw-images/background.png') 100% no-repeat;
  background-size: 100% 100%;
}

.block_1 {
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  // box-shadow: 0px 1px 0px 0px rgba(255, 255, 255, 0.5);
  // border-radius: 10px;
  // width: 444px;
  // height: 60px;
  // border: 2px solid rgba(204, 218, 226, 1);
  width: 380px;
  height: 50px;
  background: url('@/assets/images/redraw-images/blockbg.png') 0px 0px no-repeat;
  // background-size: 380px 51px;
  // margin: 31px 0 0 1068px;
}

.text-wrapper_1 {
  background-color: rgba(39, 165, 255, 1);
  border-radius: 7px;
  height: 48px;
  width: 216px;
  color: #fff !important;
}

.text_1 {
  width: 82px;
  height: 24px;
  overflow-wrap: break-word;
  font-size: 18px;
  letter-spacing: 2.25px;
  font-family: MicrosoftYaHei;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  line-height: 24px;
}

.text_2 {
  width: 81px;
  height: 24px;
  overflow-wrap: break-word;

  font-size: 18px;
  letter-spacing: 2.25px;
  font-family: MicrosoftYaHei;
  font-weight: normal;
  text-align: right;
  white-space: nowrap;
  line-height: 24px;
}

.block_2 {
  box-shadow: 0px 1px 0px 0px rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  width: 444px;
  height: 54px;
  border: 2px solid rgba(204, 218, 226, 1);
  margin: 16px 0 0 1068px;
}

.thumbnail_1 {
  width: 14px;
  height: 16px;
  margin: 19px 0 0 21px;
}

.box_1 {
  background-color: rgba(204, 218, 226, 1);
  width: 1px;
  height: 30px;
  margin: 12px 0 0 17px;
}

.text_3 {
  width: 89px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(204, 218, 226, 1);
  font-size: 14px;
  letter-spacing: 0.800000011920929px;
  font-family: MicrosoftYaHei;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 19px;
  margin: 17px 281px 0 21px;
}

.block_3 {
  box-shadow: 0px 1px 0px 0px rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  width: 444px;
  height: 54px;
  border: 2px solid rgba(204, 218, 226, 1);
  margin: 16px 0 0 1068px;
}

.thumbnail_2 {
  width: 14px;
  height: 16px;
  margin: 19px 0 0 21px;
}

.block_4 {
  background-color: rgba(204, 218, 226, 1);
  width: 1px;
  height: 30px;
  margin: 12px 0 0 17px;
}

.text_4 {
  width: 74px;
  height: 19px;
  overflow-wrap: break-word;
  color: rgba(204, 218, 226, 1);
  font-size: 14px;
  letter-spacing: 0.800000011920929px;
  font-family: MicrosoftYaHei;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 19px;
  margin: 17px 296px 0 21px;
}

.text-wrapper_2 {
  width: 425px;
  top: 200px;
  background-color: #fff;
  text-align: center;
  background-color: #fff;
  text-align: center;
  border-radius: 10px;
  height: 50px;
  width: 425px;
  // margin: 100px 0 0 1070px;
}

.text_5 {
  width: 40px;
  height: 21px;
  overflow-wrap: break-word;
  color: rgba(255, 255, 255, 1);
  font-size: 16px;
  letter-spacing: 4px;
  font-family: MicrosoftYaHei;
  font-weight: normal;
  text-align: right;
  white-space: nowrap;
  line-height: 21px;
  margin: 14px 0 0 202px;
}

.image_2 {
  top: 300px;
  left: 50%;
  transform: translateX(-50%);
  width: 425px;
  height: 2px;
  // margin: 36px 0 0 1071px;
}

.text-wrapper_3 {
  top: 330px;
  border-radius: 10px;

  height: 50px;
  border: 1px solid #ffffff;
  width: 425px;
}

.text_6 {
  width: 154px;
  height: 21px;
  overflow-wrap: break-word;
  color: rgba(39, 165, 255, 1);
  font-size: 16px;
  letter-spacing: 3.200000047683716px;
  font-family: MicrosoftYaHei;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  line-height: 21px;
  // margin: 14px 0 0 143px;
}

.text_7 {
  width: 241px;
  height: 24px;
  overflow-wrap: break-word;
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  font-family: MicrosoftYaHei;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 24px;
  margin: 214px 0 48px 1180px;
}

.text_8 {
  top: 290px;
  color: #fff;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 19px;
  overflow-wrap: break-word;
  // color: rgba(39, 165, 255, 0.4);
  font-size: 14px;
  letter-spacing: 3.5px;
  font-family: MicrosoftYaHei;
  font-weight: normal;
  text-align: right;
  white-space: nowrap;
  line-height: 19px;
}

@media (max-width: 640px) {
  .role-dialog-actions {
    grid-template-columns: 1fr;
  }
  .cancel,
  .confirm {
    width: 100%;
  }
  .role-filter .el-select {
    width: 100%;
  }
}
</style>
