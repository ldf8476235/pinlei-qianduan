<template>
  <div class="p-2 brand-detail-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="summary-line">数据日期:2024/10/01至2024/12/08 ｜ 对比日期:2023/10/01至2023/12/08</div>
      <div class="summary-line">组织: 华南大区 ｜ 业态: 标准店 ｜ 商圈: 社区店 ｜ 门店: 全部门店</div>

      <div class="filter-header">
        <div class="page-title-wrap">
          <span class="page-title-line" />
          <span class="page-title">004洗化部（一级品类）</span>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button type="primary" link @click="handleExport">导出 Excel</el-button>
        </div>
      </div>

      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="品牌类型">
          <el-select v-model="queryForm.brandType" clearable style="width: 160px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="国际品牌" value="international" />
            <el-option label="国产品牌" value="domestic" />
            <el-option label="自有品牌" value="private" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="queryForm.brandName" clearable style="width: 180px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option v-for="item in brandOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="新销品牌">
          <el-select v-model="queryForm.newSaleBrand" clearable style="width: 160px" @change="handleQuery">
            <el-option label="全部" value="" />
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">品类品牌清单</span>
        </div>
      </template>

      <el-table v-loading="tableLoading" :data="tableRows" border stripe class="brand-table" height="560">
        <el-table-column label="品牌编码" prop="brandCode" min-width="120" fixed="left" align="left" sortable show-overflow-tooltip />
        <el-table-column label="品牌名称" prop="brandName" min-width="140" fixed="left" align="left" sortable show-overflow-tooltip />
        <el-table-column label="品牌类型" prop="brandTypeLabel" min-width="120" align="left" sortable />
        <el-table-column label="新销品牌" min-width="100" align="left">
          <template #default="{ row }">{{ row.newSaleBrandLabel || '-' }}</template>
        </el-table-column>

        <el-table-column label="SKU数(总计)" min-width="120" align="right" sortable :sort-method="sortNumber('skuCountTotal')">
          <template #default="{ row }">{{ formatNumber(row.skuCountTotal, 0) }}</template>
        </el-table-column>
        <el-table-column label="SKU数(对比增长)" min-width="140" align="right" sortable :sort-method="sortNumber('skuCountGrowth')">
          <template #default="{ row }"><span :class="growthClass(row.skuCountGrowth)">{{ formatGrowth(row.skuCountGrowth) }}</span></template>
        </el-table-column>
        <el-table-column label="SKU数(占比)" min-width="120" align="right" sortable :sort-method="sortNumber('skuCountShare')">
          <template #default="{ row }">{{ formatPercent(row.skuCountShare) }}</template>
        </el-table-column>

        <el-table-column label="销售量(总计)" min-width="120" align="right" sortable :sort-method="sortNumber('saleQtyTotal')">
          <template #default="{ row }">{{ formatNumber(row.saleQtyTotal, 0) }}</template>
        </el-table-column>
        <el-table-column label="销售量(对比增长)" min-width="140" align="right" sortable :sort-method="sortNumber('saleQtyGrowth')">
          <template #default="{ row }"><span :class="growthClass(row.saleQtyGrowth)">{{ formatGrowth(row.saleQtyGrowth) }}</span></template>
        </el-table-column>
        <el-table-column label="销售量(占比)" min-width="120" align="right" sortable :sort-method="sortNumber('saleQtyShare')">
          <template #default="{ row }">{{ formatPercent(row.saleQtyShare) }}</template>
        </el-table-column>
        <el-table-column label="销售量(PSD)" min-width="120" align="right" sortable :sort-method="sortNumber('saleQtyPsd')">
          <template #default="{ row }">{{ formatNumber(row.saleQtyPsd) }}</template>
        </el-table-column>

        <el-table-column label="销售额(总计)" min-width="130" align="right" sortable :sort-method="sortNumber('salesAmountTotal')">
          <template #default="{ row }">{{ formatAmount(row.salesAmountTotal) }}</template>
        </el-table-column>
        <el-table-column label="销售额(对比增长)" min-width="140" align="right" sortable :sort-method="sortNumber('salesAmountGrowth')">
          <template #default="{ row }"><span :class="growthClass(row.salesAmountGrowth)">{{ formatGrowth(row.salesAmountGrowth) }}</span></template>
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
        <el-table-column label="毛利额(对比增长)" min-width="140" align="right" sortable :sort-method="sortNumber('grossAmountGrowth')">
          <template #default="{ row }"><span :class="growthClass(row.grossAmountGrowth)">{{ formatGrowth(row.grossAmountGrowth) }}</span></template>
        </el-table-column>
        <el-table-column label="毛利额(占比)" min-width="120" align="right" sortable :sort-method="sortNumber('grossAmountShare')">
          <template #default="{ row }">{{ formatPercent(row.grossAmountShare) }}</template>
        </el-table-column>
        <el-table-column label="毛利额(PSD)" min-width="120" align="right" sortable :sort-method="sortNumber('grossAmountPsd')">
          <template #default="{ row }">{{ formatAmount(row.grossAmountPsd) }}</template>
        </el-table-column>

        <el-table-column label="毛利率(总计)" min-width="120" align="right" sortable :sort-method="sortNumber('grossRateTotal')">
          <template #default="{ row }">{{ formatPercent(row.grossRateTotal) }}</template>
        </el-table-column>
        <el-table-column label="毛利率(对比增长)" min-width="140" align="right" sortable :sort-method="sortNumber('grossRateGrowth')">
          <template #default="{ row }"><span :class="growthClass(row.grossRateGrowth)">{{ formatGrowth(row.grossRateGrowth) }}</span></template>
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
        <el-table-column label="本期促销SKU" min-width="120" align="right" sortable :sort-method="sortNumber('promotionSkuCount')">
          <template #default="{ row }">{{ formatNumber(row.promotionSkuCount, 0) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="BrandDetail" lang="ts">
