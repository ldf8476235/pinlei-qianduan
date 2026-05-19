<template>
  <div class="introduce-direction-page">
    <div class="page-shell">
      <div class="page-header">
        <div class="title-wrap">
          <h2 class="page-title">建议引品方向</h2>
          <button class="ai-link" type="button" :disabled="!tableRows.length" @click="openAiSelector">AI选品 &gt;</button>
        </div>
        <div class="header-actions">
          <el-button circle class="icon-btn">
            <el-icon><Download /></el-icon>
          </el-button>
        </div>
      </div>

      <section class="hero-section">
        <div class="hero-orbit orbit-one"></div>
        <div class="hero-orbit orbit-two"></div>
        <div class="hero-orbit orbit-three"></div>

        <div class="node demand-node">
          <div class="side-tags side-tags-left">
            <span>价格</span>
            <span>品牌</span>
            <span>规格</span>
            <span>标签</span>
          </div>
          <div class="node-ball teal-ball">用户需求</div>
        </div>

        <div class="node supplier-node">
          <div class="node-ball gold-ball">供应商贡献</div>
          <div class="side-tags side-tags-right">
            <span>单品贡献</span>
            <span>毛利率</span>
          </div>
        </div>

        <div class="target-center">
          <div class="target-ring outer-ring">
            <div class="target-ring inner-ring">
              <span>引品目标</span>
            </div>
          </div>
        </div>

        <div class="node bottom-node">
          <div class="node-ball dark-ball">小分类 SKU配置</div>
        </div>

        <div class="connector connector-left"></div>
        <div class="connector connector-right"></div>
        <div class="connector connector-bottom"></div>
      </section>

      <section class="table-section">
        <el-alert
          v-if="errorMessage"
          class="table-alert"
          type="error"
          :closable="false"
          show-icon
          :title="errorMessage"
        />
        <el-table
          v-loading="loading"
          :data="tableRows"
          border
          stripe
          class="introduce-table"
          empty-text="暂无建议引品方向数据"
        >
          <el-table-column
            v-for="column in tableColumns"
            :key="column.value"
            :label="column.label"
            :prop="column.value"
            :min-width="column.value === 'index' ? 72 : column.value === 'vendor' ? 170 : 126"
            align="center"
            sortable
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>{{ row[column.value] || '--' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <div class="floating-actions">
      <button type="button" class="floating-btn">
        <el-icon><Grid /></el-icon>
      </button>
      <button type="button" class="floating-btn help-btn">?</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Download, Grid } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getCategoryDiagnosisIntroduceDirection } from '@/api/category/diagnosis/detail';
import type { DiagnosisIntroduceDirectionColumn } from '@/api/category/diagnosis/detail/types';
import { useRequest } from '@/hooks/useRequest';

const route = useRoute();

const defaultColumns: DiagnosisIntroduceDirectionColumn[] = [
  { label: '顺序', value: 'index' },
  { label: '价格区间', value: 'priceBand' },
  { label: '品牌', value: 'brand' },
  { label: '规格', value: 'spec' },
  { label: '供应商', value: 'vendor' },
  { label: '小分类', value: 'minClass' }
];

const tableColumns = ref<DiagnosisIntroduceDirectionColumn[]>(defaultColumns);
const tableRows = ref<Array<Record<string, string>>>([]);
const errorMessage = ref('');

const sessionId = computed(() => String(route.query.sessionId || ''));

const directionRequest = useRequest(async (id: string) => await getCategoryDiagnosisIntroduceDirection(id), {
  onSuccess: (res: any) => {
    const data = res?.data?.columns ? res.data : res?.data?.data?.columns ? res.data.data : res?.data;
    tableColumns.value = Array.isArray(data?.columns) && data.columns.length ? data.columns : defaultColumns;
    tableRows.value = Array.isArray(data?.rows) ? data.rows : [];
    errorMessage.value = '';
  },
  onError: (err) => {
    tableRows.value = [];
    tableColumns.value = defaultColumns;
    errorMessage.value = err?.response?.data?.message || err?.message || '建议引品方向加载失败';
  }
});

const loading = computed(() => directionRequest.loading.value);

const loadDirection = () => {
  if (!sessionId.value) {
    tableRows.value = [];
    tableColumns.value = defaultColumns;
    errorMessage.value = '缺少诊断 sessionId，无法加载建议引品方向';
    return;
  }
  directionRequest.run(sessionId.value);
};

const openAiSelector = () => {
  if (!tableRows.value.length) {
    ElMessage.warning('暂无建议引品方向数据');
    return;
  }
  const parts = tableColumns.value
    .filter((column) => !['index', 'vendor', 'minClass'].includes(column.value))
    .map((column) => {
      const values = tableRows.value.map((row) => row[column.value]).filter(Boolean);
      return values.length ? `${column.label}为${values.join('、')}` : '';
    })
    .filter(Boolean);
  ElMessage.info(`推荐${parts.join('，')}的商品。`);
};

watch(sessionId, loadDirection);
onMounted(loadDirection);
</script>

