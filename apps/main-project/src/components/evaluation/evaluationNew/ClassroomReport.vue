<template>
  <el-container
    v-if="renderLoading"
    v-loading="renderLoading"
    element-loading-background="rgba(0, 0, 0, 0.2)"
    style="height: 92vh"
  ></el-container>
  <choose-classroom
    v-else-if="isCourseManager && !hasChooseClassroom"
    @classroom-chosen="handleClassroomChosen"
  ></choose-classroom>
  <el-container
    v-else-if="!isCourseManager || (isCourseManager && hasChooseClassroom)"
    style="height: 92vh"
  >
    <el-header
      style="
        height: auto;
        padding: 5px 0px;
        width: 100%;
        text-align: left;
        background-color: #deebf7;
      "
    >
      <!-- <el-button type="success" style="margin-left: 0.8vw; cursor: not-allowed;">新增</el-button> -->
      <el-button type="primary" v-if="!isCourseManager" style="margin-left: 0.8vw" @click="calc()"
        >刷新报告数据</el-button
      >
      <el-button type="success" style="margin-left: 0.8vw" @click="printReport">打印报告</el-button>
      <el-button type="success" style="margin-left: 0.8vw" @click="generatePDF">下载报告</el-button>
      <el-button
        type="primary"
        v-if="isCourseManager"
        style="margin-left: 0.8vw"
        @click="hasChooseClassroom = false"
        >切换课堂</el-button
      >
    </el-header>
    <div class="main-block" style="text-align: left; overflow: auto">
      <div
        v-loading="pageLoading"
        element-loading-background="rgba(0, 0, 0, 0.2)"
        style="width: 100%; padding: 10mm 0"
      >
        <div
          id="report-container"
          style="
            width: 190mm;
            color: #0f0f0f;
            margin: 0 auto;
            font-size: 16px;
            font-weight: bolder;
            font-family: 'SimSun';
          "
        >
          <div style="margin-bottom: 30px; text-align: center">
            {{ headerData.classroomName }}<br />课堂评价报告
          </div>
          <div class="class-block">
            <div>一、课堂基本信息</div>
            <table>
              <tr>
                <td colspan="3">课程名称</td>
                <td colspan="3">{{ headerData.courseName }}</td>
                <td>开课学期</td>
                <td>{{ headerData.termName }}</td>
              </tr>
              <tr>
                <td colspan="3">任课教师</td>
                <td colspan="3">{{ headerData.teacherName }}</td>
                <td>学时/学分</td>
                <td>{{ headerData.time }} / {{ headerData.score ? headerData.score : 0 }}</td>
              </tr>
              <tr>
                <td colspan="3">课堂名称/周次</td>
                <td colspan="3">{{ headerData.classroomName }}</td>
                <td>课堂人数</td>
                <td>{{ studentList.length }}</td>
              </tr>
              <tr>
                <td colspan="8">学生成绩总评结果</td>
              </tr>
              <tr>
                <td>最高分</td>
                <td>{{ headerData.topScore || 0 }}</td>
                <td>最低分</td>
                <td>{{ headerData.lowestScore || 0 }}</td>
                <td>平均分</td>
                <td>{{ headerData.averScore || 0 }}</td>
                <td>不及格人数</td>
                <td>{{ headerData.failNum }}</td>
              </tr>
              <tr>
                <td colspan="8">
                  <div
                    id="grade-div"
                    style="
                      height: 280px;
                      margin-top: 10px;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                    "
                  ></div>
                </td>
              </tr>
            </table>
          </div>

          <div class="class-block">二、课程目标达成情况总体评价</div>
          <div id="target-achievement-degree-bar" style="height: 260px"></div>
          <div
            id="target-achievement-degree-category"
            style="height: 260px; margin-top: -60px"
          ></div>
          <table style="margin-top: 10px">
            <tr>
              <td v-for="t in courseTargetData" :key="t.id">{{ t.name }}</td>
            </tr>
            <tr>
              <td v-for="t in courseTargetData" :key="t.id">
                {{ acheiveMap.get(t.name) }}
              </td>
            </tr>
          </table>

          <div class="class-block">三、课程目标达成情况的个体评价</div>
          <div style="padding-left: 32px">
            <div style="text-align: left; margin-top: 10px">1、课程目标个体评价</div>
            <div v-for="(ctd, i) of courseTargetData" :key="ctd.id">
              <div :id="ctd.id" style="height: 63.25mm"></div>
              <div
                v-if="targetAchievementPersonalDegreeScatterList[i]"
                style="padding-left: 32px; margin: -25px 0 20px 0"
              >
                <span style="color: dodgerblue">{{ ctd.name }}</span
                >:
                <span v-if="targetAchievementPersonalDegreeScatterList[i]?.data[1].length"
                  >其中
                  {{ targetAchievementPersonalDegreeScatterList[i].data[1].join(',') }}
                  号同学本课程目标达成度低于60%，目标没有达成</span
                >
                <span v-else-if="targetAchievementData">本目标全员达成</span>
              </div>
            </div>
          </div>
          <div style="padding-left: 32px">
            <div style="text-align: left; margin-top: 10px">2、课程目标未达成的学生个体清单</div>
            <div style="margin-top: 10px">
              根据每位同学课程达成情况，可以汇总出本学期每个课程目标没有达成的学生个体清单，从中可以快速查阅每位学生的短板。
            </div>
            <table>
              <tr>
                <td style="width: 50px">序号</td>
                <td style="width: 120px">学号</td>
                <td style="width: 80px">姓名</td>
                <td v-for="t of courseTargetData" :key="t.id">{{ t.name }}</td>
              </tr>
              <tr v-for="(s, index) of aimEvaListNew" :key="s.stuno">
                <td>{{ index + 1 }}</td>
                <td style="width: 120px">{{ s.stuno }}</td>
                <td style="width: 80px">{{ s.username }}</td>
                <template v-for="(value, key) in aimEvaList" :key="key">
                  <template v-if="key === s.key">
                    <td v-for="item in value">{{ item.achievementScore >= 60 ? '√' : '' }}</td>
                  </template>
                </template>
              </tr>
            </table>
          </div>

          <div class="class-block">四、课程目标达成情况明细表</div>
          <table>
            <tr>
              <td style="width: 50px">序号</td>
              <td style="width: 120px">学号</td>
              <td style="width: 80px">姓名</td>
              <td style="width: 120px">班级</td>
              <td v-for="t of courseTargetData" :key="t.id">{{ t.name }}</td>
            </tr>
            <tr v-for="s of aimEvaListNew" :key="s.stuno">
              <td style="width: 50px">{{ s.rowNo }}</td>
              <td style="width: 120px">{{ s.stuno }}</td>
              <td style="width: 80px">{{ s.username }}</td>
              <td style="width: 120px">{{ studentList[0].className }}</td>
              <template v-for="(value, key) in aimEvaList" :key="key">
                <template v-if="key === s.key">
                  <td v-for="item in value">{{ item.achievementScore }}</td>
                </template>
              </template>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </el-container>
