<template>
  <div class="spec-analysis-page">
    <template v-if="!showDetail">
      <el-card shadow="hover" class="page-card header-card">
        <div class="page-header">
          <div class="page-header-left">
            <div class="page-title-wrap">
              <span class="page-title-line" />
              <span class="page-title">规格分析</span>
            </div>
            <div class="title-row">
              <span class="category-title">{{ categoryTitle }}</span>
              <el-tag effect="plain" type="success" class="role-tag">本期角色：结构品类</el-tag>
            </div>
            <div class="summary-line">{{ dateSummary }}</div>
          </div>
          <div class="page-header-right">
            <div class="hint-text">规格分析用于识别规格偏好与需求差异，帮助优化规格结构。</div>
            <div class="page-actions">
              <el-button link type="primary" @click="showDetail = true">详情</el-button>
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
                <span class="card-title">本期规格销售占比</span>
              </div>
            </template>
            <div ref="pieChartRef" class="chart-box medium-chart" />
          </el-card>
        </el-col>
        <el-col :lg="12" :md="24" :sm="24" :xs="24">
          <el-card shadow="hover" class="page-card chart-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">本期规格业绩排名</span>
              </div>
            </template>
            <div ref="barChartRef" class="chart-box medium-chart" />
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="12" class="chart-row">
        <el-col :span="24">
          <el-card shadow="hover" class="page-card chart-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">规格SKU数及销售对比变化</span>
              </div>
            </template>
            <div ref="lineBarChartRef" class="chart-box large-chart" />
          </el-card>
        </el-col>
      </el-row>

      <el-card shadow="hover" class="page-card summary-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">总结与建议</span>
          </div>
        </template>
        <div class="summary-content">
          <div v-for="item in summaryItems" :key="item.title" class="summary-item">
            <div class="summary-item-title">{{ item.title }}</div>
            <div class="summary-item-text">{{ item.text }}</div>
          </div>
        </div>
      </el-card>
    </template>

    <SpecDetailView v-else @back="showDetail = false" />
  </div>
</template>

<script setup name="SpecAnalysis" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import SpecDetailView from './spec-detail.vue';

const pieChartRef = ref<HTMLDivElement>();
const barChartRef = ref<HTMLDivElement>();
const lineBarChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const barChartIns = ref<echarts.ECharts>();
const lineBarChartIns = ref<echarts.ECharts>();
const showDetail = ref(false);

const categoryTitle = '004洗化部（一级品类）';
const dateSummary = '数据日期:2024/10/01至2024/12/08 ｜ 对比日期:2023/10/01至2023/12/08 ｜ 组织: 华南大区 ｜ 业态: 标准店 ｜ 商圈: 社区店 ｜ 门店: 全部门店';

const metricCards = [
  { label: '规格总数', value: '128' },
  { label: '新销规格', value: '24' }
];

const pieData = [
  { name: '规格A', value: 386000, color: '#27b0d6' },
  { name: '规格B', value: 264000, color: '#f06b4f' },
  { name: '规格C', value: 188000, color: '#b69cff' },
  { name: '规格D', value: 126000, color: '#34c38f' },
  { name: '规格E', value: 96000, color: '#f59e0b' }
];

const rankRows = [
  { name: '规格A', value: 128600 },
  { name: '规格B', value: 116400 },
  { name: '规格C', value: 102800 },
  { name: '规格D', value: 96500 },
  { name: '规格E', value: 84200 }
];

const summaryItems = [
  {
    title: '优质规格保留',
    text: '销售额表现优异、客户购买意向高的优质规格建议持续保留并重点维护。'
  },
  {
    title: '弱势规格优化',
    text: '销售额偏弱、客户意向低迷的规格建议优化组合，必要时进行精简。'
  },
  {
    title: '增长规格经营',
    text: '销售额同比上涨、购买意愿提升的规格具备经营利好，可进一步强化资源投入。'
  },
  {
    title: '风险规格预警',
    text: '销售额同比下滑、购买意愿降低的规格需关注风险，并及时制定调整方案。'
  }
];

const initPieChart = () => {
  if (!pieChartRef.value) return;
  if (!pieChartIns.value) pieChartIns.value = echarts.init(pieChartRef.value);
};

const initBarChart = () => {
  if (!barChartRef.value) return;
  if (!barChartIns.value) barChartIns.value = echarts.init(barChartRef.value);
};

