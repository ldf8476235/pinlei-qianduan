<template>
  <div class="p-2 gross-goods-list-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-header">
        <div class="filter-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">004洗化部（一级品类）</span>
          </div>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button type="primary" link @click="handleExport">导出 Excel</el-button>
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
        <el-form-item label="本期四象限">
          <el-select v-model="queryForm.currentQuadrant" clearable style="width: 170px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="领跑商品" value="leading" />
            <el-option label="吸客商品" value="attracting" />
            <el-option label="利润商品" value="profit" />
            <el-option label="问题商品" value="problem" />
          </el-select>
        </el-form-item>
        <el-form-item label="对比日期四象限">
          <el-select v-model="queryForm.compareQuadrant" clearable style="width: 170px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="领跑商品" value="leading" />
            <el-option label="吸客商品" value="attracting" />
            <el-option label="利润商品" value="profit" />
            <el-option label="问题商品" value="problem" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">品类毛利贡献率商品清单</span>
        </div>
      </template>

      <el-table v-loading="tableLoading" :data="tableRows" border stripe class="goods-table" height="560">
        <el-table-column label="商品编码" prop="goodsCode" min-width="120" fixed="left" align="left" sortable show-overflow-tooltip />
        <el-table-column label="商品名称" prop="goodsName" min-width="220" fixed="left" align="left" sortable show-overflow-tooltip />
        <el-table-column label="当前状态" prop="statusLabel" min-width="100" align="left" sortable />
        <el-table-column label="销售门店数" min-width="110" align="right" sortable :sort-method="sortNumber('storeCount')">
          <template #header>
            <el-tooltip content="商品在本期有销售记录的门店数量" placement="top">
              <span>销售门店数</span>
            </el-tooltip>
          </template>
          <template #default="{ row }">{{ formatNumber(row.storeCount, 0) }}</template>
        </el-table-column>
        <el-table-column label="毛利贡献率角色(本期/对比日期)" min-width="210" align="left">
          <template #header>
            <el-tooltip content="展示商品本期与对比日期所处的毛利贡献率四象限角色" placement="top">
              <span>毛利贡献率角色(本期/对比日期)</span>
            </el-tooltip>
          </template>
          <template #default="{ row }">
            <div class="role-cell">
              <span :class="['role-text', `is-${row.currentQuadrant}`]">{{ row.currentQuadrantLabel }}</span>
              <span class="role-separator">/</span>
              <span :class="['role-text', `is-${row.compareQuadrant}`]">{{ row.compareQuadrantLabel }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="销售量(总计)" min-width="120" align="right" sortable :sort-method="sortNumber('saleQuantityTotal')">
          <template #default="{ row }">{{ formatNumber(row.saleQuantityTotal, 0) }}</template>
        </el-table-column>
        <el-table-column label="销售量(PSD)" min-width="120" align="right" sortable :sort-method="sortNumber('saleQuantityPsd')">
          <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd) }}</template>
        </el-table-column>
        <el-table-column label="销售额(总计)" min-width="130" align="right" sortable :sort-method="sortNumber('salesAmountTotal')">
          <template #default="{ row }">{{ formatNumber(row.salesAmountTotal) }}</template>
        </el-table-column>
        <el-table-column label="销售额(占比)" min-width="120" align="right" sortable :sort-method="sortNumber('salesAmountShare')">
          <template #default="{ row }">{{ formatPercent(row.salesAmountShare) }}</template>
        </el-table-column>
        <el-table-column label="销售额(PSD)" min-width="120" align="right" sortable :sort-method="sortNumber('salesAmountPsd')">
          <template #default="{ row }">{{ formatNumber(row.salesAmountPsd) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(总计)" min-width="130" align="right" sortable :sort-method="sortNumber('grossAmountTotal')">
          <template #default="{ row }">{{ formatNumber(row.grossAmountTotal) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(占比)" min-width="120" align="right" sortable :sort-method="sortNumber('grossAmountShare')">
          <template #default="{ row }">{{ formatPercent(row.grossAmountShare) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(PSD)" min-width="120" align="right" sortable :sort-method="sortNumber('grossAmountPsd')">
          <template #default="{ row }">{{ formatNumber(row.grossAmountPsd) }}</template>
        </el-table-column>
        <el-table-column label="毛利率" min-width="100" align="right" sortable :sort-method="sortNumber('grossRate')">
          <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
        </el-table-column>
        <el-table-column label="当前库存数量" min-width="120" align="right" sortable :sort-method="sortNumber('inventoryQty')">
          <template #default="{ row }">{{ formatNumber(row.inventoryQty, 0) }}</template>
        </el-table-column>

        <el-table-column label="数量" min-width="100" align="right" sortable :sort-method="sortNumber('quantity')">
          <template #default="{ row }">{{ formatNumber(row.quantity, 0) }}</template>
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
        <el-table-column label="首次销售日期" min-width="130" align="left" sortable show-overflow-tooltip prop="firstSaleDate" />
        <el-table-column label="本期新品" min-width="100" align="left">
          <template #default="{ row }">{{ row.newProductLabel || '-' }}</template>
        </el-table-column>
        <el-table-column label="重点商品" min-width="100" align="left">
          <template #default="{ row }">{{ row.keyProductLabel || '-' }}</template>
        </el-table-column>
        <el-table-column label="季节性商品" min-width="110" align="left">
          <template #default="{ row }">{{ row.seasonalLabel || '-' }}</template>
        </el-table-column>

        <el-table-column label="操作" min-width="100" fixed="right" align="center">
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
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup name="GrossContributionGoodsList" lang="ts">
interface GoodsRow {
  goodsCode: string;
  goodsName: string;
  status: string;
  statusLabel: string;
  currentQuadrant: string;
  currentQuadrantLabel: string;
  compareQuadrant: string;
  compareQuadrantLabel: string;
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
  quantity: number;
  turnoverRate: number;
  turnoverDays: number;
  inventorySalesRatio: number;
  grossContributionRate: number;
  gmroi: number;
  sellThroughRate: number;
  promotion: string;
  promotionLabel: string;
  firstSaleDate: string;
  newProduct: string;
  newProductLabel: string;
  keyProduct: string;
  keyProductLabel: string;
  seasonal: string;
  seasonalLabel: string;
}

