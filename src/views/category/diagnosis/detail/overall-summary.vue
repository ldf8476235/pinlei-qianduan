<template>
  <div class="p-2 overall-summary-page">
    <el-card shadow="hover" class="page-card" v-loading="loading">
      <template #header>
        <div class="summary-header">
          <div>
            <div class="summary-title">整体情况总结</div>
            <div class="summary-subtitle">{{ classTitle }}</div>
          </div>
          <el-tag class="source-tag" effect="plain">按诊断结果自动生成</el-tag>
        </div>
      </template>

      <el-alert
        v-if="errorMessage"
        class="summary-alert"
        type="error"
        :closable="false"
        show-icon
        :title="errorMessage"
      />

      <el-empty v-else-if="!loading && !summarySections.length" description="暂无整体总结数据" />

      <div v-else class="summary-list" role="list">
        <section
          v-for="item in summarySections"
          :key="item.title"
          class="summary-section"
          :class="`summary-section--${item.status.toLowerCase()}`"
          role="listitem"
        >
          <div class="section-head">
            <span class="status-dot" aria-hidden="true" />
            <span class="section-title">{{ item.title }}：</span>
          </div>
          <div class="section-body">
            <div class="section-conclusion">{{ item.conclusion }}</div>
            <p v-for="line in item.descriptions" :key="line" class="section-text">{{ line }}</p>
          </div>
        </section>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getCategoryDiagnosisOverallSummary } from '@/api/category/diagnosis/detail';
import type { DiagnosisOverallSummarySection } from '@/api/category/diagnosis/detail/types';
import { useRequest } from '@/hooks/useRequest';

const route = useRoute();

const summarySections = ref<DiagnosisOverallSummarySection[]>([]);
const classNo = ref('');
const className = ref('');
const errorMessage = ref('');

const sessionId = computed(() => String(route.query.sessionId || ''));
const classTitle = computed(() => {
  const no = classNo.value || String(route.query.categoryId || '');
  const name = className.value || String(route.query.categoryName || '');
  return [no, name].filter(Boolean).join(' ') || '当前品类';
});

const summaryRequest = useRequest(async (id: string) => await getCategoryDiagnosisOverallSummary(id), {
  onSuccess: (res: any) => {
    const data = res?.data?.sections ? res.data : res?.data?.data?.sections ? res.data.data : res?.data;
    summarySections.value = data?.sections || [];
    classNo.value = data?.classNo || '';
    className.value = data?.className || '';
    errorMessage.value = '';
  },
  onError: (err) => {
    summarySections.value = [];
    errorMessage.value = err?.response?.data?.message || err?.message || '整体总结加载失败';
  }
});

const loading = computed(() => summaryRequest.loading.value);

const loadSummary = () => {
  if (!sessionId.value) {
    errorMessage.value = '缺少诊断 sessionId，无法加载整体总结';
    summarySections.value = [];
    return;
  }
  summaryRequest.run(sessionId.value);
};

watch(sessionId, loadSummary);
onMounted(loadSummary);
</script>

<style scoped>
.overall-summary-page {
  min-height: 100%;
}

.page-card {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.summary-title {
  position: relative;
  padding-left: 12px;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
  line-height: 24px;
}

.summary-title::before {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  width: 4px;
  border-radius: 4px;
  background: #f97316;
  content: '';
}

.summary-subtitle {
  margin-top: 6px;
  color: #94a3b8;
  font-size: 12px;
}

.source-tag {
  --el-tag-text-color: #f97316;
  --el-tag-border-color: #fed7aa;
  --el-tag-bg-color: #fff7ed;
  flex: none;
}

.summary-alert {
  margin-bottom: 12px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-section {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 8px 14px;
  padding: 20px 24px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f8fafc;
}

.summary-section--normal {
  border-color: #fed7aa;
  background: #fff7ed;
}

.summary-section--abnormal {
  border-color: #ffe4e6;
  background: #fff7f9;
}

.summary-section--other {
  border-color: #e5e7eb;
  background: #f8fafc;
}

.section-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}

.status-dot {
  width: 12px;
  height: 12px;
  margin-top: 6px;
  border-radius: 999px;
  background: #94a3b8;
}

.summary-section--normal .status-dot {
  background: #f97316;
}

.summary-section--abnormal .status-dot {
  background: #e11d48;
}

.section-title {
  white-space: nowrap;
}

.section-body {
  min-width: 0;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.8;
}

.section-conclusion {
  margin-bottom: 10px;
  color: #1f2937;
  font-size: 17px;
  font-weight: 700;
}

.section-text {
  margin: 0;
}

.section-text + .section-text {
  margin-top: 8px;
}

@media (max-width: 768px) {
  .summary-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-section {
    grid-template-columns: 1fr;
    padding: 16px;
  }
}
</style>
