<template>
  <div class="tag-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">标签分析</span>
            <el-button link type="primary" class="detail-link" @click="handleDetail">详情 &gt;</el-button>
          </div>
        </div>
        <div class="page-actions">
          <span class="unit-text">数据来源：静态标签 Excel</span>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card tab-card">
      <div class="source-line">
        <span class="source-label">当前标签范围</span>
        <el-tag v-for="item in activeCategoryNames" :key="item" size="small" effect="plain">{{ item }}</el-tag>
      </div>
      <div class="tag-tabs">
        <el-button
          v-for="item in tabItems"
          :key="item.value"
          :type="activeTagType === item.value ? 'primary' : 'default'"
          :plain="activeTagType !== item.value"
          class="tag-tab-btn"
          @click="handleTabChange(item.value)"
        >
          {{ item.label }}
        </el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card cloud-card" v-loading="cloudLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">本期各标签覆盖贡献</span>
          <span class="card-subtitle">按 Excel 商品标签覆盖 SKU 数计算</span>
        </div>
      </template>
      <div class="cloud-wrap">
        <div v-if="cloudWords.length" class="cloud-stage">
          <el-tooltip
            v-for="item in cloudWords"
            :key="item.key"
            placement="top"
            raw-content
            :content="item.tooltip"
          >
            <span class="cloud-word" :style="item.style">{{ item.name }}</span>
          </el-tooltip>
        </div>
        <div v-else class="cloud-empty">暂无标签分析数据</div>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card detail-card" v-loading="detailLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">标签明细</span>
        </div>
      </template>
      <el-table :data="detailRows" border stripe empty-text="暂无标签明细数据">
        <el-table-column label="标签名称" prop="tagName" min-width="180" />
        <el-table-column label="覆盖SKU数" prop="sku" min-width="120" align="right">
          <template #default="{ row }">{{ formatAmount(row.sku, 0) }}</template>
        </el-table-column>
        <el-table-column label="覆盖占比" prop="skuPer" min-width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.skuPer) }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="hover" class="page-card summary-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">总结与建议</span>
        </div>
      </template>
      <ul class="summary-list">
        <li v-for="item in summaryItems" :key="item">{{ item }}</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup name="TagAnalysis" lang="ts">
import type { TagDetailItemResponse, TagSalesSkuItemResponse, TagTypeGroupResponse } from '@/api/category/diagnosis/detail/types';
import { STATIC_TAG_ANALYSIS_DATA, STATIC_TAG_CATEGORY_ALIASES, type StaticTagMetric } from './data/staticTagAnalysisData';

interface CloudWordItem {
  key: string;
  name: string;
  tooltip: string;
  style: Record<string, string>;
}

const handleDetail = () => {
  ElMessage.info('当前为静态标签分析，明细已在下方表格展示');
};

const tabGroups = ref<TagTypeGroupResponse[]>([]);
const activeTagType = ref('');
const cloudWords = ref<CloudWordItem[]>([]);
const detailRows = ref<TagDetailItemResponse[]>([]);
const cloudLoading = ref(false);
const detailLoading = ref(false);

const route = useRoute();
const colorPool = ['#f97316', '#fb923c', '#f59e0b', '#ea580c', '#fdba74', '#c2410c', '#fbbf24'];

const tabItems = computed(() =>
  tabGroups.value
    .filter((item) => Boolean(item?.tagType))
    .map((item) => ({
      label: item.tagTypeName || item.tagType || '-',
      value: item.tagType || ''
    }))
);

const activeCategoryNames = computed(() => resolveCategoryNames(String(route.query.categoryName || '')));

const summaryItems = computed(() => {
  if (!detailRows.value.length) {
    return ['当前标签范围暂无可分析数据，请检查 Excel 标签字段或品类映射。'];
  }
  const topTags = detailRows.value.slice(0, 5).map((item) => item.tagName).filter(Boolean);
  const weakTags = detailRows.value.slice(-5).reverse().map((item) => item.tagName).filter(Boolean);
  return [
    `标签为 ${topTags.join('、')} 的商品覆盖 SKU 数较高，可作为当前品类的主推卖点或筛选维度。`,
    `标签为 ${weakTags.join('、')} 的商品覆盖 SKU 数较低，建议结合真实销售额判断是否需要补充商品或弱化该标签。`
  ];
});

const resolveCategoryNames = (categoryName: string) => {
  const sourceNames = Object.keys(STATIC_TAG_ANALYSIS_DATA);
  const normalized = categoryName.trim();
  if (normalized) {
    const aliasKey = Object.keys(STATIC_TAG_CATEGORY_ALIASES).find((key) => normalized.includes(key));
    if (aliasKey) return STATIC_TAG_CATEGORY_ALIASES[aliasKey].filter((item) => sourceNames.includes(item));

    const direct = sourceNames.find((item) => normalized.includes(item));
    if (direct) return [direct];
  }
  return ['洗护', '家清'];
};

const normalizeStaticRows = (rows: StaticTagMetric[]) => {
  const totalSku = rows.reduce((sum, item) => sum + Number(item.sku || 0), 0) || 1;
  return rows
    .map((item) => ({
      tagName: item.tagName,
      sku: item.sku,
      skuPer: (Number(item.sku || 0) / totalSku) * 100,
      sales: item.sku,
      salesPer: (Number(item.sku || 0) / totalSku) * 100
    }))
    .sort((a, b) => Number(b.sku || 0) - Number(a.sku || 0));
};

