<template>
  <div class="p-2 price-band-detail-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-header">
        <div class="page-title-wrap">
          <span class="page-title-line" />
          <span class="page-title">004洗化部（一级品类）</span>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button type="primary" link @click="handleExport">导出</el-button>
        </div>
      </div>

      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="当前状态">
          <el-select v-model="queryForm.status" clearable style="width: 160px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="观察" value="observe" />
            <el-option label="待优化" value="optimize" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期促销">
          <el-select v-model="queryForm.promotion" clearable style="width: 160px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="range-filter-row">
        <span class="range-filter-label">价格区间</span>
        <el-checkbox-group v-model="queryForm.priceRanges" @change="handleRangeChange">
          <el-checkbox v-for="item in priceRangeOptions" :key="item.value" :value="item.value">{{ item.label }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">价格带商品明细清单</span>
        </div>
      </template>

      <el-table v-loading="tableLoading" :data="tableRows" border stripe class="goods-table" height="560">
        <el-table-column label="商品编码" prop="goodsCode" min-width="120" fixed="left" align="left" sortable show-overflow-tooltip />
        <el-table-column label="商品名称" prop="goodsName" min-width="220" fixed="left" align="left" sortable show-overflow-tooltip />
        <el-table-column label="当前状态" prop="statusLabel" min-width="100" align="left" sortable />
        <el-table-column label="销售门店数" min-width="110" align="right" sortable :sort-method="sortNumber('storeCount')">
          <template #default="{ row }">{{ formatNumber(row.storeCount, 0) }}</template>
        </el-table-column>
        <el-table-column label="销售量(总计)" min-width="120" align="right" sortable :sort-method="sortNumber('saleQuantityTotal')">
          <template #default="{ row }">{{ formatNumber(row.saleQuantityTotal, 0) }}</template>
        </el-table-column>
        <el-table-column label="销售量(PSD)" min-width="120" align="right" sortable :sort-method="sortNumber('saleQuantityPsd')">
          <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd) }}</template>
        </el-table-column>
        <el-table-column label="销售额(总计)" min-width="130" align="right" sortable :sort-method="sortNumber('salesAmountTotal')">
          <template #default="{ row }">{{ formatAmount(row.salesAmountTotal) }}</template>
        </el-table-column>
        <el-table-column label="销售额(占比)" min-width="120" align="right" sortable :sort-method="sortNumber('salesAmountShare')">
          <template #default="{ row }">{{ formatPercent(row.salesAmountShare) }}</template>
        </el-table-column>
        <el-table-column label="销售额(PSD)" min-width="120" align="right" sortable :sort-method="sortNumber('salesAmountPsd')">
          <template #default="{ row }">{{ formatAmount(row.salesAmountPsd) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(总计)" min-width="130" align="right" sortable :sort-method="sortNumber('grossAmountTotal')">
          <template #default="{ row }">{{ formatAmount(row.grossAmountTotal) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(占比)" min-width="120" align="right" sortable :sort-method="sortNumber('grossAmountShare')">
          <template #default="{ row }">{{ formatPercent(row.grossAmountShare) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(PSD)" min-width="120" align="right" sortable :sort-method="sortNumber('grossAmountPsd')">
          <template #default="{ row }">{{ formatAmount(row.grossAmountPsd) }}</template>
        </el-table-column>
        <el-table-column label="毛利率" min-width="100" align="right" sortable :sort-method="sortNumber('grossRate')">
          <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
        </el-table-column>
        <el-table-column label="当前库存数量" min-width="120" align="right" sortable :sort-method="sortNumber('inventoryQty')">
          <template #default="{ row }">{{ formatNumber(row.inventoryQty, 0) }}</template>
        </el-table-column>
        <el-table-column label="库存周转率" min-width="120" align="right" sortable :sort-method="sortNumber('turnoverRate')">
          <template #default="{ row }">{{ formatNumber(row.turnoverRate) }}</template>
        </el-table-column>
        <el-table-column label="库存周转天数" min-width="130" align="right" sortable :sort-method="sortNumber('turnoverDays')">
          <template #default="{ row }">{{ formatNumber(row.turnoverDays) }}</template>
        </el-table-column>
        <el-table-column label="库销比" min-width="100" align="right" sortable :sort-method="sortNumber('inventorySalesRatio')">
          <template #default="{ row }">{{ formatNumber(row.inventorySalesRatio) }}</template>
        </el-table-column>
        <el-table-column label="毛利贡献率" min-width="120" align="right" sortable :sort-method="sortNumber('grossContributionRate')">
          <template #default="{ row }">{{ formatPercent(row.grossContributionRate) }}</template>
        </el-table-column>
        <el-table-column label="GMROI" min-width="100" align="right" sortable :sort-method="sortNumber('gmroi')">
          <template #default="{ row }">{{ formatNumber(row.gmroi) }}</template>
        </el-table-column>
        <el-table-column label="销售率" min-width="100" align="right" sortable :sort-method="sortNumber('sellThroughRate')">
          <template #default="{ row }">{{ formatPercent(row.sellThroughRate) }}</template>
        </el-table-column>
        <el-table-column label="本期促销" min-width="100" align="left">
          <template #default="{ row }">{{ row.promotionLabel || '-' }}</template>
        </el-table-column>
        <el-table-column label="首次销售日期" prop="firstSaleDate" min-width="130" align="left" sortable show-overflow-tooltip />
        <el-table-column label="本期新品" min-width="100" align="left">
          <template #default="{ row }">{{ row.newProductLabel || '-' }}</template>
        </el-table-column>
        <el-table-column label="重点商品" min-width="100" align="left">
          <template #default="{ row }">{{ row.keyProductLabel || '-' }}</template>
        </el-table-column>
        <el-table-column label="季节性商品" min-width="110" align="left">
          <template #default="{ row }">{{ row.seasonalLabel || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="92" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleProcess(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup name="PriceBandDetail" lang="ts">
