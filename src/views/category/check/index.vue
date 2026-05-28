<template>
  <div class="p-2 category-check-page">
    <el-card shadow="hover" class="mb-[12px]">
      <div class="filter-header">
        <div class="filter-actions">
          <el-button text @click="showSearch = !showSearch">{{ showSearch ? '收起^' : '展开∨' }}</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-hasPermi="['category:check:list']" type="success" icon="Search" @click="handleSearch">查询</el-button>
        </div>
      </div>

      <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
        <div v-show="showSearch" class="filter-form-wrap">
          <el-form :model="queryForm" :inline="true" label-width="80px">
            <el-form-item label="门店范围">
              <el-select v-model="queryForm.storeScope" style="width: 180px" placeholder="请选择">
                <el-option v-for="item in filterOptions.storeOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="品类级别">
              <el-select v-model="queryForm.categoryLevel" style="width: 180px" placeholder="请选择" @change="handleCategoryLevelChange">
                <el-option v-for="item in filterOptions.levelOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="品类">
              <el-popover
                v-model:visible="categoryPickerVisible"
                placement="bottom-start"
                trigger="click"
                :width="categoryPickerWidth"
                popper-class="category-picker-popper"
                :disabled="categoryOptionsLoading"
              >
                <template #reference>
                  <div class="category-picker-trigger" :class="{ 'is-open': categoryPickerVisible, 'is-loading': categoryOptionsLoading }">
                    <div class="category-picker-tags">
                      <span class="category-tag">
                        {{ categoryPickerSummaryLabel }}
                        <span v-if="!isAllCategorySelected && !categoryOptionsLoading" class="category-tag-close" @click.stop="handleCategoryClear"
                          >×</span
                        >
                      </span>
                      <span v-if="selectedCategoryCount > 1" class="category-tag count">+ {{ selectedCategoryCount - 1 }}</span>
                    </div>
                    <el-icon class="category-picker-arrow" :class="{ 'is-open': categoryPickerVisible }">
                      <ArrowDown />
                    </el-icon>
                  </div>
                </template>

                <div
                  v-loading="categoryOptionsLoading"
                  class="category-picker-panel"
                  :style="{ gridTemplateColumns: `repeat(${categoryColumnOptions.length}, minmax(190px, 1fr))`, width: `${categoryPickerWidth}px` }"
                >
                  <div v-for="(column, columnIndex) in categoryColumnOptions" :key="columnIndex" class="category-column">
                    <template v-if="columnIndex === 0">
                      <div class="category-option" :class="{ active: isAllCategorySelected }" @click="toggleAllCategories">
                        <span class="category-check" :class="{ checked: isAllCategorySelected }">✓</span>
                        <span>全部</span>
                      </div>
                    </template>
                    <div
                      v-for="item in column"
                      :key="String(item.value)"
                      class="category-option"
                      :class="{ active: isCategoryColumnActive(item, columnIndex), child: isTargetCategoryLevel(item, columnIndex) }"
                      @mouseenter="setActiveCategoryPath(columnIndex, item)"
                      @click="handleCategoryOptionClick(item, columnIndex)"
                    >
                      <span
                        class="category-check"
                        :class="{ checked: isCategorySelected(item, columnIndex) }"
                        @click.stop="handleCategoryCheckClick(item, columnIndex)"
                      >
                        ✓
                      </span>
                      <span class="category-option-label">{{ item.label }}</span>
                      <span v-if="hasNextCategoryColumn(item, columnIndex)" class="category-option-arrow">›</span>
                    </div>
                    <el-empty v-if="!column.length" description="暂无品类" :image-size="64" />
                  </div>
                </div>
              </el-popover>
            </el-form-item>
            <el-form-item label="本期日期">
              <el-date-picker
                v-model="currentDateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                range-separator="-"
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item>
              <el-button text type="primary" @click="moreConditionVisible = !moreConditionVisible">
                {{ moreConditionVisible ? '收起更多条件' : '更多条件' }}
              </el-button>
            </el-form-item>
          </el-form>

          <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
            <div v-show="moreConditionVisible" class="mt-[8px]">
              <el-form :model="queryForm" :inline="true" label-width="80px">
                <el-form-item label="对比日期">
                  <el-date-picker
                    v-model="compareDateRange"
                    type="daterange"
                    value-format="YYYY-MM-DD"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    range-separator="-"
                    style="width: 260px"
                  />
                </el-form-item>
              </el-form>
            </div>
          </transition>
        </div>
      </transition>
    </el-card>

    <el-card shadow="never" class="mb-[12px] alert-card">
      <template #header>
        <div class="alert-title">异常预警</div>
      </template>
      <button type="button" class="alert-line alert-link" @click="goAlertDetail('role')">
        存在
        <span class="alert-num">{{ alertData.roleAbnormalCount }}</span>
        个品类角色异常，与预设品类角色不一致！您可以使用系统进一步分析异常品类或根据企业策略调整品类角色的预设值。
      </button>
      <button type="button" class="alert-line alert-link" @click="goAlertDetail('skuStructure')">
        存在
        <span class="alert-num">{{ alertData.skuStructureAbnormalCount }}</span>
        个品类SKU数异常，其SKU构成比与销售构成比差值过大(超过3%)！您可以使用系统进一步分析异常SKU数的品类或根据企业策略调整品类SKU数的预设值
      </button>
      <button type="button" class="alert-line alert-link" @click="goAlertDetail('skuPreset')">
        存在
        <span class="alert-num">{{ alertData.skuPresetAbnormalCount }}</span>
        个品类SKU数异常，其当前SKU数与品类预设SKU数不一致！您可以使用系统进一步分析异常SKU数的品类或根据企业策略调整品类SKU数的预设值。
      </button>
    </el-card>

    <el-card shadow="hover" class="mb-[12px]">
      <template #header>
        <div class="module-header">
          <span class="module-title">品类角色</span>
          <div class="module-right">
            <el-button link type="primary" @click="goRoleStrategy">角色策略</el-button>
            <el-button type="primary" plain @click="goDetail('role')">详情</el-button>
          </div>
        </div>
      </template>
      <div v-loading="roleLoading" class="chart-box h-[420px]">
        <div ref="roleChartRef" class="chart-inner"></div>
      </div>
    </el-card>

    <el-card shadow="hover" class="mb-[12px] sku-card">
      <template #header>
        <div class="module-header">
          <span class="module-title">
            品类SKU数
            <el-tooltip
              effect="dark"
              placement="top"
              content="当前SKU数:以所选门店范围下在向前30天内有(销售或有库存)且状态为上架的商品作为统计依据! 本期SKU数:以所选门店范围及本期日期下有销售或(期末有库存且状态为上架)的商品作为统计依据!"
            >
              <span class="glossary-icon">ⓘ</span>
            </el-tooltip>
          </span>
          <el-button type="primary" plain @click="goDetail('sku')">详情</el-button>
        </div>
      </template>

      <div
        v-loading="skuLoading"
        class="chart-box h-[340px] mb-[12px] sku-tooltip-wrap"
        @mousemove="handleSkuTooltipMousemove($event, 'ratio')"
        @mouseleave="hideSkuTooltip"
      >
        <div
          v-if="skuHover.visible && skuHover.chartType === 'ratio'"
          class="sku-hover-band"
          :style="{ left: `${skuHover.left}px`, top: `${skuHover.top}px`, width: `${skuHover.width}px`, height: `${skuHover.height}px` }"
        />
        <div ref="skuRatioChartRef" class="chart-inner"></div>
      </div>
      <div
        v-loading="skuLoading"
        class="chart-box h-[340px] sku-tooltip-wrap"
        @mousemove="handleSkuTooltipMousemove($event, 'count')"
        @mouseleave="hideSkuTooltip"
      >
        <div
          v-if="skuHover.visible && skuHover.chartType === 'count'"
          class="sku-hover-band"
          :style="{ left: `${skuHover.left}px`, top: `${skuHover.top}px`, width: `${skuHover.width}px`, height: `${skuHover.height}px` }"
        />
        <div ref="skuCountChartRef" class="chart-inner"></div>
      </div>
      <div v-if="skuTooltip.visible" class="sku-chart-tooltip" :style="{ left: `${skuTooltip.x}px`, top: `${skuTooltip.y}px` }">
        <div class="sku-chart-tooltip-title">{{ skuTooltip.title }}</div>
        <div v-for="item in skuTooltip.rows" :key="item.name" class="sku-chart-tooltip-row">
          <span class="sku-chart-tooltip-dot" :style="{ background: item.color }" />
          <span class="sku-chart-tooltip-name">{{ item.name }}：</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="module-header">
          <span class="module-title">销售额变动</span>
          <div class="module-right">
            <el-pagination
              v-model:current-page="salesPage.pageNum"
              :page-size="salesPage.pageSize"
              :total="salesPage.total"
              layout="prev, pager, next"
              :pager-count="5"
              background
              @current-change="handleSalesPageChange"
            />
            <el-button type="primary" plain @click="goDetail('sales')">详情</el-button>
          </div>
        </div>
      </template>
      <div
        v-loading="salesLoading"
        class="chart-box h-[420px] sales-no-wheel sales-tooltip-wrap"
        @mousemove="handleSalesTooltipMousemove"
        @mouseleave="hideSalesTooltip"
      >
        <div
          v-if="salesHover.visible"
          class="sales-hover-band"
          :style="{ left: `${salesHover.left}px`, top: `${salesHover.top}px`, width: `${salesHover.width}px`, height: `${salesHover.height}px` }"
        />
        <div ref="salesChartRef" class="chart-inner"></div>
        <div v-if="salesTooltip.visible" class="sales-chart-tooltip" :style="{ left: `${salesTooltip.x}px`, top: `${salesTooltip.y}px` }">
          <div class="sales-chart-tooltip-title">{{ salesTooltip.title }}</div>
          <div class="sales-chart-tooltip-row">本期销售额：{{ salesTooltip.salesAmount }}</div>
          <div class="sales-chart-tooltip-row">对比周期销售额：{{ salesTooltip.compareSalesAmount }}</div>
          <div class="sales-chart-tooltip-row">对比增长率：{{ salesTooltip.growthRate }}</div>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="roleStrategyDialogVisible" title="角色策略及战术" width="820px" append-to-body>
      <div class="role-strategy-dialog">
        <p><strong>1. 品类角色与品类策略战术的关系：</strong></p>
        <p>
          针对不同的品类角色，需要制定不同的品类策略并运用不同的品类战术进行管理。品类战术直接影响着顾客对于企业的认知印象，同时影响品类业绩目标的实现。
        </p>

        <p><strong>2. 如何设定不同品类角色的策略及战术：</strong></p>
        <p>
          品类角色划分方法不同，品类策略及战术也不同。以行业内普适的一种品类角色划分方式为例进行介绍：示例的品类角色划分方式是以品类“综合贡献率”、“销售增长率”作为矩阵的横、纵轴，将企业同一级别的品类进行划分，从而定位品类的初始角色，企业可在此基础上基于自身考虑对品类角色进一步调整。
        </p>

        <img :src="treeStrategyImage" alt="角色策略及战术" class="role-strategy-image" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="CategoryCheck" lang="ts">
