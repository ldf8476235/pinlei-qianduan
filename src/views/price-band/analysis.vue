<template>
  <div class="p-2 price-band-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="page-title-line" />
          <span class="page-title">价格带分析</span>
          <el-button link type="primary" class="detail-link" @click="handleViewDetail">详情 &gt;</el-button>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button type="primary" plain class="setting-btn" @click="handlePriceSetting">价格区间设置</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">价格带分布图</span>
        </div>
      </template>

      <div class="chart-panel">
        <div ref="chartRef" class="chart-box large-chart" />
        <div class="chart-side-info">
          <div class="info-block">
            <div class="info-label">价格带(PZ)</div>
            <div class="info-value">{{ priceRangeText }}</div>
          </div>
          <div class="info-block">
            <div class="info-label">价格线(PL)</div>
            <div class="info-value">{{ priceLineNum }}</div>
          </div>
          <div class="info-block">
            <div class="info-label">价格点(PP)</div>
            <div class="info-value info-points">
              <span v-for="item in pricePointTexts" :key="item" class="point-chip">{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card table-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">价格带明细</span>
        </div>
      </template>

      <el-table :data="sortedTableRows" border stripe class="price-table" header-cell-class-name="price-table-header">
        <el-table-column label="价格区间" prop="label" min-width="160" fixed="left" align="center" sortable :sort-method="sortText('label')">
          <template #default="{ row }">
            <span class="range-text">{{ row.label }}</span>
          </template>
        </el-table-column>

        <el-table-column label="本期" align="center">
          <el-table-column label="SKU" min-width="100" align="center" sortable :sort-method="sortNumber('sku')">
            <template #default="{ row }"><span class="key-number">{{ formatInteger(row.sku) }}</span></template>
          </el-table-column>
          <el-table-column label="占比" min-width="100" align="center" sortable :sort-method="sortNumber('skuPer')">
            <template #default="{ row }">{{ formatPercent(row.skuPer) }}</template>
          </el-table-column>
          <el-table-column label="销售量" min-width="110" align="center" sortable :sort-method="sortNumber('saleQuantity')">
            <template #default="{ row }">{{ formatInteger(row.saleQuantity) }}</template>
          </el-table-column>
          <el-table-column label="占比" min-width="100" align="center" sortable :sort-method="sortNumber('saleQuantityPer')">
            <template #default="{ row }">{{ formatPercent(row.saleQuantityPer) }}</template>
          </el-table-column>
          <el-table-column label="单品平均" min-width="110" align="center" sortable :sort-method="sortNumber('salePrice')">
            <template #default="{ row }">{{ formatNumber(row.salePrice) }}</template>
          </el-table-column>
          <el-table-column label="销售额" min-width="130" align="center" sortable :sort-method="sortNumber('sales')">
            <template #default="{ row }"><span class="key-number">{{ formatNumber(row.sales) }}</span></template>
          </el-table-column>
          <el-table-column label="占比" min-width="100" align="center" sortable :sort-method="sortNumber('salesPer')">
            <template #default="{ row }">{{ formatPercent(row.salesPer) }}</template>
          </el-table-column>
          <el-table-column label="促销SKU" min-width="110" align="center" sortable :sort-method="sortNumber('promotionSku')">
            <template #default="{ row }">{{ formatInteger(row.promotionSku) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="建议SKU" align="center">
          <el-table-column label="建议SKU" min-width="110" align="center" sortable :sort-method="sortNumber('suggestSku')">
            <template #default="{ row }">{{ formatInteger(row.suggestSku) }}</template>
          </el-table-column>
          <el-table-column label="占比" min-width="100" align="center" sortable :sort-method="sortNumber('suggestSkuPer')">
            <template #default="{ row }">{{ formatPercent(row.suggestSkuPer) }}</template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="hover" class="page-card summary-card">
      <template #header>
        <div class="card-header">
          <span class="summary-title">总结与建议</span>
        </div>
      </template>
      <div class="summary-box">
        <ul class="summary-list">
          <li v-for="line in summaryLines" :key="line">{{ line }}</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getPriceBandDiagram, getPriceBandRangeSummary } from '@/api/category/diagnosis/analysis';

