<template>
  <div class="p-2 supplier-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div>
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">供应商分析</span>
          </div>
          <div class="page-subtitle">
            <span>sessionId: {{ sessionId || '--' }}</span>
            <span v-if="statusState?.dataVersion">版本: {{ statusState.dataVersion }}</span>
          </div>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button link type="primary" @click="handleViewDetail">详情</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12">
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="card-title">近一月供应商销售额占比</div>
          </template>
          <div ref="pieChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="chart-header">
              <span class="card-title">供应商指标排名</span>
              <el-select v-model="activeMetric" style="width: 180px" @change="loadRanking">
                <el-option v-for="item in metricOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </template>
          <div ref="barChartRef" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card advice-card mt-[12px]">
      <template #header>
        <div class="card-title">总结与建议</div>
      </template>
      <ul class="advice-list">
        <li v-for="(item, index) in summaryLines" :key="`${index}-${item}`">
          {{ item }}
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getDiagnosisSessionStatus } from '@/api/category/diagnosis';
import { getVendorRanking, getVendorSalesShare, getVendorSummary } from '@/api/supplier';
import type { VendorRankingItemVO, VendorSalesShareItemVO, VendorSummaryVO } from '@/api/supplier/types';

const metricOptions = [
  { label: '单品产出', value: '1' },
  { label: '毛利率', value: '2' },
  { label: 'SKU数', value: '3' },
  { label: '新品SKU数', value: '4' },
  { label: '异订单金额占比', value: '5' }
];

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => String(route.query.sessionId || ''));
const statusState = ref<any>();
const pieChartRef = ref<HTMLDivElement>();
const barChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const barChartIns = ref<echarts.ECharts>();
const activeMetric = ref(metricOptions[0].value);
const salesShare = ref<VendorSalesShareItemVO[]>([]);
const ranking = ref<VendorRankingItemVO[]>([]);
const summary = ref<VendorSummaryVO>({});
const loading = ref(false);

const summaryLines = computed(() => [
  ...(summary.value.summaryOne || []),
  ...(summary.value.summaryTwo || []),
  ...(summary.value.summaryThree || [])
]);

const renderPie = () => {
  if (!pieChartRef.value) return;
  pieChartIns.value ||= echarts.init(pieChartRef.value);
  pieChartIns.value.setOption(
    {
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          data: salesShare.value.map((item) => ({
            name: item.productVendorName || item.productVendorNo || '--',
            value: Number(item.sales || 0)
          }))
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderBar = () => {
  if (!barChartRef.value) return;
  barChartIns.value ||= echarts.init(barChartRef.value);
  barChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis' },
      grid: { left: 110, right: 24, top: 20, bottom: 24 },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        inverse: true,
        data: ranking.value.map((item) => item.productVendorName || item.productVendorNo || '--')
      },
      series: [{ type: 'bar', data: ranking.value.map((item) => Number(item.data || 0)) }]
    } as EChartsOption,
    true
  );
};

const loadRanking = async () => {
  if (!sessionId.value) return;
  const res = await getVendorRanking(sessionId.value, activeMetric.value, 1, 10, 'desc');
  ranking.value = res.data?.data?.list || [];
  await nextTick();
  renderBar();
};

const loadData = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const [statusRes, shareRes, summaryRes] = await Promise.all([
      getDiagnosisSessionStatus(sessionId.value),
      getVendorSalesShare(sessionId.value),
      getVendorSummary(sessionId.value)
    ]);
    statusState.value = statusRes.data;
    salesShare.value = shareRes.data?.data || [];
    summary.value = summaryRes.data?.data || {};
    await loadRanking();
    await nextTick();
    renderPie();
  } finally {
    loading.value = false;
  }
};

const handleViewDetail = () => {
  router.push({ path: '/supplier/analysis/detail', query: { ...route.query } });
};

const resize = () => {
  pieChartIns.value?.resize();
  barChartIns.value?.resize();
};

onMounted(async () => {
  await loadData();
  window.addEventListener('resize', resize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  pieChartIns.value?.dispose();
  barChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.supplier-analysis-page {
  min-height: calc(100vh - 84px);
  background: #f5f7fa;
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgb(15 23 42 / 4%);
}

.header-card {
  margin-bottom: 12px;
}

.page-header,
.page-title-wrap,
.page-actions,
.chart-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-header,
.chart-header {
  justify-content: space-between;
}

.page-title-wrap {
  justify-content: flex-start;
}

.page-title-line {
  width: 3px;
  height: 16px;
  background: var(--el-color-primary);
  border-radius: 999px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
}

.page-subtitle,
.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.chart-box {
  width: 100%;
  height: 360px;
}

.advice-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.8;
}
</style>