import * as echarts from 'echarts';
import { ArrowDown } from '@element-plus/icons-vue';
import treeStrategyImage from '@/assets/images/tree1.ae4aedc.png';
import { useRequest } from '@/hooks/useRequest';
import {
  getCategoryCheckAlert,
  getCategoryCheckCategoryOptions,
  getCategoryCheckFilter,
  getCategoryCheckRole,
  getCategoryCheckSales,
  getCategoryCheckSku
} from '@/api/category/check';
import type { CategoryCheckTreeOption } from '@/api/category/check';
import {
  CategoryCheckAlertVO,
  CategoryCheckFilterVO,
  CategoryCheckQuery,
  CategoryCheckRoleVO,
  CategoryCheckSalesQuery,
  CategoryCheckSalesVO,
  CategorySkuChartItemVO,
  CategoryCheckSkuVO
} from '@/api/category/check/types';

const proxy = getCurrentInstance()?.proxy as any;
const router = useRouter();
const ALL_CATEGORY_LABEL = '全部';
const DEFAULT_CURRENT_DATE_RANGE: [string, string] = ['2026-04-01', '2026-04-30'];
const DEFAULT_COMPARE_DATE_RANGE: [string, string] = ['2026-03-01', '2026-03-31'];
const ROLE_MATCH_SERIES = [
  { key: 'match', name: '品类角色与设定一致', color: '#2A9D8F' },
  { key: 'mismatch', name: '品类角色与设定不一致', color: '#F4A261' },
  { key: 'unset', name: '品类角色未设定', color: '#9CA3AF' }
] as const;

