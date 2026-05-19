<template>
  <div class="login-page" :style="{ backgroundImage: `url(${loginBackground})` }">
    <div class="login-page__mask"></div>
    <section class="login-card" aria-labelledby="login-title">
      <div class="login-panel">
        <div class="login-panel__content">
          <header class="login-panel__header">
            <img class="login-panel__logo" :src="categoryLabLogo" alt="品类实验室" />
            <div class="login-panel__mode" aria-label="当前登录模式">
              <span class="login-panel__mode-item is-active">{{ proxy.$t('login.mode') }}</span>
            </div>
            <h1 id="login-title" class="login-panel__title">{{ proxy.$t('login.headline') }}</h1>
            <p v-if="tenantLoadFailed" class="login-panel__hint">{{ proxy.$t('login.tenantLoadFailed') }}</p>
            <p v-else-if="tenantLoading" class="login-panel__hint">{{ proxy.$t('login.tenantLoading') }}</p>
          </header>

          <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form" status-icon>
            <el-form-item v-if="showTenantSelect" prop="tenantId">
              <el-select
                v-model="loginForm.tenantId"
                filterable
                size="large"
                :placeholder="proxy.$t('login.selectPlaceholder')"
                :loading="tenantLoading"
              >
                <el-option v-for="item in tenantList" :key="item.tenantId" :label="item.companyName" :value="item.tenantId" />
                <template #prefix>
                  <svg-icon icon-class="company" class="login-form__icon" />
                </template>
              </el-select>
            </el-form-item>

            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                type="text"
                size="large"
                maxlength="64"
                autocomplete="username"
                :placeholder="proxy.$t('login.usernamePlaceholder')"
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <svg-icon icon-class="user" class="login-form__icon" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                size="large"
                maxlength="64"
                autocomplete="current-password"
                show-password
                :placeholder="proxy.$t('login.passwordPlaceholder')"
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <svg-icon icon-class="password" class="login-form__icon" />
                </template>
              </el-input>
            </el-form-item>

            <div class="login-form__meta">
              <el-checkbox v-model="loginForm.rememberMe">{{ proxy.$t('login.rememberPassword') }}</el-checkbox>
            </div>

            <el-button
              class="login-form__submit"
              :loading="loading"
              :disabled="loading"
              size="large"
              type="primary"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">{{ proxy.$t('login.login') }}</span>
              <span v-else>{{ proxy.$t('login.logging') }}</span>
            </el-button>
          </el-form>
        </div>
      </div>

      <aside class="login-visual" aria-hidden="true">
        <img class="login-visual__image" :src="categoryLabVisual" alt="品类罗盘展示图" />
        <p class="login-visual__slogan">{{ proxy.$t('login.visualSlogan') }}</p>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import categoryLabLogo from '@/assets/images/category-lab-logo.jpg';
import categoryLabVisual from '@/assets/images/category-lab-side-visual.jpg';
import loginBackground from '@/assets/images/category-lab-login-bg.jpg';
import { getTenantList } from '@/api/login';
import { LoginData, TenantVO } from '@/api/types';
import { useUserStore } from '@/store/modules/user';
import { to } from 'await-to-js';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const loginForm = ref<LoginData>({
  tenantId: '000000',
  username: 'admin',
  password: 'admin123',
  rememberMe: false,
  code: '',
  uuid: ''
} as LoginData);

const loginRules: ElFormRules = {
  tenantId: [{ required: true, trigger: 'change', message: proxy.$t('login.rule.tenantId.required') }],
  username: [{ required: true, trigger: 'blur', message: proxy.$t('login.rule.username.required') }],
  password: [{ required: true, trigger: 'blur', message: proxy.$t('login.rule.password.required') }]
};

const loading = ref(false);
const tenantLoading = ref(false);
const tenantLoadFailed = ref(false);
const tenantEnabled = ref(true);
const redirect = ref('/category/tree');
const loginRef = ref<ElFormInstance>();
const tenantList = ref<TenantVO[]>([]);

const showTenantSelect = computed(() => tenantEnabled.value && tenantList.value.length > 1);

watch(
  () => route.query.redirect,
  (value) => {
    redirect.value = typeof value === 'string' ? decodeURIComponent(value) : '/category/tree';
  },
  { immediate: true }
);

const syncRememberedAccount = () => {
  if (loginForm.value.rememberMe) {
    localStorage.setItem('tenantId', String(loginForm.value.tenantId ?? ''));
    localStorage.setItem('username', String(loginForm.value.username ?? ''));
    localStorage.setItem('password', String(loginForm.value.password ?? ''));
    localStorage.setItem('rememberMe', 'true');
    return;
  }

  localStorage.removeItem('tenantId');
  localStorage.removeItem('username');
  localStorage.removeItem('password');
  localStorage.removeItem('rememberMe');
};

const handleLogin = async () => {
  const valid = await loginRef.value?.validate().catch(() => false);
  if (!valid) {
    return;
  }

  loading.value = true;
  syncRememberedAccount();
  const [err] = await to(userStore.login(loginForm.value));
  loading.value = false;
  if (!err) {
    await router.push(redirect.value || '/category/tree');
  }
};

const restoreLoginData = () => {
  const tenantId = localStorage.getItem('tenantId');
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  const rememberMe = localStorage.getItem('rememberMe') === 'true';

  loginForm.value = {
    ...loginForm.value,
    tenantId: tenantId || loginForm.value.tenantId,
    username: username || loginForm.value.username,
    password: password || loginForm.value.password,
    rememberMe
  } as LoginData;
};

