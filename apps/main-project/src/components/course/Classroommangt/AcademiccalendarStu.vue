<template>
  <div style="height: 92vh; display: flex; flex-direction: column">
    <!-- <el-header
      style="
        height: auto;
        padding: 5px 0px;
        width: 100%;
        background-color: #deebf7;
        display: flex;
        justify-content: flex-end;
      "
    >
      <el-upload ref="upload" :before-upload="beforeUpload" :show-file-list="false">
        <el-button v-if="roleName !== '课程负责人'" type="primary" v-blur-on-click>上传</el-button>
      </el-upload>
    </el-header> -->
    <Header title="实验大纲" />
    <div style="max-height: 100%; height: 100%; overflow: auto; margin-top: 50px; padding: 0 20px">
      <el-table :data="formattedFilelist" style="width: 100%" class="custom-table">
        <!-- <el-table-column type="selection" width="55"></el-table-column> -->
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
            <el-button size="small" @click="previewFile(scope.row)">预览</el-button>
            <el-button size="small" @click="downloadFile(scope.row)">下载</el-button>
            <!-- <el-button size="small" @click="deleteFile(scope.row)">删除</el-button> -->
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
      destroy-on-close
    >
      <template #title>
        <span>预览文件</span>
      </template>
      <!-- <LoadingSpinner /> -->
      <div v-if="previewFileType === 'pdf'" class="preview-container">
        <PdfLoadingPreview :isClose="close" :fileUrl="previewFileUrl" />
        <!-- <PdfPreview
          @handleLoading="handleLoad"
          v-show="!isLoading"
          ref="pdfPreviewRef"
          :fileUrl="previewFileUrl"
        />
        <LoadingSpinner v-show="isLoading" /> -->
        <!-- <AsyncPdfViewer ref="pdfPreviewRef" :fileUrl="previewFileUrl" /> -->
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
import Header from '@/views/page/components/header/index.vue';
import PdfLoadingPreview from '../Utilcomponents/PdfLoadingPreview.vue';
import useMain from '../../../stores/useMain.js';
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../../../utils/request.js';
import PdfPreview from '../Utilcomponents/PdfPreview.vue';

import WordPreview from '../Utilcomponents/WordPreview.vue';
import { uploadTeachingFile } from '../../../utils/uploadTeachingFile.js';
import { download } from '@/utils/FileTech.js';

const filelist = ref([]);
const previewVisible = ref(false);
const previewFileType = ref('');
const previewFileUrl = ref('');
const dialogWidth = ref('65%');

const close = ref(false);

// const pdfPreviewRef = ref(null);
const wordPreviewRef = ref(null);

const MainStore = useMain();
const roleName = JSON.parse(sessionStorage.getItem('users')).rolename;

const fetchCourseList = async () => {
  await request.course
    .get('/coursemangt/classroommangt/academiccalendar')
    .then(res => {
      if (res.code === 200) {
        filelist.value = res.data;
      } else {
        ElMessage.error('获取教学日历失败');
      }
    })
    .catch(() => {
      ElMessage.error('获取教学日历失败');
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
  const uploadUrl = '/coursemangt/classroommangt/academiccalendar/upload';
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
  }/coursemangt/classroommangt/academiccalendar/download/${encodeURIComponent(file.id)}`;
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
    ElMessage.error('无法预览此文件类型，目前预览功能仅支持pdf和docx文件格式');
    return;
  }
  close.value = false;
  previewFileUrl.value = fileUrl;
  previewVisible.value = true;
};

const downloadFile = file => {
  download(file, '/coursemangt/classroommangt/academiccalendar/download/');
};

// const downloadFile = file => {
//   const dotIndex = file.filename.lastIndexOf('.');
//   let suffix = file.filename.substring(dotIndex + 1);
//   let fileUrl = `${
//     request.course.defaults.baseURL
//   }/coursemangt/classroommangt/academiccalendar/download/${encodeURIComponent(file.id)}.${suffix}`;

//   // 创建一个用于显示下载进度的元素（可以是进度条）
//   NProgress.start();

//   request
//     .course({
//       url: fileUrl,
//       method: 'GET',
//       responseType: 'blob', // 重要：设置响应类型为blob
//       onDownloadProgress: progressEvent => {
//         if (progressEvent.total) {
//           const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100);
//           console.log(percentCompleted);
//           NProgress.set(percentCompleted / 100); // 更新进度条
//         }
//       }
//     })
//     .then(response => {
//       console.log(response);
//       const reader = new FileReader();
//       reader.readAsDataURL(response);
//       //  读取完的回调事件
//       reader.onload = e => {
//         let a = document.createElement('a');
//         a.download = file.filename;
//         a.style.display = 'none';
//         let url = reader.result;
//         a.href = url;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         // 移除进度条
//         NProgress.done();
//         ElMessage.success('下载成功');
//       };
//       // const blob = response;
//       // const link = document.createElement('a');
//       // const url = window.URL.createObjectURL(blob);
//       // link.href = url;
//       // link.download = file.filename;
//       // document.body.appendChild(link);
//       // link.click();
//       // document.body.removeChild(link);
//       // window.URL.revokeObjectURL(url);
//     })
//     .catch(error => {
//       console.error('There was a problem with the fetch operation:', error);
//       ElMessage.error('文件下载失败');
//       // 移除进度条
//       NProgress.done();
//     });
// };

const deleteFile = async file => {
  try {
    await ElMessageBox.confirm('此操作将永久删除该内容, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    const dotIndex = file.filename.lastIndexOf('.');
    let suffix = file.filename.substring(dotIndex + 1);
    let fileUrl = `/coursemangt/classroommangt/academiccalendar/delete/${encodeURIComponent(
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
  if (previewFileType === 'pdf') {
    close.value = true;
  }
  // if (pdfPreviewRef.value) {
  //   pdfPreviewRef.value.cancelCurrentTasks();
  // }
  if (wordPreviewRef.value) {
    wordPreviewRef.value.resetContent();
  }
  previewFileUrl.value = ''; // 清空预览的URL
};

onMounted(() => {
  fetchCourseList();
});
</script>

<style lang="less" scoped>
// :deep(.el-dialog) {
//   // overflow: hidden;
//   overflow: auto;
//   height: 620px;
//   scrollbar-width: none;
// }
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