const showSearch = ref(true);
const moreConditionVisible = ref(false);
const roleStrategyDialogVisible = ref(false);
const categoryOptionsLoading = ref(false);
const categoryPickerVisible = ref(false);
const categoryTreeOptions = ref<CategoryCheckTreeOption[]>([]);
const activeCategoryPath = ref<string[]>([]);

const roleChartRef = ref<HTMLDivElement>();
const skuRatioChartRef = ref<HTMLDivElement>();
const skuCountChartRef = ref<HTMLDivElement>();
const salesChartRef = ref<HTMLDivElement>();
const skuChartRows = ref<CategorySkuChartItemVO[]>([]);
const salesChartRows = ref<CategorySalesChartItemVO[]>([]);
const skuTooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  rows: [] as Array<{ name: string; value: string; color: string }>
});
const skuHover = reactive({
  visible: false,
  chartType: '' as '' | 'ratio' | 'count',
  left: 0,
  top: 0,
  width: 0,
  height: 0
});
const salesTooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  salesAmount: '',
  compareSalesAmount: '',
  growthRate: ''
});
const salesHover = reactive({
  visible: false,
  left: 0,
  top: 0,
  width: 0,
  height: 0
});

const roleChartIns = ref<echarts.ECharts>();
const skuRatioChartIns = ref<echarts.ECharts>();
const skuCountChartIns = ref<echarts.ECharts>();
const salesChartIns = ref<echarts.ECharts>();

const filterOptions = reactive<CategoryCheckFilterVO>({
  storeOptions: [],
  levelOptions: [],
  categoryOptions: []
});

const alertData = reactive<CategoryCheckAlertVO>({
  roleAbnormalCount: 0,
  skuStructureAbnormalCount: 0,
  skuPresetAbnormalCount: 0
});

const queryForm = reactive({
  storeScope: '' as string | number,
  categoryLevel: '' as string | number,
  categoryIds: [] as Array<string | number>
});

const currentDateRange = ref<[string, string]>([...DEFAULT_CURRENT_DATE_RANGE]);
const compareDateRange = ref<[string, string]>([...DEFAULT_COMPARE_DATE_RANGE]);

const salesPage = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const filterRequest = useRequest(async () => await getCategoryCheckFilter());
const categoryOptionsRequest = useRequest(async (level: string | number) => await getCategoryCheckCategoryOptions(level));
const alertRequest = useRequest(async (params: CategoryCheckQuery) => await getCategoryCheckAlert(params));
const roleRequest = useRequest(async (params: CategoryCheckQuery) => await getCategoryCheckRole(params));
const skuRequest = useRequest(async (params: CategoryCheckQuery) => await getCategoryCheckSku(params));
const salesRequest = useRequest(async (params: CategoryCheckSalesQuery) => await getCategoryCheckSales(params));

const roleLoading = computed(() => roleRequest.loading.value);
const skuLoading = computed(() => skuRequest.loading.value);
const salesLoading = computed(() => salesRequest.loading.value);
const selectedCategoryLabelMap = computed(() => {
  const map = new Map<string, string>();
  filterOptions.categoryOptions.forEach((item) => map.set(String(item.value), item.label));
  return map;
});
const targetCategoryLevel = computed(() => Number(queryForm.categoryLevel || 1));
const categoryPickerColumnCount = computed(() => Math.max(1, Math.min(targetCategoryLevel.value, 4)));
const targetCategoryOptions = computed(() =>
  filterOptions.categoryOptions.filter((item) => String(item.level || targetCategoryLevel.value) === String(targetCategoryLevel.value))
);
const targetCategoryValueSet = computed(() => new Set(targetCategoryOptions.value.map((item) => String(item.value))));
const normalizedSelectedCategoryIds = computed(() =>
  queryForm.categoryIds.map((item) => String(item)).filter((item) => targetCategoryValueSet.value.has(item))
);
const isAllCategorySelected = computed(
  () => targetCategoryOptions.value.length > 0 && normalizedSelectedCategoryIds.value.length === targetCategoryOptions.value.length
);
const selectedCategoryCount = computed(() =>
  isAllCategorySelected.value ? targetCategoryOptions.value.length + 1 : normalizedSelectedCategoryIds.value.length
);
const categoryPickerSummaryLabel = computed(() => {
  if (isAllCategorySelected.value) return ALL_CATEGORY_LABEL;
  const firstValue = normalizedSelectedCategoryIds.value[0];
  return selectedCategoryLabelMap.value.get(String(firstValue)) || ALL_CATEGORY_LABEL;
});
const visibleCategoryColumnCount = computed(() => Math.max(1, categoryColumnOptions.value.length));
const categoryPickerWidth = computed(() => Math.max(300, visibleCategoryColumnCount.value * 260));
const ensureActiveCategoryPath = () => {
  const nextPath: string[] = [];
  let currentList = categoryTreeOptions.value;
  const maxActiveDepth = Math.max(1, categoryPickerColumnCount.value - 1);
  for (let index = 0; index < maxActiveDepth; index += 1) {
    if (!currentList.length) break;
    const existing = currentList.find((item) => String(item.value) === activeCategoryPath.value[index]);
    const selected = existing || currentList[0];
    nextPath.push(String(selected.value));
    currentList = selected.children || [];
  }
  activeCategoryPath.value = nextPath;
};
const categoryColumnOptions = computed(() => {
  const columns: CategoryCheckTreeOption[][] = [];
  let currentList = categoryTreeOptions.value;
  for (let index = 0; index < categoryPickerColumnCount.value; index += 1) {
    if (!currentList.length && index > 0) break;
    columns.push(currentList);
    const activeValue = activeCategoryPath.value[index] || currentList[0]?.value;
    const activeNode = currentList.find((item) => String(item.value) === String(activeValue));
    currentList = activeNode?.children || [];
  }
  return columns;
});

