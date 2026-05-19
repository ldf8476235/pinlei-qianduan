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
        <div class="price-chart-wrap" @mousemove="handlePriceTooltipMousemove" @mouseleave="hidePriceTooltip">
          <div ref="chartRef" class="chart-box large-chart" :class="{ 'is-muted': chartStateVisible }" />
          <div v-if="chartStateVisible" class="chart-state">
            <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" />
            <el-empty v-else-if="!loading" description="暂无价格带数据" :image-size="96" />
          </div>
          <div v-if="priceTooltip.visible" class="price-chart-tooltip" :style="{ left: `${priceTooltip.x}px`, top: `${priceTooltip.y}px` }">
            <div class="price-chart-tooltip-title">价格区间：{{ priceTooltip.label }}</div>
            <div v-for="item in priceTooltip.rows" :key="item.name" class="price-chart-tooltip-row">
              <span class="price-chart-tooltip-dot" :style="{ background: item.color }" />
              <span class="price-chart-tooltip-name">{{ item.name }}：</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>
        <aside class="chart-side-info" aria-label="价格带摘要">
          <div class="summary-card-block summary-card-band">
            <div class="summary-card-head">
              <div>
                <div class="summary-card-title">价格带</div>
                <div class="summary-card-code">PZ</div>
              </div>
            </div>
            <div class="band-chip-grid">
              <span class="band-range-chip">{{ priceBandRangeDisplay }}</span>
            </div>
          </div>
          <div class="summary-card-block">
            <div class="summary-card-head">
              <div>
                <div class="summary-card-title">价格线</div>
                <div class="summary-card-code">PL</div>
              </div>
            </div>
            <div class="summary-card-value">{{ priceLineNum }}</div>
            <div class="summary-card-desc">当前识别价格线数量</div>
          </div>
          <div class="summary-card-block">
            <div class="summary-card-head">
              <div>
                <div class="summary-card-title">价格点</div>
                <div class="summary-card-code">PP</div>
              </div>
            </div>
            <div class="point-chip-grid">
              <span v-for="item in pricePointPreview" :key="item" class="point-range-chip">{{ item }}</span>
            </div>
          </div>
        </aside>
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
const errorMessage = ref('');
const priceLineNum = ref('--');
const priceRangeText = ref('--');
const pricePointTexts = ref<string[]>([]);
const tableRows = ref<PriceBandTableRow[]>([]);
const summaryHighBands = ref<any[]>([]);
const summaryLowBands = ref<any[]>([]);
const rawPricePoints = ref<any[]>([]);
const priceTooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  label: '',
  rows: [] as Array<{ name: string; value: string; color: string }>
});

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

const hidePriceTooltip = () => {
  priceTooltip.visible = false;
};

const handlePriceTooltipMousemove = (event: MouseEvent) => {
  if (!chartRef.value || !sortedTableRows.value.length) return;
  const wrap = event.currentTarget as HTMLElement;
  const wrapRect = wrap.getBoundingClientRect();
  const chartRect = chartRef.value.getBoundingClientRect();
  const gridLeft = 150;
  const gridRight = 86;
  const gridTop = 72;
  const gridBottom = 46;
  const plotLeft = chartRect.left + gridLeft;
  const plotTop = chartRect.top + gridTop;
  const plotWidth = chartRect.width - gridLeft - gridRight;
  const plotHeight = chartRect.height - gridTop - gridBottom;
  const relativeX = event.clientX - plotLeft;
  const relativeY = event.clientY - plotTop;

  if (relativeX < 0 || relativeX > plotWidth || relativeY < 0 || relativeY > plotHeight || plotWidth <= 0) {
    hidePriceTooltip();
    return;
  }

  const rows = sortedTableRows.value;
  const bandWidth = plotWidth / Math.max(1, rows.length);
  const index = Math.max(0, Math.min(rows.length - 1, Math.round(relativeX / bandWidth)));
  const row = rows[index];
  if (!row) {
    hidePriceTooltip();
    return;
  }

  const tooltipWidth = 250;
  const tooltipHeight = 150;
  priceTooltip.visible = true;
  priceTooltip.label = row.label;
  priceTooltip.rows = [
    { name: 'SKU数', value: formatInteger(row.skuLineValue || row.sku), color: '#ff765f' },
    { name: '销售额', value: `${formatNumber(row.salesLineValue || row.sales, 2)}元`, color: '#1e88e5' },
    { name: '销售量', value: formatNumber(row.quantityLineValue || row.saleQuantity, 2), color: '#14b8a6' }
  ];
  priceTooltip.x = Math.min(Math.max(12, event.clientX - wrapRect.left + 16), Math.max(12, wrapRect.width - tooltipWidth - 12));
  priceTooltip.y = Math.min(Math.max(12, event.clientY - wrapRect.top - 76), Math.max(12, wrapRect.height - tooltipHeight - 12));
};

