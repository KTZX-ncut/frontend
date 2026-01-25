
export interface FileResourceSchema {
  fileName: string,
  bucketName: string
}

export interface WorkflowRequestSchema {
  studentFeedback: FileResourceSchema, // 学生反馈
  lessonPlan: FileResourceSchema,      // 课堂教案
  ppt: FileResourceSchema,             // PPT
  courseName: string

};
