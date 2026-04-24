<template>
  <el-dialog
    :model-value="modelValue"
    width="560px"
    append-to-body
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
    :z-index="4000"
    class="goods-process-dialog"
    @closed="handleClosed"
    @update:model-value="handleVisibleChange"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">商品处理</span>
        <button type="button" class="dialog-close" @click="closeDialog">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </template>

    <div class="dialog-tip">请选择商品处理方案后再提交。</div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="dialog-form" status-icon>
      <el-form-item label="处理方案" prop="plan" required>
        <el-select v-model="form.plan" placeholder="请选择" clearable class="full-width">
          <el-option label="上架" value="on_shelf" />
          <el-option label="下架" value="off_shelf" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>

      <el-form-item label="门店需完成日期" prop="finishDate" required>
        <el-date-picker
          v-model="form.finishDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          class="full-width"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button class="cancel-btn" @click="closeDialog">取消</el-button>
        <el-button class="dark-btn" @click="handleSave">暂存</el-button>
        <el-button class="dark-btn" @click="handleDispatch">下发</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';

interface GoodsProcessForm {
  plan: string;
  finishDate: string;
}

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', value: GoodsProcessForm): void;
  (e: 'dispatch', value: GoodsProcessForm): void;
  (e: 'close'): void;
}>();

const formRef = ref<FormInstance>();
const form = reactive<GoodsProcessForm>({
  plan: '',
  finishDate: ''
});

const rules: FormRules<GoodsProcessForm> = {
  plan: [{ required: true, message: '请选择处理方案', trigger: 'change' }],
  finishDate: [{ required: true, message: '请选择门店需完成日期', trigger: 'change' }]
};

const resetForm = () => {
  form.plan = '';
  form.finishDate = '';
  formRef.value?.clearValidate();
};

const closeDialog = () => {
  emit('update:modelValue', false);
};

const handleVisibleChange = (value: boolean) => {
  emit('update:modelValue', value);
};

const validateForm = async () => {
  if (!formRef.value) return false;
  try {
    await formRef.value.validate();
    return true;
  } catch {
    return false;
  }
};

const handleSave = async () => {
  if (!(await validateForm())) return;
  emit('save', { ...form });
};

const handleDispatch = async () => {
  if (!(await validateForm())) return;
  emit('dispatch', { ...form });
  emit('update:modelValue', false);
};

const handleClosed = () => {
  resetForm();
  emit('close');
};
</script>

<style scoped lang="scss">
.goods-process-dialog :deep(.el-dialog) {
  border-radius: 14px;
  background: #fff;
}

.goods-process-dialog :deep(.el-dialog__header),
.goods-process-dialog :deep(.el-dialog__body),
.goods-process-dialog :deep(.el-dialog__footer) {
  margin: 0;
}

.goods-process-dialog :deep(.el-dialog__header) {
  padding: 18px 20px 0;
}

.goods-process-dialog :deep(.el-dialog__body) {
  padding: 14px 20px 8px;
}

.goods-process-dialog :deep(.el-dialog__footer) {
  padding: 8px 20px 20px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
}

.dialog-close {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.dialog-tip {
  margin-bottom: 16px;
  color: #0f9f9a;
  font-weight: 600;
}

.full-width {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dark-btn {
  background: #374151;
  color: #fff;
}
</style>
