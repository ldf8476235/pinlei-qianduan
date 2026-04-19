<template>
  <div class="p-2 brand-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">品牌分析</span>
          </div>
          <div class="title-row">
            <span class="category-title">004洗化部（一级品类）</span>
            <el-tag effect="plain" type="success" class="role-tag">本期角色：结构品类</el-tag>
          </div>
        </div>
        <div class="page-header-right">
          <div class="hint-text">该门店范围下品类的预设角色为“结构品类”，预设SKU总数为126</div>
          <div class="page-actions">
            <el-button link type="primary" @click="handleViewDetail">详情</el-button>
            <span class="unit-text">金额单位：元</span>
          </div>
        </div>
      </div>
    </el-card>

    <div class="metric-row">
      <el-card v-for="item in metricCards" :key="item.label" shadow="hover" class="page-card metric-card">
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-value">{{ item.value }}</div>
      </el-card>
    </div>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期各品牌销售占比</span>
              <div class="page-switcher">
                <el-button text :disabled="piePage === 1" @click="changePiePage(piePage - 1)">‹</el-button>
                <el-button v-for="page in piePageCount" :key="page" text :type="page === piePage ? 'primary' : undefined" @click="changePiePage(page)">{{ page }}</el-button>
                <el-button text :disabled="piePage === piePageCount" @click="changePiePage(piePage + 1)">›</el-button>
              </div>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-box medium-chart" />
        </el-card>
      </el-col>

      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期品牌业绩排名</span>
              <div class="toolbar-wrap">
                <el-select v-model="activeRankMetric" class="metric-select" @change="changeRankPage(1)">
                  <el-option v-for="item in rankMetricOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div class="page-switcher">
                  <el-button text :disabled="rankPage === 1" @click="changeRankPage(rankPage - 1)">‹</el-button>
                  <el-button v-for="page in rankPageCount" :key="page" text :type="page === rankPage ? 'primary' : undefined" @click="changeRankPage(page)">{{ page }}</el-button>
                  <el-button text :disabled="rankPage === rankPageCount" @click="changeRankPage(rankPage + 1)">›</el-button>
                </div>
              </div>
            </div>
          </template>
          <div ref="rankChartRef" class="chart-box medium-chart" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card chart-card combo-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">品牌SKU数及销售对比变化</span>
        </div>
      </template>
      <div ref="comboChartRef" class="chart-box combo-chart" />
    </el-card>

    <el-card shadow="hover" class="page-card advice-card">
      <template #header>
        <div class="advice-header">
          <span class="card-title">总结与建议</span>
        </div>
      </template>
      <ul class="advice-list">
        <li><strong>优质品牌维护建议：</strong> 清扬、滴露、蓝月亮销售额表现优异且客户购买意向较高，建议继续保障头部陈列与促销资源稳定投放。</li>
        <li><strong>弱势品牌优化建议：</strong> 销售额偏弱且客户意向较低的长尾品牌，建议结合门店定位与替代品牌逐步精简。</li>
        <li><strong>增长品牌经营解读：</strong> 舒肤佳、威露士销售额同比上涨且意向提升，说明品牌势能和复购表现正在增强，可适度扩大覆盖。</li>
        <li><strong>下滑品牌风险预警：</strong> 部分高库存低动销品牌出现销售额与购买意向同步下滑，建议及时复盘价格带、促销节奏和陈列位置。</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup name="BrandAnalysis" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface BrandSaleItem {
  name: string;
  value: number;
  color: string;
}

interface BrandRankItem {
  name: string;
  salesAmount: number;
  grossAmount: number;
  saleQty: number;
}

const router = useRouter();
const route = useRoute();

const pieChartRef = ref<HTMLDivElement>();
const rankChartRef = ref<HTMLDivElement>();
const comboChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const rankChartIns = ref<echarts.ECharts>();
const comboChartIns = ref<echarts.ECharts>();

const metricCards = [
  { label: '品牌总数', value: '18' },
  { label: '新销品牌', value: '4' },
  { label: '自有品牌', value: '3' }
];

const piePage = ref(1);
const rankPage = ref(1);
const pageSize = 6;
const activeRankMetric = ref('salesAmount');

const rankMetricOptions = [
  { label: '销售额', value: 'salesAmount' },
  { label: '毛利额', value: 'grossAmount' },
  { label: '销售量', value: 'saleQty' }
];

