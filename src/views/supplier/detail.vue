<template>
  <div class="p-2 supplier-detail-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-header">
        <div class="page-title-wrap">
          <span class="page-title-line" />
          <span class="page-title">供应商明细清单</span>
        </div>
        <div class="page-actions">
          <span class="unit-text">按后端排名接口展示</span>
        </div>
      </div>
      <el-form inline class="filter-form">
        <el-form-item label="指标类型">
          <el-select v-model="metric" style="width: 180px" @change="loadList">
            <el-option v-for="item in metricOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <el-table :data="rows" border stripe v-loading="loading">
        <el-table-column label="供应商编码" prop="productVendorNo" min-width="140" />
        <el-table-column label="供应商名称" prop="productVendorName" min-width="220" show-overflow-tooltip />
        <el-table-column label="指标值" min-width="140" align="right">
          <template #default="{ row }">
            {{ formatValue(row.data) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getVendorRanking } from '@/api/supplier';
import type { VendorRankingItemVO } from '@/api/supplier/types';

const metricOptions = [
  { label: '单品产出', value: '1' },
  { label: '毛利率', value: '2' },
  { label: 'SKU数', value: '3' },
  { label: '新品SKU数', value: '4' },
  { label: '异订单金额占比', value: '5' }
];

const route = useRoute();
const sessionId = computed(() => String(route.query.sessionId || ''));
const metric = ref(metricOptions[0].value);
const rows = ref<VendorRankingItemVO[]>([]);
const loading = ref(false);

const loadList = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const res = await getVendorRanking(sessionId.value, metric.value, 1, 50, 'desc');
    rows.value = res.data?.list || [];
  } finally {
    loading.value = false;
  }
};

const formatValue = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString('zh-CN', { maximumFractionDigits: 4 }) : '-';
};

onMounted(loadList);
</script>

<style scoped lang="scss">
.supplier-detail-page {
  min-height: calc(100vh - 84px);
  background: #f5f7fa;
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgb(15 23 42 / 4%);
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
  background: var(--el-color-primary);
  border-radius: 999px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
}

.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.filter-form {
  margin-top: 14px;
}
</style>
