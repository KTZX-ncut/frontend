<template class="pdf-container">
  <PdfPreview
    @handleLoading="handleLoad"
    v-show="!isLoading"
    ref="pdfPreviewRef"
    :fileUrl="props.fileUrl"
  />
  <LoadingSpinner v-show="isLoading" />
  <!-- <LoadingSpinner v-show="true" /> -->
</template>

<script setup>
import PdfPreview from './PdfPreview.vue';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import LoadingSpinner from '../Classroommangt/LoadingSpinner.vue';

const pdfPreviewRef = ref(null);
const isLoading = ref(true);

const props = defineProps({
  fileUrl: {
    type: String,
    required: true
  },
  isClose: {
    type: Boolean,
    default: false
  }
});

const handleLoad = () => {
  isLoading.value = false;
};

watch(
  () => props.isClose,
  newVal => {
    // console.log(newVal);
    if (newVal) {
      pdfPreviewRef.value?.cancelCurrentTasks();
      isLoading.value = true;
    }
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  pdfPreviewRef.value?.cancelCurrentTasks();
});

onBeforeUnmount(() => {
  pdfPreviewRef.value?.cancelCurrentTasks();
});
</script>

<style lang="less" scoped>
.pdf-container {
  overflow: auto;
  height: 500px;
  scrollbar-width: none;
}
</style>
