<template>
	<el-container style="height: 92vh;">
		<!--两个按钮，靠最左-->
		<el-header
			style="height: 7vh; padding: 5px 0px; width:100%; background-color:#deebf7; display: flex; align-items: center;">
			<template v-if="isCourseManager">
				<el-button type="primary" style="margin-left: 0.8vw;" @click="createParentData">新增章节</el-button>
				<el-button type="danger" @click="deleteSel">删除</el-button>
				<el-button type="success" @click="">保存</el-button>
				<el-button v-if="selParent" type="primary" @click="createChildrenData">新增小节</el-button>
				<el-button type="warning" style="margin-left: 0.8vw;" @click="openCopyDialog">复制思政知识单元</el-button>
			</template>
			<div class="flex-container" style="width: 100%;font-weight: bold; font-size: 25px;">课程名称</div>
		</el-header>
		<CopyModelDialog ref="copyDialogRef" copy-type="ideologyUnit" @copy-success="handleCopySuccess" />
		<el-main style="padding: 0; background-color: white;">
			<el-table class="uniqueTable" ref="sortableInstance" :data="tableData" v-loading="tableLoading"
				element-loading-background="rgba(0, 0, 0, 0.2)" style="height: 100%; width: 100%;" row-key="id"
				highlight-current-row size="large" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
				:row-class-name="tableRowClassName" @selection-change="handleSelectionChange"
				@current-change="changeSelRow">
				<el-table-column v-if="isCourseManager" type="selection" width="55"></el-table-column>
				<el-table-column prop="type" label="类型" sortable width="180">
					<!--          <template #default="tableRowData">-->
					<!--            <span v-if="!editRef.get(tableRowData.row.id)['editType']"-->
					<!--                  @dblclick="editEditRef(tableRowData.row,'editType')">{{ tableRowData.row.type }}</span>-->
					<!--            <el-input ref="inputTypeRef" v-else v-model="tableRowData.row.type" @blur="saveEditRef(tableRowData.row,'editType')"-->
					<!--                      @keyup.enter="saveEditRef(tableRowData.row,'editType')" style="width: 110px"></el-input>-->
					<!--          </template>-->
				</el-table-column>
				<el-table-column prop="name" label="名称" width="180">
					<template #default="tableRowData">
						<span v-if="!editRef.get(tableRowData.row.id)['editName']"
							@dblclick="editEditRef(tableRowData.row, 'editName')">{{ tableRowData.row.name }}</span>
						<el-input ref="inputNameRef" v-else-if="isCourseManager" v-model="tableRowData.row.name"
							@blur="saveEditRef(tableRowData.row, 'editName')"
							@keyup.enter="saveEditRef(tableRowData.row, 'editName')"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="datavalue" label="数值" sortable width="100">
					<template #default="tableRowData">
						<span v-if="!editRef.get(tableRowData.row.id)['editDataValue']"
							@dblclick="editEditRef(tableRowData.row, 'editDataValue')">
							{{ tableRowData.row.datavalue }}
						</span>
						<el-input ref="inputDataValueRef" v-else-if="isCourseManager"
							v-model="tableRowData.row.datavalue" @blur="saveEditRef(tableRowData.row, 'editDataValue')"
							@keyup.enter="saveEditRef(tableRowData.row, 'editDataValue')"></el-input>
					</template>
				</el-table-column>
				<el-table-column prop="vValues" label="绑定Value" v-if="isCourseManager">
					<template #default="tableRowData">
						<el-popover v-if="isCourseManager" placement="right-end" width="500"
							:visible="vValuePopoverVisible[tableRowData.row.id]">
							<div style="text-align: right;">
								<el-button style="font-size: 23px;" :type="'danger'" link
									@click="vValuePopoverVisible[tableRowData.row.id] = isVValuePopoverShow = false;">×</el-button>
							</div>
							<el-table ref="vValueTableRef" :data="vValueData" height="400" @selection-change="handleVValueChange"
								stripe row-key="id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" :default-expand-all="true">
								<el-table-column align="center" type="selection"
									:selectable="row => vValueTableSelectable(row, tableRowData.row)"
									width="40"></el-table-column>
								<el-table-column width="60">
									<template v-slot="row">
										{{ row.row.index }}
									</template>
								</el-table-column>
								<el-table-column prop="name" label="名称"></el-table-column>
							</el-table>
							<div style="margin-top: 10px; display: flex; justify-content: center;">
								<el-button type="success" @click="saveEditVValue(tableRowData.row)">确定</el-button>
							</div>
							<template #reference>
								<el-icon class='icon' color="dodgerblue">
									<Edit @click="openVValueDict(tableRowData.row)" />
								</el-icon>
							</template>
						</el-popover>
						<span v-if="tableRowData.row.sumVValues && tableRowData.row.sumVValues.length > 0">
							{{ ' ' + tableRowData.row.sumVValues.map(item => item.name || item.vname || '').join(", ") }}
						</span>
					</template>
				</el-table-column>
			</el-table>

		</el-main>
	</el-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from "element-plus";
