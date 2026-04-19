<template>
  <div class="p-2 supplier-analysis-page">
    <el-card shadow="hover" class="page-card summary-card">
      <div class="summary-line">数据日期:2024/10/01至2024/12/08 ｜ 对比日期:2023/10/01至2023/12/08</div>
      <div class="summary-line">组织: 华南大区 ｜ 业态: 标准店 ｜ 商圈: 社区店 ｜ 门店: 全部门店</div>
    </el-card>

    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">供应商分析</span>
          </div>
          <div class="title-row">
            <span class="category-title">004洗化部（一级品类）</span>
            <el-tag effect="plain" type="success" class="role-tag">本期角色：结构品类</el-tag>
          </div>
        </div>
        <div class="page-header-right">
          <div class="hint-text">该门店范围下品类的预设角色为“结构品类”，预设SKU数为128</div>
          <div class="page-actions">
            <el-button link type="primary" @click="handleViewDetail">详情</el-button>
            <span class="unit-text">金额单位：元</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">近3月供应商销售占比</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-box large-chart" />
        </el-card>
      </el-col>

      <el-col :lg="12" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card">
          <template #header>
            <div class="chart-header">
              <span class="card-title">近3月供应商指标排名</span>
              <div class="chart-toolbar">
                <el-select v-model="activeMetric" class="metric-select" @change="handleMetricChange">
                  <el-option v-for="item in metricOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <div class="page-switcher">
                  <el-button text :disabled="currentPage === 1" @click="changePage(currentPage - 1)">‹</el-button>
                  <el-button
                    v-for="page in pageCount"
                    :key="page"
                    text
                    :type="page === currentPage ? 'primary' : undefined"
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </el-button>
                  <el-button text :disabled="currentPage === pageCount" @click="changePage(currentPage + 1)">›</el-button>
                </div>
              </div>
            </div>
          </template>
          <div ref="barChartRef" class="chart-box large-chart" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card advice-card">
      <template #header>
        <div class="advice-header">
          <span class="card-title">总结与建议</span>
        </div>
      </template>

      <ul class="advice-list">
        <li><strong>单品产出少、毛利率低的供应商优化建议：</strong> 建议优先压缩低产出低毛利SKU，集中陈列和促销资源给头部供应商与高效率单品。</li>
        <li><strong>单品产出偏少供应商合作建议：</strong> 对持续单品产出偏少且销售贡献有限的供应商，可评估减少合作层级或逐步替换。</li>
        <li><strong>缺货率超标供应商履约提醒：</strong> 对缺货率持续偏高的供应商，应明确补货时效和履约考核规则，降低销售损失风险。</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup name="SupplierAnalysis" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface SupplierPieItem {
  name: string;
  value: number;
  color: string;
}

interface RankingRow {
  supplierCode: string;
  supplierName: string;
  saleAmount: number;
  itemOutput: number;
  grossRate: number;
  outOfStockRate: number;
}

const router = useRouter();
const route = useRoute();

const pieChartRef = ref<HTMLDivElement>();
const barChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const barChartIns = ref<echarts.ECharts>();

const metricOptions = [
  { label: '单品产出', value: 'itemOutput' },
  { label: '销售额', value: 'saleAmount' },
  { label: '毛利率', value: 'grossRate' },
  { label: '缺货率', value: 'outOfStockRate' }
];

const activeMetric = ref('itemOutput');
const currentPage = ref(1);
const pageSize = 5;

const pieData: SupplierPieItem[] = [
  { name: 'V001 联合日化', value: 165200, color: '#27b0d6' },
  { name: 'V002 华洁供应', value: 123800, color: '#f06b4f' },
  { name: 'V003 家净商贸', value: 96700, color: '#b69cff' },
  { name: 'V004 佳洁伙伴', value: 82400, color: '#34c38f' },
  { name: 'V005 清新产业', value: 71600, color: '#f59e0b' }
];

const rankingRows: RankingRow[] = [
  { supplierCode: 'V001', supplierName: '联合日化', saleAmount: 165200, itemOutput: 5820, grossRate: 31.6, outOfStockRate: 1.8 },
  { supplierCode: 'V002', supplierName: '华洁供应', saleAmount: 123800, itemOutput: 4760, grossRate: 28.2, outOfStockRate: 2.5 },
  { supplierCode: 'V003', supplierName: '家净商贸', saleAmount: 96700, itemOutput: 4310, grossRate: 26.9, outOfStockRate: 3.1 },
  { supplierCode: 'V004', supplierName: '佳洁伙伴', saleAmount: 82400, itemOutput: 3880, grossRate: 30.4, outOfStockRate: 4.2 },
  { supplierCode: 'V005', supplierName: '清新产业', saleAmount: 71600, itemOutput: 3310, grossRate: 24.8, outOfStockRate: 5.1 },
  { supplierCode: 'V006', supplierName: '优选洗护', saleAmount: 64500, itemOutput: 2860, grossRate: 22.6, outOfStockRate: 5.8 },
  { supplierCode: 'V007', supplierName: '北辰清洁', saleAmount: 60200, itemOutput: 2630, grossRate: 20.1, outOfStockRate: 6.2 },
  { supplierCode: 'V008', supplierName: '晨光供销', saleAmount: 55100, itemOutput: 2410, grossRate: 21.4, outOfStockRate: 4.6 },
  { supplierCode: 'V009', supplierName: '同兴日配', saleAmount: 49700, itemOutput: 2280, grossRate: 19.9, outOfStockRate: 7.4 },
  { supplierCode: 'V010', supplierName: '百悦商行', saleAmount: 45600, itemOutput: 2140, grossRate: 18.6, outOfStockRate: 8.1 }
];