</template>

<script setup>
import * as echarts from 'echarts';
import { nextTick, onMounted, ref } from 'vue';
import html2pdf from 'html2pdf.js';
import request from '../../../utils/request.js';
import { ElMessage } from 'element-plus';
import ChooseClassroom from '../subcomponents/ChooseClassroom.vue';
import { Loading } from '@element-plus/icons-vue';
import useCourseAim from '../../../stores/useCourseAim.js';
import useItem from '../../../stores/useItem.js';
import useLabel from '../../../stores/useLabel.ts';
import { storeToRefs } from 'pinia';
import parseJWT from '../../../utils/parseJWT.js';

const roleName = JSON.parse(sessionStorage.getItem('users')).rolename;
const classroomIdRef =
  roleName === '任课教师' ? parseJWT(sessionStorage.getItem('token')).obsid : '';
const aimStore = useCourseAim();
const itemStore = useItem();
const labelStore = useLabel();
const { fetchTypeEva, fetchAimEva, fetchStuIds, fetchLabelList } = labelStore;
const { typeEvaList, aimEvaList, stuIds, labelList } = storeToRefs(labelStore);
const { setCourseId, fetchCourseId } = itemStore;
const { fetchAim } = aimStore;
const { aimList } = storeToRefs(aimStore);
const { courseId } = storeToRefs(itemStore);
const aimEvaListNew = ref([]);
const className = ref();

