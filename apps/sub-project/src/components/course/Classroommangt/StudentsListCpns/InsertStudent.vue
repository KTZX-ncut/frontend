<template>
  <div class="inner">
    <h2 style="margin-top: 0">请选择所需选课学生</h2>
    <div class="wrapper">
      <div class="dropdown">
        <el-dropdown>
          <el-tree-select
            :disable-branch-nodes="true"
            :props="defaultProps"
            node-key="id"
            v-model="valueStrictly"
            :data="listData"
            :expand-on-click-node="true"
            :check-on-click-node="true"
            :render-after-expand="false"
            style="width: 250px"
            :render-content="renderContent"
            :placeholder="placeholderText"
            @node-click="nodeClick"
          />
        </el-dropdown>
      </div>
      <div class="searchInput">
        <el-input
          v-model.lazy="searchKeyword"
          @input="debouncedQuerySearch"
          placeholder="请输入姓名关键字"
          class="input-with-select"
          style="width: 200px; margin-right: 0.8vw"
        ></el-input>
        <el-button type="primary" @click="querySearch">搜索</el-button>
      </div>
    </div>
    <div class="v-table">
      <el-table @selection-change="handleSelectionChange" :data="filteredData" style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="120">
          <template #default="scope">{{
            filteredData.findIndex(item => item.id === scope.row.id) + 1
          }}</template>
        </el-table-column>
        <el-table-column property="loginname" label="登录名称" width="120" />
        <el-table-column property="username" label="姓名" width="240" show-overflow-tooltip />
        <el-table-column property="obsname" label="专业" />
      </el-table>
    </div>
    <el-button style="margin-right: 10px" @click="closeInserStudent">关闭</el-button>
    <!-- 添加内联样式 -->
    <el-button type="success" @click="submitUpload">上传</el-button>
  </div>
</template>

<script setup>
import { searchInTable } from '@/utils/searchInTable.js';
import request from '../../../../utils/request';
import { ElMessage, ElMessageBox } from 'element-plus';
import { findNodebyId } from '@/utils/findNodebyId.js';
import { storeToRefs } from 'pinia';
import useTeacherInClass from '@/stores/useTeacherInClass.js';
import { ref, reactive, computed, onMounted, h } from 'vue';
import _ from 'lodash';
import { tr } from 'element-plus/es/locale/index.mjs';

const props = defineProps({
  parseToken: {
    type: String,
    required: true
  }
});

const searchKeyword = ref('');

const listData = ref([]);

const TeacherInClassStore = useTeacherInClass();

const { organizationList, stuList } = storeToRefs(TeacherInClassStore);

const placeholderText = ref('请选择');

const currentobsId = ref('');

const filteredData = ref([]);

const currentobsname = ref('');

// TODO:在异步处理时，应将currentobsID获取以便找到对应专业的学生
const nodeClick = (data, node, event) => {
  node.checked = !node.checked;
  currentobsId.value = data.id;
  getPeopleList();
  currentobsname.value = data.obsname;
  // if (!node.childNodes || node.childNodes.length === 0) {
  //   node.checked = !node.checked;
  //   currentobsId.value = data.id;
  //   getPeopleList();
  // } else {
  //   currentobsname.value = data.obsname;
  // }
};

// *****************搜索框逻辑***********
const getPeopleList = () => {
  request.admin
    .get('/sysmangt/personnelmangt/person?obsid=' + currentobsId.value + '&catelog=1')
    .then(res => {
      if (res.code === 200) {
        // peoplelist.value = res.data;
        searchKeyword.value = null;
        filteredData.value = res.data;
      }
    });
};

const fetchData = () => {
  // 模拟异步获取数据

  //页面进入后，获取左侧的组织机构列表
  request.admin
    .get('/sysmangt/personnelmangt')
    .then(res => {
      // 登录成功
      listData.value = res.data[0].children;
    })
    .catch(error => {
      // 获取失败
      ElMessage({
        type: 'error',
        message: '获取组织机构列表失败'
      });
    });
};

const debouncedQuerySearch = _.debounce(() => {
  querySearch();
}, 500);
const querySearch = () => {
  // 处理搜索逻辑
  if (searchKeyword.value.length >= 1 || searchKeyword.value.length === 0) {
    filteredData.value = searchInTable(filteredData.value, searchKeyword.value, 'username'); // 假设我们按 'username' 列搜索
    // console.log('搜索内容:', searchKeyword.value)
  }
};
const nodes = ref([]);
// const nodesMap = reactive(new Map());
const selectedIds = ref(new Set());

