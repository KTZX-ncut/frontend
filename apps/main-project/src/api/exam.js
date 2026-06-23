import request from '../utils/request.js'

/** 获取当前用户的课程ID */
export const getCourseId = () => request.exam.get('/exam/meta/courseId')

export const getKwaList = (courseId) => request.exam.get('/exam/questiongen/kwa', { params: courseId ? { courseId } : {} })
export const generateQuestions = (data) => request.exam.post('/exam/questiongen/generate', data)
export const getQuestionGenPage = (params = {}) => request.exam.get('/exam/questiongen/page', { params })
export const deleteQuestions = (data) => request.exam.post('/exam/questiongen/delete', data)
export const autoGeneratePaper = (data) => request.exam.post('/exam/paper/autoGenerate', data)
export const manualGeneratePaper = (data) => request.exam.post('/exam/paper/manualGenerate', data)
export const getPaperList = () => request.exam.get('/exam/paper/list')
export const getPaperQuestions = (paperId) => request.exam.get('/exam/paper/questions', { params: { paperId } })
export const publishPaper = (paperId, classroomId) => request.exam.post('/exam/paper/publish', null, { params: { paperId, classroomId } })
export const deletePaper = (paperId) => request.exam.post('/exam/paper/delete', null, { params: { paperId } })
export const simulateScores = (data) => request.exam.post('/exam/scoresim/simulate', data)
export const getSimResult = (params = {}) => request.exam.get('/exam/scoresim/result', { params })
