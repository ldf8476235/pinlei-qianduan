import { onBeforeUnmount, ref } from 'vue';

export type RequestExecutor<TParams, TResult> = (params: TParams) => Promise<TResult>;

export interface UseRequestOptions<TResult> {
  onSuccess?: (res: TResult) => void;
  onError?: (err: any) => void | Promise<void>;
}

/**
 * 轻量请求封装：统一 loading 与异常处理
 */
export const useRequest = <TParams = void, TResult = any>(executor: RequestExecutor<TParams, TResult>, options?: UseRequestOptions<TResult>) => {
  const loading = ref(false);
  let alive = true;

  onBeforeUnmount(() => {
    alive = false;
  });

  const run = async (params: TParams): Promise<TResult | undefined> => {
    loading.value = true;
    try {
      const res = await executor(params);
      if (!alive) return undefined;
      options?.onSuccess?.(res);
      return res;
    } catch (err: any) {
      if (!alive) return undefined;
      await options?.onError?.(err);
      return undefined;
    } finally {
      if (alive) {
        loading.value = false;
      }
    }
  };

  return {
    loading,
    run
  };
};

export default useRequest;
