<template>
	<el-container style="height: 92vh;">
		<el-header style="height: auto; padding: 5px 0px; width:100%; text-align: left; background-color:#deebf7;">
			<el-button v-if="roleName === '课程负责人'" type="warning" style="margin-left: 0.8vw;" @click="openCopyDialog">复制关键字</el-button>
			<el-button type="success" style="margin-left: 0.8vw;" @click="addKeyword">新增</el-button>
			<!-- <el-button type="primary" @click="openDictionary">从关键字字典选择</el-button> -->
			<el-button type="danger" @click="openDeleteDialog">删除</el-button>
			<el-button v-blur-on-click type="info" @click="importData">导入</el-button>

			<el-button type="primary">保存</el-button>
			<el-input v-model="tableSearchData" style="margin-left: 0.8vw; width: 250px" placeholder="查找关键字">
				<template #append><el-button :icon="Search" /></template>
			</el-input>

			<el-dialog :destroy-on-close="true" :show-close="false" :close-on-click-modal="false"
				style="width: 22vw; padding-top: 0" v-model="importdialogViaible">
				<h2 style="margin-top: 0">导入关键字</h2>
				<el-upload class="upload-demo" ref="uploadRef" :auto-upload="true" :show-file-list="false"
					:before-upload="beforeUpload" style="margin-bottom: 20px;width:18vw;margin-left:10px">
					<!-- 使用输入框作为上传的触发器 -->
					<el-input slot="trigger" v-model="fileName" placeholder="未选择文件" readonly
						style="cursor: pointer; text-align:center;width:18vw"></el-input>
				</el-upload>

				<div style="text-align: center; margin-bottom: 20px">
					<!-- 添加内联样式 -->
					<!-- 下载链接 -->
					<a href="/file/关键字导入模板.xlsx" download>点击下载模板文件</a>
				</div>

				<div style="text-align: right">
					<!-- 添加内联样式 -->
					<!-- 上传按钮 -->
					<el-button style="margin-right: 10px" @click="closeimportdialogViable">关闭</el-button>
					<!-- 添加内联样式 -->
					<el-button type="success" @click="submitUpload">上传</el-button>
				</div>
			</el-dialog>
		</el-header>
		<CopyModelDialog ref="copyDialogRef" copy-type="keyword" @copy-success="loadData" />
		<el-main style="padding: 0;">

			<!----------------------------------确认删除的弹框-------------------------------------->
			<el-dialog v-model="deleteDialogVisible" width="450" destroy-on-close>
				<template #header="{ titleId, titleClass }">
					<div v-if="!relatedKWA.length" style="text-align: left; margin-bottom: -15px;">
						<div :id="titleId" :class="titleClass" style="font-size: 15px;">
							<el-button link type="warning">
								<el-icon size="20" style="padding-bottom: 3px; box-sizing: border-box;">
									<WarningFilled />
								</el-icon>
							</el-button>
							是否要删除选中的关键字
						</div>
					</div>
				</template>
				<div v-if="relatedKWA.length > 0" style="text-align: left;">
					<div style="margin-bottom: 5px;">
						<el-text type="danger" style="display: flex;">
							<div>将删除的关键字与以下KWA有关，请先删除相关的KWA</div>
						</el-text>
					</div>
					<el-table :data="relatedKWA" style="width: 100%; height: 300px;" stripe border>
						<el-table-column label="KWA名称" prop="name" />
					</el-table>
				</div>
				<template #footer>
					<div v-if="!relatedKWA.length" class="dialog-footer">
						<el-button @click="deleteDialogVisible = false">取消</el-button>
						<el-button type="primary" @click="deleteKeyword()">
							确认
						</el-button>
					</div>
				</template>
			</el-dialog>
			<!-------------------------------------------------------------------------------------->

			<el-table :data="filteredTableData" stripe style="width: 100%; height: 100%;" @selection-change="handleSelectionChange"
				size="large">
				<el-table-column type="selection" width="55"></el-table-column>
				<el-table-column prop="showId" label="序号" width="60"></el-table-column>
				<el-table-column prop="name" label="名称" width="240">
					<template #default="tableRowData">
						<div v-if="!editRef.get(tableRowData.row.id)['editName']" style="width: 100%; height: 23px;"
							@dblclick="editEditRef(tableRowData.row, 'editName')">{{ tableRowData.row.name }}</div>
						<el-input ref="inputNameRef" v-else v-model="tableRowData.row.name"
							@blur="saveEditRef(tableRowData.row, 'editName')"
							@keyup.enter="saveEditRef(tableRowData.row, 'editName')"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="datavalue" label="数值" width="100">
					<template #default="tableRowData">
						<div v-if="!editRef.get(tableRowData.row.id)['editDataValue']"
							style="width: 100%; height: 23px;"
							@dblclick="editEditRef(tableRowData.row, 'editDataValue')">{{ tableRowData.row.datavalue
							}}</div>
						<el-input ref="inputTableRowDataRef" v-else v-model="tableRowData.row.datavalue"
							@blur="saveEditRef(tableRowData.row, 'editDataValue')"
							@keyup.enter="saveEditRef(tableRowData.row, 'editDataValue')"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="importantlevelid" label="重要程度" width="150">
					<template #default="tableRowData">
						<div v-if="!editRef.get(tableRowData.row.id)['editImportantlevelid']"
							style="width: 100%; height: 23px;"
							@dblclick="editEditRef(tableRowData.row, 'editImportantlevelid')">{{
								tableRowData.row.importantlevelid
							}}</div>
						<el-input ref="inputImportantlevelidRef" v-else v-model="tableRowData.row.importantlevelid"
							@blur="saveEditRef(tableRowData.row, 'editImportantlevelid')"
							@keyup.enter="saveEditRef(tableRowData.row, 'editImportantlevelid')"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="remark" label="备注">
					<template #default="tableRowData">
						<div v-if="!editRef.get(tableRowData.row.id)['editRemark']" style="width: 100%; height: 23px;"
							@dblclick="editEditRef(tableRowData.row, 'editRemark')">{{ tableRowData.row.remark }}</div>
						<el-input ref="inputRemarkRef" v-else v-model="tableRowData.row.remark"
							@blur="saveEditRef(tableRowData.row, 'editRemark')"
							@keyup.enter="saveEditRef(tableRowData.row, 'editRemark')"></el-input>
					</template>
				</el-table-column>
			</el-table>
			<!--          <p>{{ filteredTableData }}</p>-->
		</el-main>
	</el-container>