const mergeStaticRows = (categoryNames: string[], tagType: string) => {
  const rowMap = new Map<string, StaticTagMetric>();
  categoryNames.forEach((categoryName) => {
    const rows = STATIC_TAG_ANALYSIS_DATA[categoryName]?.[tagType] || [];
    rows.forEach((item) => {
      const key = item.tagName.trim();
      if (!key) return;
      const current = rowMap.get(key);
      rowMap.set(key, {
        tagName: key,
        sku: Number(current?.sku || 0) + Number(item.sku || 0)
      });
    });
  });
  return normalizeStaticRows([...rowMap.values()]);
};

const getAvailableTagTypes = (categoryNames: string[]) => {
  const typeSet = new Set<string>();
  categoryNames.forEach((categoryName) => {
    Object.keys(STATIC_TAG_ANALYSIS_DATA[categoryName] || {}).forEach((tagType) => typeSet.add(tagType));
  });
  return [...typeSet].map((tagType) => ({
    tagType,
    tagTypeName: tagType
  }));
};

const cloudSlots = [
  [50, 48],
  [31, 36],
  [69, 37],
  [18, 54],
  [82, 54],
  [43, 24],
  [58, 25],
  [36, 64],
  [64, 64],
  [22, 28],
  [78, 28],
  [13, 40],
  [88, 41],
  [49, 73],
  [27, 76],
  [73, 76],
  [10, 66],
  [91, 66],
  [38, 12],
  [62, 12],
  [16, 16],
  [84, 16],
  [50, 88],
  [30, 90],
  [70, 90],
  [7, 24],
  [94, 24],
  [7, 82],
  [94, 82],
  [24, 10],
  [76, 10],
  [41, 84],
  [59, 84],
  [4, 50],
  [96, 50],
  [50, 8]
] as const;

const buildCloudWords = (items: TagSalesSkuItemResponse[]) => {
  const sorted = [...items].sort((a, b) => Number(b.sku || 0) - Number(a.sku || 0)).slice(0, cloudSlots.length);
  const maxSku = Math.max(...sorted.map((item) => Number(item.sku || 0)), 1);
  return sorted.map((item, index) => {
    const sku = Number(item.sku || 0);
    const weight = sku / maxSku;
    const size = 13 + weight * 20;
    const [x, y] = cloudSlots[index];
    const color = colorPool[index % colorPool.length];
    return {
      key: `${item.tagName || 'tag'}-${index}`,
      name: item.tagName || '-',
      tooltip: `标签名称：${item.tagName || '-'}<br/>覆盖SKU数：${formatAmount(sku, 0)}<br/>覆盖占比：${formatPercent(item.skuPer)}`,
      style: {
        left: `${x}%`,
        top: `${y}%`,
        fontSize: `${size.toFixed(0)}px`,
        color,
        transform: 'translate(-50%, -50%) rotate(0deg)',
        zIndex: `${100 - index}`,
        maxWidth: '210px'
      }
    };
  });
};

const formatAmount = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

const formatPercent = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return `${num.toFixed(2)}%`;
};

const loadStaticTagAnalysis = () => {
  cloudLoading.value = true;
  detailLoading.value = true;
  try {
    tabGroups.value = getAvailableTagTypes(activeCategoryNames.value);
    if (!tabGroups.value.some((item) => item.tagType === activeTagType.value)) {
      activeTagType.value = tabGroups.value[0]?.tagType || '';
    }
    const rows = activeTagType.value ? mergeStaticRows(activeCategoryNames.value, activeTagType.value) : [];
    detailRows.value = rows;
    cloudWords.value = buildCloudWords(rows as TagSalesSkuItemResponse[]);
  } finally {
    cloudLoading.value = false;
    detailLoading.value = false;
  }
};

const handleTabChange = (tagType: string) => {
  if (activeTagType.value === tagType) return;
  activeTagType.value = tagType;
  loadStaticTagAnalysis();
};

onMounted(() => {
  loadStaticTagAnalysis();
});

watch(
  () => route.query.categoryName,
  () => {
    activeTagType.value = '';
    loadStaticTagAnalysis();
  }
);
</script>

<style scoped lang="scss">
.tag-analysis-page {
  background: #f5f7fa;
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.header-card,
.tab-card,
.cloud-card,
.detail-card,
.summary-card {
  margin-bottom: 12px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
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
  color: #0f172a;
}

.detail-link {
  padding-left: 0;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-text {
  color: #64748b;
  font-size: 13px;
}

.tag-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.source-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.source-label {
  color: #64748b;
  font-size: 13px;
}

.tag-tab-btn {
  min-width: 82px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.card-subtitle {
  font-size: 12px;
  color: #94a3b8;
}

.cloud-wrap {
  width: 100%;
  overflow: hidden;
}

.cloud-empty {
  height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.72) 0%, rgba(255, 255, 255, 1) 100%);
  color: #94a3b8;
  font-size: 14px;
}

.cloud-stage {
  position: relative;
  width: 100%;
  min-height: 520px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.72) 0%, rgba(255, 255, 255, 1) 100%);
  border-radius: 16px;
  overflow: hidden;
}

.cloud-word {
  position: absolute;
  display: inline-block;
  white-space: normal;
  text-align: center;
  line-height: 1.18;
  font-weight: 600;
  cursor: default;
  user-select: none;
  overflow-wrap: anywhere;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.85);
}

.summary-card {
  background: #fff;
}

.summary-list {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  line-height: 1.9;
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
  }

  .page-actions {
    flex-wrap: wrap;
  }

  .cloud-stage {
    min-height: 460px;
  }

  .cloud-empty {
    height: 420px;
  }
}
</style>
