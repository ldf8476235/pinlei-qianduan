<template>
  <div class="p-2 price-band-detail-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-header">
        <div class="page-title-wrap"><span class="page-title-line" /><span class="page-title">价格带明细</span></div>
        <div class="page-actions"><span class="unit-text">金额单位：元</span></div>
      </div>
      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="状态"><el-input v-model="queryForm.status" clearable style="width: 140px" /></el-form-item>
        <el-form-item label="促销"><el-input v-model="queryForm.promotion" clearable style="width: 120px" /></el-form-item>
        <el-form-item><el-button type="primary" @click="loadData">查询</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="hover" class="page-card table-card" v-loading="loading">
      <template #header
        ><div class="card-header"><span class="card-title">价格带商品列表</span></div></template
      >
      <el-table :data="tableRows" border stripe height="560">
        <el-table-column label="商品" prop="goodsName" min-width="220" />
        <el-table-column label="状态" prop="statusLabel" min-width="100" />
        <el-table-column label="销售额" prop="salesAmountTotal" min-width="120" align="right" />
        <el-table-column label="毛利额" prop="grossAmountTotal" min-width="120" align="right" />
        <el-table-column label="毛利率" prop="grossRate" min-width="100" align="right" />
        <el-table-column label="GMROI" prop="gmroi" min-width="100" align="right" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getPriceBandDetails } from '@/api/category/diagnosis/analysis';

const route = useRoute();
const sessionId = computed(() => String(route.query.sessionId || ''));
const loading = ref(false);
const tableRows = ref<any[]>([]);
const queryForm = reactive({ status: '', promotion: '' });

const loadData = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const res = await getPriceBandDetails({
      sessionId: sessionId.value,
      page: 1,
      size: 100,
      status: queryForm.status ? [queryForm.status] : undefined,
      promotion: queryForm.promotion || undefined
    });
    tableRows.value = res.data?.records || [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
watch(() => route.query.sessionId, loadData);
</script>