interface QueryForm {
  status: string;
  promotion: string;
  currentQuadrant: string;
  compareQuadrant: string;
  pageNum: number;
  pageSize: number;
}

const initialQueryForm = (): QueryForm => ({
  status: '',
  promotion: '',
  currentQuadrant: '',
  compareQuadrant: '',
  pageNum: 1,
  pageSize: 10
});

const queryForm = reactive<QueryForm>(initialQueryForm());
const tableLoading = ref(false);
const total = ref(0);
const tableRows = ref<GoodsRow[]>([]);

const mockRows: GoodsRow[] = [
  {
    goodsCode: '690123450011',
    goodsName: '柔顺洗发露 750ml',
    status: 'normal',
    statusLabel: '正常',
    currentQuadrant: 'leading',
    currentQuadrantLabel: '领跑商品',
    compareQuadrant: 'leading',
    compareQuadrantLabel: '领跑商品',
    storeCount: 58,
    saleQuantityTotal: 1520,
    saleQuantityPsd: 8.12,
    salesAmountTotal: 86240,
    salesAmountShare: 14.2,
    salesAmountPsd: 460.11,
    grossAmountTotal: 32771,
    grossAmountShare: 16.85,
    grossAmountPsd: 174.98,
    grossRate: 38.0,
    inventoryQty: 420,
    quantity: 428,
    turnoverRate: 3.62,
    turnoverDays: 27.6,
    inventorySalesRatio: 0.88,
    grossContributionRate: 11.36,
    gmroi: 2.78,
    sellThroughRate: 82.4,
    promotion: 'Y',
    promotionLabel: '是',
    firstSaleDate: '2024-01-15',
    newProduct: 'N',
    newProductLabel: '否',
    keyProduct: 'Y',
    keyProductLabel: '是',
    seasonal: 'N',
    seasonalLabel: '否'
  },
  {
    goodsCode: '690123450022',
    goodsName: '抑菌洗手液 300ml',
    status: 'observe',
    statusLabel: '观察',
    currentQuadrant: 'attracting',
    currentQuadrantLabel: '吸客商品',
    compareQuadrant: 'leading',
    compareQuadrantLabel: '领跑商品',
    storeCount: 47,
    saleQuantityTotal: 1096,
    saleQuantityPsd: 5.84,
    salesAmountTotal: 64820,
    salesAmountShare: 11.8,
    salesAmountPsd: 345.56,
    grossAmountTotal: 11668,
    grossAmountShare: 6.00,
    grossAmountPsd: 62.18,
    grossRate: 18.0,
    inventoryQty: 510,
    quantity: 536,
    turnoverRate: 2.31,
    turnoverDays: 43.8,
    inventorySalesRatio: 1.24,
    grossContributionRate: 4.05,
    gmroi: 1.16,
    sellThroughRate: 67.2,
    promotion: 'N',
    promotionLabel: '否',
    firstSaleDate: '2023-10-08',
    newProduct: 'N',
    newProductLabel: '否',
    keyProduct: 'N',
    keyProductLabel: '否',
    seasonal: 'N',
    seasonalLabel: '否'
  },
  {
    goodsCode: '690123450033',
    goodsName: '香氛洗衣液 1kg',
    status: 'normal',
    statusLabel: '正常',
    currentQuadrant: 'profit',
    currentQuadrantLabel: '利润商品',
    compareQuadrant: 'profit',
    compareQuadrantLabel: '利润商品',
    storeCount: 36,
    saleQuantityTotal: 518,
    saleQuantityPsd: 2.76,
    salesAmountTotal: 35260,
    salesAmountShare: 6.2,
    salesAmountPsd: 187.71,
    grossAmountTotal: 11283,
    grossAmountShare: 5.80,
    grossAmountPsd: 60.07,
    grossRate: 32.0,
    inventoryQty: 280,
    quantity: 294,
    turnoverRate: 2.95,
    turnoverDays: 33.9,
    inventorySalesRatio: 0.96,
    grossContributionRate: 3.92,
    gmroi: 1.93,
    sellThroughRate: 74.8,
    promotion: 'Y',
    promotionLabel: '是',
    firstSaleDate: '2024-03-11',
    newProduct: 'Y',
    newProductLabel: '是',
    keyProduct: 'N',
    keyProductLabel: '否',
    seasonal: 'N',
    seasonalLabel: '否'
  },
  {
    goodsCode: '690123450044',
    goodsName: '家用清洁喷雾 600ml',
    status: 'optimize',
    statusLabel: '待优化',
    currentQuadrant: 'problem',
    currentQuadrantLabel: '问题商品',
    compareQuadrant: 'profit',
    compareQuadrantLabel: '利润商品',
    storeCount: 19,
    saleQuantityTotal: 166,
    saleQuantityPsd: 0.88,
    salesAmountTotal: 9360,
    salesAmountShare: 2.4,
    salesAmountPsd: 49.79,
    grossAmountTotal: 842,
    grossAmountShare: 0.43,
    grossAmountPsd: 4.48,
    grossRate: 9.0,
    inventoryQty: 680,
    quantity: 724,
    turnoverRate: 0.76,
    turnoverDays: 93.1,
    inventorySalesRatio: 2.74,
    grossContributionRate: 0.29,
    gmroi: 0.18,
    sellThroughRate: 31.4,
    promotion: 'N',
    promotionLabel: '否',
    firstSaleDate: '2022-08-09',
    newProduct: 'N',
    newProductLabel: '否',
    keyProduct: 'N',
    keyProductLabel: '否',
    seasonal: 'Y',
    seasonalLabel: '是'
  },
  {
    goodsCode: '690123450055',
    goodsName: '便携湿巾 8片装',
    status: 'normal',
    statusLabel: '正常',
    currentQuadrant: 'attracting',
    currentQuadrantLabel: '吸客商品',
    compareQuadrant: 'attracting',
    compareQuadrantLabel: '吸客商品',
    storeCount: 56,
    saleQuantityTotal: 1250,
    saleQuantityPsd: 6.98,
    salesAmountTotal: 31800,
    salesAmountShare: 3.7,
    salesAmountPsd: 177.65,
    grossAmountTotal: 11240,
    grossAmountShare: 5.77,
    grossAmountPsd: 62.79,
    grossRate: 35.35,
    inventoryQty: 860,
    quantity: 912,
    turnoverRate: 1.82,
    turnoverDays: 54.9,
    inventorySalesRatio: 1.37,
    grossContributionRate: 3.90,
    gmroi: 1.41,
    sellThroughRate: 58.5,
    promotion: 'Y',
    promotionLabel: '是',
    firstSaleDate: '2023-12-01',
    newProduct: 'N',
    newProductLabel: '否',
    keyProduct: 'Y',
    keyProductLabel: '是',
    seasonal: 'N',
    seasonalLabel: '否'
  },
  {
    goodsCode: '690123450066',
    goodsName: '天然香皂 120g',
    status: 'observe',
    statusLabel: '观察',
    currentQuadrant: 'profit',
    currentQuadrantLabel: '利润商品',
    compareQuadrant: 'problem',
    compareQuadrantLabel: '问题商品',
    storeCount: 28,
    saleQuantityTotal: 362,
    saleQuantityPsd: 1.93,
    salesAmountTotal: 18620,
    salesAmountShare: 2.9,
    salesAmountPsd: 99.23,
    grossAmountTotal: 7060,
    grossAmountShare: 3.62,
    grossAmountPsd: 37.61,
    grossRate: 37.92,
    inventoryQty: 340,
    quantity: 356,
    turnoverRate: 2.02,
    turnoverDays: 49.5,
    inventorySalesRatio: 1.12,
    grossContributionRate: 2.45,
    gmroi: 1.58,
    sellThroughRate: 61.7,
    promotion: 'N',
    promotionLabel: '否',
    firstSaleDate: '2024-02-28',
    newProduct: 'Y',
    newProductLabel: '是',
    keyProduct: 'N',
    keyProductLabel: '否',
    seasonal: 'N',
    seasonalLabel: '否'
  }
];

