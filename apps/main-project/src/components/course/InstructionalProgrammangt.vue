<template>
  <div style="height: 92vh; display: flex; flex-direction: column">
    <el-header
      style="
        height: auto;
        padding: 5px 0px;
        width: 100%;
        background-color: #deebf7;
        display: flex;
        justify-content: flex-end;
      "
    >
      <el-button v-if="roleName === '课程负责人'" type="warning" style="margin-right: 8px;" @click="openCopyDialog">从历史课程复制</el-button>
      <el-upload ref="upload" :before-upload="beforeUpload" :show-file-list="false">
        <el-button v-if="roleName !== '任课教师'" type="primary" v-blur-on-click>上传</el-button>
      </el-upload>
    </el-header>
    <CopyModelDialog ref="copyDialogRef" copy-type="syllabus" @copy-success="fetchCourseList" />
    <div style="max-height: 100%; height: 100%; overflow: auto">
      <el-table :data="formattedFilelist" style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="filename" label="名称"></el-table-column>
        <el-table-column label="大小">
          <template #default="scope">
            <div>
              {{ scope.row.formattedSize }}
              <span v-if="scope.row.size < 1024 * 1024"></span>
              <span v-else-if="scope.row.size < 1024 * 1024 * 10"></span>
              <span v-else>(Large File)</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createtime" label="上传时间"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" v-blur-on-click @click="previewFile(scope.row)">预览</el-button>
            <el-button size="small" v-blur-on-click @click="downloadFile(scope.row)"
              >下载</el-button
            >
            <el-button size="small" v-blur-on-click @click="deleteFile(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 预览模态框 -->
    <el-dialog
      v-model="previewVisible"
      custom-class="preview-dialog"
      @close="handleClosePreview"
      :width="dialogWidth"
      :height="dialogWidth"
    >
      <template #title>
        <span>预览文件</span>
      </template>
      <div v-if="previewFileType === 'pdf'" class="preview-container">
        <PdfPreview ref="pdfPreviewRef" :fileUrl="previewFileUrl" />
      </div>
      <div v-if="previewFileType === 'word'" class="preview-container">
        <WordPreview ref="wordPreviewRef" :fileUrl="previewFileUrl" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClosePreview">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import NProgress from 'nprogress';
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../../utils/request.js';
import PdfPreview from './Utilcomponents/PdfPreview.vue';
import WordPreview from './Utilcomponents/WordPreview.vue';
import { uploadTeachingFile } from '../../utils/uploadTeachingFile.js';
import useMain from '../../stores/useMain.js';
import CopyModelDialog from './subcomponents/CopyModelDialog.vue';

const filelist = ref([]);
const previewVisible = ref(false);
const previewFileType = ref('');
const previewFileUrl = ref('');
const dialogWidth = ref('65%');

const pdfPreviewRef = ref(null);
const wordPreviewRef = ref(null);

const MainStore = useMain();
const roleName = JSON.parse(sessionStorage.getItem('users')).rolename;

const fetchCourseList = async () => {
  await request.course
    .get('/coursemangt/instructionalprogram')
    .then(res => {
      if (res.code === 200) {
        filelist.value = res.data;
      } else {
        ElMessage.error('获取教学大纲失败');
      }
    })
    .catch(() => {
      ElMessage.error('获取教学大纲失败');
    });
};

const formatFileSize = size => {
  if (size < 1024) {
    return size + ' B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB';
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
};

const formattedFilelist = computed(() => {
  return filelist.value.map(file => ({
    ...file,
    formattedSize: formatFileSize(file.size)
  }));
});

const beforeUpload = file => {
  const uploadUrl = '/coursemangt/instructionalprogram/upload';
  uploadTeachingFile(
    file,
    uploadUrl,
    res => {
      // 成功回调
      console.log('上传成功:', res);
      // 处理成功后的逻辑
      fetchCourseList();
    },
    res => {
      // 失败回调
      console.log('上传失败:', res);
      // 处理失败后的逻辑
    }
  );
};

const previewFile = async file => {
  let fileUrl = `${
    request.course.defaults.baseURL
  }/coursemangt/instructionalprogram/download/${encodeURIComponent(file.id)}`;
  console.log('Preview file URL:', fileUrl); // 检查 URL 是否正确
  const isPDF = file.filename.toLowerCase().endsWith('.pdf');
  const isWord = file.filename.toLowerCase().endsWith('.docx');

  if (isPDF) {
    previewFileType.value = 'pdf';
    fileUrl += '.pdf';
  } else if (isWord) {
    previewFileType.value = 'word';
    fileUrl += '.docx';
  } else {
    ElMessage.error('无法预览此文件类型');
    return;
  }
  previewFileUrl.value = fileUrl;
  previewVisible.value = true;
};

const downloadFile = file => {
  const dotIndex = file.filename.lastIndexOf('.');
  let suffix = file.filename.substring(dotIndex + 1);
  NProgress.start();
  let fileUrl = `${
    request.course.defaults.baseURL
  }/coursemangt/instructionalprogram/download/${encodeURIComponent(file.id)}.${suffix}`;
  request
    .course({
      url: fileUrl,
      method: 'GET',
      responseType: 'blob', // 重要：设置响应类型为blob
      onDownloadProgress: progressEvent => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          // console.log(percentCompleted);
          NProgress.set(percentCompleted / 100); // 更新进度条
        }
      }
    })
    .then(response => {
      const blob = response;
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      NProgress.done();
      ElMessage.success('下载成功');
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      ElMessage.error('文件下载失败');
    });
};

const deleteFile = async file => {
  try {
    await ElMessageBox.confirm('此操作将永久删除该课程大纲, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    const dotIndex = file.filename.lastIndexOf('.');
    let suffix = file.filename.substring(dotIndex + 1);
    let fileUrl = `/coursemangt/instructionalprogram/delete/${encodeURIComponent(
      file.id
    )}.${suffix}`;
    await request.course
      .get(fileUrl)
      .then(res => {
        if (res.code === 200) {
          ElMessage.success('删除成功');
          fetchCourseList();
        } else {
          ElMessage.error('删除失败');
        }
      })
      .catch(() => {
        ElMessage.error('删除失败');
      });
  } catch (error) {
    ElMessage.info('删除失败');
  }
};

const handleClosePreview = () => {
  previewVisible.value = false;

  // 取消 PDF 预览的渲染任务
  if (pdfPreviewRef.value) {
    pdfPreviewRef.value.cancelCurrentTasks();
  }
  if (wordPreviewRef.value) {
    wordPreviewRef.value.resetContent();
  }
  previewFileUrl.value = ''; // 清空预览的URL
};

const copyDialogRef = ref(null);
function openCopyDialog() { copyDialogRef.value?.init(); }

onMounted(() => {
  fetchCourseList();
});
</script>

<style scoped>
.preview-container {
  width: 100%;
  height: 100%;
}

.pdf-container,
.word-container {
  width: 100%;
  height: 80vh;
}

.pdf-frame,
.word-frame {
  width: 100%;
  height: 100%;
}
</style>