const pageCount = computed(() => Math.max(1, Math.ceil(rankingRows.length / pageSize)));
const currentRankingRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return rankingRows.slice(start, start + pageSize);
});

const getMetricLabel = (metric: string) => metricOptions.find((item) => item.value === metric)?.label || metric;

const getMetricValue = (row: RankingRow) => {
  if (activeMetric.value === 'saleAmount') return row.saleAmount;
  if (activeMetric.value === 'grossRate') return row.grossRate;
  if (activeMetric.value === 'outOfStockRate') return row.outOfStockRate;
  return row.itemOutput;
};

const getMetricUnit = () => {
  if (activeMetric.value === 'saleAmount') return '元';
  if (activeMetric.value === 'grossRate' || activeMetric.value === 'outOfStockRate') return '%';
  return '元/单品';
};

const initPieChart = () => {
  if (!pieChartRef.value) return;
  if (!pieChartIns.value) {
    pieChartIns.value = echarts.init(pieChartRef.value);
  }
};

const initBarChart = () => {
  if (!barChartRef.value) return;
  if (!barChartIns.value) {
    barChartIns.value = echarts.init(barChartRef.value);
  }
};

const renderPieChart = () => {
  initPieChart();
  if (!pieChartIns.value) return;

  const option: EChartsOption = {
    color: pieData.map((item) => item.color),
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}<br/>销售额：${Number(params.value).toLocaleString('zh-CN')}<br/>占比：${Number(params.percent).toFixed(2)}%`
    },
    legend: {
      orient: 'vertical',
      right: 12,
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
        data: pieData.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }
    ]
  };

  pieChartIns.value.setOption(option, true);
};

const renderBarChart = () => {
  initBarChart();
  if (!barChartIns.value) return;

  const rows = currentRankingRows.value;
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const row = Array.isArray(params) ? params[0] : params;
        return `${row.axisValue}<br/>${getMetricLabel(activeMetric.value)}：${formatMetric(Number(row.value))}`;
      }
    },
    grid: {
      left: 90,
      right: 26,
      top: 24,
      bottom: 24
    },
    xAxis: {
      type: 'value',
      name: getMetricUnit(),
      nameTextStyle: { color: '#909399' },
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#606266' },
      splitLine: { lineStyle: { color: '#ebeef5' } }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: rows.map((item) => `${item.supplierCode}`),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: '#606266' }
    },
    series: [
      {
        type: 'bar',
        data: rows.map((item) => getMetricValue(item)),
        barWidth: 16,
        itemStyle: {
          color: '#27b0d6',
          borderRadius: [0, 8, 8, 0]
        },
        label: {
          show: true,
          position: 'right',
          color: '#606266',
          formatter: ({ value }: { value: number }) => formatMetric(Number(value))
        },
        markPoint: rows.length
          ? {
              symbol: 'triangle',
              symbolSize: 16,
              symbolRotate: 0,
              itemStyle: { color: '#e53e3e' },
              data: [
                {
                  coord: [getMetricValue(rows[0]), rows[0].supplierCode]
                }
              ]
            }
          : undefined
      }
    ]
  };

  barChartIns.value.setOption(option, true);
};

const formatMetric = (value: number) => {
  if (activeMetric.value === 'grossRate' || activeMetric.value === 'outOfStockRate') {
    return `${value.toFixed(2)}%`;
  }
  return value.toLocaleString('zh-CN');
};

const loadSupplierAnalysis = async () => {
  // TODO: replace with real backend request for supplier analysis.
  await nextTick();
  renderPieChart();
  renderBarChart();
};

const changePage = async (page: number) => {
  if (page < 1 || page > pageCount.value || page === currentPage.value) return;
  currentPage.value = page;
  await nextTick();
  renderBarChart();
};

const handleMetricChange = async () => {
  currentPage.value = 1;
  await nextTick();
  renderBarChart();
};

const handleViewDetail = () => {
  router.push({
    path: '/supplier/analysis/detail',
    query: {
      ...route.query
    }
  });
};

const resizeCharts = () => {
  pieChartIns.value?.resize();
  barChartIns.value?.resize();
};

onMounted(async () => {
  await loadSupplierAnalysis();
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  pieChartIns.value?.dispose();
  barChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.supplier-analysis-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.summary-card {
  margin-bottom: 12px;
}

.summary-line {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.7;
}

.header-card {
  margin-bottom: 12px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-title-wrap,
.title-row,
.page-actions,
.chart-toolbar,
.page-switcher {
  display: flex;
  align-items: center;
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
  line-height: 1;
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

.role-tag {
  border-radius: 999px;
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

.page-actions {
  gap: 12px;
}

.chart-row {
  margin-bottom: 12px;
}

.chart-header,
.card-header,
.advice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.metric-select {
  width: 140px;
}

.chart-toolbar {
  gap: 12px;
}

.page-switcher {
  gap: 2px;
}

.chart-box {
  width: 100%;
}

.large-chart {
  height: 360px;
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
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header-right {
    align-items: flex-start;
  }

  .chart-toolbar {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