interface GoodsRow {
  goodsCode: string;
  goodsName: string;
  status: string;
  statusLabel: string;
  priceRange: string;
  storeCount: number;
  saleQuantityTotal: number;
  saleQuantityPsd: number;
  salesAmountTotal: number;
  salesAmountShare: number;
  salesAmountPsd: number;
  grossAmountTotal: number;
  grossAmountShare: number;
  grossAmountPsd: number;
  grossRate: number;
  inventoryQty: number;
  turnoverRate: number;
  turnoverDays: number;
  inventorySalesRatio: number;
  grossContributionRate: number;
  gmroi: number;
  sellThroughRate: number;
  promotion: string;
  promotionLabel: string;
  firstSaleDate: string;
  newProductLabel: string;
  keyProductLabel: string;
  seasonalLabel: string;
}

interface QueryForm {
  status: string;
  promotion: string;
  priceRanges: string[];
  pageNum: number;
  pageSize: number;
}

const route = useRoute();
const allRangeValue = 'all';

const resolveRangeOptions = () => {
  const routeRanges = route.query.ranges as string | undefined;
  if (!routeRanges) {
    return ['0-9.9', '10-19.9', '20-29.9', '30-39.9', '40-59.9'];
  }
  try {
    const parsed = JSON.parse(routeRanges) as Array<{ start: number; end: number }>;
    return parsed.map((item) => `${Number(item.start).toFixed(1).replace(/\.0$/, '')}-${Number(item.end).toFixed(1).replace(/\.0$/, '')}`);
  } catch {
    return ['0-9.9', '10-19.9', '20-29.9', '30-39.9', '40-59.9'];
  }
};

const priceRangeOptions = [{ label: '全部', value: allRangeValue }, ...resolveRangeOptions().map((item) => ({ label: item, value: item }))];

const initialQueryForm = (): QueryForm => ({
  status: '',
  promotion: '',
  priceRanges: [allRangeValue],
  pageNum: 1,
  pageSize: 10
});

const queryForm = reactive<QueryForm>(initialQueryForm());
const tableLoading = ref(false);
const tableRows = ref<GoodsRow[]>([]);
const total = ref(0);