const buildQuery = (): CategoryCheckQuery => ({
  storeScope: queryForm.storeScope,
  categoryLevel: queryForm.categoryLevel,
  categoryIds: normalizedSelectedCategoryIds.value,
  currentStartDate: currentDateRange.value?.[0],
  currentEndDate: currentDateRange.value?.[1],
  compareStartDate: compareDateRange.value?.[0],
  compareEndDate: compareDateRange.value?.[1]
});

const collectTargetCategoryValues = (nodes: CategoryCheckTreeOption[] = [], depth = 1): string[] => {
  const result: string[] = [];
  nodes.forEach((node) => {
    const level = Number(node.level || depth);
    if (level === targetCategoryLevel.value) {
      result.push(String(node.value));
      return;
    }
    if (node.children?.length) {
      result.push(...collectTargetCategoryValues(node.children, depth + 1));
    }
  });
  return result;
};

const selectAllCategories = () => {
  queryForm.categoryIds = targetCategoryOptions.value.map((item) => item.value);
};

const toggleAllCategories = () => {
  queryForm.categoryIds = isAllCategorySelected.value ? [] : targetCategoryOptions.value.map((item) => item.value);
};

const loadCategoryOptions = async (level: string | number) => {
  categoryOptionsLoading.value = true;
  try {
    const res = await categoryOptionsRequest.run(level);
    filterOptions.categoryOptions = res?.data?.options || [];
    categoryTreeOptions.value = res?.data?.tree || [];
    ensureActiveCategoryPath();
    selectAllCategories();
  } finally {
    categoryOptionsLoading.value = false;
  }
};

const initFilter = async () => {
  const res = await filterRequest.run(undefined as never);
  const data = res?.data;
  if (!data) return;
  filterOptions.storeOptions = data.storeOptions || [];
  filterOptions.levelOptions = data.levelOptions || [];
  filterOptions.categoryOptions = data.categoryOptions || [];

  const defaultStore = filterOptions.storeOptions.find((item) => item.label === '全店') || filterOptions.storeOptions[0];
  const defaultLevel = filterOptions.levelOptions.find((item) => String(item.label).includes('一级')) || filterOptions.levelOptions[0];
  queryForm.storeScope = defaultStore?.value || '';
  queryForm.categoryLevel = defaultLevel?.value || '';
  if (queryForm.categoryLevel) {
    await loadCategoryOptions(queryForm.categoryLevel);
  }
};

const handleCategoryLevelChange = async (level: string | number) => {
  categoryPickerVisible.value = false;
  await loadCategoryOptions(level);
};

const handleCategoryClear = () => {
  queryForm.categoryIds = [];
};

const isCategorySelected = (item: CategoryCheckTreeOption, columnIndex: number) => {
  const selectedSet = new Set(normalizedSelectedCategoryIds.value);
  const values = isTargetCategoryLevel(item, columnIndex) ? [String(item.value)] : collectTargetCategoryValues(item.children || [], columnIndex + 2);
  return values.length > 0 && values.every((value) => selectedSet.has(value));
};

const resolveCategoryColumnLevel = (item: CategoryCheckTreeOption, columnIndex: number) => Number(item.level || columnIndex + 1);

const isTargetCategoryLevel = (item: CategoryCheckTreeOption, columnIndex: number) =>
  resolveCategoryColumnLevel(item, columnIndex) === targetCategoryLevel.value || columnIndex === categoryPickerColumnCount.value - 1;

const hasNextCategoryColumn = (item: CategoryCheckTreeOption, columnIndex: number) =>
  columnIndex < categoryPickerColumnCount.value - 1 && Boolean(item.children?.length);

const setActiveCategoryPath = (columnIndex: number, item: CategoryCheckTreeOption) => {
  const nextPath = activeCategoryPath.value.slice(0, columnIndex);
  nextPath[columnIndex] = String(item.value);
  activeCategoryPath.value = nextPath;
  ensureActiveCategoryPath();
};

const isCategoryColumnActive = (item: CategoryCheckTreeOption, columnIndex: number) => {
  if (isTargetCategoryLevel(item, columnIndex)) return isCategorySelected(item, columnIndex);
  return activeCategoryPath.value[columnIndex] === String(item.value);
};

const handleCategoryOptionClick = (item: CategoryCheckTreeOption, columnIndex: number) => {
  setActiveCategoryPath(columnIndex, item);
  if (isTargetCategoryLevel(item, columnIndex)) {
    toggleCategoryValues([item.value]);
  }
};