const sortNumber = (field: keyof PriceBandTableRow) => (a: PriceBandTableRow, b: PriceBandTableRow) => Number(a[field] || 0) - Number(b[field] || 0);
const sortText = (field: keyof PriceBandTableRow) => (a: PriceBandTableRow, b: PriceBandTableRow) => String(a[field] || '').localeCompare(String(b[field] || ''));

const sortedTableRows = computed(() => [...tableRows.value].sort((a, b) => a.sortValue - b.sortValue));
const priceBandRangeDisplay = computed(() => {
  const rows = sortedTableRows.value;
  const rowMaxValues = rows
    .map((item) => Number(item.raw?.priceBandMax ?? item.raw?.maxPrice))
    .filter((value) => Number.isFinite(value));
  const rangeSource = `${priceRangeText.value}/${rows.map((item) => item.label).join('/')}`;
  const parsedValues = rangeSource
    .match(/\d+(?:\.\d+)?/g)
    ?.map((item) => Number(item))
    .filter((value) => Number.isFinite(value)) || [];
  const max = Math.max(0, ...rowMaxValues, ...parsedValues);
  if (Number.isFinite(max) && max > 0) {
    return `0 - ${formatNumber(max, 2)}`;
  }
  return '--';
});

const pricePointPreview = computed(() => pricePointTexts.value.filter((item) => item && item !== '--').slice(0, 6));

const chartStateVisible = computed(() => Boolean(errorMessage.value || (!loading.value && !sortedTableRows.value.length)));

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

  const xAxisData = rows.map((item) => item.xLabel || item.label);
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
      color: ['#ff765f', '#1e88e5', '#14b8a6', '#ff765f', '#1e88e5'],
      tooltip: {
        show: false
      },
      axisPointer: {
        show: true,
        triggerOn: 'mousemove|click',
        type: 'cross',
        snap: true,
        link: [{ xAxisIndex: [0] }],
        lineStyle: { color: '#cbd5e1', width: 1, type: 'dashed' },
        crossStyle: { color: '#cbd5e1', width: 1, type: 'dashed' },
        label: {
          show: true,
          backgroundColor: '#64748b',
          color: '#fff',
          borderRadius: 3,
          padding: [4, 8]
        }
      },
      legend: {
        top: 12,
        left: 'center',
        itemWidth: 22,
        itemHeight: 12,
        icon: 'roundRect',
        textStyle: { color: '#3f3f46', fontSize: 14 },
        data: ['SKU数', '销售额', '销售量', '价格线SKU数', '价格线销售额']
      },
      grid: {
        left: 150,
        right: 86,
        top: 72,
        bottom: 46
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: '#c7c7c7' } },
        axisLabel: {
          color: '#4b5563',
          fontSize: 13,
          interval: 0,
          rotate: xAxisData.length > 14 ? 20 : 0,
          margin: 10,
          hideOverlap: true
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '销售额(元)',
          position: 'left',
          min: -maxSales,
          max: maxSales,
          nameTextStyle: { color: '#343434', fontSize: 13, align: 'center', padding: [0, 0, 10, 0] },
          axisLabel: { color: '#4b5563', fontSize: 13, formatter: (value: number) => formatNumber(value, 2) },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: '销售量',
          position: 'left',
          offset: 92,
          min: 0,
          max: maxQuantity,
          nameTextStyle: { color: '#343434', fontSize: 13, align: 'center', padding: [0, 0, 10, 0] },
          axisLabel: { color: '#4b5563', fontSize: 13, formatter: (value: number) => formatNumber(value, 2) },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        },
        {
          type: 'value',
          name: 'SKU数',
          position: 'right',
          min: 0,
          max: maxSku,
          nameTextStyle: { color: '#343434', fontSize: 13, align: 'center', padding: [0, 0, 10, 0] },
          axisLabel: { color: '#4b5563', fontSize: 13, formatter: (value: number) => formatInteger(value) },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '价格线SKU数',
          type: 'bar',
          yAxisIndex: 2,
          barWidth: 5,
          barGap: '30%',
          data: priceLineSkuData,
          itemStyle: { color: '#ff765f', borderRadius: [2, 2, 0, 0] },
          z: 2
        },
        {
          name: '价格线销售额',
          type: 'bar',
          yAxisIndex: 0,
          barWidth: 5,
          data: priceLineSalesData,
          itemStyle: { color: '#1e88e5', borderRadius: [2, 2, 0, 0] },
          z: 2
        },
        {
          name: 'SKU数',
          type: 'line',
          yAxisIndex: 2,
          smooth: true,
          symbol: 'emptyCircle',
          symbolSize: 8,
          lineStyle: { width: 3, color: '#ff765f' },
          itemStyle: { color: '#fff', borderColor: '#ff765f', borderWidth: 3 },
          data: skuLineData,
          z: 5
        },
        {
          name: '销售额',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          symbol: 'emptyCircle',
          symbolSize: 8,
          lineStyle: { width: 3, color: '#1e88e5' },
          itemStyle: { color: '#fff', borderColor: '#1e88e5', borderWidth: 3 },
          data: salesLineData,
          z: 5
        },
        {
          name: '销售量',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbol: 'emptyCircle',
          symbolSize: 8,
          lineStyle: { width: 3, color: '#14b8a6' },
          itemStyle: { color: '#fff', borderColor: '#14b8a6', borderWidth: 3 },
          data: quantityLineData,
          z: 5
        }
      ]
    } as EChartsOption,
    true
  );
};

