<template>
  <div class="p-2 category-diagnosis-customer-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">客户分析</span>
          </div>
          <el-tag effect="plain" type="success" class="role-tag">本期角色：结构品类</el-tag>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="ageLoading">
          <template #header>
            <div class="card-header">
              <span class="card-title">年龄段分布</span>
            </div>
          </template>
          <div ref="ageChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="radarLoading">
          <template #header>
            <div class="card-header">
              <span class="card-title">客户画像雷达</span>
            </div>
          </template>
          <div ref="radarChartRef" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card" v-loading="tableLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">客户明细</span>
        </div>
      </template>
      <el-table :data="tableRows" border stripe row-key="ageKey" class="customer-table">
        <el-table-column label="年龄段" min-width="140" fixed="left">
          <template #default="{ row }">{{ row.ageName || row.ageCode || '-' }}</template>
        </el-table-column>
        <el-table-column label="本期销售额" min-width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.currentSales) }}</template>
        </el-table-column>
        <el-table-column label="本期客数" min-width="120" align="right">
          <template #default="{ row }">{{ formatInteger(row.currentCustomerCount) }}</template>
        </el-table-column>
        <el-table-column label="本期客单价" min-width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.currentCustomerPrice) }}</template>
        </el-table-column>
        <el-table-column label="本期件单价" min-width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.currentUnitPrice) }}</template>
        </el-table-column>
        <el-table-column label="本期客均件数" min-width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.currentCountAve) }}</template>
        </el-table-column>
        <el-table-column label="本期销售量" min-width="120" align="right">
          <template #default="{ row }">{{ formatInteger(row.currentSaleQuantity) }}</template>
        </el-table-column>
        <el-table-column label="对比销售额" min-width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.compareSales) }}</template>
        </el-table-column>
        <el-table-column label="销售额增长" min-width="120" align="right">
          <template #default="{ row }"><span :class="growthClass(row.salesGrowth)">{{ formatGrowth(row.salesGrowth) }}</span></template>
        </el-table-column>
        <el-table-column label="对比客数" min-width="120" align="right">
          <template #default="{ row }">{{ formatInteger(row.compareCustomerCount) }}</template>
        </el-table-column>
        <el-table-column label="客数增长" min-width="120" align="right">
          <template #default="{ row }"><span :class="growthClass(row.customerGrowth)">{{ formatGrowth(row.customerGrowth) }}</span></template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="CategoryDiagnosisCustomerDetail" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useRequest } from '@/hooks/useRequest';
import {
  getCategoryDiagnosisCustomerAgeBuckets,
  getCategoryDiagnosisCustomerDetails,
  getCategoryDiagnosisCustomerRadar
} from '@/api/category/diagnosis/detail';
import type {
  CustomerAgeBucketResponse,
  CustomerSalesDetailsItemResponse,
  CustomerSalesDetailsResponse,
  CustomerSalesRadarItemResponse,
  DiagnosisSubClassQuery
} from '@/api/category/diagnosis/detail/types';

interface AgeBarItem extends CustomerAgeBucketResponse {
  ageKey: string;
}

interface RadarViewItem {
  name: string;
  value: number[];
}

const route = useRoute();
const ageChartRef = ref<HTMLDivElement>();
const radarChartRef = ref<HTMLDivElement>();
const ageChartIns = ref<echarts.ECharts>();
const radarChartIns = ref<echarts.ECharts>();

const query = computed<DiagnosisSubClassQuery>(() => ({
  sessionId: (route.query.sessionId as string) || ''
}));

const sessionId = computed(() => query.value.sessionId || '');

const ageRows = ref<AgeBarItem[]>([]);
const radarRows = ref<CustomerSalesRadarItemResponse[]>([]);
const tableRows = ref<(CustomerSalesDetailsItemResponse & { ageKey: string })[]>([]);

const toNumber = (value: unknown, digits?: number) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return typeof digits === 'number' ? Number(num.toFixed(digits)) : num;
};

const formatAmount = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

const formatInteger = (value: unknown) => formatAmount(value, 0);
const formatGrowth = (value: unknown) => {
  const num = toNumber(value, 2);
  return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
};
const growthClass = (value: unknown) => (Number(value ?? 0) > 0 ? 'is-up' : Number(value ?? 0) < 0 ? 'is-down' : 'is-flat');

const normalizeAgeRows = (payload: CustomerAgeBucketResponse[] | undefined): AgeBarItem[] =>
  (payload || []).map((item, index) => ({
    ...item,
    ageKey: `${item.ageCode || 'age'}-${index}`
  }));

const normalizeRadarRows = (payload: CustomerSalesRadarItemResponse[] | undefined) => payload || [];
const normalizeTableRows = (payload: CustomerSalesDetailsResponse | undefined) =>
  (payload?.records || []).map((item, index) => ({
    ...item,
    ageKey: `${item.ageCode || 'age'}-${index}`
  }));

const ageRequest = useRequest(async (id: string) => await getCategoryDiagnosisCustomerAgeBuckets(id), {
  onSuccess: (res) => {
    ageRows.value = normalizeAgeRows(res?.data);
    nextTick(renderAgeChart);
  }
});