interface PriceBandTableRow {
  label: string;
  sortValue: number;
  raw: any;
  sku: number;
  skuPer: number | string;
  saleQuantity: number;
  saleQuantityPer: number | string;
  salePrice: number;
  sales: number;
  salesPer: number | string;
  promotionSku: number;
  suggestSku: number;
  suggestSkuPer: number | string;
  xLabel: string;
  skuLineValue: number;
  salesLineValue: number;
  quantityLineValue: number;
  priceLineSkuValue: number;
  priceLineSalesValue: number;
}

const route = useRoute();
const router = useRouter();
const chartRef = ref<HTMLDivElement>();
const chartIns = ref<echarts.ECharts>();
const loading = ref(false);
const priceLineNum = ref('--');
const priceRangeText = ref('--');
const pricePointTexts = ref<string[]>([]);
const tableRows = ref<PriceBandTableRow[]>([]);
const summaryHighBands = ref<any[]>([]);
const summaryLowBands = ref<any[]>([]);
const rawPricePoints = ref<any[]>([]);

const sessionId = computed(() => String(route.query.sessionId || ''));

const numericFields = {
  sku: ['sku', 'skuNum', 'currentSku', 'skuCount'],
  skuPer: ['skuPer', 'skuRatio', 'skuShare', 'skuPercent'],
  saleQuantity: ['saleQuantity', 'salesQuantity', 'quantity', 'salesVolume'],
  saleQuantityPer: ['saleQuantityPer', 'saleQuantityRatio', 'salesQuantityPer', 'quantityPer'],
  salePrice: ['salePrice', 'avgPrice', 'unitPrice', 'itemAvgPrice'],
  sales: ['sales', 'salesAmount', 'saleAmount', 'amount'],
  salesPer: ['salesPer', 'salesRatio', 'salesShare', 'amountPer'],
  promotionSku: ['promotionSku', 'promotionSkuCount', 'promotionCount', 'promoSku'],
  suggestSku: ['suggestSku', 'adviceSku', 'recommendedSku', 'proposalSku'],
  suggestSkuPer: ['suggestSkuPer', 'adviceSkuPer', 'recommendedSkuPer', 'proposalSkuPer'],
  priceLineSkuValue: ['priceLineSku', 'priceLineSkuCount', 'lineSku', 'plSku'],
  priceLineSalesValue: ['priceLineSales', 'priceLineSalesAmount', 'lineSales', 'plSales']
} as const;

const readNumber = (source: any, keys: readonly string[]) => {
  for (const key of keys) {
    const value = source?.[key];
    const num = Number(value);
    if (value !== undefined && value !== null && value !== '' && Number.isFinite(num)) {
      return num;
    }
  }
  return 0;
};

const readText = (source: any, keys: string[]) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return '';
};

const formatNumber = (value: unknown, digits = 0) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
};

const formatInteger = (value: unknown) => formatNumber(value, 0);

const formatPercent = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return `${num.toFixed(2)}%`;
};

const sortNumber = (field: keyof PriceBandTableRow) => (a: PriceBandTableRow, b: PriceBandTableRow) => Number(a[field] || 0) - Number(b[field] || 0);
const sortText = (field: keyof PriceBandTableRow) => (a: PriceBandTableRow, b: PriceBandTableRow) => String(a[field] || '').localeCompare(String(b[field] || ''));

const sortedTableRows = computed(() => [...tableRows.value].sort((a, b) => a.sortValue - b.sortValue));

const formatBandLabel = (item: any) => {
  const min = Number(item?.priceBandMin ?? 0);
  const max = Number(item?.priceBandMax ?? 0);
  const minText = Number.isFinite(min) ? min.toFixed(2) : '--';
  const maxText = Number.isFinite(max) ? max.toFixed(2) : '--';
  return `${minText}-${maxText}`;
};

