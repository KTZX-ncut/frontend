import { defineStore } from 'pinia';
import { getStuList } from '@/api/teacherInclass.js';
import {
  delAllStudent,
  delSingleStudent,
  getOrgnization,
  importStudentList,
  importStudentmenu,
  isAttendEvaluation,
  generatePortrait,
  isAttendEvaluationAchievement,
  generatePortraitAchievement
} from '../api/teacherInclass';

const useTeacherInClass = defineStore('TeacherInClass', {
  // 存放数据
  state: () => ({
    stuList: [],
    organizationList: [],
    peopleList: []
  }),
  // 存放异步请求函数
  actions: {
    setPeopleList(payload) {
      this.peopleList = payload;
    },
    // 获取学生信息表
    async fetchStudentList(parseToken) {
      const { data } = await getStuList(parseToken.obsid);
      this.stuList = data;
      return {
        data,
        code: '200'
      };
    },
    // 获取插入学生信息列表
    async fetchInsertStudent(obsid) {
      const { data } = await getStuList(obsid);
      this.organizationList = data;
    },
    // 删除某一学生信息,stuIds类型为数组
    async delStudentOne(classroomId, stuIds) {
      console.log(classroomId, stuIds);
      const res = await delSingleStudent(classroomId, stuIds);
      return res;
    },
    // 删除所有学生信息
    async delStudentAll(classRoomId) {
      const res = await delAllStudent(classRoomId);
      return res;
    },
    // 获取组织结构
    async getSystemOrg() {
      const { data } = await getOrgnization();
      this.organizationList = data;
      return {
        code: 200
      };
    },
    // 模板导入
    async importExcel(fd) {
      const res = await importStudentList(fd);
      return res;
    },
    // 批量导入
    async importStudent(list) {
      const res = await importStudentmenu(list);
      return res;
    },
    // 修改学生参与评价(形成性)
    async putAttendEvaluation(arr) {
      return await isAttendEvaluation(arr);
    },
    // 一键生成画像（形成性）
    async generatePortraitInstant(courseId, classroomId, stuIdList, paperIdList) {
      return await generatePortrait(courseId, classroomId, stuIdList, paperIdList);
    },
    // 修改学生参与评价（达成性）
    async putAttendEvaluationAchievement(arr) {
      return await isAttendEvaluationAchievement(arr);
    },
    // 一键生成画像（达成性）
    async generatePortraitAchievement(courseId, classroomId, stuIdList, paperIdList) {
      return await generatePortraitAchievement(courseId, classroomId, stuIdList, paperIdList);
    }
  }
});

export default useTeacherInClass;
