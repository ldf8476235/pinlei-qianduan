<template>
  <div class="p-2 brand-detail-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="filter-header">
        <div class="page-title-wrap"><span class="page-title-line" /><span class="page-title">品牌明细</span></div>
        <div class="page-actions"><span class="unit-text">金额单位：元</span></div>
      </div>
      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="品牌类型"><el-input v-model="queryForm.brandType" clearable style="width: 140px" /></el-form-item>
        <el-form-item label="品牌"><el-input v-model="queryForm.brandName" clearable style="width: 160px" /></el-form-item>
        <el-form-item label="新品类"><el-input v-model="queryForm.newSaleBrand" clearable style="width: 140px" /></el-form-item>
        <el-form-item><el-button type="primary" @click="loadData">查询</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="hover" class="page-card table-card" v-loading="loading">
      <template #header
        ><div class="card-header"><span class="card-title">品牌明细列表</span></div></template
      >
      <el-table :data="tableRows" border stripe height="560">
        <el-table-column label="品牌" prop="productBrand" min-width="140" />
        <el-table-column label="类型" prop="brandTypeName" min-width="100" />
        <el-table-column label="新品类" prop="newBrandTypeName" min-width="100" />
        <el-table-column label="SKU" prop="sku" min-width="100" align="right" />
        <el-table-column label="销售额" prop="sales" min-width="120" align="right" />
        <el-table-column label="毛利额" prop="gross" min-width="120" align="right" />
        <el-table-column label="毛利率" prop="grossRate" min-width="100" align="right" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getBrandDetails } from '@/api/category/diagnosis/analysis';

const route = useRoute();
const sessionId = computed(() => String(route.query.sessionId || ''));
const loading = ref(false);
const tableRows = ref<any[]>([]);
const queryForm = reactive({ brandType: '', brandName: '', newSaleBrand: '' });

const loadData = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const res = await getBrandDetails({
      sessionId: sessionId.value,
      page: 1,
      size: 100,
      brandTypeList: queryForm.brandType ? [queryForm.brandType] : undefined,
      brandList: queryForm.brandName ? [queryForm.brandName] : undefined,
      newBrandType: queryForm.newSaleBrand || undefined
    });
    tableRows.value = res.data?.records || [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
watch(() => route.query.sessionId, loadData);
</script>