<style scoped lang="scss">
.introduce-direction-page {
  position: relative;
  min-height: 100%;
  border-radius: 20px;
  background:
    radial-gradient(circle at 18% 20%, rgba(255, 126, 24, 0.2) 0, rgba(255, 126, 24, 0) 28%),
    radial-gradient(circle at 86% 18%, rgba(255, 186, 91, 0.22) 0, rgba(255, 186, 91, 0) 24%),
    radial-gradient(circle at 50% 100%, rgba(255, 111, 15, 0.12) 0, rgba(255, 111, 15, 0) 28%),
    linear-gradient(180deg, #fff3e8 0%, #fffaf4 52%, #fff1e3 100%);
  overflow: hidden;
}

.introduce-direction-page::before,
.introduce-direction-page::after {
  position: absolute;
  inset: auto;
  content: '';
  border-radius: 50%;
  border: 1px solid rgba(255, 126, 24, 0.1);
  pointer-events: none;
}

.introduce-direction-page::before {
  width: 560px;
  height: 560px;
  left: -140px;
  top: 120px;
}

.introduce-direction-page::after {
  width: 660px;
  height: 660px;
  right: -180px;
  top: -40px;
}

.page-shell {
  position: relative;
  z-index: 1;
  padding: 24px 28px 28px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-title {
  margin: 0;
  color: #152133;
  font-size: 24px;
  font-weight: 700;
}

.ai-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: #f97316;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.ai-link:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.icon-btn {
  border-color: rgba(249, 115, 22, 0.2);
  color: #f97316;
  background: rgba(255, 255, 255, 0.78);
}

.hero-section {
  position: relative;
  display: flex;
  min-height: 420px;
  align-items: center;
  justify-content: center;
}

.hero-orbit {
  position: absolute;
  border-radius: 50%;
  border: 1px dashed rgba(249, 115, 22, 0.14);
}

.orbit-one {
  width: 520px;
  height: 520px;
}

.orbit-two {
  width: 420px;
  height: 420px;
}

.orbit-three {
  width: 320px;
  height: 320px;
}

.target-center {
  position: relative;
  z-index: 2;
}

.target-ring {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.outer-ring {
  width: 210px;
  height: 210px;
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.18) 0%, rgba(249, 115, 22, 0.08) 100%);
  box-shadow: inset 0 0 0 18px rgba(255, 255, 255, 0.88);
}

.inner-ring {
  width: 138px;
  height: 138px;
  background: linear-gradient(180deg, #ffffff 0%, #f3fbf8 100%);
  box-shadow:
    inset 0 0 0 10px rgba(249, 115, 22, 0.14),
    0 16px 34px rgba(249, 115, 22, 0.15);
  color: #152133;
  font-size: 24px;
  font-weight: 700;
}

.node {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 16px;
}

.demand-node {
  top: 52px;
  left: calc(50% - 330px);
}

.supplier-node {
  top: 58px;
  right: calc(50% - 338px);
}

.bottom-node {
  bottom: 38px;
  left: 50%;
  transform: translateX(-50%);
}

.node-ball {
  display: flex;
  width: 118px;
  height: 118px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.14);
}

.teal-ball {
  background: linear-gradient(180deg, #ff9b32 0%, #f97316 100%);
  color: #ffffff;
}

.gold-ball {
  background: linear-gradient(180deg, #ffd36f 0%, #f4b238 100%);
  color: #352700;
}

.dark-ball {
  width: 148px;
  height: 148px;
  background: linear-gradient(180deg, #1b2230 0%, #06090f 100%);
  color: #ffffff;
}

.side-tags {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.side-tags span {
  border-radius: 999px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
  color: #526070;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.connector {
  position: absolute;
  z-index: 1;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.28) 50%, rgba(249, 115, 22, 0.08) 100%);
}

.connector-left,
.connector-right {
  top: 160px;
  width: 180px;
  height: 2px;
}

.connector-left {
  left: calc(50% - 250px);
}

.connector-right {
  right: calc(50% - 250px);
}

.connector-bottom {
  bottom: 142px;
  width: 2px;
  height: 84px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.28) 50%, rgba(249, 115, 22, 0.08) 100%);
}

.table-section {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
  padding: 18px 18px 14px;
}

.table-alert {
  margin-bottom: 12px;
}

.introduce-table :deep(.el-table__header th) {
  background: #f4f7fb;
  color: #182233;
  font-weight: 700;
  text-align: center;
}

.introduce-table :deep(.cell) {
  font-size: 13px;
  text-align: center;
}

.introduce-table :deep(.el-table__body td) {
  color: #425168;
}

.floating-actions {
  position: absolute;
  top: 148px;
  right: 18px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.floating-btn {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.1);
  color: #f97316;
  font-size: 20px;
  cursor: pointer;
}

.help-btn {
  color: #ffffff;
  background: linear-gradient(180deg, #ff9b32 0%, #f97316 100%);
  font-size: 22px;
  font-weight: 700;
}

@media (max-width: 1400px) {
  .demand-node {
    left: calc(50% - 290px);
  }

  .supplier-node {
    right: calc(50% - 294px);
  }

  .connector-left,
  .connector-right {
    width: 130px;
  }
}

@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-section {
    min-height: 560px;
  }

  .demand-node,
  .supplier-node,
  .bottom-node {
    position: static;
    transform: none;
  }

  .hero-section {
    flex-direction: column;
    gap: 24px;
  }

  .target-center {
    order: 2;
  }

  .demand-node {
    order: 1;
  }

  .supplier-node {
    order: 3;
  }

  .bottom-node {
    order: 4;
  }

  .connector,
  .hero-orbit {
    display: none;
  }

  .floating-actions {
    top: auto;
    right: 14px;
    bottom: 18px;
  }
}

@media (max-width: 768px) {
  .page-shell {
    padding: 18px 16px 22px;
  }

  .title-wrap {
    flex-wrap: wrap;
  }

  .demand-node,
  .supplier-node {
    flex-direction: column;
  }

  .side-tags {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
