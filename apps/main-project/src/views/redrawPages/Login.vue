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

          <el-dialog :modelValue="showRoleModal" :show-close="false" :close-on-click-modal="false">
            <template #header>
              <div style="font-weight: bold; font-size: 18px" class="title">选 择 角 色</div>
              <el-divider style="border-top: 1px solid #27a5ff !important" />
            </template>
            <el-radio-group v-model="selectedRoleId">
              <div class="flex flex-col flex-wrap content-between overflow-auto radio-wrap">
                <el-radio
                  v-for="role in roledata.simpleRoleList"
                  :key="getRoleOptionKey(role)"
                  :label="getRoleOptionKey(role)"
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

          <el-dialog :modelValue="showRoleModal" :show-close="false" :close-on-click-modal="false">
            <template #header>
              <div style="font-weight: bold; font-size: 18px" class="title">选 择 角 色</div>
              <el-divider style="border-top: 1px solid #27a5ff !important" />
            </template>
            <el-radio-group v-model="selectedRoleId">
              <div class="flex flex-col flex-wrap content-between">
                <el-radio
                  v-for="role in roledata.simpleRoleList"
                  :key="getRoleOptionKey(role)"
                  :label="getRoleOptionKey(role)"
                >
                  <div style="font-size: 16px; color: #666">
                    {{ role.rolename }}
                  </div>
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
  margin-bottom: 20px !important;
}
:deep(.el-radio-group) {
  width: 646px;
  margin: 0 auto;
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
  height: 442px;
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
</style>
