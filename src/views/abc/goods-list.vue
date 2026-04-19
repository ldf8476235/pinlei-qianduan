<template>
  <div class="p-2 abc-goods-list-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-header">
        <span class="page-title">品类ABC商品清单</span>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button type="primary" link @click="handleExport">导出</el-button>
        </div>
      </div>

      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="当前状态">
          <el-select v-model="queryForm.status" clearable style="width: 160px">
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="淘汰建议" value="retire" />
            <el-option label="观察中" value="observe" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期促销">
          <el-select v-model="queryForm.promotion" clearable style="width: 160px">
            <el-option label="全部" value="" />
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
        </el-form-item>
        <el-form-item label="ABC类型">
          <el-select v-model="queryForm.abcType" clearable style="width: 180px">
            <el-option label="销售额ABC" value="sales_abc" />
            <el-option label="毛利额ABC" value="gross_abc" />
            <el-option label="销售量ABC" value="quantity_abc" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期ABC">
          <el-select v-model="queryForm.currentAbc" clearable style="width: 140px">
            <el-option label="A类" value="A" />
            <el-option label="B类" value="B" />
            <el-option label="C类" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item label="对比日期ABC">
          <el-select v-model="queryForm.compareAbc" clearable style="width: 160px">
            <el-option label="A类" value="A" />
            <el-option label="B类" value="B" />
            <el-option label="C类" value="C" />
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
          <span class="card-title">品类ABC商品清单</span>
        </div>
      </template>

      <el-table :data="tableRows" border stripe class="goods-table">
        <el-table-column label="商品编码" min-width="120" fixed="left" align="left" prop="goodsCode" />
        <el-table-column label="商品名称" min-width="220" fixed="left" align="left" prop="goodsName" show-overflow-tooltip />
        <el-table-column label="当前状态" min-width="110" align="left" prop="statusLabel" />
        <el-table-column label="销售门店数" min-width="110" align="right">
          <template #default="{ row }">{{ formatNumber(row.storeCount, 0) }}</template>
        </el-table-column>
        <el-table-column label="销售额ABC类别(本期/对比日期)" min-width="190" align="center">
          <template #default="{ row }">{{ `${row.currentAbc}/${row.compareAbc}` }}</template>
        </el-table-column>
        <el-table-column label="销售量(总计)" min-width="110" align="right">
          <template #default="{ row }">{{ formatNumber(row.saleQuantityTotal, 0) }}</template>
        </el-table-column>
        <el-table-column label="销售量(PSD)" min-width="110" align="right">
          <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd) }}</template>
        </el-table-column>
        <el-table-column label="销售额(总计)" min-width="130" align="right">
          <template #default="{ row }">{{ formatNumber(row.salesAmountTotal) }}</template>
        </el-table-column>
        <el-table-column label="销售额(占比)" min-width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.salesAmountShare) }}</template>
        </el-table-column>
        <el-table-column label="销售额(PSD)" min-width="110" align="right">
          <template #default="{ row }">{{ formatNumber(row.salesAmountPsd) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(总计)" min-width="130" align="right">
          <template #default="{ row }">{{ formatNumber(row.grossAmountTotal) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(占比)" min-width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.grossAmountShare) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(PSD)" min-width="110" align="right">
          <template #default="{ row }">{{ formatNumber(row.grossAmountPsd) }}</template>
        </el-table-column>
        <el-table-column label="毛利率" min-width="100" align="right">
          <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
        </el-table-column>
        <el-table-column label="当前库存数量" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.inventoryQty, 0) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleProcess(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="AbcGoodsList" lang="ts">
interface GoodsRow {
  goodsCode: string;
  goodsName: string;
  status: string;
  statusLabel: string;
  promotion: string;
  abcType: string;
  currentAbc: string;
  compareAbc: string;
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
}

const initialQueryForm = () => ({
  status: '',
  promotion: '',
  abcType: 'sales_abc',
  currentAbc: '',
  compareAbc: ''
});

const queryForm = reactive(initialQueryForm());

const mockRows: GoodsRow[] = [
  {
    goodsCode: '6901234560012',
    goodsName: '清爽去屑洗发露 500ml',
    status: 'normal',
    statusLabel: '正常',
    promotion: 'Y',
    abcType: 'sales_abc',
    currentAbc: 'A',
    compareAbc: 'A',
    storeCount: 42,
    saleQuantityTotal: 862,
    saleQuantityPsd: 4.63,
    salesAmountTotal: 58620,
    salesAmountShare: 6.82,
    salesAmountPsd: 314.08,
    grossAmountTotal: 18260,
    grossAmountShare: 7.21,
    grossAmountPsd: 97.84,
    grossRate: 31.15,
    inventoryQty: 520
  },
  {
    goodsCode: '6901234560029',
    goodsName: '抑菌洗手液 300ml',
    status: 'observe',
    statusLabel: '观察中',
    promotion: 'N',
    abcType: 'sales_abc',
    currentAbc: 'B',
    compareAbc: 'A',
    storeCount: 38,
    saleQuantityTotal: 436,
    saleQuantityPsd: 2.61,
    salesAmountTotal: 28340,
    salesAmountShare: 3.30,
    salesAmountPsd: 169.70,
    grossAmountTotal: 9140,
    grossAmountShare: 3.61,
    grossAmountPsd: 54.73,
    grossRate: 32.25,
    inventoryQty: 410
  },
  {
    goodsCode: '6901234560036',
    goodsName: '家用清洁喷雾 600ml',
    status: 'retire',
    statusLabel: '淘汰建议',
    promotion: 'N',
    abcType: 'sales_abc',
    currentAbc: 'C',
    compareAbc: 'B',
    storeCount: 19,
    saleQuantityTotal: 108,
    saleQuantityPsd: 0.74,
    salesAmountTotal: 6620,
    salesAmountShare: 0.77,
    salesAmountPsd: 45.34,
    grossAmountTotal: 1780,
    grossAmountShare: 0.70,
    grossAmountPsd: 12.19,
    grossRate: 26.89,
    inventoryQty: 680
  },
  {
    goodsCode: '6901234560043',
    goodsName: '便携湿巾 8片装',
    status: 'normal',
    statusLabel: '正常',
    promotion: 'Y',
    abcType: 'sales_abc',
    currentAbc: 'B',
    compareAbc: 'B',
    storeCount: 56,
    saleQuantityTotal: 1250,
    saleQuantityPsd: 6.98,
    salesAmountTotal: 31800,
    salesAmountShare: 3.70,
    salesAmountPsd: 177.65,
    grossAmountTotal: 11240,
    grossAmountShare: 4.44,
    grossAmountPsd: 62.79,
    grossRate: 35.35,
    inventoryQty: 860
  }
];

const tableRows = ref<GoodsRow[]>([]);

const loadGoodsList = async () => {
  // TODO: replace with real backend request for ABC goods list.
  tableRows.value = mockRows.filter((item) => {
    const matchStatus = !queryForm.status || item.status === queryForm.status;
    const matchPromotion = !queryForm.promotion || item.promotion === queryForm.promotion;
    const matchType = !queryForm.abcType || item.abcType === queryForm.abcType;
    const matchCurrent = !queryForm.currentAbc || item.currentAbc === queryForm.currentAbc;
    const matchCompare = !queryForm.compareAbc || item.compareAbc === queryForm.compareAbc;
    return matchStatus && matchPromotion && matchType && matchCurrent && matchCompare;
  });
};

const handleQuery = async () => {
  await loadGoodsList();
};

const handleReset = async () => {
  Object.assign(queryForm, initialQueryForm());
  await loadGoodsList();
};

const handleExport = () => {
  // TODO: replace with RuoYi native download integration after backend API is ready.
  ElMessage.info('导出入口已预留，后续可直接接若依原生导出逻辑');
};

const handleProcess = (row: GoodsRow) => {
  ElMessage.info(`处理入口已预留：${row.goodsName}`);
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
  await loadGoodsList();
});
</script>

<style scoped lang="scss">
.abc-goods-list-page {
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

.page-title,
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
