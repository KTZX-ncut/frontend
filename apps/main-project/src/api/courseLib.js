import request from '../utils/request.js'
// 添加课堂题目
export const addCourseLib = (data) => {
    return request.page.post('/courseLib/add', data)
}
// 课堂kwa
export const courseLibKwaMap = () => {
    return request.page.get('/courseLib/kwa/map')
}
// 课堂添加kwa
export const courseLibKwaTree = () => {
    return request.page.get('/courseLib/kwa/tree')
}
// 题型设定页-获取WR
export const taskKwa = () => {
    return request.page.get('/paper/edit/kwa/map')
}
// 课堂题型
export const courseLibType = () => {
    return request.page.get('/courseLib/queType/list')
}
// 课堂列表
export const courseLibList = (data) => {
    return request.page.post('/courseLib/pager', data)
}
// 复制题目
export const courseLibCopy = (data) => {
    return request.page.get('/courseLib/copy?id=' + data)
}
// 删除题目
export const courseLibDel = (data) => {
    return request.page.post('/courseLib/delete', data)
}
// 编辑题目
export const courseLibEdit = (data) => {
    return request.page.post('/courseLib/update', data)
}
// 获取课程题型设定
export const courseLibTypeList = () => {
    return request.page.get('/courseLib/type/list')
}
// 获取课程保存题型设定
export const courseLibTypeSetStatus = (data) => {
    return request.page.post('/courseLib/type/setStatus', data)
}

// 获取课程题型同步列表
export const courseLibSyncPager = (data) => {
    return request.page.post('/courseLib/sync/pager', data)
}
// 接受申请
export const syncAccept = (data) => {
    return request.page.post('/courseLib/sync/accept', data)
}
// 拒绝申请
export const syncReject = (data) => {
    return request.page.post('/courseLib/sync/reject', data)
}
// 课程列表权限接口
export const courseLibWR = () => {
    return request.page.get('/courseLib/getWR')
}
// 同步页权限接口
export const courseLibSyncWR = () => {
    return request.page.get('/courseLib/sync/getWR')
}
// 页面权限接口
export const courseLiTypeWR = () => {
    return request.page.get('/courseLib/type/getWR')
}

// 课堂 价值
export const courseLibVTree = () => {
    return request.page.get('/courseLib/v/tree')
}

export const login = () => {
    return request.fork.get('/login?loginName=test1&pwd=123456&catelog=2&loginway=1&roleId=516761049-234512f3-7c19-4580-abe2-ebfb1dd8db21&obsId=2c918af681fa6ea7018209a505c30672&userType=teacher')
}