</template>

<script setup>
import { Search, WarningFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import request from "../../utils/request";
import _ from 'lodash';
import CopyModelDialog from '../course/subcomponents/CopyModelDialog.vue';

const roleName = JSON.parse(sessionStorage.getItem('users'))?.rolename;
const copyDialogRef = ref(null);
function openCopyDialog() { copyDialogRef.value?.init(); }

const tableSearchData = ref('');    // 主界面搜索框数据

const deleteDialogVisible = ref(false);

const relatedKWA = ref([]);

const loadData = () => {
	request.evaluation.get('/evaluation/keywords').then((res) => {
		if (res.code === 200) {
			tableData.value = res.data;
			initialize(tableData.value);
		}
		else {
			ElMessage.error(res.msg);
		}
	}).catch((error) => {
		ElMessage.error('获取关键字失败' + error);
	})
}

const initialize = () => {
	var id = 1;
	tableData.value.forEach((item) => {
		item.showId = id++;
		item.datavalue = Number(item.datavalue).toFixed(2);
		editRef.value.set(item.id, { "editName": false, "editDataValue": false, "editImportantlevelid": false, "editRemark": false });
	});
}

onMounted(() => {
	loadData();
	initialize();
});

const tableData = ref([]);

const filteredTableData = computed(() => {
	if (!tableSearchData.value) {
		return tableData.value; // 如果没有搜索查询，返回原始数据
	}
	return tableData.value.filter(item => {
		// 根据需要调整过滤逻辑，这里假设你想根据 'name' 属性进行过滤
		return item.name.includes(tableSearchData.value);
	});
});

var multipleSelection = [];

const handleSelectionChange = (val) => {
	multipleSelection = val;
}

const addKeyword = () => {
	var flag = true;
	// tableData.value.forEach(item => {
	//   if(item.id === '空'){
	//     flag = false;
	//     ElMessage({
	//       type: 'warning',
	//       message: '有未设置完善的关键字',
	//       duration: 800
	//     });
	//   }
	// });
	if (flag) {
		var newData = {
			id: '',
			name: '未设置名称',
			datavalue: 0.00,
			importantlevelid: '0.0',
			remark: '无',
		}
		request.evaluation.post('/evaluation/keywords/create', newData).then((res) => {
			if (res.code === 200) {
				loadData();
				ElMessage.success('新增成功');
			}
			else {
				ElMessage.error(res.msg);
			}
		}).catch((error) => {
			ElMessage.error('新增关键字失败' + error);
		});
	}
}

const openDeleteDialog = () => {
	relatedKWA.value = [];
	if (multipleSelection.length === 0) {
		ElMessage({
			type: 'warning',
			message: '未选择关键字',
			duration: 800
		});
		return;
	}
	var ids = [];
	for (const sel of multipleSelection) {
		ids.push(sel.id);
	}
	request.evaluation.post(`/evaluation/keywords/getKwaByKeywordsId`, ids).then((res) => {
		if (res.code === 200) {
			relatedKWA.value = res.data;
		}
		else {
			ElMessage.error(res.msg);
		}
	}).catch((error) => {
		ElMessage.error('获取相关KWA失败' + error);
	})

	deleteDialogVisible.value = true;
}

const deleteKeyword = () => {
	var ids = [];
	for (const sel of multipleSelection) {
		ids.push(sel.id);
	}
	request.evaluation.post('/evaluation/keywords/delete', ids).then((res) => {
		if (res.code === 200) {
			loadData();
			ElMessage.success('删除成功');
		}
		else {
			ElMessage.error(res.msg);
		}
	}).catch((error) => {
		ElMessage.error('删除关键字失败' + error);
	});

	deleteDialogVisible.value = false;
}

const editRef = ref(new Map());

const inputNameRef = ref(null);
const inputTableRowDataRef = ref(null);
const inputImportantlevelidRef = ref(null);
const inputRemarkRef = ref(null);

const tempRowData = ref({});

const editEditRef = (row, field) => {
	tempRowData.value = _.cloneDeep(row);
	editRef.value.get(row.id)[field] = true;
	setTimeout(() => {
		if (field === 'editName') {
			inputNameRef.value.focus();
		} else if (field === 'editDataValue') {
			inputTableRowDataRef.value.focus();
		} else if (field === 'editImportantlevelid') {
			inputImportantlevelidRef.value.focus();
		} else if (field === 'editRemark') {
			inputRemarkRef.value.focus();
		}
	}, 0);
};

const importdialogViaible = ref(false)
const uploadRef = ref(null);
const fileName = ref(''); // 文件名
const fileToUpload = ref(null); // 要上传的文件对象
const importData = () => {
	importdialogViaible.value = true;

}

function handleFileChange(file) {
	if (file) {
		fileName.value = file.name; // 显示文件名
		fileToUpload.value = file; // 保存文件对象
	}
}

function beforeUpload(file) {
	handleFileChange(file); // 在上传前处理文件变化
	return false; // 阻止默认上传行为
}

function submitUpload() {
	if (fileToUpload.value) {
		const formData = new FormData();
		formData.append('file', fileToUpload.value);
		console.log(formData);
		request.evaluation
			.post('/evaluation/keywords/import', formData)
			.then(res => {
				// 处理响应
				if (res.code === 200) {
					ElMessage.success('文件上传成功！');
					importdialogViaible.value = false;
					loadData();
				} else {
					ElMessage.error(res.message || '上传失败！');
				}
			})
			.catch(error => {
				ElMessage.error(error.message || '上传时发生错误！');
			});
	} else {
		ElMessage.warning('请先选择一个文件！');
	}
}

const closeimportdialogViable = () => {
	importdialogViaible.value = false;
	fileName.value = '';
	fileToUpload.value = null;
};

const saveEditRef = (row, field) => {
	if (_.isEqual(row, tempRowData.value)) {
		editRef.value.get(row.id)[field] = false;
		return;
	}
	editRef.value.get(row.id)[field] = false;
	request.evaluation.post('/evaluation/keywords', row).then((res) => {
		if (res.code === 200) {
			loadData();
			ElMessage.success('修改成功');
		}
	}).catch((error) => {
		ElMessage.error('修改能力失败' + error);
	})
};

</script>

<style scoped></style>