const brandSales: BrandSaleItem[] = [
  { name: '清扬', value: 128600, color: '#27b0d6' },
  { name: '滴露', value: 116400, color: '#f06b4f' },
  { name: '蓝月亮', value: 102800, color: '#b69cff' },
  { name: '舒肤佳', value: 96500, color: '#34c38f' },
  { name: '威露士', value: 84200, color: '#f59e0b' },
  { name: '立白', value: 76500, color: '#60a5fa' },
  { name: '六神', value: 62100, color: '#ef4444' },
  { name: '超能', value: 55800, color: '#14b8a6' },
  { name: '纳爱斯', value: 48600, color: '#8b5cf6' },
  { name: '雕牌', value: 43200, color: '#f97316' }
];

const brandRanks: BrandRankItem[] = [
  { name: '清扬', salesAmount: 128600, grossAmount: 46280, saleQty: 6520 },
  { name: '滴露', salesAmount: 116400, grossAmount: 41360, saleQty: 5930 },
  { name: '蓝月亮', salesAmount: 102800, grossAmount: 36850, saleQty: 5210 },
  { name: '舒肤佳', salesAmount: 96500, grossAmount: 34120, saleQty: 4880 },
  { name: '威露士', salesAmount: 84200, grossAmount: 30240, saleQty: 4310 },
  { name: '立白', salesAmount: 76500, grossAmount: 28620, saleQty: 3960 },
  { name: '六神', salesAmount: 62100, grossAmount: 23120, saleQty: 3210 },
  { name: '超能', salesAmount: 55800, grossAmount: 20450, saleQty: 2860 },
  { name: '纳爱斯', salesAmount: 48600, grossAmount: 17980, saleQty: 2520 },
  { name: '雕牌', salesAmount: 43200, grossAmount: 15360, saleQty: 2250 }
];

const comboBrands = ['清扬', '滴露', '蓝月亮', '舒肤佳', '威露士', '立白', '六神', '超能'];
const comboSkuChange = [6, 4, -2, 5, 3, -1, -3, 2];
const comboSalesGrowth = [18.6, 12.4, -4.2, 16.8, 9.3, -2.1, -6.8, 4.5];

const piePageCount = computed(() => Math.max(1, Math.ceil(brandSales.length / pageSize)));
const rankPageCount = computed(() => Math.max(1, Math.ceil(brandRanks.length / pageSize)));
const currentPieRows = computed(() => brandSales.slice((piePage.value - 1) * pageSize, piePage.value * pageSize));
const currentRankRows = computed(() => brandRanks.slice((rankPage.value - 1) * pageSize, rankPage.value * pageSize));

const initPieChart = () => {
  if (!pieChartRef.value) return;
  if (!pieChartIns.value) pieChartIns.value = echarts.init(pieChartRef.value);
};

const initRankChart = () => {
  if (!rankChartRef.value) return;
  if (!rankChartIns.value) rankChartIns.value = echarts.init(rankChartRef.value);
};

const initComboChart = () => {
  if (!comboChartRef.value) return;
  if (!comboChartIns.value) comboChartIns.value = echarts.init(comboChartRef.value);
};