const handleCategoryCheckClick = (item: CategoryCheckTreeOption, columnIndex: number) => {
  setActiveCategoryPath(columnIndex, item);
  const values = isTargetCategoryLevel(item, columnIndex) ? [item.value] : collectTargetCategoryValues(item.children || [], columnIndex + 2);
  toggleCategoryValues(values);
};

const toggleCategoryValues = (values: Array<string | number>) => {
  const normalizedValues = values.map((item) => String(item)).filter((item) => targetCategoryValueSet.value.has(item));
  if (!normalizedValues.length) return;
  const current = new Set(normalizedSelectedCategoryIds.value);
  const shouldUncheck = normalizedValues.every((item) => current.has(item));
  if (shouldUncheck) {
    normalizedValues.forEach((item) => current.delete(item));
    queryForm.categoryIds = Array.from(current);
    return;
  }
  normalizedValues.forEach((item) => current.add(item));
  queryForm.categoryIds = Array.from(current);
};

const renderRoleChart = (data: CategoryCheckRoleVO) => {
  if (!roleChartRef.value) return;
  if (!roleChartIns.value) {
    roleChartIns.value = echarts.init(roleChartRef.value);
    roleChartIns.value.on('click', (params: any) => {
      const row = params.data?.rawData;
      if (row?.categoryId) {
        router.push({
          path: '/category/diagnosis',
          query: {
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            categoryLevel: queryForm.categoryLevel || 1,
            storeNo: queryForm.storeScope || '0',
            startDate: currentDateRange.value?.[0] || '',
            endDate: currentDateRange.value?.[1] || '',
            compareStartDate: compareDateRange.value?.[0] || '',
            compareEndDate: compareDateRange.value?.[1] || ''
          }
        });
      }
    });
  }

  const list = data.list || [];
  const xThreshold = data.splitLineX ?? 10;
  const yThreshold = data.splitLineY ?? 10;
  const resolveRoleMatchColor = (status?: string) => ROLE_MATCH_SERIES.find((item) => item.key === status)?.color || ROLE_MATCH_SERIES[2].color;
  const formatCategoryBubbleLabel = (item: any) => {
    const code = String(item.categoryCode || '').trim();
    const name = String(item.categoryName || '').trim();
    if (code && name) return `{code|${code}}\n{name|${name}}`;
    return code || name || '';
  };
  const points = list.map((item) => ({
    value: [item.contributionRate, item.growthRate, item.skuCount],
    rawData: item,
    labelText: formatCategoryBubbleLabel(item),
    itemStyle: {
      color: resolveRoleMatchColor(item.roleMatchStatus)
    },
    symbolSize: Math.max(46, Math.min(62, Math.sqrt(Math.max(item.skuCount, 1)) / 2)),
    name: `${item.categoryCode} ${item.categoryName}`
  }));
  const bubbleLabelOption = {
    show: true,
    formatter: (params: any) => params.data?.labelText || '',
    position: 'inside',
    align: 'center',
    verticalAlign: 'middle',
    rich: {
      code: {
        fontSize: 14,
        fontWeight: 500,
        color: '#111827',
        lineHeight: 15
      },
      name: {
        fontSize: 13,
        fontWeight: 500,
        color: '#111827',
        lineHeight: 15
      }
    }
  };

  roleChartIns.value.setOption({
    color: ROLE_MATCH_SERIES.map((item) => item.color),
    legend: {
      top: 6,
      data: ROLE_MATCH_SERIES.map((item) => ({
        name: item.name,
        itemStyle: { color: item.color }
      }))
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const row = params.data?.rawData || {};
        return [
          `${row.categoryCode || ''} ${row.categoryName || ''}`,
          `设定角色：${row.presetRoleName || '--'}`,
          `测算角色：${row.evaluatedRoleName || row.roleName || '--'}`,
          `销售对比增长率：${row.growthRate ?? 0}%`,
          `综合贡献率：${row.contributionRate ?? 0}%`,
          `SKU数：${row.skuCount ?? 0}`,
          `销售额：${row.salesAmount ?? '--'}`
        ].join('<br/>');
      }
    },
    grid: { left: 64, right: 24, top: 48, bottom: 42 },
    xAxis: {
      type: 'value',
      name: '综合贡献率%',
      axisLabel: { formatter: '{value}%' },
      splitLine: { show: true, lineStyle: { color: '#EEF1F6' } }
    },
    yAxis: {
      type: 'value',
      name: '销售对比增长率%',
      axisLabel: { formatter: '{value}%' },
      splitLine: { show: true, lineStyle: { color: '#EEF1F6' } }
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        moveOnMouseWheel: true,
        zoomOnMouseWheel: true
      }
    ],
    graphic: [
      {
        type: 'line',
        shape: { x1: 0, y1: 0, x2: 0, y2: 0 }
      }
    ],
    series: [
      ...ROLE_MATCH_SERIES.map((item) => ({
        name: item.name,
        type: 'scatter',
        label: bubbleLabelOption,
        itemStyle: { color: item.color },
        data: points.filter((point: any) => point.rawData.roleMatchStatus === item.key)
      })),
      {
        type: 'line',
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          lineStyle: { color: '#111827', width: 1.1 },
          data: [{ xAxis: xThreshold }, { yAxis: yThreshold }]
        }
      }
    ]
  });
};

const hideSkuTooltip = () => {
  skuTooltip.visible = false;
  skuHover.visible = false;
};

const formatSkuPercent = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? `${num.toFixed(2)}%` : '--';
};

const formatSkuInteger = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toLocaleString('zh-CN') : '--';
};

const formatWanYuan = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? `${(num / 10000).toFixed(2)}万元` : '--';
};

const hideSalesTooltip = () => {
  salesTooltip.visible = false;
  salesHover.visible = false;
};

