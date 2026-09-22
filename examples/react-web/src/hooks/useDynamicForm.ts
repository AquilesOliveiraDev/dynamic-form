import { useMemo, useRef, useCallback, useSyncExternalStore } from 'react';
import { FormStore, type FormStoreConfig, type FormState } from '@dynamic-form/core';

function cloneState<T extends Record<string, any>>(st: FormState<T>): FormState<T> {
  return {
    ...st,
    values: { ...st.values },
    errors: { ...st.errors },
    touched: { ...st.touched },
    visibility: { ...st.visibility },
    disabledState: { ...st.disabledState },
    changedFields: [...(st.changedFields || [])],
  };
}

export function useDynamicForm<TFormData extends Record<string, any> = Record<string, any>>(
  config: FormStoreConfig<TFormData>,
) {
  const store = useMemo(() => new FormStore<TFormData>(config), []);
  const snapshotRef = useRef<FormState<TFormData>>(cloneState(store.getState()));

  const subscribe = useCallback((onStoreChange: () => void) => {
    return store.subscribe((next) => {
      snapshotRef.current = cloneState(next);
      onStoreChange();
    });
  }, [store]);

  const getSnapshot = useCallback(() => {
    return snapshotRef.current;
  }, []);

  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  return {
    store,
    state,
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    visibility: state.visibility,
    disabledState: state.disabledState,
    isDirty: state.isDirty,
    isSubmitting: state.isSubmitting,
    submitCount: state.submitCount,
    setValue: (field: string, val: any) => store.setValue(field, val),
    submit: async (): Promise<boolean> => {
      const isValid = await store.validateForm();
      if (isValid) {
        await store.submit();
        return true;
      }
      return false;
    },
    validate: async (): Promise<boolean> => await store.validateForm(),
    reset: () => {
      store.reset();
      snapshotRef.current = cloneState(store.getState());
    },
    isFieldRequired: (name: string): boolean => store.isFieldRequired(name),
  };
}
