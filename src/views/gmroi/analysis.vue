<template>
  <div class="p-2 gmroi-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div>
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">GMROI 分析</span>
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

    <el-alert
      v-if="!sessionReady"
      class="mb-[12px]"
      type="info"
      :closable="false"
      :title="`诊断预计算中，当前阶段：${statusState?.currentStage || 'WAIT_PRECOMPUTE'}`"
      :description="`进度 ${formatPercent(statusState?.progressPercent)}，页面会自动刷新。`"
      show-icon
    />

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="14" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="card-title">本期 GMROI 四象限散点图</div>
          </template>
          <div ref="scatterChartRef" class="chart-box large-chart" />
        </el-card>
      </el-col>
      <el-col :lg="10" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="card-title">GMROI 区间 SKU 统计</div>
          </template>
          <div ref="pieChartRef" class="chart-box small-chart" />
        </el-card>
        <el-card shadow="hover" class="page-card chart-card mt-[12px]" v-loading="loading">
          <template #header>
            <div class="card-title">四象限 SKU 占比变化</div>
          </template>
          <div ref="barChartRef" class="chart-box small-chart" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-title">GMROI 区间占比</div>
      </template>
      <el-table :data="matrixRows" border stripe>
        <el-table-column label="区间" min-width="120">
          <template #default="{ row }">
            {{ row.label }}
          </template>
        </el-table-column>
        <el-table-column v-for="col in matrixColumns" :key="col.key" :label="col.label" min-width="140" align="center">
          <template #default="{ row }">
            {{ formatPercent(row[col.key]) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getDiagnosisSessionStatus } from '@/api/category/diagnosis';
import { getGmroiFourQuadrant, getGmroiSkuChange, getGmroiSkuNum, getGmroiSkuPer } from '@/api/gmroi';
import type { GmroiQuadrantItemVO, GmroiQuadrantVO } from '@/api/gmroi/types';

interface GmroiSkuNumState {
  sku_1?: number;
  sku_2?: number;
  sku_3?: number;
  sku_4?: number;
}

interface GmroiSkuPerState {
  currentSkuPer_1?: number;
  currentSkuPer_2?: number;
  currentSkuPer_3?: number;
  currentSkuPer_4?: number;
  compareSkuPer_1?: number;
  compareSkuPer_2?: number;
  compareSkuPer_3?: number;
  compareSkuPer_4?: number;
}

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => String(route.query.sessionId || ''));
const scatterChartRef = ref<HTMLDivElement>();
const pieChartRef = ref<HTMLDivElement>();
const barChartRef = ref<HTMLDivElement>();
const scatterChartIns = ref<echarts.ECharts>();
const pieChartIns = ref<echarts.ECharts>();
const barChartIns = ref<echarts.ECharts>();
const statusState = ref<any>();
const quadrantState = ref<GmroiQuadrantVO>({ list: [] });
const skuNumState = ref<GmroiSkuNumState>({});
const skuPerState = ref<GmroiSkuPerState>({});
const loading = ref(false);

const matrixColumns = [
  { key: 'current', label: '本期' },
  { key: 'compare', label: '对比期' }
];

const matrixRows = computed(() => [
  { label: 'GMROI<=1', current: skuPerState.value.currentSkuPer_1 || 0, compare: skuPerState.value.compareSkuPer_1 || 0 },
  { label: '1<GMROI<=2', current: skuPerState.value.currentSkuPer_2 || 0, compare: skuPerState.value.compareSkuPer_2 || 0 },
  { label: '2<GMROI<=3', current: skuPerState.value.currentSkuPer_3 || 0, compare: skuPerState.value.compareSkuPer_3 || 0 },
  { label: 'GMROI>3', current: skuPerState.value.currentSkuPer_4 || 0, compare: skuPerState.value.compareSkuPer_4 || 0 }
]);

const sessionReady = computed(() => Boolean(statusState.value?.ready));

