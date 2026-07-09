<template>
  <div class="practice">
    <Header :title="disable ? '实验查看' : type == 'pg' ? '实验批改' : '实验修改'" :pathData="pathData" />
    <div class="practice-submit" v-if="!disable">
      <el-button type="primary" @click="prePage"
        ><el-icon><ArrowLeft /></el-icon>上一个</el-button
      >
      <el-button type="primary" @click="nextPage"
        >下一个<el-icon><ArrowRight /></el-icon
      ></el-button>
    </div>
    <div class="title-box">
      <div class="title-top">
        <div class="left-box">
          <span class="title-name">{{ dataStudentCorrect?.stu?.name }}</span>
          <span class="title-name">{{ dataStudentCorrect?.stu?.stuNo }}</span>
        </div>
        <div class="right-box" v-if="!disable">
          <el-button type="primary" @click="submit"
            ><el-icon><Plus /></el-icon> 提交</el-button
          >
        </div>
      </div>
      <div class="title-bottom">
        <div class="line">
          <div class="item">
            <span class="item-name">当前实验:</span>
            <span class="item-value" :title="dataStudentCorrect?.name">{{ dataStudentCorrect?.name }}</span>
          </div>
          <div class="item">
            <span class="item-name">所属课程:</span>
            <span class="item-value" :title="dataStudentCorrect?.courseName">{{ dataStudentCorrect?.courseName }}</span>
          </div>
          <div class="item">
            <span class="item-name">专业:</span>
            <span class="item-value" :title="dataStudentCorrect?.stu?.className">{{ dataStudentCorrect?.stu?.className }}</span>
          </div>
          <div class="item">
            <span class="item-name">实验总分:</span>
            <span class="item-value" :title="dataStudentCorrect?.totalScore">{{ dataStudentCorrect?.totalScore }}</span>
          </div>
        </div>
        <div class="line">
          <div class="item">
            <span class="item-name">所属课堂:</span>
            <span class="item-value" :title="dataStudentCorrect?.classroomName">{{ dataStudentCorrect?.classroomName }}</span>
          </div>
          <div class="item">
            <span class="item-name">状态:</span>
            <!-- 0=已发布 1=已作答 2=已批改 -->
            <span class="item-value" :title="statusMap.get(dataStudentCorrect?.stu?.status)">{{ statusMap.get(dataStudentCorrect?.stu?.status) }}</span>
          </div>
          <div class="item">
            <span class="item-name"></span>
            <span class="item-value"></span>
          </div>
          <div class="item">
            <span class="item-name">学生得分:</span>
            <!-- 0=已发布 1=已作答 2=已批改 -->
            <span class="item-value" :title="stuTotalScore || 0">{{ stuTotalScore || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-for="(item, i) in items" :key="item.id">
      <template v-if="item.beDefault === 0 && item.beValid">
        <div class="practice-list">
          <div class="item-title">{{ item.itemName }}</div>
          <div class="practice-item flex-between">
            <div class="item-left">
              <!-- {{ host + item.defaultPath }} -->
              <div class="flex-start">
                <div class="task-upload-url flex-start">
                  <div v-if="!item.urlArr || !item.urlArr.length" class="flex-center task-no-data">暂未上传{{ item.itemName }}</div>
                  <!-- <div style="width: 560px" v-if="isImageURL(item.urlArr[0])"> -->
                  <div :style="disable ? 'width: 530px' : 'width: 530px'" v-else>
                    <ImageSwiper :isImageShow="true" :isDocToImageData="isDocToImageData" :itemId="item.id" :images="item.urlArr" :type="item.itemCode" :defaultName="item.itemName" :source="disable ? 'view' : 'edit'" />
                  </div>
                </div>
                <!-- 不是批改才显示上传 -->
                <div class="task-upload" v-if="type != 'xg' && type != 'pg'">
                  <el-upload :action="action" :data="data" :show-file-list="false" :on-success="(response, file) => handleAvatarSuccess(response, file, item)">
                    <!-- <img v-if="imageUrl" :src="imageUrl" class="avatar" /> -->
                    <!-- <el-icon class="avatar-uploader-icon">
                      <Plus />
                    </el-icon> -->
                  </el-upload>
                </div>
              </div>
            </div>
            <!-- {{ type }}-{{ type == 'pg' ? item.scoreCfg : item.other?.scoreCfg }} -->
            <!-- {{ item.score }} {{ item.other?.score }} -->
            <ScoreInput
              v-if="item.scoreCfg.mode == 'subs' && dataStudentCorrect?.stu?.status != 0"
              @updateDataObj="updateDataObj"
              :index="i"
              :stuId="stuId"
              :dataObj="item"
              :title="item.itemName"
              :scoreCfg="type == 'pg' ? item.scoreCfg : item.other?.scoreCfg || item.scoreCfg"
              :score="type == 'pg' ? item.score : item.other?.score || item.score"
              :urlArr="item.urlArr"
              :disable="disable"
            />
            <GradeInput
              v-if="item.scoreCfg.mode == 'percent' && dataStudentCorrect?.stu?.status != 0"
              @updateDataObj="updateDataObj"
              :index="i"
              :stuId="stuId"
              :dataObj="item"
              :title="item.itemName"
              :scoreCfg="type == 'pg' ? item.scoreCfg : item.other?.scoreCfg || item.scoreCfg"
              :score="type == 'pg' ? item.score : item.other?.score || item.score"
              :urlArr="item.urlArr"
              :disable="disable"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, toRaw } from "vue";
import { useRouter } from "vue-router";
import { studentCorrect, studentSave, prePageApi, nextPageApi } from "@/api/practice/index.ts";
import { host } from "@/utils/request.js";
import { getFileExtensionFromUrl, isImageURL, downloadFile } from "@/utils/index.js";
import { ElMessage, ElMessageBox } from "element-plus";
import Header from "@/views/page/components/header/index.vue";
import ImageSwiper from "../components/ImageSwiper.vue";
import ScoreInput from "../components/ScoreInput.vue";
import GradeInput from "../components/GradeInput.vue";

const router = useRouter();
const { currentRoute } = router;
const route = currentRoute.value;
const stuId = ref(route.query.sid);
const practiceId = ref(route.query.pid);
const itemId = ref(route.query.id);
const isDocToImageData = {
  stuId: stuId.value,
  practiceId: practiceId.value,
};
console.log(isDocToImageData, 'isDocToImageData')

const type = ref(route.query.type);
const disable = route.query.disable || false;
const statusMap = new Map([
  [0, "已发布"],
  [1, "已作答"],
  [2, "已批改"],
]);

const taskData = [
  {
    name: "报告格式:",
    value: "format",
  },
  {
    name: "报告字数:",
    value: "num",
  },
  {
    name: "结构合理:",
    value: "structure",
  },
  {
    name: "内容充实:",
    value: "content",
  },
];

const items = ref([]);

const pathData = ref([
  {
    name: "实验管理",
    path: "/homes/courseteacherhome/exam/experimental/labmangt",
  },
  {
    name: "实验学生列表",
    path: "/homes/courseteacherhome/exam/experimental/student",
    query: {
      id: route.query.id,
      privilege: route.query.privilege,
    },
  },
  {
    name: disable ? "实验查看" : type.value == "pg" ? "实验批改" : "实验修改",
    path: "",
  },
]);
const lockDoc = (url) => {
  window.open(url);
};

onMounted(() => {
  getStudentCorrect(stuId.value, practiceId.value);
});

const handleCheck = (val, item) => {
  const total = item.score ?? 0;
  const values = val.length > 1 ? [val[val.length - 1]] : val;
  item.check = values;
  const currentTotal = Math.floor(total * values);
  const averageScore = Math.floor(currentTotal / 4);
  const finalScore = currentTotal - averageScore * 3;
  taskData.forEach((f, i) => {
    item[f.value] = taskData.length === i + 1 ? finalScore : averageScore;
  });
  // 得分
  item.goal = 0;
  taskData.forEach((f) => {
    if (item[f.value]) {
      item.goal += item[f.value];
    }
  });
};

const changeGoal = (item) => {
  item.goal = 0;
  taskData.forEach((f) => {
    if (item[f.value]) {
      item.goal += item[f.value];
    }
  });
};

const handleScore = (val, item) => {
  // console.log('handleScore', val, item)
  changeGoal(item);
};

const lock = (url) => {
  window.open(url);
};

const download = (url, name) => {
  downloadFile(url, name);
};

const submit = () => {
  ElMessageBox.confirm("确定提交吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const correctMap = [];
      console.log(items.value,'items.value')
      items.value.forEach((item, index) => {
        if (type.value == "pg") {
          if (item?.scoreCfg?.mode == "percent") {
            correctMap.push({
              correctImg: item?.correctImg || item?.other?.correctImg || "",
              correctStep: item?.correctStep || item?.other?.stepMap || null,
              itemId: item?.id,
              mode: item?.scoreCfg?.mode || "",
              score: item?.score || 0,
              totalImg: item?.totalImg || "",
              scoreDetail: item?.scoreCfg?.map || null,
              selectedScoreName: item?.scoreCfg?.checked  || ''
            });
          } else {
            correctMap.push({
              correctImg: item?.correctImg || item?.other?.correctImg || "",
              correctStep: item?.correctStep || item?.other?.stepMap || null,
              itemId: item?.id,
              mode: item?.scoreCfg?.mode || "",
              score: item?.score || 0,
              totalImg: item?.totalImg || "",
              scoreDetail: item?.scoreCfg?.map || null,
            });
          }
        } else {
          if (item?.scoreCfg?.mode == "percent") {
            correctMap.push({
              correctImg: item?.correctImg || item?.other?.correctImg || "",
              correctStep: item?.correctStep || item?.other?.stepMap || null,
              itemId: item?.id,
              mode: item?.scoreCfg?.mode || "",
              score: item?.other?.score || 0,
              totalImg: item?.totalImg || "",
              scoreDetail: item?.other?.scoreCfg?.map || null,
              selectedScoreName: item?.scoreCfg?.checked  || ''
            });
          } else {
            correctMap.push({
              correctImg: item?.correctImg || item?.other?.correctImg || "",
              correctStep: item?.correctStep || item?.other?.stepMap || null,
              itemId: item?.id,
              mode: item?.scoreCfg?.mode || "",
              score: item?.other?.score || 0,
              totalImg: item?.totalImg || "",
              scoreDetail: item?.other?.scoreCfg?.map || null,
            });
          }
        }
      });
      studentSave({
        items: correctMap,
        stuId: stuId.value,
        practiceId: practiceId.value,
      }).then((res) => {
        if (res.code === "200") {
          ElMessage.success("提交成功");
          getStudentCorrect(stuId.value, practiceId.value);
          // router.back(-1);
        }
      });
    })
    .catch(() => {});
};
const dataStudentCorrect = ref({});
const stuTotalScore = ref(0);
const getStudentCorrect = () => {
  studentCorrect({ stuId: stuId.value, practiceId: practiceId.value }).then((res) => {
    if (res.code === "200") {
      items.value = res?.data?.items;
      const answerMap = res?.data?.stu?.answerMap;
      dataStudentCorrect.value = res?.data;
      stuTotalScore.value = res?.data?.stu?.resultScore;
      type.value = res?.data?.stu?.status == 2 ? 'xg' : 'pg';
      pathData.value[2].name = disable ? "实验查看" : type.value == "pg" ? "实验批改" : "实验修改";
      // 内容回显
      if (items.value.length > 0) {
        items.value?.forEach((item) => {
          item.originScore = item.score;
          if (item.beDefault === 0 && answerMap[item.id]) {
            item.urlArr = answerMap[item.id]?.map((url) => {
              return host + "/static/" + url;
            });
          }
          taskData.forEach((f) => {
            item[f.value] = 0;
          });
          item.goal = 0;
          item.selectedScoreName = item?.other?.selectedScoreName || null;
          if (item?.other) {
            item.other.scoreCfg = {
              mode: item.other.mode,
              map: item.other.scoreMap,
              checked: item?.selectedScoreName || "",
            };
            item.scoreCfg = {
              mode: item.other.mode,
              map: item.other.scoreMap,
              checked: item?.selectedScoreName || "",
            }
            item.score = item.other?.score || 0;
          }else {
            item.scoreCfg = {
              ...item.scoreCfg,
              checked: item?.selectedScoreName || "",
            };
            item.score = item.score || 0;
          }
          console.log(item.other?.score,'item.other?.score')
          
        });
      }
    }
  });
};
const prePage = () => {
  prePageApi(practiceId.value, stuId.value).then((res) => {
    if (res.code === "200" && res.data != null) {
      stuId.value = res.data.stuId;
      practiceId.value = res.data.practiceId;
      getStudentCorrect(stuId.value, practiceId.value);
    } else {
      ElMessage.error("没有上一个数据");
    }
  });
};
const nextPage = () => {
  nextPageApi(practiceId.value, stuId.value).then((res) => {
    if (res.code === "200" && res.data != null) {
      stuId.value = res.data.stuId;
      practiceId.value = res.data.practiceId;
      getStudentCorrect(stuId.value, practiceId.value);
    } else {
      ElMessage.error("没有下一个数据");
    }
  });
};
const updateDataObj = (index, dataObj) => {
  items.value[index] = dataObj;
  if (type.value == "pg") {
    items.value[index].score = dataObj.score;
    // items.value[index].scoreCfg = dataObj.scoreCfg;
  } else {
    items.value[index].other.score = dataObj.score;
    items.value[index].other.scoreCfg = dataObj.scoreCfg;
    // items.value[index].other.scoreCfg = dataObj.other.scoreCfg;
  }
  console.log(items.value,'items.value11222')
  updateScore(items.value);
};
const updateScore = (data) => {
  let totalScore = 0;
  data.forEach((item) => {
    if (item.beDefault === 0 && item.beValid) {
      totalScore = Number(totalScore) + Number((item.score * item.weight * 0.01).toFixed(2));
    }
  });
  stuTotalScore.value = (totalScore * dataStudentCorrect.value?.totalScore/100).toFixed(0);
};
//   const greeting = "Hello, Vue 3!";
</script>