import { Edit } from '@element-plus/icons-vue';
import request from "../../utils/request";
import Sortable from 'sortablejs';
import _ from 'lodash';
import { TableInstance } from 'element-plus';
import CopyModelDialog from '../course/subcomponents/CopyModelDialog.vue';
import parseJWT from '../../utils/parseJWT';

//-------------------------缓存数据变量
//应该存储真正的课程ID
// 当前课程ID：从登录 token 解析出 obsid（不再写死，否则复制到当前课程后页面读取的是固定课程导致看不到数据）
const courseid = parseJWT(sessionStorage.getItem('token'))?.obsid || "";
const isCourseManager = ref(false);
const copyDialogRef = ref(null);
const openCopyDialog = () => {
	copyDialogRef.value?.init();
};
const handleCopySuccess = async () => {
	await loadVValueData();
	await loadData();
};
var multipleSelection = [];
var selParent = ref(null);
const editRef = ref(new Map());
const inputTypeRef = ref(null);
const inputNameRef = ref(null);
const inputDataValueRef = ref(null);
const sortableInstance = ref(null);

//-------------------------数据
const tableData = ref([]);
const tableLoading = ref(true);
const vValueData = ref([]);
const vValuePopoverVisible = ref({});


//-------------------------处理方法
//children行class显示
const tableRowClassName = ({ row, rowIndex }) => {
	// console.log(row);
	if (row.isChildren) {
		return 'child-row'
	}
	return ''
}

const checkRole = async () => {     // 查询是否是课程负责人，课程负责人要先选择课堂
	try {
		const res = await request.evaluation.get('/evaluation/attainment');
		if (res.code === 200) {
			if (res.data.isCourseManager) {
				isCourseManager.value = true;
			}
			else {
				isCourseManager.value = false;
			}
		} else {
			ElMessage.error(res.msg);
		}
	} catch (error) {
		ElMessage.error('查询角色类型失败' + error);
	}
	return isCourseManager.value;
}

//初始化
onMounted(async () => {
	await checkRole();
	await loadVValueData();
	await loadData();
	const table = document.querySelector('.uniqueTable .el-table__body-wrapper tbody');
	// const tbody = myTable.value.$el.querySelector('.el-table__body-wrapper tbody');

	if (isCourseManager.value) {
		// 创建 Sortable 实例
		sortableInstance.value = Sortable.create(table, {
			animation: 150,
			onEnd: (evt) => {
				const list = tableData;
				const oldIndex = evt.oldIndex;
				const newIndex = evt.newIndex;
				// 使用 Vue 的响应式方法来更新数组
				if (oldIndex !== newIndex) {
					var selData = getDataForPosition(oldIndex);
					var toData = getDataForPosition(newIndex);
					if (selData.pOrderNum === toData.pOrderNum) {
						var data = {
							id: selData.id,
							pid: selData.pid,
							courseid: courseid,
							ordernum: selData.ordernum,
						}
						request.evaluation.post(`/evaluation/knowledgeUnit/updateKnowledgeUnitOrdernum?preOrdernum=${toData.ordernum - 1}`, data)
							.then((res) => {
								if (res.code === 200) {
									ElMessage.success('移动成功');
									loadData();
								} else {
									loadData();
									ElMessage.error(res.msg);
								}
							}).catch((error) => {
								ElMessage.error('移动失败' + error);
								setTimeout(() => {
									ElMessage.success("重新加载数据");
									loadData();
								}, 1);
							});
					}
				}
				const tagName = evt.item.tagName;
				const items = evt.from.getElementsByTagName(tagName);
				if (evt.oldIndex > evt.newIndex) {
					evt.from.insertBefore(evt.item, items[evt.oldIndex + 1]);
				} else {
					evt.from.insertBefore(evt.item, items[evt.oldIndex]);
				}
			},
		});
	}
});

