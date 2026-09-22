import { ref, type Ref, onUnmounted, getCurrentInstance } from 'vue';
import { FormStore, type FormStoreConfig, type FormState } from '@dynamic-form/core';

export function useDynamicForm<TFormData extends Record<string, any> = Record<string, any>>(
  config: FormStoreConfig<TFormData>
) {
  const store = new FormStore<TFormData>(config);
  const state: Ref<FormState<TFormData>> = ref(store.getState()) as Ref<FormState<TFormData>>;

  const unsubscribe = store.subscribe((nextState) => {
    state.value = {
      ...nextState,
      values: { ...nextState.values },
      errors: { ...nextState.errors },
      touched: { ...nextState.touched },
      visibility: { ...nextState.visibility },
      disabledState: { ...nextState.disabledState },
    };
  });

  if (getCurrentInstance()) {
    onUnmounted(() => {
      unsubscribe();
    });
  }

  const setValue = (field: string, val: any) => {
    store.setValue(field, val);
  };

  const validate = async (): Promise<boolean> => {
    return await store.validateForm();
  };

  const submit = async (): Promise<boolean> => {
    const isValid = await store.validateForm();
    if (isValid) {
      await store.submit();
      return true;
    }
    return false;
  };

  const reset = () => {
    store.reset();
  };

  const isFieldRequired = (name: string): boolean => {
    return store.isFieldRequired(name);
  };

  return {
    store,
    state,
    setValue,
    validate,
    submit,
    reset,
    isFieldRequired,
  };
}
