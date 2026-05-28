<template>
  <div class="p-2 full-class-detail-page">
    <el-card shadow="hover" class="summary-card">
      <div class="summary-lines">
        <div>
          数据日期：{{ query.currentStartDate || '-' }} 至 {{ query.currentEndDate || '-' }}； 对比日期：{{ query.compareStartDate || '-' }} 至
          {{ query.compareEndDate || '-' }}
        </div>
        <div>组织：总部；业态：全部业态；商圈：全部商圈；</div>
        <div>门店：{{ storeLabel }}</div>
      </div>
    </el-card>

    <el-card shadow="never" class="filter-card">
      <el-form :model="filterForm" inline label-width="92px" class="filter-form">
        <el-form-item label="品类角色">
          <el-select v-model="filterForm.roleBase" class="role-base-select" placeholder="请选择">
            <el-option label="本期值" value="current" />
            <el-option label="设定值" value="preset" />
          </el-select>
          <el-select v-model="filterForm.classRole" multiple collapse-tags collapse-tags-tooltip clearable class="role-select" placeholder="全部">
            <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色一致">
          <el-select v-model="filterForm.roleConsistent" class="filter-select" placeholder="请选择">
            <el-option label="全部" value="all" />
            <el-option label="一致" value="consistent" />
            <el-option label="不一致" value="inconsistent" />
            <el-option label="未设定" value="unset" />
          </el-select>
        </el-form-item>
        <el-form-item label="SKU占比合理">
          <el-select v-model="filterForm.skuRatioStatus" class="filter-select" placeholder="请选择">
            <el-option label="全部" value="all" />
            <el-option label="合理" value="reasonable" />
            <el-option label="不合理" value="unreasonable" />
          </el-select>
        </el-form-item>
        <el-form-item label="SKU数一致">
          <el-select v-model="filterForm.skuCountStatus" class="filter-select" placeholder="请选择">
            <el-option label="全部" value="all" />
            <el-option label="一致" value="consistent" />
            <el-option label="不一致" value="inconsistent" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">全类检测明细</span>
          <div class="table-actions">
            <span class="unit-text">*金额单位：元</span>
            <el-button type="primary" link @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <el-alert v-if="errorText" class="mb-[12px]" :title="errorText" type="error" show-icon :closable="false" />

      <el-table v-loading="loading" :data="pagedRows" border stripe height="620" class="detail-table" empty-text="暂无全类检测明细数据">
        <el-table-column label="品类" min-width="150" fixed="left">
          <template #default="{ row }">
            <div class="class-cell">
              <span class="class-code">{{ row.classNo || '-' }}</span>
              <span class="class-name">{{ row.className || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="品类角色" align="center">
          <el-table-column label="设定值" prop="presetRoleName" min-width="110" sortable />
          <el-table-column label="本期值" prop="currentRoleName" min-width="110" sortable />
        </el-table-column>

        <el-table-column label="品类SKU数" align="center">
          <el-table-column label="设定值" min-width="105" align="right" sortable prop="suggestSaleSku">
            <template #default="{ row }">{{ formatInteger(row.suggestSaleSku) }}</template>
          </el-table-column>
          <el-table-column label="本期值" min-width="105" align="right" sortable prop="saleSku">
            <template #default="{ row }">{{ formatInteger(row.saleSku) }}</template>
          </el-table-column>
          <el-table-column label="当前值" min-width="105" align="right" sortable prop="currentSku">
            <template #default="{ row }">{{ formatInteger(row.currentSku) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="综合贡献率" align="center">
          <el-table-column label="本期值" min-width="110" align="right" sortable prop="contributionRatePer">
            <template #default="{ row }">{{ formatPercent(row.contributionRatePer) }}</template>
          </el-table-column>
          <el-table-column label="构成比" min-width="100" align="right" sortable prop="salesPer">
            <template #default="{ row }">{{ formatPercent(row.salesPer) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="销售额" align="center">
          <el-table-column label="总计" min-width="130" align="right" sortable prop="sales">
            <template #default="{ row }">{{ formatAmount(row.sales) }}</template>
          </el-table-column>
          <el-table-column label="对比日期" min-width="130" align="right" sortable prop="salesCompare">
            <template #default="{ row }">{{ formatAmount(row.salesCompare) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="110" align="right" sortable prop="salesCompareRate">
            <template #default="{ row }"
              ><span :class="rateClass(row.salesCompareRate)">{{ formatPercent(row.salesCompareRate) }}</span></template
            >
          </el-table-column>
          <el-table-column label="构成比" min-width="100" align="right" sortable prop="salesAmountPer">
            <template #default="{ row }">{{ formatPercent(row.salesAmountPer ?? row.salesPer) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="销售量" align="center">
          <el-table-column label="总计" min-width="120" align="right" sortable prop="saleQuantity">
            <template #default="{ row }">{{ formatAmount(row.saleQuantity, 0) }}</template>
          </el-table-column>
          <el-table-column label="对比日期" min-width="120" align="right" sortable prop="saleQuantityCompare">
            <template #default="{ row }">{{ formatAmount(row.saleQuantityCompare, 0) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="110" align="right" sortable prop="saleQuantityCompareRate">
            <template #default="{ row }"
              ><span :class="rateClass(row.saleQuantityCompareRate)">{{ formatPercent(row.saleQuantityCompareRate) }}</span></template
            >
          </el-table-column>
          <el-table-column label="构成比" min-width="100" align="right" sortable prop="saleQuantityPer">
            <template #default="{ row }">{{ formatPercent(row.saleQuantityPer) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="毛利额" align="center">
          <el-table-column label="总计" min-width="130" align="right" sortable prop="gross">
            <template #default="{ row }">{{ formatAmount(row.gross) }}</template>
          </el-table-column>
          <el-table-column label="对比日期" min-width="130" align="right" sortable prop="grossCompare">
            <template #default="{ row }">{{ formatAmount(row.grossCompare) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="110" align="right" sortable prop="grossCompareRate">
            <template #default="{ row }"
              ><span :class="rateClass(row.grossCompareRate)">{{ formatPercent(row.grossCompareRate) }}</span></template
            >
          </el-table-column>
          <el-table-column label="构成比" min-width="100" align="right" sortable prop="grossPer">
            <template #default="{ row }">{{ formatPercent(row.grossPer) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="毛利率" align="center">
          <el-table-column label="总计" min-width="100" align="right" sortable prop="grossRate">
            <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
          </el-table-column>
          <el-table-column label="对比日期" min-width="110" align="right" sortable prop="grossRateCompare">
            <template #default="{ row }">{{ formatPercent(row.grossRateCompare) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="110" align="right" sortable prop="grossRateCompareRate">
            <template #default="{ row }"
              ><span :class="rateClass(row.grossRateCompareRate)">{{ formatPercent(row.grossRateCompareRate) }}</span></template
            >
          </el-table-column>
        </el-table-column>

        <el-table-column label="客数" align="center">
          <el-table-column label="总计" min-width="120" align="right" sortable prop="customerCount">
            <template #default="{ row }">{{ formatAmount(row.customerCount, 0) }}</template>
          </el-table-column>
          <el-table-column label="对比日期" min-width="120" align="right" sortable prop="customerCountCompare">
            <template #default="{ row }">{{ formatAmount(row.customerCountCompare, 0) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="110" align="right" sortable prop="customerCountCompareRate">
            <template #default="{ row }"
              ><span :class="rateClass(row.customerCountCompareRate)">{{ formatPercent(row.customerCountCompareRate) }}</span></template
            >
          </el-table-column>
        </el-table-column>

        <el-table-column label="客单价" align="center">
          <el-table-column label="总计" min-width="110" align="right" sortable prop="customerPrice">
            <template #default="{ row }">{{ formatAmount(row.customerPrice) }}</template>
          </el-table-column>
          <el-table-column label="对比日期" min-width="110" align="right" sortable prop="customerPriceCompare">
            <template #default="{ row }">{{ formatAmount(row.customerPriceCompare) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="110" align="right" sortable prop="customerPriceCompareRate">
            <template #default="{ row }"
              ><span :class="rateClass(row.customerPriceCompareRate)">{{ formatPercent(row.customerPriceCompareRate) }}</span></template
            >
          </el-table-column>
        </el-table-column>

        <el-table-column label="平均库存成本" align="center">
          <el-table-column label="总计" min-width="135" align="right" sortable prop="avgInventoryCost">
            <template #default="{ row }">{{ formatAmount(row.avgInventoryCost) }}</template>
          </el-table-column>
          <el-table-column label="对比日期" min-width="135" align="right" sortable prop="avgInventoryCostCompare">
            <template #default="{ row }">{{ formatAmount(row.avgInventoryCostCompare) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="110" align="right" sortable prop="avgInventoryCostCompareRate">
            <template #default="{ row }"
              ><span :class="rateClass(row.avgInventoryCostCompareRate)">{{ formatPercent(row.avgInventoryCostCompareRate) }}</span></template
            >
          </el-table-column>
          <el-table-column label="构成比" min-width="100" align="right" sortable prop="avgInventoryCostPer">
            <template #default="{ row }">{{ formatPercent(row.avgInventoryCostPer) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="周转天数" min-width="110" align="right" sortable prop="turnoverDays">
          <template #default="{ row }">{{ formatAmount(row.turnoverDays) }}</template>
        </el-table-column>
        <el-table-column label="动销率" min-width="100" align="right" sortable prop="sellThroughRate">
          <template #default="{ row }">{{ formatPercent(row.sellThroughRate) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="92" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDiagnosis(row)">品类诊断</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredTotal"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {
  getAllClassCheckRoleTypes,
  getAllClassCheckSalesChange,
  getAllClassCheckScatter,
  getAllClassCheckSku,
  getAllClassCheckSkuDiffer
} from '@/api/category/diagnosis/detail';
import type { AllClassCheckListRequest, AllClassCheckRequest } from '@/api/category/diagnosis/detail/all-class-check-types';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const errorText = ref('');
const roleOptions = ref<{ label: string; value: string }[]>([]);
const rows = ref<any[]>([]);

const DEFAULT_CLASS_NO = ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011'];

const query = reactive<AllClassCheckListRequest>({
  deptId: route.query.deptId as string | undefined,
  retailTypeId: route.query.retailTypeId as string | undefined,
  businessCircleId: route.query.businessCircleId as string | undefined,
  deptGroupId: route.query.deptGroupId as string | undefined,
  storeNo: (route.query.storeNo as string) || (route.query.storeScope as string) || '0',
  classLevel: Number(route.query.classLevel || route.query.categoryLevel || 1),
  classNo: [],
  classRole: [],
  currentStartDate: (route.query.currentStartDate as string) || (route.query.startDate as string) || '',
  currentEndDate: (route.query.currentEndDate as string) || (route.query.endDate as string) || '',
  compareStartDate: (route.query.compareStartDate as string) || '',
  compareEndDate: (route.query.compareEndDate as string) || '',
  page: Number(route.query.page || 1),
  size: Number(route.query.size || 10),
  order: 'sales',
  orderType: 'desc'
});

const filterForm = reactive({
  roleBase: route.query.alertType === 'role' ? 'preset' : 'current',
  classRole: [] as string[],
  roleConsistent: route.query.alertType === 'role' ? 'inconsistent' : 'all',
  skuRatioStatus: route.query.alertType === 'skuStructure' ? 'unreasonable' : 'all',
  skuCountStatus: route.query.alertType === 'skuPreset' ? 'inconsistent' : 'all'
});

const toRouteArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const routeClassNo = toRouteArray(route.query.classNo || route.query.classNos);
const isDefaultAllClassNo = routeClassNo.length >= DEFAULT_CLASS_NO.length && DEFAULT_CLASS_NO.every((item) => routeClassNo.includes(item));
query.classNo = isDefaultAllClassNo ? [] : routeClassNo;

const storeLabel = computed(() => (String(query.storeNo || '0') === '0' ? '全部' : query.storeNo));

const putIfPresent = (target: Record<string, unknown>, key: string, value: unknown) => {
  if (value !== undefined && value !== null && value !== '') {
    target[key] = value;
  }
};

const baseRequest = computed<AllClassCheckRequest>(() => {
  const request: AllClassCheckRequest = {
    storeNo: query.storeNo,
    classLevel: query.classLevel,
    currentStartDate: query.currentStartDate,
    currentEndDate: query.currentEndDate,
    compareStartDate: query.compareStartDate,
    compareEndDate: query.compareEndDate
  };

  putIfPresent(request as Record<string, unknown>, 'deptId', query.deptId);
  putIfPresent(request as Record<string, unknown>, 'retailTypeId', query.retailTypeId);
  putIfPresent(request as Record<string, unknown>, 'businessCircleId', query.businessCircleId);
  putIfPresent(request as Record<string, unknown>, 'deptGroupId', query.deptGroupId);
  if (query.classNo?.length) request.classNo = query.classNo;
  if (query.classRole?.length) request.classRole = query.classRole;

  return request;
});

const unwrap = (res: any) => res?.data?.data ?? res?.data?.result ?? res?.data ?? res?.result ?? res;
const toNumber = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};
const firstValue = (source: any, keys: string[], fallback: any = undefined) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
};
const calcRate = (current: unknown, compare: unknown) => {
  const currentNum = toNumber(current);
  const compareNum = toNumber(compare);
  if (!compareNum) return currentNum ? 100 : 0;
  return ((currentNum - compareNum) / Math.abs(compareNum)) * 100;
};
const calcPercent = (part: unknown, totalValue: unknown) => {
  const denominator = toNumber(totalValue);
  if (!denominator) return 0;
  return (toNumber(part) / denominator) * 100;
};

