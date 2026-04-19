<template>
  <div class="p-2 supplier-detail-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-header">
        <div class="page-title-wrap">
          <span class="page-title-line" />
          <span class="page-title">供应商明细清单</span>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button type="primary" link @click="handleExport">导出</el-button>
        </div>
      </div>

      <el-form inline class="filter-form">
        <el-form-item label="供应商状态">
          <el-select v-model="queryForm.status" style="width: 160px" @change="loadDetailList">
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="待优化" value="optimize" />
          </el-select>
        </el-form-item>
        <el-form-item label="指标类型">
          <el-select v-model="queryForm.metric" style="width: 160px" @change="loadDetailList">
            <el-option label="单品产出" value="itemOutput" />
            <el-option label="销售额" value="saleAmount" />
            <el-option label="毛利率" value="grossRate" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <el-table :data="tableRows" border stripe>
        <el-table-column label="供应商编码" prop="supplierCode" min-width="120" />
        <el-table-column label="供应商名称" prop="supplierName" min-width="180" show-overflow-tooltip />
        <el-table-column label="SKU数" prop="skuCount" min-width="100" align="right" />
        <el-table-column label="销售额" prop="saleAmount" min-width="120" align="right" />
        <el-table-column label="毛利率" prop="grossRate" min-width="100" align="right" />
        <el-table-column label="单品产出" prop="itemOutput" min-width="120" align="right" />
        <el-table-column label="缺货率" prop="outOfStockRate" min-width="100" align="right" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="SupplierDetail" lang="ts">
interface SupplierDetailRow {
  supplierCode: string;
  supplierName: string;
  skuCount: number;
  saleAmount: string;
  grossRate: string;
  itemOutput: string;
  outOfStockRate: string;
}

const queryForm = reactive({
  status: '',
  metric: 'itemOutput'
});

const tableRows = ref<SupplierDetailRow[]>([]);

const loadDetailList = async () => {
  // TODO: replace with real backend request for supplier detail list.
  tableRows.value = [
    { supplierCode: 'V001', supplierName: '联合日化', skuCount: 36, saleAmount: '165,200', grossRate: '31.60%', itemOutput: '5,820', outOfStockRate: '1.80%' },
    { supplierCode: 'V002', supplierName: '华洁供应', skuCount: 28, saleAmount: '123,800', grossRate: '28.20%', itemOutput: '4,760', outOfStockRate: '2.50%' },
    { supplierCode: 'V003', supplierName: '家净商贸', skuCount: 24, saleAmount: '96,700', grossRate: '26.90%', itemOutput: '4,310', outOfStockRate: '3.10%' }
  ];
};

const handleExport = () => {
  ElMessage.info('导出入口已预留，后续可接真实接口');
};

onMounted(async () => {
  await loadDetailList();
});
</script>

<style scoped lang="scss">
.supplier-detail-page {
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
.page-actions {
  display: flex;
  align-items: center;
}

.filter-header {
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

@media (max-width: 992px) {
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