const radarRequest = useRequest(async (id: string) => await getCategoryDiagnosisCustomerRadar(id), {
  onSuccess: (res) => {
    radarRows.value = normalizeRadarRows(res?.data);
    nextTick(renderRadarChart);
  }
});

const tableRequest = useRequest(async (id: string) => await getCategoryDiagnosisCustomerDetails(id, 1, 999, 'ageOrder', 'asc'), {
  onSuccess: (res) => {
    tableRows.value = normalizeTableRows(res?.data);
  }
});

const ageLoading = computed(() => ageRequest.loading.value);
const radarLoading = computed(() => radarRequest.loading.value);
const tableLoading = computed(() => tableRequest.loading.value);

const renderAgeChart = () => {
  if (!ageChartRef.value) return;
  if (!ageChartIns.value) ageChartIns.value = echarts.init(ageChartRef.value);
  ageChartIns.value.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30, containLabel: true },
    xAxis: { type: 'value', axisLabel: { color: '#6b7280' }, splitLine: { lineStyle: { color: '#eef2f7' } } },
    yAxis: { type: 'category', data: ageRows.value.map((item) => item.ageName || item.ageCode || '-'), axisLabel: { color: '#6b7280' } },
    series: [
      {
        type: 'bar',
        data: ageRows.value.map((item) => toNumber(item.orderNumber, 0)),
        itemStyle: { color: '#3b82f6' }
      }
    ]
  });
};

const renderRadarChart = () => {
  if (!radarChartRef.value) return;
  if (!radarChartIns.value) radarChartIns.value = echarts.init(radarChartRef.value);
  const items = radarRows.value.filter((item) => item.ageCode === 'ALL' || item.ageName === '全部');
  const indicators = ['销售额', '客数', '客单价', '件单价', '客均件数', '销售量'].map((name) => ({ name, max: 100000 }));
  const seriesData: RadarViewItem[] = [
    {
      name: '男',
      value: [
        items.find((item) => item.gender === 1)?.currentSales || 0,
        items.find((item) => item.gender === 1)?.currentCustomerCount || 0,
        items.find((item) => item.gender === 1)?.currentCustomerPrice || 0,
        items.find((item) => item.gender === 1)?.currentUnitPrice || 0,
        items.find((item) => item.gender === 1)?.currentCountAve || 0,
        items.find((item) => item.gender === 1)?.currentSaleQuantity || 0
      ].map((v) => toNumber(v, 2))
    },
    {
      name: '女',
      value: [
        items.find((item) => item.gender === 2)?.currentSales || 0,
        items.find((item) => item.gender === 2)?.currentCustomerCount || 0,
        items.find((item) => item.gender === 2)?.currentCustomerPrice || 0,
        items.find((item) => item.gender === 2)?.currentUnitPrice || 0,
        items.find((item) => item.gender === 2)?.currentCountAve || 0,
        items.find((item) => item.gender === 2)?.currentSaleQuantity || 0
      ].map((v) => toNumber(v, 2))
    }
  ];
  radarChartIns.value.setOption({
    tooltip: { trigger: 'item' },
    legend: { top: 0, left: 'center' },
    radar: { indicator: indicators },
    series: [{ type: 'radar', data: seriesData }]
  });
};

const loadPageData = async () => {
  if (!sessionId.value) return;
  await Promise.all([ageRequest.run(sessionId.value), radarRequest.run(sessionId.value), tableRequest.run(sessionId.value)]);
};

const resizeCharts = () => {
  ageChartIns.value?.resize();
  radarChartIns.value?.resize();
};

onMounted(async () => {
  await loadPageData();
  window.addEventListener('resize', resizeCharts);
});

watch(
  () => route.query.sessionId,
  async () => {
    await loadPageData();
  }
);

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  ageChartIns.value?.dispose();
  radarChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.category-diagnosis-customer-page {
  background: #f5f7fa;
  min-height: 100%;
}
.page-card { border: 1px solid var(--el-border-color-light); box-shadow: 0 2px 8px rgba(15,23,42,.04); }
.header-card { margin-bottom: 12px; }
.page-header { display:flex; justify-content:space-between; gap:16px; }
.page-title-wrap { display:flex; align-items:center; gap:8px; }
.page-title-line { width:3px; height:16px; border-radius:999px; background: var(--el-color-primary); }
.page-title { font-size:20px; font-weight:700; }
.page-actions { display:flex; align-items:center; gap:14px; }
.chart-row { margin-bottom:12px; }
.card-header { display:flex; align-items:center; justify-content:space-between; }
.card-title { font-size:15px; font-weight:600; }
.chart-box { width:100%; height:360px; }
.customer-table :deep(.el-table__header th) { background:#f8fafc; font-weight:600; }
.customer-table :deep(.cell) { font-size:13px; }
.is-up { color: var(--el-color-danger); font-weight: 600; }
.is-down { color: var(--el-color-success); font-weight: 600; }
.is-flat { color: var(--el-text-color-secondary); font-weight: 600; }
</style>