const formatPointValue = (item: any) => {
  const num = Number(item?.salePrice ?? item?.pricePoint ?? item?.minSalePrice ?? item);
  return Number.isFinite(num) ? num.toFixed(2) : '--';
};

const summaryLines = computed(() => {
  const topPoints = [...rawPricePoints.value]
    .sort((a, b) => Number(b?.totalSales ?? b?.sales ?? 0) - Number(a?.totalSales ?? a?.sales ?? 0))
    .slice(0, 3)
    .map((item) => formatPointValue(item))
    .filter((item) => item !== '--');
  const highBands = summaryHighBands.value.map((item) => formatBandLabel(item));
  const lowBands = summaryLowBands.value.map((item) => formatBandLabel(item));
  const pointText = topPoints.length ? topPoints.join('、') : '29.90、9.90、49.90';
  const highBandText = highBands.length ? highBands.join('、') : '9.90-24.81';
  const lowBandText = lowBands.length ? lowBands.join('、') : '69.54-84.45、114.27-129.18、159.00-168.00';

  return [
    `当前价格带存在${topPoints.length || 3}个价格点“${pointText}”，用户更愿意购买该售价商品。若价格点符合企业预期，建议在价格点附近多配置商品、陈列更丰满一些，以吸引消费者。此外，价格点“${pointText}”所在价格区间销售表现及稳定，建议调整其区间价格商品。`,
    `客户购买“${highBandText}”区间的商品意愿较高，但此区间配置SKU数较少，可参考区间“建议SKU数”以增加商品配置。`,
    `客户购买“${lowBandText}”区间的商品意愿较低，但此区间配置SKU数较多，可参考区间“建议SKU数”减少区间商品配置或更换SKU。`,
    '系统已根据品类总SKU和各价格区间下单品平均销售量“给出区间-建议SKU数”，可参考进行商品配置。'
  ];
});

const renderChart = (rows: PriceBandTableRow[]) => {
  if (!chartRef.value) return;
  chartIns.value ||= echarts.init(chartRef.value);

  const xAxisData = rows.map((item) => item.xLabel);
  const skuLineData = rows.map((item) => item.skuLineValue);
  const salesLineData = rows.map((item) => item.salesLineValue);
  const quantityLineData = rows.map((item) => item.quantityLineValue);
  const priceLineSkuData = rows.map((item) => item.priceLineSkuValue);
  const priceLineSalesData = rows.map((item) => item.priceLineSalesValue);
  const maxSales = Math.max(1, ...salesLineData.map((item) => Math.abs(Number(item || 0))), ...priceLineSalesData.map((item) => Math.abs(Number(item || 0))));
  const maxQuantity = Math.max(1, ...quantityLineData.map((item) => Math.abs(Number(item || 0))));
  const maxSku = Math.max(1, ...skuLineData.map((item) => Math.abs(Number(item || 0))), ...priceLineSkuData.map((item) => Math.abs(Number(item || 0))));

  chartIns.value.setOption(
    {
      color: ['#f59e0b', '#2563eb', '#14b8a6', '#ef4444', '#3b82f6'],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        top: 8,
        itemWidth: 12,
        itemHeight: 10,
        data: ['SKU数', '销售额', '销售量', '价格线SKU数', '价格线销售额']
      },
      grid: {
        left: 70,
        right: 140,
        top: 54,
        bottom: 48
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: '#d1d5db' } },
        axisLabel: { color: '#64748b', rotate: xAxisData.length > 8 ? 30 : 0 }
      },
      yAxis: [
        {
          type: 'value',
          name: '销售额(元)',
          position: 'left',
          min: -maxSales,
          max: maxSales,
          axisLabel: { color: '#64748b', formatter: (value: number) => formatInteger(value) },
          splitLine: { lineStyle: { color: '#eef2f7' } }
        },
        {
          type: 'value',
          name: '销售量',
          position: 'right',
          offset: 0,
          min: -maxQuantity,
          max: maxQuantity,
          axisLabel: { color: '#64748b', formatter: (value: number) => formatInteger(value) },
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: 'SKU数',
          position: 'right',
          offset: 62,
          min: 0,
          max: maxSku,
          axisLabel: { color: '#64748b', formatter: (value: number) => formatInteger(value) },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '价格线SKU数',
          type: 'bar',
          yAxisIndex: 2,
          barWidth: 10,
          data: priceLineSkuData,
          itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: '价格线销售额',
          type: 'bar',
          yAxisIndex: 0,
          barWidth: 10,
          barGap: '40%',
          data: priceLineSalesData,
          itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: 'SKU数',
          type: 'line',
          yAxisIndex: 2,
          smooth: true,
          symbol: 'emptyCircle',
          symbolSize: 8,
          lineStyle: { width: 2, color: '#f59e0b' },
          itemStyle: { color: '#f59e0b', borderColor: '#f59e0b', borderWidth: 2 },
          data: skuLineData
        },
        {
          name: '销售额',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { width: 3, color: '#2563eb' },
          itemStyle: { color: '#2563eb' },
          data: salesLineData
        },
        {
          name: '销售量',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { width: 3, color: '#14b8a6' },
          itemStyle: { color: '#14b8a6' },
          data: quantityLineData
        }
      ]
    } as EChartsOption,
    true
  );
};