const renderScatter = () => {
  if (!scatterChartRef.value) return;
  scatterChartIns.value ||= echarts.init(scatterChartRef.value);
  scatterChartIns.value.setOption(
    {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.data[2]}<br/>周转率：${params.data[0]}<br/>毛利率：${params.data[1]}`
      },
      grid: { left: 50, right: 24, top: 20, bottom: 40 },
      xAxis: { type: 'value', name: '库存周转率' },
      yAxis: { type: 'value', name: '毛利率' },
      series: [
        {
          type: 'scatter',
          symbolSize: 12,
          data: quadrantState.value.list.map((item: GmroiQuadrantItemVO) => [
            Number(item.turnoverRate || 0),
            Number(item.grossRate || 0),
            item.productName || item.productNo || '--'
          ])
        }
      ]
    } as EChartsOption,
    true
  );
};

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
          data: [
            { name: 'GMROI<=1', value: Number(skuNumState.value.sku_1 || 0) },
            { name: '1<GMROI<=2', value: Number(skuNumState.value.sku_2 || 0) },
            { name: '2<GMROI<=3', value: Number(skuNumState.value.sku_3 || 0) },
            { name: 'GMROI>3', value: Number(skuNumState.value.sku_4 || 0) }
          ]
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
      xAxis: { type: 'category', data: ['本期', '对比期'] },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'bar',
          name: 'GMROI<=1',
          stack: 'a',
          data: [skuPerState.value.currentSkuPer_1 || 0, skuPerState.value.compareSkuPer_1 || 0]
        },
        {
          type: 'bar',
          name: '1<GMROI<=2',
          stack: 'a',
          data: [skuPerState.value.currentSkuPer_2 || 0, skuPerState.value.compareSkuPer_2 || 0]
        },
        {
          type: 'bar',
          name: '2<GMROI<=3',
          stack: 'a',
          data: [skuPerState.value.currentSkuPer_3 || 0, skuPerState.value.compareSkuPer_3 || 0]
        },
        {
          type: 'bar',
          name: 'GMROI>3',
          stack: 'a',
          data: [skuPerState.value.currentSkuPer_4 || 0, skuPerState.value.compareSkuPer_4 || 0]
        }
      ]
    } as EChartsOption,
    true
  );
};

const loadData = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const [statusRes, quadrantRes, skuNumRes, skuPerRes, skuChangeRes] = await Promise.all([
      getDiagnosisSessionStatus(sessionId.value),
      getGmroiFourQuadrant(sessionId.value),
      getGmroiSkuNum(sessionId.value),
      getGmroiSkuPer(sessionId.value),
      getGmroiSkuChange(sessionId.value)
    ]);
    statusState.value = statusRes.data;
    quadrantState.value = quadrantRes.result || { list: [] };
    skuNumState.value = skuNumRes.result || {};
    skuPerState.value = skuPerRes.result || {};
    void skuChangeRes;
    await nextTick();
    renderScatter();
    renderPie();
    renderBar();
  } finally {
    loading.value = false;
  }
};

const handleViewDetail = () => {
  router.push({ path: '/gmroi/analysis/detail', query: { ...route.query } });
};

const formatPercent = (value: unknown) => `${Number(value || 0).toFixed(2)}%`;

const resize = () => {
  scatterChartIns.value?.resize();
  pieChartIns.value?.resize();
  barChartIns.value?.resize();
};

onMounted(async () => {
  await loadData();
  window.addEventListener('resize', resize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  scatterChartIns.value?.dispose();
  pieChartIns.value?.dispose();
  barChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.gmroi-analysis-page {
  min-height: calc(100vh - 84px);
  background: #f5f7fa;
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgb(15 23 42 / 4%);
}

.header-card,
.chart-row,
.table-card {
  margin-bottom: 12px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
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

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.chart-box {
  width: 100%;
  height: 320px;
}

.large-chart {
  height: 500px;
}

.small-chart {
  height: 230px;
}
</style>