const renderPieChart = () => {
  initPieChart();
  if (!pieChartIns.value) return;
  const option: EChartsOption = {
    color: currentPieRows.value.map((item) => item.color),
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}<br/>销售额：${Number(params.value).toLocaleString('zh-CN')}<br/>占比：${Number(params.percent).toFixed(2)}%`
    },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'middle',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#606266', fontSize: 13 }
    },
    series: [
      {
        type: 'pie',
        radius: ['52%', '72%'],
        center: ['34%', '50%'],
        label: { show: false },
        labelLine: { show: false },
        data: currentPieRows.value.map((item) => ({ name: item.name, value: item.value, itemStyle: { color: item.color } }))
      }
    ]
  };
  pieChartIns.value.setOption(option, true);
};

const renderRankChart = () => {
  initRankChart();
  if (!rankChartIns.value) return;
  const rows = currentRankRows.value;
  const metricLabel = rankMetricOptions.find((item) => item.value === activeRankMetric.value)?.label || '销售额';
  const values = rows.map((item) => Number(item[activeRankMetric.value as keyof BrandRankItem] || 0));
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const row = Array.isArray(params) ? params[0] : params;
        return `${row.axisValue}<br/>${metricLabel}：${Number(row.value).toLocaleString('zh-CN')}`;
      }
    },
    grid: { left: 76, right: 26, top: 24, bottom: 24 },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#606266' },
      splitLine: { lineStyle: { color: '#ebeef5' } }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: rows.map((item) => item.name),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: '#606266' }
    },
    series: [
      {
        type: 'bar',
        barWidth: 16,
        data: values,
        itemStyle: { color: '#27b0d6', borderRadius: [0, 8, 8, 0] },
        label: {
          show: true,
          position: 'right',
          color: '#606266',
          formatter: ({ value }: { value: number }) => Number(value).toLocaleString('zh-CN')
        },
        markPoint: rows.length
          ? {
              symbol: 'triangle',
              symbolSize: 16,
              itemStyle: { color: '#e53e3e' },
              data: [{ coord: [values[0], rows[0].name] }]
            }
          : undefined
      }
    ]
  };
  rankChartIns.value.setOption(option, true);
};

const renderComboChart = () => {
  initComboChart();
  if (!comboChartIns.value) return;
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        const rows = Array.isArray(params) ? params : [params];
        return [rows[0]?.axisValue || '', ...rows.map((item) => `${item.marker}${item.seriesName}：${Number(item.value).toFixed(2)}${item.seriesName.includes('增长率') ? '%' : ''}`)].join('<br/>');
      }
    },
    legend: {
      top: 6,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#606266', fontSize: 13 },
      data: ['SKU变动数', '销售额增长率']
    },
    grid: { left: 52, right: 52, top: 46, bottom: 30 },
    xAxis: {
      type: 'category',
      data: comboBrands,
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#606266' }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额增长率',
        axisLabel: { color: '#606266', formatter: (value: number) => `${value}%` },
        splitLine: { lineStyle: { color: '#ebeef5' } }
      },
      {
        type: 'value',
        name: 'SKU变动数',
        axisLabel: { color: '#606266' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'SKU变动数',
        type: 'bar',
        yAxisIndex: 1,
        barWidth: 18,
        data: comboSkuChange,
        itemStyle: { color: '#f59e0b', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '销售额增长率',
        type: 'line',
        smooth: true,
        data: comboSalesGrowth,
        itemStyle: { color: '#9ca3af' },
        lineStyle: { color: '#9ca3af', width: 2 }
      }
    ]
  };
  comboChartIns.value.setOption(option, true);
};

const loadBrandAnalysis = async () => {
  // TODO: replace with real backend request for brand analysis.
  await nextTick();
  renderPieChart();
  renderRankChart();
  renderComboChart();
};

const changePiePage = async (page: number) => {
  if (page < 1 || page > piePageCount.value || page === piePage.value) return;
  piePage.value = page;
  await nextTick();
  renderPieChart();
};

const changeRankPage = async (page: number) => {
  if (page < 1 || page > rankPageCount.value || page === rankPage.value) return;
  rankPage.value = page;
  await nextTick();
  renderRankChart();
};

const handleViewDetail = () => {
  router.push({
    path: '/brand/analysis/detail',
    query: {
      ...route.query
    }
  });
};

const resizeCharts = () => {
  pieChartIns.value?.resize();
  rankChartIns.value?.resize();
  comboChartIns.value?.resize();
};

onMounted(async () => {
  await loadBrandAnalysis();
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  pieChartIns.value?.dispose();
  rankChartIns.value?.dispose();
  comboChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.brand-analysis-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.header-card,
.metric-row,
.chart-row,
.combo-card {
  margin-bottom: 12px;
}

.page-header,
.page-title-wrap,
.title-row,
.page-actions,
.card-header,
.toolbar-wrap,
.page-switcher,
.advice-header {
  display: flex;
  align-items: center;
}

.page-header,
.card-header,
.advice-header {
  justify-content: space-between;
  gap: 12px;
}

.page-title-wrap {
  gap: 8px;
}

.page-title-line {
  width: 3px;
  height: 16px;
  border-radius: 999px;
  background: var(--el-color-primary);
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.title-row {
  gap: 10px;
  margin-top: 10px;
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.page-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.hint-text,
.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.page-actions,
.toolbar-wrap,
.page-switcher {
  gap: 12px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 18px 20px;
}

.metric-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.metric-value {
  margin-top: 10px;
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.metric-select {
  width: 120px;
}

.chart-box {
  width: 100%;
}

.medium-chart {
  height: 340px;
}

.combo-chart {
  height: 320px;
}

.advice-list {
  margin: 0;
  padding-left: 18px;
  color: var(--el-text-color-regular);
  line-height: 1.8;
}

.advice-list li + li {
  margin-top: 10px;
}

@media (max-width: 992px) {
  .page-header,
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header-right {
    align-items: flex-start;
  }

  .metric-row {
    grid-template-columns: 1fr;
  }

  .toolbar-wrap {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