interface BrandDetailRow {
  brandCode: string;
  brandName: string;
  brandType: string;
  brandTypeLabel: string;
  newSaleBrand: string;
  newSaleBrandLabel: string;
  skuCountTotal: number;
  skuCountGrowth: number;
  skuCountShare: number;
  saleQtyTotal: number;
  saleQtyGrowth: number;
  saleQtyShare: number;
  saleQtyPsd: number;
  salesAmountTotal: number;
  salesAmountGrowth: number;
  salesAmountShare: number;
  salesAmountPsd: number;
  grossAmountTotal: number;
  grossAmountGrowth: number;
  grossAmountShare: number;
  grossAmountPsd: number;
  grossRateTotal: number;
  grossRateGrowth: number;
  inventoryQty: number;
  turnoverRate: number;
  turnoverDays: number;
  inventorySalesRatio: number;
  grossContributionRate: number;
  gmroi: number;
  sellThroughRate: number;
  promotionSkuCount: number;
}

interface QueryForm {
  brandType: string;
  brandName: string;
  newSaleBrand: string;
}

const queryForm = reactive<QueryForm>({
  brandType: '',
  brandName: '',
  newSaleBrand: ''
});

const brandOptions = ['清扬', '滴露', '蓝月亮', '舒肤佳', '威露士', '立白'];
const tableLoading = ref(false);
const tableRows = ref<BrandDetailRow[]>([]);

