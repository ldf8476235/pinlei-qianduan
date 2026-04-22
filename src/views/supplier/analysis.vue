<template>
  <div class="p-2 supplier-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="title-block">
          <div class="page-title-row">
            <span class="page-title">供应商分析</span>
            <el-link type="primary" :underline="false" class="detail-link" @click="handleViewDetail">详情 &gt;</el-link>
          </div>
          <div class="page-subtitle">
            <span>sessionId: {{ sessionId || '--' }}</span>
            <span v-if="statusState?.dataVersion">版本: {{ statusState.dataVersion }}</span>
          </div>
        </div>

        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button type="primary" plain @click="handleViewDetail">详情</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12">
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="chart-card-header">
              <span class="card-title">近3月供应商销售占比</span>
            </div>
          </template>
          <div class="pie-layout">
            <div ref="pieChartRef" class="chart-box" />
            <div class="pie-legend">
              <div v-for="item in pieLegendItems" :key="item.key" class="legend-item">
                <span class="legend-dot" :style="{ background: item.color }" />
                <span class="legend-name">{{ item.name }}</span>
              </div>
              <div class="legend-pager">
                <span class="pager-arrow">▲</span>
                <span>{{ pieLegendPageText }}</span>
                <span class="pager-arrow">▼</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="chart-card-header">
              <div class="chart-title-group">
                <span class="card-title">近3月供应商指标排名</span>
                <span class="rank-direction">降序</span>
              </div>
              <el-select v-model="activeMetric" style="width: 180px" @change="loadRanking">
                <el-option v-for="item in metricOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </template>
          <div class="bar-wrap">
            <div ref="barChartRef" class="chart-box chart-box--bar" />
          <div class="bar-pager">
            <span v-for="item in rankingPageMarks" :key="item" class="page-mark" :class="{ active: item === 1 }">
              {{ item }}
            </span>
            <span v-if="showRankingEllipsis" class="page-mark page-mark--ellipsis">...</span>
          </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card advice-card mt-[12px]">
      <template #header>
        <div class="advice-card-header">
          <span class="advice-accent" />
          <span class="card-title">总结与建议</span>
        </div>
      </template>

      <ul class="advice-list">
        <li v-if="summarySentenceOne"><span class="bullet">●</span><span>{{ summarySentenceOne }}</span></li>
        <li v-if="summarySentenceTwo"><span class="bullet">●</span><span>{{ summarySentenceTwo }}</span></li>
        <li v-if="summarySentenceThree"><span class="bullet">●</span><span>{{ summarySentenceThree }}</span></li>
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
  { label: '新商品SKU数', value: '4' },
  { label: '异议单金额占比', value: '5' }
];

const legendColors = ['#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#15803d'];

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
const rankingTotal = ref(0);
const summary = ref<VendorSummaryVO>({});
const loading = ref(false);

const pieLegendItems = computed(() => {
  return [...salesShare.value]
    .sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0))
    .slice(0, 5)
    .map((item, index) => ({
      key: `${item.productVendorNo || index}`,
      name: item.productVendorNo || item.productVendorName || '--',
      color: legendColors[index % legendColors.length]
    }));
});

const pieLegendPageText = computed(() => {
  const totalPages = Math.max(1, Math.ceil((salesShare.value.length || 1) / 5));
  return `1/${totalPages}`;
});

const rankingPageMarks = computed(() => {
  const totalPages = Math.max(1, Math.ceil((rankingTotal.value || ranking.value.length || 1) / 10));
  return Array.from({ length: Math.min(3, totalPages) }, (_, index) => index + 1);
});

const showRankingEllipsis = computed(() => Math.max(1, Math.ceil((rankingTotal.value || ranking.value.length || 1) / 10)) > 3);

const summarySentenceOne = computed(() => {
  const list = (summary.value.summaryOne || []).filter(Boolean);
  return list.length ? `${list.join('、')}等，单品产出较少且毛利率较低，建议优化该供应商下的商品，可优先对供应SKU较少的供应商处理。` : '';
});

const summarySentenceTwo = computed(() => {
  const list = (summary.value.summaryTwo || []).filter(Boolean);
  return list.length ? `${list.join('、')}等，单品产出较少，建议减少或更换该供应商下的商品。` : '';
});

const summarySentenceThree = computed(() => {
  const list = (summary.value.summaryThree || []).filter(Boolean);
  return list.length ? `${list.join('、')}等，缺货率相对较高(超过5%)，建议规范该供应商的履约行为。` : '';
});