<style scoped lang="scss">
.practice-submit {
  margin-top: 10px;
}
.practice {
  background: #fff;
  padding: 0 10px 10px 10px;
  text-align: left;
  font-size: 13px;
  box-sizing: border-box;
  // padding: 20px;
  .practice-submit {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
  }
  .title-box {
    width: 100%;
    height: 163px;
    border-radius: 10px;
    border: 1px solid rgba(39, 165, 255, 0.5);
    margin-bottom: 40px;
    margin-top: 30px;
    .title-top {
      height: 60px;
      background: rgba(39, 165, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      .title-name {
        font-family: MicrosoftYaHei;
        font-size: 18px;
        color: #0078cd;
        margin-right: 40px;
      }
    }
    .title-bottom {
      .line {
        width: 100%;
        height: 50px;
        border-top: 1px solid rgba(39, 165, 255, 0.5);
        display: flex;
        align-items: center;
        .item {
          width: 31%;
          height: 100%;
          line-height: 50px;
          padding-left: 20px;
          border-right: 1px solid rgba(39, 165, 255, 0.5);
          display: flex;
          align-items: center;
          &:nth-child(4) {
            border-right: 0;
          }
          .item-name {
            font-family: MicrosoftYaHei;
            font-size: 12px;
            color: #666666;
            margin-right: 10px;
            display: inline-block;
          }
          .item-value {
            display: inline-block;
            font-family: MicrosoftYaHei;
            font-size: 16px;
            color: #1b1b1b;
            max-width: 110px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: pointer;
          }
        }
      }
    }
  }
  .practice-list {
    border-radius: 10px;
    border: 1px solid rgba(50, 177, 108, 0.5);
    margin-bottom: 20px;
    .item-title {
      height: 50px;
      line-height: 50px;
      font-family: MicrosoftYaHei;
      font-size: 18px;
      color: #1b1b1b;
      background: rgba(50, 177, 108, 0.1);
      border-radius: 10px 10px 0px 0px;
      text-align: center;
    }
    .practice-item {
      padding: 20px;
    }
  }
}

// .practice-item {
//   margin-bottom: 10px;
// }

// .item-title {
//   margin-bottom: 10px;
//   border-bottom: 1px solid rgba(116, 116, 116, 0.543);
//   font-size: 14px;
//   font-weight: bold;
// }

// .item-left {
//   width: 100%;
// }

// .item-right {
//   width: 220px;
// }

// .task-upload-url {
//   width: 100%;
//   height: 178px;
// }

.task-no-data {
  width: 200px;
  height: 288px;
  background: #ffffff;
  border-radius: 5px;
  border: 1px solid #d2d2d2;
  margin: 50px 50px;
}

// .url-wrap {
//   margin-right: 10px;
//   position: relative;
//   border-radius: 4px;
//   overflow: hidden;
//   border: 1px solid #d9d9d9;
// }

// .file-msg {
//   width: 178px;
//   height: 178px;
//   text-align: center;
// }

// .file-name {
//   font-size: 15px;
//   font-weight: bold;
//   margin-bottom: 10px;
// }
</style>