const handleSalesTooltipMousemove = (event: MouseEvent) => {
  const rows = salesChartRows.value;
  if (!rows.length) {
    hideSalesTooltip();
    return;
  }

  const wrap = event.currentTarget as HTMLElement;
  const rect = wrap.getBoundingClientRect();
  const gridLeft = 120;
  const gridRight = 24;
  const gridTop = 40;
  const gridBottom = 30;
  const plotLeft = rect.left + gridLeft;
  const plotTop = rect.top + gridTop;
  const plotWidth = rect.width - gridLeft - gridRight;
  const plotHeight = rect.height - gridTop - gridBottom;
  const relativeX = event.clientX - plotLeft;
  const relativeY = event.clientY - plotTop;

  if (relativeX < 0 || relativeX > plotWidth || relativeY < 0 || relativeY > plotHeight || plotHeight <= 0) {
    hideSalesTooltip();
    return;
  }

  const step = plotHeight / Math.max(1, rows.length);
  const index = Math.max(0, Math.min(rows.length - 1, Math.floor(relativeY / step)));
  const row = rows[index];
  if (!row) {
    hideSalesTooltip();
    return;
  }

  salesHover.visible = true;
  salesHover.left = gridLeft;
  salesHover.top = gridTop + index * step;
  salesHover.width = plotWidth;
  salesHover.height = step;

  const tooltipWidth = 280;
  const tooltipHeight = 126;
  salesTooltip.visible = true;
  salesTooltip.title = `${row.categoryId} ${row.categoryName}`;
  salesTooltip.salesAmount = formatWanYuan(row.salesAmount);
  salesTooltip.compareSalesAmount = formatWanYuan(row.compareSalesAmount);
  salesTooltip.growthRate = `${Number(row.growthRate ?? 0).toFixed(2)}%`;
  salesTooltip.x = Math.min(Math.max(12, event.clientX - rect.left + 14), Math.max(12, rect.width - tooltipWidth - 12));
  salesTooltip.y = Math.min(Math.max(12, event.clientY - rect.top - 56), Math.max(12, rect.height - tooltipHeight - 12));
};

const handleSkuTooltipMousemove = (event: MouseEvent, chartType: 'ratio' | 'count') => {
  const rows = skuChartRows.value;
  if (!rows.length) {
    hideSkuTooltip();
    return;
  }
  const wrap = event.currentTarget as HTMLElement;
  const rect = wrap.getBoundingClientRect();
  const card = wrap.closest('.sku-card') as HTMLElement | null;
  const cardRect = card?.getBoundingClientRect() ?? rect;
  const gridLeft = 52;
  const gridRight = 52;
  const gridTop = 40;
  const gridBottom = 52;
  const plotLeft = rect.left + gridLeft;
  const plotTop = rect.top + gridTop;
  const plotWidth = rect.width - gridLeft - gridRight;
  const plotHeight = rect.height - gridTop - gridBottom;
  const relativeX = event.clientX - plotLeft;
  const relativeY = event.clientY - plotTop;

  if (relativeX < 0 || relativeX > plotWidth || relativeY < 0 || relativeY > plotHeight || plotWidth <= 0) {
    hideSkuTooltip();
    return;
  }

  const step = plotWidth / Math.max(1, rows.length);
  const index = Math.max(0, Math.min(rows.length - 1, Math.floor(relativeX / step)));
  const row = rows[index];
  if (!row) {
    hideSkuTooltip();
    return;
  }

  skuHover.visible = true;
  skuHover.chartType = chartType;
  skuHover.left = gridLeft + index * step;
  skuHover.top = gridTop;
  skuHover.width = step;
  skuHover.height = plotHeight;

  skuTooltip.visible = true;
  skuTooltip.title = `${row.categoryId ? `${row.categoryId} ` : ''}${row.categoryName || '--'}`;
  skuTooltip.rows =
    chartType === 'ratio'
      ? [
          { name: '本期SKU构成比', value: formatSkuPercent(row.skuRatio), color: '#f97316' },
          { name: '本期销售额构成比', value: formatSkuPercent(row.salesRatio), color: '#F56C6C' },
          { name: '构成比差值', value: formatSkuPercent(row.ratioDiff), color: '#F4A261' }
        ]
      : [
          { name: '当前SKU数', value: formatSkuInteger(row.currentSkuCount), color: '#f97316' },
          { name: '预设SKU数', value: formatSkuInteger(row.presetSkuCount), color: '#F56C6C' },
          { name: 'SKU差值', value: formatSkuInteger(row.skuDiff), color: '#F4A261' }
        ];

  const tooltipWidth = 260;
  const tooltipHeight = 132;
  skuTooltip.x = Math.min(Math.max(12, event.clientX - cardRect.left + 14), Math.max(12, cardRect.width - tooltipWidth - 12));
  skuTooltip.y = Math.min(Math.max(12, event.clientY - cardRect.top - 64), Math.max(12, cardRect.height - tooltipHeight - 12));
};

