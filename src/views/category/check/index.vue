<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="search">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="门店" prop="storeCode">
            <el-select v-model="queryParams.storeCode" clearable filterable placeholder="请选择门店" style="width: 220px">
              <el-option v-for="item in storeOptions" :key="item.storeCode" :label="item.storeName" :value="item.storeCode" />
            </el-select>
          </el-form-item>
          <el-form-item label="核对日期" prop="checkDate">
            <el-date-picker v-model="queryParams.checkDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" />
          </el-form-item>
          <el-form-item label="关键字" prop="keyword">
            <el-input v-model="queryParams.keyword" clearable placeholder="品类名称/编号" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button v-hasPermi="['category:check:list']" type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="hover">
      <template #header>
        <el-row :gutter="10">
          <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="dataList">
        <el-table-column label="品类ID" prop="categoryId" align="center" width="120" />
        <el-table-column label="品类名称" prop="categoryName" align="center" min-width="160" show-overflow-tooltip />
        <el-table-column label="SKU总数" prop="skuCount" align="center" width="120" />
        <el-table-column label="已映射SKU" prop="mappedSkuCount" align="center" width="120" />
        <el-table-column label="缺失SKU" prop="missingSkuCount" align="center" width="120" />
        <el-table-column label="核对通过率" align="center" width="140">
          <template #default="scope"> {{ scope.row.checkRate }}% </template>
        </el-table-column>
        <el-table-column label="核对日期" prop="checkDate" align="center" width="160" />
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="CategoryCheck" lang="ts">
import { listCategoryCheck } from '@/api/category/check';
import { CategoryCheckQuery, CategoryCheckVO } from '@/api/category/check/types';
import { listStoreOptions } from '@/api/category/tree';
import { StoreOptionVO } from '@/api/category/tree/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const dataList = ref<CategoryCheckVO[]>([]);
const storeOptions = ref<StoreOptionVO[]>([]);

const queryFormRef = ref<ElFormInstance>();

const queryParams = reactive<CategoryCheckQuery>({
  pageNum: 1,
  pageSize: 10,
  storeCode: '',
  checkDate: '',
  keyword: ''
});

const getStoreList = async () => {
  const res = await listStoreOptions();
  storeOptions.value = res.data || [];
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listCategoryCheck(queryParams);
    dataList.value = res.rows || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = async () => {
  queryParams.pageNum = 1;
  await getList();
};

const resetQuery = async () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  await getList();
};

onMounted(async () => {
  await getStoreList();
  await getList();
});
</script>