const getDataForPosition = (p) => {
	for (const item of tableData.value) {
		if (item.position === p) {
			return item;
		}
		if (item.children) {
			for (const i of item.children) {
				if (i.position === p) {
					return i;
				}
			}
		}
	}
	return null;
}

const loadVValueData = async () => {
	try {
		const res = await request.evaluation.get('/evaluation/ideology/value');
		if (res.code === 200) {
			// 保持树形结构，用于el-table的tree-props显示
			// leaf=0, level=1显示在第一级，leaf=1, level=2显示在第二级
			// 为每个节点添加序号，格式：1, 1.1, 1.1.1
			const processTree = (nodes, parentIndex = '') => {
				return (nodes || []).map((node, index) => {
					const nodeData = node.extra || node;
					// 计算当前节点的序号
					const currentIndex = parentIndex ? `${parentIndex}.${index + 1}` : `${index + 1}`;
					const item = {
						id: node.id,
						name: node.name || nodeData.vname || '',
						vname: nodeData.vname || node.name || '',
						parentId: node.parentId || nodeData.parentId,
						level: nodeData.level || 0,
						leaf: nodeData.leaf || 0,
						index: currentIndex, // 添加序号属性
						hasChildren: node.children && node.children.length > 0,
						children: node.children && node.children.length > 0 ? processTree(node.children, currentIndex) : []
					};
					return item;
				});
			};
			vValueData.value = processTree(res.data || []);
		} else {
			ElMessage.error(res.msg);
		}
	} catch (error) {
		ElMessage.error('获取v值数据失败' + error);
	}
}

// 获取v值在树中的索引（从节点的index属性获取）
const getVValueIndex = (row) => {
	return row.index || '';
}

const loadData = async () => {
	tableLoading.value = true;
	try {
		const res = await request.evaluation.get('/evaluation/knowledgeUnit/getKnowledgeUnitTree?courseid=' + courseid);
		if (res.code === 200) {
			const normalizeVValuesField = (nodes) => {
				(nodes || []).forEach((n) => {
					n.vValues = n.vValues || n.vvalues || [];
					if (n.children && n.children.length) {
						normalizeVValuesField(n.children);
					}
				});
			};
			normalizeVValuesField(res.data);
			tableData.value = res.data;
			// console.log(res.data);
			initialize();
		} else {
			ElMessage.error(res.msg);
		}
	} catch (error) {
		ElMessage.error('获取失败' + error);
	}
	tableLoading.value = false;
}