const handleSelectionChange = async data => {
  // 创建一个新的选中 ID 集合
  const newSelectedIds = new Set(data.map(row => row.id));
  data.forEach(item => {
    if (!selectedIds.value.has(item.id)) {
      const newNode = {
        classRoomId: props.parseToken.obsid,
        usersid: item.id,
        obsid: item.obsid,
        username: item.username,
        obsname: item.obsname,
        proname: currentobsname.value,
        loginname: item.loginname
      };
      nodes.value.push(newNode); // 添加到 nodes
    }
  });

  // 处理取消选中的项
  selectedIds.value.forEach(id => {
    if (!newSelectedIds.has(id)) {
      const index = nodes.value.findIndex(node => node.usersid === id);
      if (index > -1) nodes.value.splice(index, 1); // 从 nodes 中移除
    }
  });

  // 更新选中 ID 集合
  selectedIds.value = newSelectedIds;
  console.log(nodes.value); // 更新后的数组
};

// const handleSelectionChange = async data => {
//   nodes.value.forEach(node => nodesMap.set(node.usersid, node));
//   // console.log(data);
//   data.forEach(item => {
//     console.log(item);
//     if (!nodesMap.has(item.id)) {
//       const newNode = {
//         classRoomId: props.parseToken.obsid,
//         usersid: item.id,
//         obsid: item.obsid,
//         username: item.username,
//         obsname: item.obsname,
//         proname: currentobsname.value,
//         loginname: item.loginname
//       };
//       nodesMap.set(item.id, newNode);
//       nodes.value.push(newNode);
//       // nodes.value.push({
//       //   classRoomId: props.parseToken.obsid,
//       //   usersid: item.id,
//       //   obsid: item.obsid,
//       //   username: item.username,
//       //   obsname: item.obsname,
//       //   proname: currentobsname.value,
//       //   loginname: item.loginname
//       // });
//     }
//   });
//   console.log(nodes.value);
// };

// const handleCheckChange = async (node, nodeData) => {
//   if (
//     (!node.children || node.children.length === 0) &&
//     (!node.studentDtos || node.studentDtos.length === 0)
//   ) {
//     // 选择相应的组织机构，其人员很多，所以使用数组进行存储
//     if (nodeData) {
//       // console.log(findNodebyId(listData.value, node.id));
//       // // console.log(findNodebyId(listData.value, node.id));
//       // // console.log(node.id);
//       // // console.log(node.id);
//       nodeIds.value.push(node.id);
//       // nodes为存放节点数据的数组
//       nodeIds.value.forEach(item => {
//         const ret = findNodebyId(listData.value, item);
//         nodes.value.push({
// classRoomId: props.classroomId,
// usersid: ret.usersid,
// obsid: ret.obsid,
// username: ret.username,
// obsname: ret.obsname,
// proname: ret.proname,
// loginname: ret.loginname
//         });
//       });
//       console.log(nodes.value);
//       // const res = await TeacherInClassStore.fetchInsertStudent(node.id);
//       // if (res) {
//       //   // console.log(res);
//       //   findNodebyId(listData.value[0].children, node.id, res);
//       //   // console.log(listData.value[0].children);
//       // }
//       // console.log(node);
//     } else {
//       nodeIds.value.pop(node.id);
//     }
//   }
// };

// 批量导入学生
const submitUpload = async () => {
  // 再次去重
  const uniqueNodes = _.uniqBy(nodes.value, 'usersid');
  const res = await TeacherInClassStore.importStudent(uniqueNodes);
  if (res.code === 200) {
    ElMessage.success('学生选课成功');
    location.reload();
  } else {
    ElMessage.error('学生选课失败');
  }
};

const emits = defineEmits(['closeTab']);
const closeInserStudent = () => {
  emits('closeTab', false);
};

const defaultProps = {
  children: node => node.children || node.studentDtos, // 子节点字段
  label: node => (node.username ? node.username + ' ' + node.loginname : node.obsname) // 显示文本字段
};

const valueStrictly = ref();

onMounted(async () => {
  fetchData();
});
</script>

<style lang="less" scoped>
.wrapper {
  display: flex;
  justify-content: space-between;
  .dropdown {
    margin-bottom: 15px;
    .table-container {
      height: 150px;
    }
  }
  .searchInput {
    margin-bottom: 15px;
  }
}
.v-table {
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>
