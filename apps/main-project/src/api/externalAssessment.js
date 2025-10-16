import request from '../utils/request.js'

/**
 * 导入外部考核 Excel 文件
 * @param {File|FormData} file - Excel 文件对象
 */
export const importExternalAssessment = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.evaluation.post('/external-assessment/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // ✅ 改成 60秒 或更长
  })
}


/**
 * 新增外部考核标签
 * @param {Object} data - 标签数据
 */
export const addExternalLabel = (data) => {
  return request.evaluation.post('/external-assessment/label/add', data)
}

/**
 * 更新外部考核标签
 * @param {Object} data - 标签更新数据
 */
export const updateExternalLabel = (data) => {
  return request.evaluation.post('/external-assessment/label/update', data)
}

/**
 * 删除外部考核标签
 * @param {string|number} id - 标签 ID
 */
export const deleteExternalLabel = (id) => {
  return request.evaluation.delete(`/external-assessment/label/delete/${id}`)
}

/**
 * 根据考核任务 ID 获取标签列表
 * @param {string} taskId - 任务 ID
 */
export const getExternalLabelList = () => {
  return request.evaluation.get('/external-assessment/label/list')
}

/**
 * 批量保存客观题考核项
 * @param {Array|Object} data - 批量保存的数据
 */
export const batchSaveObjectiveCategory = (data) => {
  return request.evaluation.post('/objective-category/batch-save', data)
}

// 获取所有考核项与课程目标的分数
export const listObjectiveCategory = (params) => {
  return request.evaluation.get('/objective-category/list', { params })
}