const formatAmount = (value: unknown, digits = 2) => {
  if (value === undefined || value === null || value === '') return '-';
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};
const formatInteger = (value: unknown) => formatAmount(value, 0);
const formatPercent = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '-';
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${num.toFixed(2)}%`;
};
const rateClass = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return '';
  return num > 0 ? 'rate-up' : 'rate-down';
};

const normalizeRoleOptions = (payload: any) => {
  const list = Array.isArray(payload) ? payload : payload?.list || payload?.content || [];
  roleOptions.value = list.map((item: any) => ({
    label: item.label || item.dictLabel || item.name || item.value,
    value: String(item.value || item.dictValue || item.code || item.label)
  }));
};

const buildMap = (list: any[] = []) => new Map(list.map((item) => [String(item.classNo || item.classCode || item.categoryId || ''), item]));

const normalizeRow = (row: any, roleItem: any, skuItem: any, diffItem: any, totals: Record<string, number>) => {
  const sales = toNumber(firstValue(row, ['sales', 'salesAmount', 'currentSales']));
  const salesCompare = toNumber(firstValue(row, ['salesCompare', 'compareSales', 'compareSalesAmount']));
  const saleQuantity = toNumber(firstValue(row, ['saleQuantity', 'salesQuantity', 'quantity']));
  const saleQuantityCompare = toNumber(firstValue(row, ['saleQuantityCompare', 'compareSaleQuantity', 'compareQuantity']));
  const gross = toNumber(firstValue(row, ['gross', 'grossProfit', 'grossAmount']));
  const grossCompare = toNumber(firstValue(row, ['grossCompare', 'compareGross', 'compareGrossAmount']));
  const customerCount = toNumber(firstValue(row, ['customerCount', 'custNum', 'customerNum', 'flowCount']));
  const customerCountCompare = toNumber(firstValue(row, ['customerCountCompare', 'compareCustomerCount', 'compareCustNum', 'compareFlowCount']));
  const customerPrice = toNumber(firstValue(row, ['customerPrice', 'avgCustomerPrice'], customerCount ? sales / customerCount : 0));
  const customerPriceCompare = toNumber(
    firstValue(row, ['customerPriceCompare', 'compareCustomerPrice'], customerCountCompare ? salesCompare / customerCountCompare : 0)
  );
  const avgInventoryCost = toNumber(firstValue(row, ['avgInventoryCost', 'avgStockCost', 'averageInventoryCost']));
  const avgInventoryCostCompare = toNumber(firstValue(row, ['avgInventoryCostCompare', 'compareAvgInventoryCost', 'compareAvgStockCost']));
  const grossRate = firstValue(row, ['grossRate', 'grossProfitRate'], sales ? (gross / sales) * 100 : undefined);
  const grossRateCompare = firstValue(row, ['grossRateCompare', 'compareGrossRate'], salesCompare ? (grossCompare / salesCompare) * 100 : undefined);
  const presetRoleName = firstValue(roleItem, ['presetRoleName', 'setClassRoleName'], firstValue(row, ['presetRoleName', 'setClassRoleName'], '-'));
  const currentRoleName = firstValue(
    roleItem,
    ['evaluatedRoleName', 'classRoleName', 'currentRoleName', 'classRoleTypeDescribe'],
    firstValue(row, ['classRoleName', 'currentRoleName'], '-')
  );
  const hasPresetRole = Boolean(presetRoleName && presetRoleName !== '-');
  const hasCurrentRole = Boolean(currentRoleName && currentRoleName !== '-');
  const roleWarning =
    typeof roleItem?.roleWarning === 'boolean' ? roleItem.roleWarning : hasPresetRole && hasCurrentRole && presetRoleName !== currentRoleName;
  const suggestSaleSku = toNumber(firstValue(diffItem, ['suggestSaleSku', 'sysSuggestSaleSku'], firstValue(skuItem, ['suggestSaleSku'])));
  const saleSku = toNumber(firstValue(diffItem, ['saleSku'], firstValue(skuItem, ['saleSku', 'haveSalesSku', 'classSku'])));
  const currentSku = toNumber(firstValue(skuItem, ['classSku', 'haveSalesSku', 'saleSku'], saleSku));
  const skuPer = toNumber(firstValue(skuItem, ['skuPer']));
  const salesPer = toNumber(firstValue(row, ['salesPer'], firstValue(skuItem, ['salesPer'], calcPercent(sales, totals.sales))));

  return {
    ...row,
    ...roleItem,
    classNo: firstValue(row, ['classNo', 'classCode', 'categoryId'], firstValue(roleItem, ['classNo', 'classCode'], '-')),
    className: firstValue(row, ['className', 'classDesc', 'categoryName'], firstValue(roleItem, ['className', 'classDesc'], '-')),
    presetRoleName,
    currentRoleName,
    roleWarning,
    roleUnset: !hasPresetRole,
    roleConsistent: hasPresetRole && hasCurrentRole && !roleWarning,
    suggestSaleSku,
    saleSku,
    currentSku,
    skuPer,
    skuRatioReasonable: Math.abs(skuPer - salesPer) <= 3,
    skuCountConsistent: suggestSaleSku ? suggestSaleSku === saleSku : true,
    contributionRatePer: firstValue(
      row,
      ['contributionRatePer', 'contributionRate'],
      firstValue(roleItem, ['contributionRatePer', 'contributionRate'])
    ),
    sales,
    salesCompare,
    salesCompareRate: firstValue(row, ['salesCompareRate', 'salesGrowthRate'], calcRate(sales, salesCompare)),
    salesAmountPer: salesPer,
    salesPer,
    saleQuantity,
    saleQuantityCompare,
    saleQuantityCompareRate: firstValue(row, ['saleQuantityCompareRate', 'quantityCompareRate'], calcRate(saleQuantity, saleQuantityCompare)),
    saleQuantityPer: firstValue(row, ['saleQuantityPer', 'quantityPer'], calcPercent(saleQuantity, totals.saleQuantity)),
    gross,
    grossCompare,
    grossCompareRate: firstValue(row, ['grossCompareRate', 'grossGrowthRate'], calcRate(gross, grossCompare)),
    grossPer: firstValue(row, ['grossPer'], calcPercent(gross, totals.gross)),
    grossRate,
    grossRateCompare,
    grossRateCompareRate: firstValue(row, ['grossRateCompareRate'], Number(grossRate) - Number(grossRateCompare)),
    customerCount,
    customerCountCompare,
    customerCountCompareRate: firstValue(row, ['customerCountCompareRate'], calcRate(customerCount, customerCountCompare)),
    customerPrice,
    customerPriceCompare,
    customerPriceCompareRate: firstValue(row, ['customerPriceCompareRate'], calcRate(customerPrice, customerPriceCompare)),
    avgInventoryCost,
    avgInventoryCostCompare,
    avgInventoryCostCompareRate: firstValue(row, ['avgInventoryCostCompareRate'], calcRate(avgInventoryCost, avgInventoryCostCompare)),
    avgInventoryCostPer: firstValue(row, ['avgInventoryCostPer'], calcPercent(avgInventoryCost, totals.avgInventoryCost)),
    turnoverDays: firstValue(row, ['turnoverDays', 'stockTurnoverDays']),
    sellThroughRate: firstValue(row, ['sellThroughRate', 'saleRate', 'dynamicSalesRate'])
  };
};

const displayRows = computed(() => {
  return rows.value.filter((row) => {
    if (filterForm.classRole.length) {
      const roleValue = filterForm.roleBase === 'preset' ? row.presetRoleName : row.currentRoleName;
      if (!filterForm.classRole.includes(String(roleValue))) return false;
    }
    if (filterForm.roleConsistent === 'consistent' && !row.roleConsistent) return false;
    if (filterForm.roleConsistent === 'inconsistent' && !row.roleWarning) return false;
    if (filterForm.roleConsistent === 'unset' && !row.roleUnset) return false;
    if (filterForm.skuRatioStatus === 'reasonable' && !row.skuRatioReasonable) return false;
    if (filterForm.skuRatioStatus === 'unreasonable' && row.skuRatioReasonable) return false;
    if (filterForm.skuCountStatus === 'consistent' && !row.skuCountConsistent) return false;
    if (filterForm.skuCountStatus === 'inconsistent' && row.skuCountConsistent) return false;
    return true;
  });
});

const filteredTotal = computed(() => displayRows.value.length);

const pagedRows = computed(() => {
  const currentPage = Math.max(Number(query.page || 1), 1);
  const pageSize = Math.max(Number(query.size || 10), 1);
  const start = (currentPage - 1) * pageSize;
  return displayRows.value.slice(start, start + pageSize);
});

const reload = async () => {
  loading.value = true;
  errorText.value = '';
  try {
    const body = baseRequest.value;
    const [roleTypeRes, salesRes, roleRes, skuRes, diffRes] = await Promise.all([
      getAllClassCheckRoleTypes(),
      getAllClassCheckSalesChange({ ...body, page: 1, size: 10000, order: query.order, orderType: query.orderType }),
      getAllClassCheckScatter(body),
      getAllClassCheckSku(body),
      getAllClassCheckSkuDiffer(body)
    ]);

    normalizeRoleOptions(unwrap(roleTypeRes));
    const salesPayload = unwrap(salesRes) || {};
    const rolePayload = unwrap(roleRes) || {};
    const skuPayload = unwrap(skuRes) || {};
    const diffPayload = unwrap(diffRes) || {};
    const salesRows = salesPayload.content || salesPayload.list || [];
    const roleMap = buildMap(rolePayload.list || []);
    const skuMap = buildMap(skuPayload.list || []);
    const diffMap = buildMap(diffPayload.list || []);
    const totals = salesRows.reduce(
      (acc: Record<string, number>, item: any) => {
        acc.sales += toNumber(item.sales);
        acc.saleQuantity += toNumber(item.saleQuantity);
        acc.gross += toNumber(item.gross);
        acc.avgInventoryCost += toNumber(firstValue(item, ['avgInventoryCost', 'avgStockCost', 'averageInventoryCost']));
        return acc;
      },
      { sales: 0, saleQuantity: 0, gross: 0, avgInventoryCost: 0 }
    );

    rows.value = salesRows.map((item: any) => {
      const key = String(item.classNo || item.classCode || item.categoryId || '');
      return normalizeRow(item, roleMap.get(key) || {}, skuMap.get(key) || {}, diffMap.get(key) || {}, totals);
    });
    query.page = 1;
  } catch (error: any) {
    errorText.value = error?.message || '全类检测明细加载失败';
    rows.value = [];
  } finally {
    loading.value = false;
  }
};

const handlePageSizeChange = () => {
  query.page = 1;
};

const handlePageChange = (page: number) => {
  query.page = page;
};

const handleDiagnosis = (row: any) => {
  router.push({
    path: '/category/diagnosis',
    query: {
      categoryId: row.classNo,
      categoryName: row.className,
      categoryLevel: query.classLevel,
      storeNo: query.storeNo,
      startDate: query.currentStartDate,
      endDate: query.currentEndDate,
      compareStartDate: query.compareStartDate,
      compareEndDate: query.compareEndDate
    }
  });
};

const handleExport = () => {
  const header = [
    '品类编码',
    '品类名称',
    '设定角色',
    '本期角色',
    '设定SKU',
    '本期SKU',
    '当前SKU',
    '综合贡献率',
    '销售额',
    '对比销售额',
    '销售额增长率'
  ];
  const lines = displayRows.value.map((row) =>
    [
      row.classNo,
      row.className,
      row.presetRoleName,
      row.currentRoleName,
      row.suggestSaleSku,
      row.saleSku,
      row.currentSku,
      row.contributionRatePer,
      row.sales,
      row.salesCompare,
      row.salesCompareRate
    ]
      .map((item) => `"${String(item ?? '').replace(/"/g, '""')}"`)
      .join(',')
  );
  const blob = new Blob([`\ufeff${[header.join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `全类检测明细_${query.currentStartDate || ''}_${query.currentEndDate || ''}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

watch(
  filterForm,
  () => {
    query.page = 1;
  },
  { deep: true }
);

onMounted(reload);
</script>

<style scoped lang="scss">
.full-class-detail-page {
  background: #f5f7fb;
}
.summary-card,
.filter-card,
.table-card {
  margin-bottom: 12px;
  border-radius: 6px;
}
.summary-lines {
  color: #334155;
  font-size: 14px;
  line-height: 1.9;
}
.filter-card :deep(.el-card__body) {
  padding: 14px 16px 4px;
}
.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 12px;
}
.role-base-select {
  width: 120px;
  margin-right: 8px;
}
.role-select {
  width: 220px;
}
.filter-select {
  width: 150px;
}
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.table-title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
}
.table-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}
.unit-text {
  color: #64748b;
  font-size: 13px;
}
.detail-table {
  width: 100%;
}
.detail-table :deep(.el-table__header th) {
  background: #fff3e8;
  color: #111827;
  font-weight: 700;
}
.detail-table :deep(.el-table__fixed-right) {
  box-shadow: -4px 0 10px rgba(15, 23, 42, 0.08);
}
.class-cell {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}
.class-code {
  color: #64748b;
  font-size: 12px;
}
.class-name {
  color: #0f172a;
  font-weight: 600;
}
.rate-up {
  color: #dc2626;
  font-weight: 700;
}
.rate-down {
  color: #16a34a;
  font-weight: 700;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 14px;
}
@media (max-width: 1200px) {
  .role-select {
    width: 180px;
  }
  .filter-select {
    width: 130px;
  }
}
</style>
