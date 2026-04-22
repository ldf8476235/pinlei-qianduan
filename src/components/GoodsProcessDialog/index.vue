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

    <div class="dialog-tip">选中商品的销售门店需按照以下要求进行处理!</div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="dialog-form"
      status-icon
    >
      <el-form-item label="处理方案" prop="plan" required>
        <el-select v-model="form.plan" placeholder="请选择" clearable class="full-width">
          <el-option label="下架淘汰" value="remove" />
          <el-option label="观察调整" value="observe" />
          <el-option label="保留跟踪" value="retain" />
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
import type { FormInstance, FormRules } from 'element-plus';
import { Close } from '@element-plus/icons-vue';

interface GoodsProcessForm {
  plan: string;
  finishDate: string;
}

const props = defineProps<{
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
  const valid = await validateForm();
  if (!valid) return;
  emit('save', { ...form });
};

const handleDispatch = async () => {
  const valid = await validateForm();
  if (!valid) return;
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
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
}

.goods-process-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 18px 20px 0;
}

.goods-process-dialog :deep(.el-dialog__body) {
  padding: 14px 20px 8px;
}

.goods-process-dialog :deep(.el-dialog__footer) {
  padding: 8px 20px 20px;
}

.goods-process-dialog :deep(.el-overlay-dialog) {
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dialog-title {
  color: #111827;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.dialog-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.dialog-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.dialog-close:active {
  transform: scale(0.96);
}

.dialog-tip {
  margin-bottom: 18px;
  color: #0f9f9a;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
}

.dialog-form {
  padding-top: 2px;
}

.dialog-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.dialog-form :deep(.el-form-item__label) {
  color: #111827;
  font-weight: 600;
}

.full-width {
  width: 100%;
}

.dialog-form :deep(.el-input__wrapper),
.dialog-form :deep(.el-select__wrapper),
.dialog-form :deep(.el-date-editor.el-input__wrapper) {
  min-height: 42px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #d1d5db inset;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.dialog-form :deep(.el-input__wrapper:hover),
.dialog-form :deep(.el-select__wrapper:hover),
.dialog-form :deep(.el-date-editor.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #9ca3af inset;
}

.dialog-form :deep(.is-focus .el-input__wrapper),
.dialog-form :deep(.is-focused.el-select__wrapper),
.dialog-form :deep(.el-date-editor.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(15, 159, 154, 0.2), 0 0 0 1px #0f9f9a inset;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  min-width: 84px;
  border-color: #d1d5db;
  color: #111827;
}

.dark-btn {
  min-width: 84px;
  border-color: #374151;
  background: #374151;
  color: #fff;
}

.dark-btn:hover,
.dark-btn:focus-visible {
  border-color: #1f2937;
  background: #1f2937;
  color: #fff;
}

.dark-btn:active {
  border-color: #111827;
  background: #111827;
}
</style>
