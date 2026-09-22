import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { FormStore, type FormStoreConfig, type FormState } from '@dynamic-form/core';

export function useDynamicForm<TFormData extends Record<string, any> = Record<string, any>>(
  config: FormStoreConfig<TFormData>,
) {
  const store = useMemo(() => new FormStore<TFormData>(config), []);

  const state = useSyncExternalStore(
    (callback) => store.subscribe(callback),
    () => store.getState(),
    () => store.getState(),
  );

  return {
    store,
    state,
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isDirty: state.isDirty,
    isSubmitting: state.isSubmitting,
    submitCount: state.submitCount,
    setValue: store.setValue.bind(store),
    submit: store.submit.bind(store),
    reset: store.reset.bind(store),
    validateForm: store.validateForm.bind(store),
  };
}
