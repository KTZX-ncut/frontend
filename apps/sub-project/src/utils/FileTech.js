import NProgress from 'nprogress';
import request from './request';
import { ElMessage } from 'element-plus';

export const download = (file, url) => {
  const dotIndex = file.filename.lastIndexOf('.');
  let suffix = file.filename.substring(dotIndex + 1);
  let fileUrl = `${request.course.defaults.baseURL}${url + encodeURIComponent(file.id)}.${suffix}`;

  // 创建一个用于显示下载进度的元素（可以是进度条）
  NProgress.start();

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
      const blob = response instanceof Blob ? response : new Blob([response]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.download = file.filename;
      a.style.display = 'none';
      a.href = downloadUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      NProgress.done();
      ElMessage.success('下载成功');
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      ElMessage.error('文件下载失败');
      // 移除进度条
      NProgress.done();
    });
};