const initialize = () => {
	var p = 0;
	tableData.value.forEach((item) => {
		// 处理v值
		item.oldVValueIds = item.vValueIds = item.vValues ? item.vValues.map(v => v.vid) : [];
		const vMap = new Map();
		[...(item.vValues || []), ...(item.children_vValues || [])].forEach(v => vMap.set(v.vid, v));
		item.sumVValues = Array.from(vMap.values());
		item.sumVValueIds = item.sumVValues.map(v => v.vid);

		item.datavalue = Number(item.datavalue).toFixed(2);
		item.position = p++;
		item.pOrderNum = 0;
		item.isChildren = false;
		vValuePopoverVisible.value[item.id] = false;
		editRef.value.set(item.id, { "editName": false, "editDataValue": false });
		if (item.children) {
			item.children.forEach((i) => {
				// 处理v值
				i.oldVValueIds = i.vValueIds = i.vValues ? i.vValues.map(v => v.vid) : [];
				const childVMap = new Map();
				[...(i.vValues || []), ...(i.children_vValues || [])].forEach(v => childVMap.set(v.vid, v));
				i.sumVValues = Array.from(childVMap.values());
				i.sumVValueIds = i.sumVValues.map(v => v.vid);

				i.datavalue = Number(i.datavalue).toFixed(2);
				i.position = p++;
				i.isChildren = true;
				//父节点ordernum
				i.pid = item.id;
				i.pOrderNum = item.ordernum;
				i.parentType = item.type;
				vValuePopoverVisible.value[i.id] = false;
				editRef.value.set(i.id, { "editName": false, "editDataValue": false });
			});
		}
	});
}

//选中
const handleSelectionChange = (val) => {
	multipleSelection = val;
}

//选中行
const changeSelRow = (row) => {
	if (row) {
		if (!row.isChildren) {
			selParent.value = row;
		} else {
			selParent.value = null;
		}
	} else {
		selParent.value = null;
	}
};

//创建章
const createParentData = () => {
	var newData = {
		courseid: courseid,
		type: '未命名的章节',
		name: '未命名的名称',
		datavalue: 0.00,
	}
	request.evaluation.post('/evaluation/knowledgeUnit/insertChapter', newData).then((res) => {
		if (res.code === 200) {
			loadData();
			ElMessage.success('新增成功');
		} else {
			ElMessage.error(res.msg);
		}
	}).catch((error) => {
		ElMessage.error('新增失败' + error);
	});
}

//创建节
const createChildrenData = () => {
	var newData = {
		courseid: courseid,
		pid: selParent.value.id,
		type: '未命名的小节',
		name: '未命名的名称',
		datavalue: 0.00,
	}
	request.evaluation.post('/evaluation/knowledgeUnit/insertSection', newData).then((res) => {
		if (res.code === 200) {
			loadData();
			ElMessage.success('新增成功');
		} else {
			ElMessage.error(res.msg);
		}
	}).catch((error) => {
		ElMessage.error('新增失败' + error);
	});
}

//双击修改章节、名称
const editEditRef = (row, field) => {
	editRef.value.get(row.id)[field] = true;
	setTimeout(() => {
		if (field === 'editType') {
			inputTypeRef.value.focus();
		} else if (field === 'editName') {
			inputNameRef.value.focus();
		} else if (field === 'editDataValue') {
			inputDataValueRef.value.focus();
		}
	}, 0);
};

const vValueTableRef = ref<TableInstance>();
const vValueSelection = ref([]);
const isVValuePopoverShow = ref(false);

//保存章节、名称修改
const saveEditRef = (row, field) => {
	editRef.value.get(row.id)[field] = false;
	request.evaluation.post('/evaluation/knowledgeUnit/updateKnowledgeUnit', row).then((res) => {
		if (res.code === 200) {
			loadData();
			ElMessage.success('更新成功');
		} else {
			ElMessage.error(res.msg);
		}
	}).catch((error) => {
		ElMessage.error('更新失败' + error);
	});
	//信息已被修改，处理
};

// v值相关方法
const vValueTableSelectable = (vValueRow, tableRowData) => {
	tableData.value.forEach(t => {
		if (t.id === tableRowData.id) {
			tableRowData = t;
			return;
		}
	});
	return !(tableRowData.children_vValues || []).map(t => t.vid).includes(vValueRow.id);
}

const flattenVValueTree = (nodes) => {
	const result = [];
	const walk = (list) => {
		(list || []).forEach((n) => {
			result.push(n);
			if (n.children && n.children.length) {
				walk(n.children);
			}
		});
	};
	walk(nodes);
	return result;
}