const isCourseManager = ref(null);
const hasChooseClassroom = ref(false);
const renderLoading = ref(true);
const pageLoading = ref(true);
const headerData = ref({});
const stuTotalScoreMap = ref(null);
const stuTargetAchievementMap = ref(null);
const studentList = ref([]);
const classroomId = ref(null);

const totalScore = ref(null);

const courseTargetData = ref();

const targetAchievementData = ref(null); // 存放计算好的所有学生的课程目标达成度数据

const targetSumAchievementDegree = ref({}); // 存储每个课程目标达成度的平均达成度

const gradeDivBar = ref(null); // 总评分布图-柱状图
const targetSumAchievementDegreeBar = ref(null); // 课程目标总体达成度-柱状图
const targetSumAchievementDegreeCategory = ref(null); // 课程目标总体达成度-折线图

const targetAchievementPersonalDegreeScatterList = ref([]); // 课程目标个体达成度-散点图

const acheiveMap = ref(new Map());
const acheieveAllMap = ref(new Map());
const personalMap = ref(new Map());

const options = ref({
  // 报告生成pdf的配置项
  margin: 10,
  filename: '达成性评价报告.pdf',
  image: { type: 'jpeg', quality: 1 },
  html2canvas: { scale: 4, useCORS: true },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'
  },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // 强制避免内容切割
});