const renderSkuCharts = (data: CategoryCheckSkuVO) => {
  const list = data.list || [];
  skuChartRows.value = list;
  const names = list.map((item) => item.categoryName);
  const skuRatio = list.map((item) => item.skuRatio);
  const salesRatio = list.map((item) => item.salesRatio);
  const ratioDiff = list.map((item) => item.ratioDiff);
  const currentSku = list.map((item) => item.currentSkuCount);
  const presetSku = list.map((item) => item.presetSkuCount);
  const skuDiff = list.map((item) => item.skuDiff);

  if (!skuRatioChartIns.value && skuRatioChartRef.value) {
    skuRatioChartIns.value = echarts.init(skuRatioChartRef.value);
  }
  if (!skuCountChartIns.value && skuCountChartRef.value) {
    skuCountChartIns.value = echarts.init(skuCountChartRef.value);
  }
  if (!skuRatioChartIns.value || !skuCountChartIns.value) return;

  const zoomCfg = [
    {
      type: 'inside',
      xAxisIndex: 0,
      zoomOnMouseWheel: true,
      moveOnMouseWheel: true
    }
  ];
  skuRatioChartIns.value.setOption({
    tooltip: { show: false },
    legend: { top: 8, data: ['本期SKU构成比', '本期销售额构成比', '构成比差值'] },
    grid: { left: 52, right: 52, top: 40, bottom: 52 },
    xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: 30 } },
    yAxis: [
      { type: 'value', name: '构成比%', axisLabel: { formatter: '{value}%' }, min: 0, max: 60 },
      { type: 'value', name: '构成比差值%', axisLabel: { formatter: '{value}%' }, min: -40, max: 30 }
    ],
    dataZoom: zoomCfg,
    series: [
      { name: '本期SKU构成比', type: 'bar', data: skuRatio, itemStyle: { color: '#f97316' } },
      { name: '本期销售额构成比', type: 'bar', data: salesRatio, itemStyle: { color: '#F56C6C' } },
      { name: '构成比差值', type: 'line', yAxisIndex: 1, data: ratioDiff, itemStyle: { color: '#F4A261' } }
    ]
  });

  skuCountChartIns.value.setOption({
    tooltip: { show: false },
    legend: { top: 8, data: ['当前SKU数', '预设SKU数', 'SKU差值'] },
    grid: { left: 52, right: 52, top: 40, bottom: 52 },
    xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: 30 } },
    yAxis: [
      { type: 'value', name: 'SKU数', min: 0 },
      { type: 'value', name: 'SKU差值' }
    ],
    dataZoom: zoomCfg,
    series: [
      { name: '当前SKU数', type: 'bar', data: currentSku, itemStyle: { color: '#f97316' } },
      { name: '预设SKU数', type: 'bar', data: presetSku, itemStyle: { color: '#F56C6C' } },
      { name: 'SKU差值', type: 'line', yAxisIndex: 1, data: skuDiff, itemStyle: { color: '#F4A261' } }
    ]
  });
};