const toggleVValueSelection = vValueIds => {
	const idSet = new Set((vValueIds || []).map(id => String(id)));
	const allRows = flattenVValueTree(vValueData.value);
	const rows = allRows.filter(v => idSet.has(String(v.id)));
	if (rows.length > 0) {
		nextTick(() => {
			rows.forEach(row => {
				vValueTableRef.value?.toggleRowSelection(row, true);
			});
		});
	} else {
		vValueTableRef.value?.clearSelection();
	}
};

const handleVValueChange = selection => {
	vValueSelection.value = selection;
};

const openVValueDict = (row) => {
	if (isVValuePopoverShow.value) return;
	vValuePopoverVisible.value[row.id] = true;
	isVValuePopoverShow.value = true;
	vValueTableRef.value?.clearSelection();		
	// 仅回显当前行“直接绑定”的v值，避免把子节点继承的children_vValues也拿来回显（它们在selectable里是禁选的）
	toggleVValueSelection(row.vValueIds || []);
}



//保存v值修改
const saveEditVValue = async (row) => {
	vValuePopoverVisible.value[row.id] = isVValuePopoverShow.value = false;
	row.vValueIds = _.cloneDeep(vValueSelection.value).map(v => v.id);
	vValueTableRef.value!.clearSelection();
	var newVValueIds = row.vValueIds.filter(id => !(row.oldVValueIds || []).includes(id));
	var deleteVValueIds = (row.oldVValueIds || []).filter(id => !row.vValueIds.includes(id));
	
	let hasError = false;
	
	// 删除v值
	if (deleteVValueIds.length !== 0) {
		try {
			const res = await request.evaluation.post(`/evaluation/knowledgeUnit/deleteKnowledgeUnitVValue?unitid=${row.id}`, deleteVValueIds);
			if (res.code === 200) {
				// ElMessage.success('删除v值成功');
			} else {
				ElMessage.error(res.msg);
				hasError = true;
			}
		} catch (error) {
			ElMessage.error('删除v值失败' + error);
			hasError = true;
		}
	}
	
	// 添加v值 - 使用Promise.all等待所有异步操作完成
	if (newVValueIds.length > 0) {
		try {
			const insertPromises = newVValueIds.map(async (newVValueId) => {
				const postData = {
					unitid: row.id,
					vid: newVValueId,
					status: 0
				};
				const res = await request.evaluation.post('/evaluation/knowledgeUnit/insertKnowledgeUnitVValue', postData);
				if (res.code === 200) {
					return true;
				} else {
					ElMessage.error(res.msg);
					return false;
				}
			});
			const results = await Promise.all(insertPromises);
			if (results.some(r => !r)) {
				hasError = true;
			}
		} catch (error) {
			ElMessage.error('添加v值失败' + error);
			hasError = true;
		}
	}
	
	// 如果有操作，重新加载数据（不自动弹出查看绑定弹窗）
	if (deleteVValueIds.length || newVValueIds.length) {
		if (!hasError) {
			ElMessage.success('绑定价值成功');
		}
		// 重新加载数据
		await loadData();
	}
};

//删除章
const deleteSel = () => {
	if (multipleSelection.length === 0) {
		ElMessage({
			type: 'warning',
			message: '未选择关键字',
			duration: 800
		});
	}
	ElMessageBox.confirm(
		'选中的知识单元将被删除，是否确定',
		'警告',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}
	).then(() => {
		var ids = [];
		for (const sel of multipleSelection) {
			ids.push(sel.id);
		}
		request.evaluation.post('/evaluation/knowledgeUnit/deleteKnowledgeUnit?courseid=' + courseid, ids).then((res) => {
			if (res.code === 200) {
				loadData();
				ElMessage.success('删除成功');
			} else {
				ElMessage.error(res.msg);
			}
		}).catch((error) => {
			ElMessage.error('删除失败' + error);
		});
	}).catch(() => { })
}
</script>

<style scoped>
.el-table>>>.child-row {
	background-color: rgb(250, 250, 250);
	/*color:royalblue*/
}

.icon:hover {
	cursor: pointer;
}
</style>