<template>
  <div class="page">
    <div class="section_1">
      <div class="inner">
        <span class="title_text">数字产业学院教学平台</span>
        <div class="block_1 flex flex-row justify-between items-center">
          <div
            style="width: 50%; color: rgba(39, 165, 255, 1);"
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
            style="width: 50%; color: rgba(39, 165, 255, 1);"
            :class="
              loginForm.catelog === '2'
                ? 'text-wrapper_1 flex flex-col cursor-pointer justify-center items-center h-full'
                : 'flex all flex-row cursor-pointer justify-center items-center h-full'
            "
          >
            <span class="text_2">教师登录</span>
          </div>
        </div>
        <div v-if="!isText" class="wrapper">
          <div class="login-pannel">
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

          <div @click="login" class="login-btn cursor-pointer">
            <span class="text_5">登录</span>
          </div>

          <div class="divider-row">
            <span class="divider-line"></span>
            <span class="divider-text">or</span>
            <span class="divider-line"></span>
          </div>

          <div
            @click="() => { isText = !isText; }"
            class="switch-btn cursor-pointer"
          >
            <span class="text_6">短信验证密码登录</span>
          </div>
        </div>

        <div v-else class="wrapper">
          <div class="login-pannel">
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
              </el-form-item>
            </el-form>
          </div>

          <div @click="login" class="login-btn cursor-pointer">
            <span class="text_5">登录</span>
          </div>

          <div class="divider-row">
            <span class="divider-line"></span>
            <span class="divider-text">or</span>
            <span class="divider-line"></span>
          </div>

          <div
            @click="() => { isText = !isText; }"
            class="switch-btn cursor-pointer"
          >
            <span class="text_6">账号密码登录</span>
          </div>
        </div>
      </div>
      <span class="text_7">数字产业学院&#64;2024版权所有</span>
    </div>

    <!-- 角色选择弹窗 - 放在面板外部 -->
    <el-dialog :modelValue="showRoleModal" :show-close="false" :close-on-click-modal="false" append-to-body>
      <template #header>
        <div style="font-weight: bold; font-size: 18px" class="title">选 择 角 色</div>
        <el-divider style="border-top: 1px solid #27a5ff !important" />
      </template>
      <el-radio-group v-model="selectedRoleId">
        <div class="flex flex-col flex-wrap content-between overflow-auto radio-wrap">
          <el-radio
            v-for="role in roledata.simpleRoleList"
            :key="role.roleid"
            :label="role.id"
          >
            <div style="font-size: 16px; color: #666">{{ role.rolename }}</div>
          </el-radio>
        </div>
      </el-radio-group>
      <template #footer>
        <div class="button" style="margin: 0 auto">
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
import { User, Lock, Edit, Phone, MessageBox, Message } from '@element-plus/icons-vue';
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
//默认选择第一个角色序号
// const selectedRoleId = ref(data.simpleRoleList[0].roleid);

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
  const selectedRole = roledata.simpleRoleList.find(role => role.id === selectedRoleId.value);
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
.page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.section_1 {
  width: 100%;
  height: 100%;
  background: url('@/assets/images/redraw-images/background-new.jpg') center no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-left: 35%;
}

.inner {
  width: 420px;
  min-width: 420px;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  padding: 36px 32px 28px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title_text {
  font-size: 24px;
  font-weight: bold;
  color: #0064b1;
  letter-spacing: 3px;
  white-space: nowrap;
  font-family: MicrosoftYaHei, sans-serif;
  margin-bottom: 24px;
}

.block_1 {
  width: 100%;
  height: 48px;
  background: url('@/assets/images/redraw-images/blockbg.png') center no-repeat;
  background-size: 100% 100%;
  margin-bottom: 20px;
}

.text-wrapper_1 {
  background-color: rgba(39, 165, 255, 1);
  border-radius: 7px;
  height: 46px;
  color: #fff !important;
}

.text_1,
.text_2 {
  font-size: 16px;
  letter-spacing: 2px;
  font-family: MicrosoftYaHei;
  text-align: center;
  white-space: nowrap;
}

.wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-pannel {
  width: 100%;
}

.el-form {
  width: 100%;
  .el-form-item {
    :deep(.el-input__wrapper) {
      border: 2px solid rgba(204, 218, 226, 1);
      border-radius: 10px;
      box-shadow: 0px 1px 0px 0px rgba(255, 255, 255, 0.5);
      height: 50px;
    }
    .el-input {
      :deep(.el-input__prefix) {
        width: 14px;
        height: 16px;
        margin-right: 15px;
      }
    }
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  background-color: #fff;
  border: 2px solid #27a5ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.text_5 {
  color: #0177cc;
  font-size: 16px;
  letter-spacing: 4px;
  font-family: MicrosoftYaHei;
  font-weight: bold;
}

.divider-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 16px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(39, 165, 255, 0.3);
}

.divider-text {
  padding: 0 12px;
  color: #999;
  font-size: 13px;
}

.switch-btn {
  width: 100%;
  height: 48px;
  border: 1px solid #27a5ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(39, 165, 255, 0.05);
}

.text_6 {
  color: #27a5ff;
  font-size: 15px;
  letter-spacing: 2px;
  font-family: MicrosoftYaHei;
  text-align: center;
  white-space: nowrap;
}

.text_7 {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-family: MicrosoftYaHei;
  text-align: center;
  white-space: nowrap;
  margin-top: 20px;
}

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
  margin-bottom: 20px !important;
}

:deep(.el-radio-group) {
  width: 646px;
  margin: 0 auto;
}

:deep(.el-dialog) {
  border-radius: 10px;
}

:deep(.el-dialog__header) {
  padding-bottom: 0 !important;
}

:deep(.el-dialog__footer) {
  display: flex !important;
  justify-content: center;
  padding: 20px 40px;
}

.radio-wrap {
  width: 646px;
  height: 442px;
}

.radio-wrap::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.radio-wrap::-webkit-scrollbar-thumb {
  background-color: rgba(64, 158, 254, 0.5);
  border-radius: 4px;
}

.radio-wrap::-webkit-scrollbar-track {
  background: #f0f0f0;
}
</style>