const mockRows: BrandDetailRow[] = [
  { brandCode: 'B001', brandName: '清扬', brandType: 'international', brandTypeLabel: '国际品牌', newSaleBrand: 'N', newSaleBrandLabel: '否', skuCountTotal: 18, skuCountGrowth: 8.5, skuCountShare: 12.6, saleQtyTotal: 6520, saleQtyGrowth: 16.8, saleQtyShare: 15.3, saleQtyPsd: 34.2, salesAmountTotal: 128600, salesAmountGrowth: 18.6, salesAmountShare: 14.8, salesAmountPsd: 674.2, grossAmountTotal: 46280, grossAmountGrowth: 17.2, grossAmountShare: 15.6, grossAmountPsd: 242.3, grossRateTotal: 35.99, grossRateGrowth: 2.1, inventoryQty: 860, turnoverRate: 3.8, turnoverDays: 28.6, inventorySalesRatio: 0.92, grossContributionRate: 14.2, gmroi: 3.46, sellThroughRate: 82.8, promotionSkuCount: 6 },
  { brandCode: 'B002', brandName: '滴露', brandType: 'international', brandTypeLabel: '国际品牌', newSaleBrand: 'Y', newSaleBrandLabel: '是', skuCountTotal: 14, skuCountGrowth: 6.2, skuCountShare: 9.8, saleQtyTotal: 5930, saleQtyGrowth: 12.5, saleQtyShare: 13.9, saleQtyPsd: 31.1, salesAmountTotal: 116400, salesAmountGrowth: 12.4, salesAmountShare: 13.4, salesAmountPsd: 611.4, grossAmountTotal: 41360, grossAmountGrowth: 10.8, grossAmountShare: 13.9, grossAmountPsd: 217.2, grossRateTotal: 35.53, grossRateGrowth: 1.4, inventoryQty: 740, turnoverRate: 3.3, turnoverDays: 31.5, inventorySalesRatio: 0.98, grossContributionRate: 12.9, gmroi: 3.08, sellThroughRate: 79.6, promotionSkuCount: 5 },
  { brandCode: 'B003', brandName: '蓝月亮', brandType: 'domestic', brandTypeLabel: '国产品牌', newSaleBrand: 'N', newSaleBrandLabel: '否', skuCountTotal: 16, skuCountGrowth: -2.3, skuCountShare: 11.2, saleQtyTotal: 5210, saleQtyGrowth: -3.6, saleQtyShare: 12.2, saleQtyPsd: 27.3, salesAmountTotal: 102800, salesAmountGrowth: -4.2, salesAmountShare: 11.8, salesAmountPsd: 540.1, grossAmountTotal: 36850, grossAmountGrowth: -3.1, grossAmountShare: 12.4, grossAmountPsd: 193.4, grossRateTotal: 35.85, grossRateGrowth: -0.6, inventoryQty: 690, turnoverRate: 2.8, turnoverDays: 36.2, inventorySalesRatio: 1.08, grossContributionRate: 11.7, gmroi: 2.74, sellThroughRate: 73.2, promotionSkuCount: 4 },
  { brandCode: 'B004', brandName: '舒肤佳', brandType: 'international', brandTypeLabel: '国际品牌', newSaleBrand: 'Y', newSaleBrandLabel: '是', skuCountTotal: 12, skuCountGrowth: 9.8, skuCountShare: 8.4, saleQtyTotal: 4880, saleQtyGrowth: 15.3, saleQtyShare: 11.4, saleQtyPsd: 25.6, salesAmountTotal: 96500, salesAmountGrowth: 16.8, salesAmountShare: 11.1, salesAmountPsd: 506.8, grossAmountTotal: 34120, grossAmountGrowth: 14.9, grossAmountShare: 11.5, grossAmountPsd: 179.1, grossRateTotal: 35.36, grossRateGrowth: 1.8, inventoryQty: 620, turnoverRate: 3.1, turnoverDays: 33.8, inventorySalesRatio: 1.01, grossContributionRate: 10.8, gmroi: 2.96, sellThroughRate: 77.4, promotionSkuCount: 4 },
  { brandCode: 'B005', brandName: '威露士', brandType: 'domestic', brandTypeLabel: '国产品牌', newSaleBrand: 'N', newSaleBrandLabel: '否', skuCountTotal: 10, skuCountGrowth: 4.6, skuCountShare: 7.0, saleQtyTotal: 4310, saleQtyGrowth: 8.9, saleQtyShare: 10.1, saleQtyPsd: 22.6, salesAmountTotal: 84200, salesAmountGrowth: 9.3, salesAmountShare: 9.7, salesAmountPsd: 442.1, grossAmountTotal: 30240, grossAmountGrowth: 8.2, grossAmountShare: 10.2, grossAmountPsd: 158.7, grossRateTotal: 35.91, grossRateGrowth: 0.9, inventoryQty: 560, turnoverRate: 2.9, turnoverDays: 35.2, inventorySalesRatio: 1.04, grossContributionRate: 9.6, gmroi: 2.63, sellThroughRate: 71.8, promotionSkuCount: 3 },
  { brandCode: 'B006', brandName: '立白', brandType: 'private', brandTypeLabel: '自有品牌', newSaleBrand: 'N', newSaleBrandLabel: '否', skuCountTotal: 9, skuCountGrowth: -1.8, skuCountShare: 6.3, saleQtyTotal: 3960, saleQtyGrowth: -2.4, saleQtyShare: 9.3, saleQtyPsd: 20.8, salesAmountTotal: 76500, salesAmountGrowth: -1.6, salesAmountShare: 8.8, salesAmountPsd: 401.6, grossAmountTotal: 28620, grossAmountGrowth: -1.1, grossAmountShare: 9.6, grossAmountPsd: 150.2, grossRateTotal: 37.41, grossRateGrowth: 0.3, inventoryQty: 510, turnoverRate: 2.6, turnoverDays: 39.1, inventorySalesRatio: 1.12, grossContributionRate: 8.9, gmroi: 2.48, sellThroughRate: 69.7, promotionSkuCount: 2 }
];

const loadDetailList = async () => {
  tableLoading.value = true;
  try {
    // TODO: replace with real backend request for brand detail list.
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    tableRows.value = mockRows.filter((item) => {
      const matchBrandType = !queryForm.brandType || item.brandType === queryForm.brandType;
      const matchBrandName = !queryForm.brandName || item.brandName === queryForm.brandName;
      const matchNewSale = !queryForm.newSaleBrand || item.newSaleBrand === queryForm.newSaleBrand;
      return matchBrandType && matchBrandName && matchNewSale;
    });
  } finally {
    tableLoading.value = false;
  }
};

const handleQuery = async () => {
  await loadDetailList();
};

const handleExport = () => {
  ElMessage.info('导出入口已预留，后续可接真实接口');
};

const sortNumber = (field: keyof BrandDetailRow) => (a: BrandDetailRow, b: BrandDetailRow) => Number(a[field] || 0) - Number(b[field] || 0);

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

const formatGrowth = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  const prefix = num > 0 ? '+' : '';
  return `${prefix}${num.toFixed(2)}%`;
};

const growthClass = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (num > 0) return 'is-up';
  if (num < 0) return 'is-down';
  return 'is-flat';
};

onMounted(async () => {
  await loadDetailList();
});
</script>

<style scoped lang="scss">
.brand-detail-page {
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

.summary-line {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.7;
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
  margin-top: 8px;
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

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.brand-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.brand-table :deep(.cell) {
  font-size: 13px;
}

.is-up {
  color: #16a34a;
  font-weight: 600;
}

.is-down {
  color: #dc2626;
  font-weight: 600;
}

.is-flat {
  color: #6b7280;
  font-weight: 600;
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