const reload = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const [diagramRes, summaryRes] = await Promise.all([getPriceBandDiagram(sessionId.value), getPriceBandRangeSummary(sessionId.value)]);
    const diagram: any = diagramRes.data || {};
    const summary: any = summaryRes.data || {};
    const chartRows = Array.isArray(diagram.rangePerformanceList) ? diagram.rangePerformanceList : [];
    const summaryRows = Array.isArray(summary.list) ? summary.list : [];
    rawPricePoints.value = Array.isArray(diagram.pricePointList) ? diagram.pricePointList : [];
    summaryHighBands.value = Array.isArray(summary.summaryTwo) ? summary.summaryTwo : [];
    summaryLowBands.value = Array.isArray(summary.summaryThree) ? summary.summaryThree : [];
    const chartRowMap = new Map(
      chartRows.map((item: any) => [
        `${item.priceBandMin ?? ''}_${item.priceBandMax ?? ''}`,
        item
      ])
    );

    tableRows.value = summaryRows.map((item: any, index: number) => {
      const priceBandMin = Number(item.priceBandMin ?? item.minPrice ?? 0);
      const priceBandMax = Number(item.priceBandMax ?? item.maxPrice ?? 0);
      const chartItem = chartRowMap.get(`${item.priceBandMin ?? ''}_${item.priceBandMax ?? ''}`) || {};
      return {
        label: item.priceBand ?? `${item.priceBandMin ?? '--'} - ${item.priceBandMax ?? '--'}`,
        sortValue: Number.isFinite(priceBandMin) ? priceBandMin : index,
        raw: item,
        sku: readNumber(item, numericFields.sku),
        skuPer: readNumber(item, numericFields.skuPer),
        saleQuantity: readNumber(item, numericFields.saleQuantity),
        saleQuantityPer: readNumber(item, numericFields.saleQuantityPer),
        salePrice: readNumber(item, numericFields.salePrice),
        sales: readNumber(item, numericFields.sales),
        salesPer: readNumber(item, numericFields.salesPer),
        promotionSku: readNumber(item, numericFields.promotionSku),
        suggestSku: readNumber(item, numericFields.suggestSku),
        suggestSkuPer: readNumber(item, numericFields.suggestSkuPer),
        xLabel: String(chartItem.pricePoint ?? item.priceBand ?? item.priceBandMin ?? item.priceBandMax ?? index + 1),
        skuLineValue: readNumber(chartItem, numericFields.sku) || readNumber(item, numericFields.sku),
        salesLineValue: readNumber(chartItem, numericFields.sales) || readNumber(item, numericFields.sales),
        quantityLineValue: readNumber(chartItem, numericFields.saleQuantity) || readNumber(item, numericFields.saleQuantity),
        priceLineSkuValue: readNumber(chartItem, numericFields.priceLineSkuValue),
        priceLineSalesValue: readNumber(chartItem, numericFields.priceLineSalesValue)
      } satisfies PriceBandTableRow;
    });

    priceLineNum.value = String(diagram.priceLineNum ?? 0);
    priceRangeText.value = readText(diagram, ['priceRangeText']) || `${diagram.priceBandMin ?? '--'} - ${diagram.priceBandMax ?? '--'}`;
    pricePointTexts.value = Array.isArray(diagram.pricePointList)
      ? diagram.pricePointList.map((item: any) => String(item.pricePoint ?? item.pointPrice ?? item.priceBandMin ?? item.priceBandMax ?? '--'))
      : [];

    if (!priceRangeText.value || priceRangeText.value === '-- - --') {
      priceRangeText.value =
        (summary.list || []).map((item: any) => `${item.priceBandMin ?? '--'}-${item.priceBandMax ?? '--'}`).join(' / ') ||
        `${chartRows[0]?.priceBandMin ?? '--'} - ${chartRows[chartRows.length - 1]?.priceBandMax ?? '--'}`;
    }

    if (!pricePointTexts.value.length) {
      pricePointTexts.value = chartRows.map((item: any) => String(item.pricePoint ?? item.priceBandMin ?? '--'));
    }

    renderChart(sortedTableRows.value);
  } finally {
    loading.value = false;
  }
};