const getTableList = async () => {
  tableLoading.value = true;
  try {
    // TODO: replace with real backend request for gross contribution goods list.
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    const filtered = mockRows.filter((item) => {
      const matchStatus = !queryForm.status || item.status === queryForm.status;
      const matchPromotion = !queryForm.promotion || item.promotion === queryForm.promotion;
      const matchCurrent = !queryForm.currentQuadrant || item.currentQuadrant === queryForm.currentQuadrant;
      const matchCompare = !queryForm.compareQuadrant || item.compareQuadrant === queryForm.compareQuadrant;
      return matchStatus && matchPromotion && matchCurrent && matchCompare;
    });
    total.value = filtered.length;
    const start = (queryForm.pageNum - 1) * queryForm.pageSize;
    const end = start + queryForm.pageSize;
    tableRows.value = filtered.slice(start, end);
  } finally {
    tableLoading.value = false;
  }
};

const handleQuery = async () => {
  queryForm.pageNum = 1;
  await getTableList();
};

const handleReset = async () => {
  Object.assign(queryForm, initialQueryForm());
  await getTableList();
};

const handleExport = () => {
  // TODO: replace with RuoYi native download integration after backend API is ready.
  ElMessage.info('导出入口已预留，后续可直接接若依原生导出逻辑');
};

const handleProcess = (row: GoodsRow) => {
  ElMessage.info(`处理入口已预留：${row.goodsName}`);
};

const sortNumber = (field: keyof GoodsRow) => {
  return (a: GoodsRow, b: GoodsRow) => Number(a[field] || 0) - Number(b[field] || 0);
};

const formatNumber = (value: number | string | null | undefined, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
};

const formatPercent = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${num.toFixed(2)}%`;
};

onMounted(async () => {
  await getTableList();
});
</script>

<style scoped lang="scss">
.gross-goods-list-page {
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
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.filter-header-left {
  display: flex;
  align-items: center;
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
  color: var(--el-text-color-primary);
  line-height: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.filter-form {
  margin-top: 14px;
}

.goods-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.goods-table :deep(.cell) {
  font-size: 13px;
}

.goods-table :deep(.el-table__body td) {
  color: var(--el-text-color-regular);
}

.role-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.role-separator {
  color: var(--el-text-color-secondary);
}

.role-text {
  font-weight: 600;
}

.role-text.is-leading {
  color: #27b0d6;
}

.role-text.is-attracting {
  color: #f06b4f;
}

.role-text.is-profit {
  color: #b69cff;
}

.role-text.is-problem {
  color: #e53e3e;
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