const renderPie = () => {
  if (!pieChartRef.value) return;
  pieChartIns.value ||= echarts.init(pieChartRef.value);
  const data = [...salesShare.value]
    .sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0))
    .slice(0, 5)
    .map((item, index) => ({
      name: item.productVendorName || item.productVendorNo || '--',
      value: Number(item.sales || 0),
      itemStyle: { color: legendColors[index % legendColors.length] }
    }));

  pieChartIns.value.setOption(
    {
      tooltip: {
        trigger: 'item',
        formatter: (param: any) => `${param.name}<br/>销售额：${Number(param.value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
      },
      series: [
        {
          type: 'pie',
          radius: ['52%', '76%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderBar = () => {
  if (!barChartRef.value) return;
  barChartIns.value ||= echarts.init(barChartRef.value);
  const values = ranking.value.map((item) => Number(item.data || 0));
  const maxValue = values.length ? Math.max(...values) : 0;
  const avgValue = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

  barChartIns.value.setOption(
    {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 140, right: 36, top: 18, bottom: 18, containLabel: true },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#d1d5db' } },
        splitLine: { lineStyle: { color: '#e5e7eb' } }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#111827' },
        data: ranking.value.map((item) => item.productVendorName || item.productVendorNo || '--')
      },
      series: [
        {
          type: 'bar',
          barWidth: 14,
          itemStyle: { color: '#14b8a6', borderRadius: [0, 999, 999, 0] },
          data: values,
          markLine: {
            symbol: ['none', 'none'],
            label: { show: false },
            lineStyle: { color: '#ef4444', width: 2, type: 'solid' },
            data: [{ xAxis: avgValue || maxValue * 0.6 }]
          }
        }
      ]
    } as EChartsOption,
    true
  );
};

const loadRanking = async () => {
  if (!sessionId.value) return;
  const res = await getVendorRanking(sessionId.value, activeMetric.value, 1, 10, 'desc');
  ranking.value = res.data?.list || [];
  rankingTotal.value = Number(res.data?.total || ranking.value.length || 0);
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
    salesShare.value = shareRes.data || [];
    summary.value = summaryRes.data || {};
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

watch(
  () => route.query.sessionId,
  async () => {
    await loadData();
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  pieChartIns.value?.dispose();
  barChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.supplier-analysis-page {
  min-height: calc(100vh - 84px);
  background:
    radial-gradient(circle at top left, rgb(20 184 166 / 8%), transparent 34%),
    linear-gradient(180deg, #f8fafc 0%, #f3f6fb 100%);
}

.page-card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgb(15 23 42 / 5%);
  border-radius: 14px;
  overflow: hidden;
}

.header-card {
  margin-bottom: 12px;
}

.page-header,
.page-title-row,
.page-actions,
.chart-card-header,
.chart-title-group,
.advice-card-header {
  display: flex;
  align-items: center;
}

.page-header,
.chart-card-header {
  justify-content: space-between;
  gap: 12px;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.page-title-row {
  gap: 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.detail-link {
  font-size: 14px;
  font-weight: 600;
}

.page-subtitle,
.unit-text,
.rank-direction {
  font-size: 13px;
  color: #64748b;
}

.page-subtitle {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.page-actions {
  gap: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.chart-title-group {
  gap: 10px;
}

.chart-box {
  width: 100%;
  height: 360px;
}

.chart-box--bar {
  height: 340px;
}

.pie-layout {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.pie-legend {
  width: 220px;
  padding: 10px 0 10px 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #111827;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.legend-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-pager {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: #334155;
  font-size: 12px;
}

.pager-arrow {
  color: #0f766e;
}

.bar-wrap {
  display: flex;
  flex-direction: column;
}

.bar-pager {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 0 0 6px;
}

.page-mark {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #475569;
  background: #edf2f7;
}

.page-mark.active {
  color: #ffffff;
  background: #14b8a6;
}

.page-mark--ellipsis {
  background: transparent;
}

.advice-card {
  margin-top: 12px;
  background: #fbfdff;
}

.advice-card-header {
  gap: 10px;
}

.advice-accent {
  width: 4px;
  height: 18px;
  border-radius: 999px;
  background: #14b8a6;
}

.advice-list {
  margin: 0;
  padding: 0 0 0 4px;
  list-style: none;
  line-height: 1.9;
  color: #111827;
}

.advice-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.bullet {
  flex: 0 0 auto;
  color: #111827;
  line-height: 1.9;
}
</style>