const handleViewDetail = () => {
  router.push({ path: '/price-band/analysis/detail', query: { ...route.query } });
};

const handlePriceSetting = () => {
  ElMessage.info('价格区间设置功能待接入');
};

const resizeChart = () => chartIns.value?.resize();

onMounted(reload);
watch(() => route.query.sessionId, reload);
onBeforeUnmount(() => chartIns.value?.dispose());
onMounted(() => {
  window.addEventListener('resize', resizeChart);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
});
</script>

<style scoped lang="scss">
.price-band-analysis-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.header-card,
.chart-card,
.table-card,
.summary-card {
  margin-bottom: 12px;
}

.page-header,
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
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

.detail-link {
  padding-left: 0;
  font-size: 14px;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.unit-text {
  color: #64748b;
  font-size: 13px;
}

.setting-btn {
  border-radius: 999px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.summary-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.chart-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  gap: 12px;
}

.chart-box {
  width: 100%;
}

.large-chart {
  height: 440px;
}

.chart-side-info {
  border-left: 1px solid #e5e7eb;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
}

.info-block {
  padding: 14px 14px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.info-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.7;
  word-break: break-word;
}

.info-points {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.point-chip {
  padding: 4px 8px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
}

.range-text,
.key-number {
  color: #0f766e;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 600;
}

.price-table :deep(.el-table__header th),
.price-table :deep(.price-table-header) {
  background: #f2f7fb;
  color: #334155;
  font-weight: 700;
  text-align: center;
}

.price-table :deep(.cell) {
  text-align: center;
  font-size: 13px;
}

.price-table :deep(.el-table__body td) {
  color: #334155;
}

.summary-box {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 18px 20px;
}

.summary-list {
  margin: 0;
  padding-left: 20px;
  color: #111827;
  line-height: 1.9;
}

.summary-list li + li {
  margin-top: 8px;
}

@media (max-width: 1200px) {
  .chart-panel {
    grid-template-columns: 1fr;
  }

  .chart-side-info {
    border-left: 0;
    border-top: 1px solid #e5e7eb;
    padding-left: 0;
    padding-top: 12px;
  }
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-actions {
    width: 100%;
    justify-content: space-between;
  }

  .large-chart {
    height: 360px;
  }
}
</style>