const reload = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  errorMessage.value = '';
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
      const chartItem = (chartRowMap.get(`${item.priceBandMin ?? ''}_${item.priceBandMax ?? ''}`) || {}) as Record<string, any>;
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
  } catch (error) {
    errorMessage.value = '价格带数据加载失败，请稍后重试';
    tableRows.value = [];
    pricePointTexts.value = [];
    priceLineNum.value = '--';
    priceRangeText.value = '--';
    chartIns.value?.clear();
    console.error('[PriceBandAnalysis] reload failed', error);
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
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 22px;
  align-items: stretch;
}

.chart-box {
  width: 100%;
}

.price-chart-wrap {
  position: relative;
  min-width: 0;
}

.large-chart {
  height: 480px;
}

.large-chart.is-muted {
  opacity: 0.28;
}

.chart-state {
  position: absolute;
  inset: 72px 86px 46px 150px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.82);
  border-radius: 6px;
}

.price-chart-tooltip {
  position: absolute;
  z-index: 20;
  width: 250px;
  padding: 14px 16px;
  border: 1px solid #78b7ff;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 14px 30px rgb(15 23 42 / 16%);
  color: #64748b;
  font-size: 15px;
  line-height: 1.55;
  pointer-events: none;
  backdrop-filter: blur(6px);
}

.price-chart-tooltip-title {
  margin-bottom: 8px;
  color: #475569;
  font-weight: 700;
}

.price-chart-tooltip-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}

.price-chart-tooltip-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.price-chart-tooltip-name {
  color: #64748b;
}

.price-chart-tooltip-row strong {
  margin-left: auto;
  color: #64748b;
  font-weight: 700;
}

.chart-side-info {
  position: relative;
  align-self: stretch;
  margin: 4px 0 8px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  justify-content: flex-start;
}

.summary-card-block {
  position: relative;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  padding: 18px 22px;
  border: 1px solid #fed7aa;
  border-radius: 0;
  background:
    radial-gradient(circle at 92% 12%, rgba(249, 115, 22, 0.13), transparent 34%),
    linear-gradient(180deg, #fffaf5 0%, #fffefd 62%, #fff7ed 100%);
  box-shadow: none;
}

.summary-card-block:first-child {
  border-radius: 16px 16px 0 0;
}

.summary-card-block + .summary-card-block {
  margin-top: -1px;
}

.summary-card-block:last-child {
  border-radius: 0 0 16px 16px;
  box-shadow: 0 12px 28px rgba(249, 115, 22, 0.08);
}

.summary-card-band {
  max-height: 136px;
}

.summary-card-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.summary-card-title {
  color: #1f2937;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.summary-card-code {
  margin-top: 6px;
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.band-chip-grid,
.point-chip-grid {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.band-range-chip,
.point-range-chip {
  min-height: 36px;
  padding: 8px 14px;
  display: inline-flex;
  align-items: center;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.82);
  color: #9a3412;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.15;
}

.band-range-chip {
  width: 100%;
  justify-content: center;
  font-size: 18px;
}

.summary-card-value {
  position: relative;
  z-index: 1;
  color: #b45309;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.28;
  word-break: break-word;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.72);
}

.summary-card-desc {
  position: relative;
  z-index: 1;
  margin-top: 8px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 700;
}

.point-range-chip {
  color: #c2410c;
  border-radius: 999px;
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
    margin: 0;
    padding: 18px 0 0;
    border-left: 0;
    border-top: 1px solid #fed7aa;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
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
    height: 380px;
  }

  .chart-state {
    inset: 68px 16px 46px 16px;
  }

  .chart-side-info {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .summary-card-title {
    font-size: 16px;
  }

  .summary-card-value {
    font-size: 26px;
  }
}
</style>