const mockRows: GoodsRow[] = [
  { goodsCode: '690323450011', goodsName: '柔顺洗发露 750ml', status: 'normal', statusLabel: '正常', priceRange: '10-19.9', storeCount: 58, saleQuantityTotal: 1520, saleQuantityPsd: 8.12, salesAmountTotal: 86240, salesAmountShare: 14.2, salesAmountPsd: 460.11, grossAmountTotal: 32771, grossAmountShare: 16.85, grossAmountPsd: 174.98, grossRate: 36, inventoryQty: 420, turnoverRate: 3.8, turnoverDays: 27.6, inventorySalesRatio: 0.88, grossContributionRate: 11.36, gmroi: 3.42, sellThroughRate: 82.4, promotion: 'Y', promotionLabel: '是', firstSaleDate: '2024-01-15', newProductLabel: '否', keyProductLabel: '是', seasonalLabel: '否' },
  { goodsCode: '690323450022', goodsName: '抑菌洗手液 300ml', status: 'observe', statusLabel: '观察', priceRange: '20-29.9', storeCount: 47, saleQuantityTotal: 1096, saleQuantityPsd: 5.84, salesAmountTotal: 64820, salesAmountShare: 11.8, salesAmountPsd: 345.56, grossAmountTotal: 18150, grossAmountShare: 9.33, grossAmountPsd: 96.81, grossRate: 28, inventoryQty: 510, turnoverRate: 1.4, turnoverDays: 43.8, inventorySalesRatio: 1.24, grossContributionRate: 6.29, gmroi: 1.86, sellThroughRate: 67.2, promotion: 'N', promotionLabel: '否', firstSaleDate: '2023-10-08', newProductLabel: '否', keyProductLabel: '否', seasonalLabel: '否' },
  { goodsCode: '690323450033', goodsName: '便携湿巾 8片装', status: 'normal', statusLabel: '正常', priceRange: '0-9.9', storeCount: 56, saleQuantityTotal: 1250, saleQuantityPsd: 6.98, salesAmountTotal: 31800, salesAmountShare: 3.7, salesAmountPsd: 177.65, grossAmountTotal: 4770, grossAmountShare: 2.45, grossAmountPsd: 26.65, grossRate: 15, inventoryQty: 860, turnoverRate: 3.2, turnoverDays: 54.9, inventorySalesRatio: 1.37, grossContributionRate: 1.65, gmroi: 1.27, sellThroughRate: 58.5, promotion: 'Y', promotionLabel: '是', firstSaleDate: '2023-12-01', newProductLabel: '否', keyProductLabel: '是', seasonalLabel: '否' },
  { goodsCode: '690323450044', goodsName: '家用清洁喷雾 600ml', status: 'optimize', statusLabel: '待优化', priceRange: '30-39.9', storeCount: 19, saleQuantityTotal: 166, saleQuantityPsd: 0.88, salesAmountTotal: 9360, salesAmountShare: 2.4, salesAmountPsd: 49.79, grossAmountTotal: 1030, grossAmountShare: 0.53, grossAmountPsd: 5.48, grossRate: 11, inventoryQty: 680, turnoverRate: 0.9, turnoverDays: 93.1, inventorySalesRatio: 2.74, grossContributionRate: 0.36, gmroi: 0.42, sellThroughRate: 31.4, promotion: 'N', promotionLabel: '否', firstSaleDate: '2022-08-09', newProductLabel: '否', keyProductLabel: '否', seasonalLabel: '是' },
  { goodsCode: '690323450055', goodsName: '香氛洗衣液 1kg', status: 'normal', statusLabel: '正常', priceRange: '40-59.9', storeCount: 36, saleQuantityTotal: 518, saleQuantityPsd: 2.76, salesAmountTotal: 35260, salesAmountShare: 6.2, salesAmountPsd: 187.71, grossAmountTotal: 11283, grossAmountShare: 5.8, grossAmountPsd: 60.07, grossRate: 32, inventoryQty: 280, turnoverRate: 2.95, turnoverDays: 33.9, inventorySalesRatio: 0.96, grossContributionRate: 3.92, gmroi: 2.41, sellThroughRate: 74.8, promotion: 'Y', promotionLabel: '是', firstSaleDate: '2024-03-11', newProductLabel: '是', keyProductLabel: '否', seasonalLabel: '否' }
];

const getPriceBandDetailList = async () => {
  tableLoading.value = true;
  try {
    // TODO: replace with real backend request for price band detail list.
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    const selectedRanges = queryForm.priceRanges.includes(allRangeValue) ? [] : queryForm.priceRanges;
    const filtered = mockRows.filter((item) => {
      const matchStatus = !queryForm.status || item.status === queryForm.status;
      const matchPromotion = !queryForm.promotion || item.promotion === queryForm.promotion;
      const matchRange = !selectedRanges.length || selectedRanges.includes(item.priceRange);
      return matchStatus && matchPromotion && matchRange;
    });
    total.value = filtered.length;
    const start = (queryForm.pageNum - 1) * queryForm.pageSize;
    tableRows.value = filtered.slice(start, start + queryForm.pageSize);
  } finally {
    tableLoading.value = false;
  }
};

const handleQuery = async () => {
  queryForm.pageNum = 1;
  await getPriceBandDetailList();
};

const handlePageChange = async () => {
  await getPriceBandDetailList();
};

const handleRangeChange = async (value: string[]) => {
  if (!value.length) {
    queryForm.priceRanges = [allRangeValue];
  } else if (value.includes(allRangeValue) && value.length > 1) {
    queryForm.priceRanges = [allRangeValue];
  } else if (!value.includes(allRangeValue) && value.length === priceRangeOptions.length - 1) {
    queryForm.priceRanges = [allRangeValue];
  }
  await handleQuery();
};

const handleExport = () => {
  ElMessage.info('导出入口已预留，后续可接真实接口');
};

const handleProcess = (row: GoodsRow) => {
  ElMessage.info(`处理入口已预留：${row.goodsName}`);
};

const sortNumber = (field: keyof GoodsRow) => (a: GoodsRow, b: GoodsRow) => Number(a[field] || 0) - Number(b[field] || 0);

const formatNumber = (value: number | string | null | undefined, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
};

const formatAmount = (value: number | string | null | undefined) => formatNumber(value);

const formatPercent = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${num.toFixed(2)}%`;
};

onMounted(async () => {
  await getPriceBandDetailList();
});
</script>

<style scoped lang="scss">
.price-band-detail-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.filter-card {
  margin-bottom: 12px;
}

.filter-header,
.page-title-wrap,
.page-actions,
.card-header {
  display: flex;
  align-items: center;
}

.filter-header,
.card-header {
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

.page-actions {
  gap: 12px;
}

.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.filter-form {
  margin-top: 14px;
}

.range-filter-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.range-filter-label {
  min-width: 70px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.goods-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

@media (max-width: 992px) {
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