const initLineBarChart = () => {
  if (!lineBarChartRef.value) return;
  if (!lineBarChartIns.value) lineBarChartIns.value = echarts.init(lineBarChartRef.value);
};

const renderPieChart = () => {
  initPieChart();
  if (!pieChartIns.value) return;
  const option: EChartsOption = {
    color: pieData.map((item) => item.color),
    tooltip: {
      trigger: 'item',
      formatter: (params: any) =>
        `${params.name}<br/>销售额：${Number(params.value).toLocaleString('zh-CN')}<br/>销售占比：${Number(params.percent).toFixed(2)}%`
    },
    legend: {
      orient: 'vertical',
      right: 12,
      top: 'middle',
      icon: 'circle'
    },
    series: [
      {
        type: 'pie',
        radius: ['52%', '72%'],
        center: ['34%', '50%'],
        label: { show: false },
        labelLine: { show: false },
        data: pieData.map((item) => ({ name: item.name, value: item.value, itemStyle: { color: item.color } }))
      }
    ]
  };
  pieChartIns.value.setOption(option, true);
};

const renderBarChart = () => {
  initBarChart();
  if (!barChartIns.value) return;
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 56, right: 20, top: 20, bottom: 20 },
    xAxis: {
      type: 'value',
      name: '销售额',
      axisLabel: { color: '#606266' },
      splitLine: { lineStyle: { color: '#ebeef5' } }
    },
    yAxis: {
      type: 'category',
      data: rankRows.map((item) => item.name),
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: rankRows.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: index === 0 ? '#ef4444' : '#27b0d6',
            borderRadius: [0, 8, 8, 0]
          }
        })),
        barWidth: 18
      }
    ]
  };
  barChartIns.value.setOption(option, true);
};

const renderLineBarChart = () => {
  initLineBarChart();
  if (!lineBarChartIns.value) return;
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['SKU变动数', '销售额增长率'], top: 8 },
    grid: { left: 56, right: 56, top: 48, bottom: 28 },
    xAxis: {
      type: 'category',
      data: ['规格A', '规格B', '规格C', '规格D', '规格E'],
      axisTick: { alignWithLabel: true }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额增长率',
        axisLabel: { formatter: '{value}%' }
      },
      {
        type: 'value',
        name: 'SKU变动数量'
      }
    ],
    series: [
      {
        name: 'SKU变动数',
        type: 'bar',
        yAxisIndex: 1,
        data: [8, -3, 5, 2, -1],
        itemStyle: { color: '#f59e0b' }
      },
      {
        name: '销售额增长率',
        type: 'line',
        data: [12.4, 6.1, 8.8, 3.2, 1.9],
        itemStyle: { color: '#9ca3af' },
        lineStyle: { color: '#9ca3af' },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  };
  lineBarChartIns.value.setOption(option, true);
};

const renderCharts = () => {
  renderPieChart();
  renderBarChart();
  renderLineBarChart();
};

const resizeCharts = () => {
  pieChartIns.value?.resize();
  barChartIns.value?.resize();
  lineBarChartIns.value?.resize();
};

onMounted(async () => {
  await nextTick();
  renderCharts();
  window.addEventListener('resize', resizeCharts);
});

watch(showDetail, async (value) => {
  if (value) return;
  await nextTick();
  renderCharts();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  pieChartIns.value?.dispose();
  barChartIns.value?.dispose();
  lineBarChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.spec-analysis-page {
  background: #f5f7fa;
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.header-card {
  margin-bottom: 12px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.page-title-wrap {
  display: flex;
  align-items: center;
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
  color: #0f172a;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.category-title {
  font-size: 16px;
  color: #111827;
  font-weight: 600;
}

.summary-line {
  margin-top: 8px;
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
}

.page-header-right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
}

.hint-text {
  color: #64748b;
  font-size: 13px;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}

.unit-text {
  color: #64748b;
  font-size: 13px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.metric-card {
  min-height: 104px;
  border-radius: 12px;
  padding: 12px;
}

.metric-label {
  color: #64748b;
  font-size: 13px;
}

.metric-value {
  margin-top: 14px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.chart-row,
.summary-card {
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.chart-box {
  width: 100%;
  height: 360px;
}

.large-chart {
  height: 420px;
}

.summary-content {
  display: grid;
  gap: 12px;
}

.summary-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
}

.summary-item-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
}

.summary-item-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.7;
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
  }

  .page-header-right {
    align-items: flex-start;
  }

  .metric-row {
    grid-template-columns: 1fr;
  }
}
</style>
