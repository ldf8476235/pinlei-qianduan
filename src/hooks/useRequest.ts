export type RequestExecutor<TParams, TResult> = (params: TParams) => Promise<TResult>;

export interface UseRequestOptions<TResult> {
  onSuccess?: (res: TResult) => void;
  onError?: (err: any) => void;
}

/**
 * 轻量请求封装：统一 loading 与异常处理
 */
export const useRequest = <TParams = void, TResult = any>(executor: RequestExecutor<TParams, TResult>, options?: UseRequestOptions<TResult>) => {
  const loading = ref(false);

  const run = async (params: TParams): Promise<TResult | undefined> => {
    loading.value = true;
    try {
      const res = await executor(params);
      options?.onSuccess?.(res);
      return res;
    } catch (err: any) {
      options?.onError?.(err);
      return undefined;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    run
  };
};

export default useRequest;