const checkRole = async () => {
  // 查询是否是课程负责人，课程负责人要先选择课堂
  try {
    const res = await request.evaluation.get('/evaluation/attainment');
    if (res.code === 200) {
      if (res.data.isCourseManager) {
        isCourseManager.value = true;
        hasChooseClassroom.value = false;
      } else {
        isCourseManager.value = false;
        getClassroomInfoByClassroomId();
      }
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('查询角色类型失败' + error);
  }
  renderLoading.value = false;
  return isCourseManager.value;
};

const getObsidFromToken = token => {
  if (!token) return null;

  // 获取 token 中的 payload 部分（token 是 base64 编码的）
  const payload = token.split('.')[1];
  const decodedPayload = JSON.parse(atob(payload)); // 解码并解析 payload

  // 假设 obsid 在 payload 中
  return decodedPayload.obsid;
};

const calc = async () => {
  const loadingMessage = ElMessage({
    message: `正在计算中，请稍候...`,
    type: 'info',
    duration: 0
  });
  pageLoading.value = true;
  try {
    const res = await request.evaluation.get(`/evaluation/attainment/calc`);
    if (res.code === 200) {
      await getData(classroomId.value);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('计算失败' + error);
  } finally {
    ElMessage.closeAll();
    pageLoading.value = false;
  }
};

onMounted(async () => {
  renderLoading.value = true;
  await checkRole();
  classroomIdRef
    ? await fetchCourseId(classroomIdRef)
    : setCourseId(parseJWT(sessionStorage.getItem('token')).obsid);
  await fetchAim({ courseId: courseId.value, current: 1, size: -1 });
  courseTargetData.value = aimList.value.map(a => ({ ...a, name: a.objectiveName, id: a.id }));
  await fetchTypeEva(classroomIdRef);
  await fetchAimEva(classroomIdRef);
  await fetchStuIds(classroomIdRef);
  await fetchLabelList(classroomIdRef);

  Object.entries(aimEvaList.value).forEach(([key, value]) => {
    let newItem = { totalScore: 0 };
    value.map((s, index) => {
      newItem['username'] = s.studentName;
      newItem['key'] = key;
      newItem[s.objectiveName] = s.achievementScore;
      newItem['final'] = s.final || 0;
      newItem['stuno'] = s.stuNo;
      newItem['seq'] = index + 1;
      newItem['totalScore'] = Number(newItem['totalScore']) + Number(s.achievementScore) || 0;
      acheiveMap.value.set(
        s.objectiveName,
        (acheiveMap.value.get(s.objectiveName) || 0) + Number(s.achievementScore)
      );
      acheieveAllMap.value.set(s.objectiveName, [
        ...(acheieveAllMap.value.get(s.objectiveName) || []),
        {
          username: s.studentName,
          score: s.achievementScore,
          stuno: s.stuNo,
          name: s.objectiveName
        }
      ]);
      // personalMap.value.set(key,)
    });
    newItem['totalScore'] = Number((newItem['totalScore'] / value.length).toFixed(2));

    aimEvaListNew.value.push(newItem);
    newItem = {};
  });
  [...acheiveMap.value.keys()].map(k =>
    acheiveMap.value.set(k, Number((acheiveMap.value.get(k) / stuIds.value.length).toFixed(2)))
  );
  console.log('aim', aimEvaListNew.value);
  console.log(acheiveMap.value);
  console.log(acheieveAllMap.value);
  if (!isCourseManager.value) {
    const token = sessionStorage.getItem('token');
    classroomId.value = getObsidFromToken(token);
    await getData(classroomId.value);
  }
});

const getData = async classroomId => {
  pageLoading.value = true;
  try {
    const res = await request.evaluation.get(
      `/evaluation/attainment/getClassroomStuList?classroomId=${classroomId}`
    );
    if (res.code === 200) {
      studentList.value = res.data;
    } else ElMessage.error(res.msg);
  } catch (error) {
    ElMessage.error('获取学生列表失败' + error);
  }

  try {
    const res = await request.evaluation.get(`/evaluation/coursetarget`);
    if (res.code === 200) {
      // courseTargetData.value = res.data;
    } else ElMessage.error(res.msg);
  } catch (error) {
    ElMessage.error('获取课程目标失败' + error);
  }

  try {
    const res = await request.evaluation.get(
      `/evaluation/attainment/getTotalScore?classroomId=${classroomId}`
    );
    if (res.code === 200) {
      totalScore.value = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('获取成绩失败' + error);
  }

  try {
    const res = await request.evaluation.get(
      `/evaluation/attainment/getTargetAchievement?classroomId=${classroomId}`
    );
    if (res.code === 200) {
      targetAchievementData.value = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('获取课程目标达成失败' + error);
  }

  setTimeout(() => {
    initialize();
    pageLoading.value = false;
  }, 100);
};

const initialize = () => {
  stuTotalScoreMap.value = new Map();
  totalScore.value.forEach(score => {
    const { stuId, checkitemId, checkitemScore, ratio } = score;
    if (!stuTotalScoreMap.value.get(stuId)) stuTotalScoreMap.value.set(stuId, 0);
    let totalScore = stuTotalScoreMap.value.get(stuId);
    stuTotalScoreMap.value.set(stuId, totalScore + checkitemScore * ratio);
  });

  stuTargetAchievementMap.value = new Map();
  for (let t of targetAchievementData.value) {
    const { id, stuId, classroomId, targetId, degree } = t;
    if (!stuTargetAchievementMap.value.get(stuId)) stuTargetAchievementMap.value.set(stuId, {});
    stuTargetAchievementMap.value.get(stuId)[targetId] = Number(degree.toFixed(2));
  }

  Object.assign(headerData.value, {
    averScore: 0,
    topScore: 0,
    lowestScore: 100,
    failNum: 0,
    totalNum: 0
  });
  for (let [index, stu] of studentList.value.entries()) {
    stu.rowNo = index + 1;
    let score = stuTotalScoreMap.value.get(stu.id);
    if (!score) continue;
    stu.totalScore = Number(score.toFixed(0));
    headerData.value.averScore += score;
    if (score > headerData.value.topScore) headerData.value.topScore = Number(score.toFixed(0));
    if (score < headerData.value.lowestScore)
      headerData.value.lowestScore = Number(score.toFixed(0));
    if (score < 60) headerData.value.failNum++;

    const targetAchievement = stuTargetAchievementMap.value.get(stu.id);
    Object.assign(stu, targetAchievement);
  }
  headerData.value.averScore = Number(
    (headerData.value.averScore / studentList.value.length).toFixed(2)
  );

  headerData.value.totalNum = stuIds.value.length;
  let min = Number.MAX_VALUE;
  let max = 0;
  let avg = 0;
  let unQualifiedNum = 0;
  aimEvaListNew.value.map(a => {
    if (a.totalScore < 60) {
      unQualifiedNum++;
    }
    avg += a.totalScore;
    min = Math.min(min, a.totalScore);
    max = Math.max(max, a.totalScore);
  });
  headerData.value.failNum = unQualifiedNum;
  headerData.value.lowestScore = min.toFixed(2);
  headerData.value.topScore = max.toFixed(2);
  headerData.value.averScore = Number((avg / stuIds.value.length).toFixed(2));
  console.log(headerData.value, max, min, unQualifiedNum);

  const gradeDivData = generateGradeDivData();
  gradeDivBar.value = echarts.init(document.getElementById('grade-div'), null, { renderer: 'svg' });
  gradeDivBar.value.setOption({
    title: {
      show: true,
      text: '总评成绩分段图',
      left: 'center',
      textStyle: {
        color: '#0f0f0f',
        fontSize: 13,
        fontFamily: 'SimSun'
      }
    },
    tooltip: {},
    legend: {},
    xAxis: {
      data: ['不合格（<60）', '合格（60-74）', '良好（75-84）', '优秀（85-100）']
    },
    yAxis: {},
    series: [
      {
        type: 'bar',
        data: gradeDivData,
        label: {
          show: true,
          position: 'top',
          color: 'grey'
        },
        barWidth: '40%'
      }
    ]
  });

  calcTargetSumAchievementDegree();
  // const sumGraphData = generateSumGraphData();
  const sumGraphData = generateAim();
  targetSumAchievementDegreeBar.value = echarts.init(
    document.getElementById('target-achievement-degree-bar'),
    null,
    { renderer: 'svg' }
  );
  targetSumAchievementDegreeBar.value.setOption({
    tooltip: {},
    legend: {},
    xAxis: {
      data: courseTargetData.value.map(ctd => ctd.name)
    },
    yAxis: {},
    series: [
      {
        type: 'bar',
        data: sumGraphData,
        label: {
          show: true,
          position: 'top',
          color: 'grey'
        },
        markLine: {
          symbol: 'none',
          data: [
            {
              yAxis: 60, // 设置红线的位置
              lineStyle: {
                color: 'red', // 设置红线的颜色
                type: 'solid', // 设置红线的样式（可以是'solid', 'dashed', 'dotted'等）
                width: 1
              },
              label: {
                show: true,
                position: 'end',
                formatter: '合格线',
                color: 'red'
              }
            }
          ],
          silent: true
        },
        tooltip: {
          trigger: 'item', // 触发项为每一个数据项
          formatter: function (params) {
            // params 是每个数据项的参数，包含了当前点的数据
            // formatter 可以是字符串，也可以是函数
            console.log(params);
            const info = params.data.extraInfo;
            return (
              // '代码：' +
              // info.code +
              // '<br>' +
              '课程目标：' + info.name + '<br>' + '达成度：' + params.data.value
            );
          }
        }
      }
    ]
  });

  targetSumAchievementDegreeCategory.value = echarts.init(
    document.getElementById('target-achievement-degree-category'),
    null,
    { renderer: 'svg' }
  );
  targetSumAchievementDegreeCategory.value.setOption({
    tooltip: {},
    xAxis: {
      type: 'category',
      data: courseTargetData.value.map(ctd => ctd.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: sumGraphData,
        markLine: {
          symbol: 'none',
          data: [
            {
              yAxis: 60, // 设置红线的位置
              lineStyle: {
                color: 'red', // 设置红线的颜色
                type: 'solid', // 设置红线的样式（可以是'solid', 'dashed', 'dotted'等）
                width: 1
              },
              label: {
                show: true,
                position: 'end',
                formatter: '合格线',
                color: 'red'
              }
            }
          ],
          silent: true
        },
        type: 'line',
        lineStyle: {
          color: 'dodgerblue' // 设置线的颜色
        },
        label: {
          show: true,
          position: 'top',
          color: 'grey'
        },
        tooltip: {
          trigger: 'item', // 触发项为每一个数据项
          formatter: function (params) {
            // params 是每个数据项的参数，包含了当前点的数据
            // formatter 可以是字符串，也可以是函数
            // console.log(params);
            const info = params.data.extraInfo;
            return (
              // '代码：' +
              // info.code +
              // '<br>' +
              '课程目标：' + info.name + '<br>' + '达成度：' + params.data.value
            );
          }
        }
      }
    ]
  });

  for (let i = 0; i < courseTargetData.value.length; i++) {
    console.log(courseTargetData.value[i]);
    targetAchievementPersonalDegreeScatterList.value[i] = {};
    targetAchievementPersonalDegreeScatterList.value[i].data = generatePersonalGraphData(
      courseTargetData.value[i].objectiveName
    );
    console.log(targetAchievementPersonalDegreeScatterList.value[i]);
    targetAchievementPersonalDegreeScatterList.value[i].element = echarts.init(
      document.getElementById(courseTargetData.value[i].id),
      null,
      { renderer: 'svg' }
    );
    targetAchievementPersonalDegreeScatterList.value[i].element.setOption({
      title: {
        show: true,
        text: courseTargetData.value[i].code,
        left: 'center',
        textStyle: {
          color: '#0f0f0f',
          fontSize: 13,
          fontFamily: 'SimSun'
        }
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'value',
        scale: false
      },
      tooltip: {
        trigger: 'item', // 触发项为每一个数据项
        formatter: function (params) {
          // params 是每个数据项的参数，包含了当前点的数据
          // formatter 可以是字符串，也可以是函数
          console.log(params);
          const info = params.data.extraInfo;
          return (
            '序号：' +
            info.seq +
            '<br>' +
            '姓名：' +
            info.username +
            '<br>' +
            '学号：' +
            info.stuno +
            '<br>' +
            '达成度: ' +
            params.value[1] +
            '<br>' +
            '课程目标: ' +
            courseTargetData.value[i].name
          );
        }
      },
      series: [
        {
          name: 'Male',
          type: 'scatter',
          data: targetAchievementPersonalDegreeScatterList.value[i].data[0],
          label: {
            show: true,
            position: 'top',
            color: 'grey'
          },
          markLine: {
            symbol: 'none',
            data: [
              {
                yAxis: 60, // 设置红线的位置
                lineStyle: {
                  color: 'red', // 设置红线的颜色
                  type: 'solid', // 设置红线的样式（可以是'solid', 'dashed', 'dotted'等）
                  width: 1
                },
                label: {
                  show: true,
                  position: 'end',
                  formatter: '合格线',
                  color: 'red'
                }
              }
            ],
            silent: true
          }
        }
      ]
    });
  }
};

const getClassroomInfoByClassroomId = async () => {
  try {
    const res = await request.evaluation.get('/evaluation/attainment/getClassroomByClassroomId');
    if (res.code === 200) {
      headerData.value = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('获取课堂信息失败' + error);
  }
};

const handleClassroomChosen = async (classroomId_, classroomInfo) => {
  headerData.value = classroomInfo;
  hasChooseClassroom.value = true;
  classroomId.value = classroomId_;
  await getData(classroomId.value);
};

const generateGradeDivData = () => {
  let res = [];
  for (let i = 0; i < 4; i++)
    res[i] = { value: 0, itemStyle: { color: i === 0 ? '#d00' : 'dodgerblue' } };
  aimEvaListNew.value.forEach((a, stuId) => {
    if (a.totalScore < 60) res[0].value++;
    else if (a.totalScore >= 60 && a.totalScore < 75) res[1].value++;
    else if (a.totalScore >= 75 && a.totalScore < 84) res[2].value++;
    else res[3].value++;
  });
  return res;
};

const calcTargetSumAchievementDegree = () => {
  // 计算课程目标的整体达成度（均值）
  courseTargetData.value.forEach(ct => {
    targetSumAchievementDegree.value[ct.id] = 0;
    let excludeNum = 0;
    studentList.value.forEach(stu => {
      if (stu.evaluationState) targetSumAchievementDegree.value[ct.id] += stu[ct.id];
      else excludeNum++;
    });
    let sum = targetSumAchievementDegree.value[ct.id];
    targetSumAchievementDegree.value[ct.id] = Number(
      (sum / (studentList.value.length - excludeNum)).toFixed(2)
    );
  });
};

const generateSumGraphData = () => {
  // 生成有关显示课程目标整体达成度的图表数据
  let res = [];
  courseTargetData.value.forEach(ct => {
    res.push({
      value: targetSumAchievementDegree.value[ct.id],
      itemStyle: {
        color: targetSumAchievementDegree.value[ct.id] >= 0.6 ? 'dodgerblue' : '#d00'
      },
      extraInfo: {
        code: ct.code,
        name: ct.name
      }
    });
  });
  return res;
};

const generateAim = () => {
  let res = [];
  [...acheiveMap.value.keys()].map(k => {
    const totalScore = acheiveMap.value.get(k);
    res.push({
      value: totalScore,
      itemStyle: {
        color: totalScore >= 60 ? 'dodgerblue' : '#d00'
      },
      extraInfo: {
        code: k,
        name: k
      }
    });
  });
  return res;
};

const generatePersonalGraphData = courseTargetName => {
  // 生成有关显示课程目标个体达成度的图表数据
  let res = [];
  let unAchieved = [];
  acheieveAllMap.value.get(courseTargetName).forEach((s, index) => {
    res.push({
      value: [String(index), s['score']],
      itemStyle: {
        color: s['score'] >= 60 ? 'dodgerblue' : '#d00'
      },
      extraInfo: {
        username: s.username,
        stuno: s.stuno,
        objectiveNamw: s.name,
        seq: index + 1
      }
    });
    if (s['score'] < 60) unAchieved.push(index + 1);
  });
  return [res, unAchieved];
};

const generatePDF = async () => {
  // 将报告转为pdf
  pageLoading.value = true;
  const info = ElMessage({
    message: '导出中...',
    duration: 0
  });
  const report = document.getElementById('report-container');
  await html2pdf(report, options.value);
  pageLoading.value = false;
  ElMessage.closeAll();
};

const printReport = () => {
  // 触发浏览器的打印窗口
  pageLoading.value = true;
  const info = ElMessage({
    message: '请稍后...',
    duration: 0
  });
  const report = document.getElementById('report-container');
  html2pdf()
    .from(report)
    .set(options.value)
    .toPdf()
    .get('pdf')
    .then(function (pdf) {
      // 生成完PDF后自动打开打印对话框
      pdf.autoPrint();
      // 创建一个隐藏的 iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdf.output('bloburl');
      document.body.appendChild(iframe);
      // 等待 iframe 加载完成
      iframe.onload = function () {
        // 触发打印
        iframe.contentWindow.print();
      };
      pageLoading.value = false;
      ElMessage.closeAll();
    });
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  color: #0f0f0f;
}

th,
td {
  border: 1px solid #2f2f2f;
  text-align: center;
  word-wrap: break-word;
  /* 处理单元格中的换行 */
}

.class-block {
  margin-top: 30px;
}
</style>