const renderSalesChart = (data: CategoryCheckSalesVO) => {
  if (!salesChartRef.value) return;
  if (!salesChartIns.value) {
    salesChartIns.value = echarts.init(salesChartRef.value);
  }
  const rows = data.rows || [];
  const sorted = [...rows].sort((a, b) => b.growthRate - a.growthRate);
  salesChartRows.value = sorted;
  const names = sorted.map((item) => `${item.categoryId} ${item.categoryName}`);
  const growthRates = sorted.map((item) => item.growthRate);

  salesChartIns.value.setOption({
    tooltip: { show: false },
    legend: { top: 8, data: ['对比增长率'] },
    grid: { left: 120, right: 24, top: 40, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    yAxis: { type: 'category', data: names, inverse: true },
    series: [
      {
        name: '对比增长率',
        type: 'bar',
        data: growthRates,
        itemStyle: { color: '#ff7e18' }
      }
    ]
  });
};

const loadAlert = async () => {
  const res = await alertRequest.run(buildQuery());
  Object.assign(alertData, res?.data || {});
};

const loadRole = async () => {
  const res = await roleRequest.run(buildQuery());
  renderRoleChart(res?.data || { list: [] });
};

const loadSku = async () => {
  const res = await skuRequest.run(buildQuery());
  renderSkuCharts(res?.data || { list: [] });
};

const loadSales = async () => {
  const params: CategoryCheckSalesQuery = {
    ...buildQuery(),
    pageNum: salesPage.pageNum,
    pageSize: salesPage.pageSize
  };
  const res = await salesRequest.run(params);
  const data = res?.data || { rows: [], total: 0, pageNum: 1, pageSize: salesPage.pageSize };
  salesPage.total = data.total || 0;
  renderSalesChart(data);
};

const loadAll = async () => {
  await Promise.all([loadAlert(), loadRole(), loadSku(), loadSales()]);
};

const handleSearch = async () => {
  salesPage.pageNum = 1;
  await loadAll();
};

const handleReset = async () => {
  const defaultStore = filterOptions.storeOptions.find((item) => item.label === '全店') || filterOptions.storeOptions[0];
  const defaultLevel = filterOptions.levelOptions.find((item) => String(item.label).includes('一级')) || filterOptions.levelOptions[0];
  queryForm.storeScope = defaultStore?.value || '';
  queryForm.categoryLevel = defaultLevel?.value || '';
  currentDateRange.value = [...DEFAULT_CURRENT_DATE_RANGE];
  compareDateRange.value = [...DEFAULT_COMPARE_DATE_RANGE];
  salesPage.pageNum = 1;
  if (queryForm.categoryLevel) {
    await loadCategoryOptions(queryForm.categoryLevel);
  }
  await loadAll();
};

const handleSalesPageChange = async (pageNum: number) => {
  salesPage.pageNum = pageNum;
  await loadSales();
};

const goRoleStrategy = () => {
  roleStrategyDialogVisible.value = true;
};

const buildDetailQuery = (type: string) => {
  const query = buildQuery();
  const isAllSelected = isAllCategorySelected.value || !query.categoryIds?.length;
  const detailQuery: Record<string, any> = {
    sourceModule: type,
    storeNo: query.storeScope || '0',
    classLevel: query.categoryLevel || 1,
    currentStartDate: query.currentStartDate,
    currentEndDate: query.currentEndDate,
    compareStartDate: query.compareStartDate,
    compareEndDate: query.compareEndDate
  };

  if (!isAllSelected) {
    detailQuery.classNo = query.categoryIds?.map((item) => String(item));
  }

  return detailQuery;
};

const goDetail = (type: string) => {
  router.push({
    path: '/category/check/detail',
    query: buildDetailQuery(type)
  });
};

const goAlertDetail = (alertType: 'role' | 'skuStructure' | 'skuPreset') => {
  const sourceModule = alertType === 'role' ? 'role' : 'sku';
  router.push({
    path: '/category/check/detail',
    query: {
      ...buildDetailQuery(sourceModule),
      alertType
    }
  });
};

const resizeCharts = () => {
  roleChartIns.value?.resize();
  skuRatioChartIns.value?.resize();
  skuCountChartIns.value?.resize();
  salesChartIns.value?.resize();
};

onMounted(async () => {
  await initFilter();
  await loadAll();
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  roleChartIns.value?.dispose();
  skuRatioChartIns.value?.dispose();
  skuCountChartIns.value?.dispose();
  salesChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.category-check-page {
  background: transparent;
}

.filter-header {
  display: flex;
  justify-content: flex-end;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

.filter-form-wrap {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.category-picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 300px;
  min-height: 38px;
  padding: 4px 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 7px;
  background: #ffffff;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.category-picker-trigger.is-open {
  border-color: #f97316;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.12);
}

.category-picker-trigger.is-loading {
  cursor: wait;
  opacity: 0.72;
}

.category-picker-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  max-width: 170px;
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
}

.category-tag.count {
  max-width: none;
  color: #6b7280;
  font-weight: 600;
}

.category-tag-close {
  margin-left: 8px;
  color: #9ca3af;
  font-size: 18px;
  line-height: 1;
}

.category-picker-arrow {
  color: #9ca3af;
  transition: transform 0.18s ease;
}

.category-picker-arrow.is-open {
  transform: rotate(180deg);
}

:global(.category-picker-popper) {
  padding: 0 !important;
  border: 1px solid #d8dee8 !important;
  border-radius: 8px !important;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12) !important;
}

.category-picker-panel {
  display: grid;
  min-width: 300px;
  max-height: 320px;
  overflow: hidden;
  background: #ffffff;
}

.category-column {
  max-height: 320px;
  padding: 12px 0;
  overflow-y: auto;
}

.category-column:not(:last-child) {
  border-right: 1px solid #e5e7eb;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 22px;
  color: #5f6368;
  font-size: 16px;
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.category-option:hover,
.category-option.active {
  background: #f7f8fa;
  color: #1fa77a;
  font-weight: 700;
}

.category-option.child {
  color: #1fa77a;
  font-weight: 700;
}

.category-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid #d8dee8;
  border-radius: 3px;
  background: #ffffff;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
}

.category-option.active .category-check,
.category-check.checked {
  border-color: #2aa879;
  background: #2aa879;
}

.category-option-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-option-arrow {
  color: #2aa879;
  font-size: 26px;
  line-height: 1;
}

.alert-card {
  background: #fff2f2;
  border-color: #f9d4d4;
}

.alert-title {
  color: #b42318;
  font-size: 18px;
  font-weight: 700;
}

.alert-line {
  display: block;
  width: 100%;
  padding: 4px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #7a271a;
  text-align: left;
  line-height: 1.85;
  font-size: 14px;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.alert-link {
  cursor: pointer;
}

.alert-link:hover,
.alert-link:focus-visible {
  background: rgba(249, 115, 22, 0.1);
  color: #b42318;
  outline: none;
}

.alert-num {
  color: #d92d20;
  font-size: 18px;
  font-weight: 700;
  padding: 0 2px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.module-title {
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.glossary-icon {
  margin-left: 4px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
}

.module-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.chart-box {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.chart-inner {
  width: 100%;
  height: 100%;
}

.sku-card {
  position: relative;
}

.sku-tooltip-wrap {
  position: relative;
}

.sku-hover-band {
  position: absolute;
  z-index: 1;
  border-radius: 3px;
  background: linear-gradient(180deg, rgba(255, 126, 24, 0.13), rgba(255, 126, 24, 0.05));
  pointer-events: none;
}

.sku-tooltip-wrap .chart-inner {
  position: relative;
  z-index: 2;
}

.sku-chart-tooltip {
  position: absolute;
  z-index: 40;
  width: 260px;
  padding: 12px 14px;
  border: 1px solid rgba(226, 232, 240, 0.96);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
  color: #6b7280;
  font-size: 14px;
  line-height: 1.65;
  pointer-events: none;
}

.sku-chart-tooltip-title {
  margin-bottom: 6px;
  color: #6b7280;
  font-size: 15px;
  font-weight: 700;
}

.sku-chart-tooltip-row {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.sku-chart-tooltip-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.sku-chart-tooltip-name {
  color: #6b7280;
}

.sku-chart-tooltip-row strong {
  margin-left: auto;
  color: #6b7280;
  font-weight: 700;
}

.sales-no-wheel {
  position: relative;
  overflow: hidden;
}

.sales-tooltip-wrap .chart-inner {
  position: relative;
  z-index: 2;
}

.sales-hover-band {
  position: absolute;
  z-index: 1;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(255, 126, 24, 0.13), rgba(255, 126, 24, 0.05));
  pointer-events: none;
}

.sales-chart-tooltip {
  position: absolute;
  z-index: 40;
  width: 280px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 126, 24, 0.55);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 12px 28px rgba(124, 45, 18, 0.16);
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
  pointer-events: none;
}

.sales-chart-tooltip-title {
  margin-bottom: 4px;
  color: #6b7280;
  font-size: 15px;
  font-weight: 700;
}

.sales-chart-tooltip-row {
  white-space: nowrap;
}

.role-strategy-dialog {
  max-height: 68vh;
  overflow-y: auto;
  line-height: 1.8;
  color: var(--el-text-color-primary);
}

.role-strategy-image {
  display: block;
  width: 100%;
  height: auto;
  margin-top: 8px;
}

@media (max-width: 992px) {
  .module-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