const initTenantList = async () => {
  tenantLoading.value = true;
  tenantLoadFailed.value = false;
  const [err, res] = await to(getTenantList(false));
  tenantLoading.value = false;

  if (err) {
    tenantLoadFailed.value = true;
    tenantEnabled.value = false;
    return;
  }

  const data = res.data;
  tenantEnabled.value = data.tenantEnabled === undefined ? true : data.tenantEnabled;
  tenantList.value = data.voList ?? [];

  if (!tenantEnabled.value || tenantList.value.length === 0) {
    return;
  }

  const currentTenantId = loginForm.value.tenantId;
  const matchedTenant = tenantList.value.find((item) => item.tenantId === currentTenantId);
  loginForm.value.tenantId = matchedTenant?.tenantId ?? tenantList.value[0].tenantId;
};

onMounted(async () => {
  restoreLoginData();
  await initTenantList();
});
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.login-page__mask {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(18, 18, 18, 0.2) 0%, rgba(18, 18, 18, 0.08) 40%, rgba(18, 18, 18, 0.1) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 100%);
}

.login-card {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  width: min(860px, calc(100vw - 32px));
  height: 770px;
  overflow: hidden;
  border-radius: 28px;
  background: transparent;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(1px);
}

.login-panel {
  flex: 0 0 430px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #fff;
}

.login-panel__content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 350px;
}

.login-panel__header {
  margin-bottom: 0;
}

.login-panel__logo {
  display: block;
  width: 100%;
  max-width: 240px;
  margin-bottom: 24px;
}

.login-panel__mode {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.login-panel__mode-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 40px;
  color: #6b7280;
  font-size: 20px;
  font-weight: 500;
}

.login-panel__mode-item.is-active {
  color: #374151;
}

.login-panel__mode-item.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -13px;
  height: 2px;
  border-radius: 999px;
  background: #9ca3af;
}

.login-panel__title {
  margin: 0 0 20px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.login-panel__hint {
  margin: -8px 0 16px;
  color: #f59e0b;
  font-size: 12px;
  line-height: 18px;
}

.login-form {
  width: 100%;
}

.login-form__icon {
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

.login-form__meta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 6px 0 0;
  color: #9ca3af;
  font-size: 14px;
}

.login-form__submit {
  width: 100%;
  height: 62px;
  border: none;
  border-radius: 999px;
  margin-top: 40px;
  background: linear-gradient(to right, #f97316, #ea580c);
  box-shadow: 0 8px 16px rgba(251, 146, 60, 0.4);
  color: #fff;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: 0;
}

.login-form__submit:hover,
.login-form__submit:focus-visible {
  background: linear-gradient(to right, #ea580c, #f97316);
}

.login-visual {
  flex: 0 0 430px;
  position: relative;
  align-self: stretch;
  height: 100%;
  padding: 0;
  border-radius: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #ffad4f 0%, #ff7c08 58%, #ff6a00 100%);
}

.login-visual__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 44%;
}

.login-visual__slogan {
  position: absolute;
  right: 20px;
  bottom: 28px;
  left: 20px;
  z-index: 1;
  margin: 0;
  color: #fff;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.25;
  text-align: center;
  text-shadow: 0 6px 18px rgba(136, 49, 0, 0.25);
}

.login-form :deep(.el-form-item) {
  margin-bottom: 28px;
}

.login-form :deep(.el-input__wrapper),
.login-form :deep(.el-select__wrapper) {
  height: 40px;
  padding: 0 0 8px;
  border-radius: 0;
  background: transparent;
  box-shadow: inset 0 -1px 0 #d1d5db;
}

.login-form :deep(.el-input__wrapper.is-focus),
.login-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: inset 0 -1px 0 #f97316;
}

.login-form :deep(.el-input__inner),
.login-form :deep(.el-select__placeholder),
.login-form :deep(.el-select__selected-item) {
  color: #374151;
  font-size: 16px;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #9ca3af;
}

.login-form :deep(.el-form-item__error) {
  padding-top: 6px;
}

.login-form :deep(.el-checkbox__label) {
  color: #9ca3af;
}

.login-form :deep(.el-input__prefix),
.login-form :deep(.el-select__prefix) {
  margin-right: 12px;
}

@media (max-width: 1200px) {
  .login-card {
    width: min(860px, calc(100vw - 40px));
  }
}

@media (max-width: 960px) {
  .login-page {
    padding: 20px;
  }

  .login-card {
    flex-direction: column;
    width: min(430px, 100%);
    height: auto;
  }

  .login-panel {
    flex-basis: auto;
    padding: 32px 24px 24px;
  }

  .login-panel__logo {
    margin-inline: auto;
  }

  .login-panel__mode {
    gap: 24px;
  }

  .login-visual {
    flex-basis: auto;
    min-height: 320px;
  }

  .login-visual__image {
    object-position: center 42%;
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 12px;
  }

  .login-card {
    width: 100%;
    border-radius: 24px;
  }

  .login-panel {
    padding: 24px 18px 18px;
  }

  .login-panel__mode {
    gap: 18px;
    margin-bottom: 18px;
  }

  .login-panel__title {
    margin-bottom: 18px;
  }

  .login-form :deep(.el-input__wrapper),
  .login-form :deep(.el-select__wrapper) {
    height: 40px;
  }

  .login-form :deep(.el-input__inner),
  .login-form :deep(.el-select__placeholder),
  .login-form :deep(.el-select__selected-item) {
    font-size: 16px;
  }

  .login-form__submit {
    height: 60px;
    font-size: 24px;
  }

  .login-visual__slogan {
    font-size: 24px;
    right: 16px;
    bottom: 20px;
    left: 16px;
  }
}
</style>
