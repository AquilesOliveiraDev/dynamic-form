import { FormStore, type FormStoreConfig, type FormState } from '@dynamic-form/core';

export function createDynamicForm<TFormData extends Record<string, any> = Record<string, any>>(
  config: FormStoreConfig<TFormData>
) {
  const store = new FormStore<TFormData>(config);
  let state = $state<FormState<TFormData>>(store.getState());

  const unsubscribe = store.subscribe((next) => {
    state = {
      ...next,
      values: { ...next.values },
      errors: { ...next.errors },
      touched: { ...next.touched },
      visibility: { ...next.visibility },
      disabledState: { ...next.disabledState },
    };
  });

  return {
    get state() {
      return state;
    },
    store,
    setValue: (field: string, val: any) => store.setValue(field, val),
    validate: async (): Promise<boolean> => {
      return await store.validateForm();
    },
    submit: async (): Promise<boolean> => {
      const isValid = await store.validateForm();
      if (isValid) {
        await store.submit();
        return true;
      }
      return false;
    },
    reset: () => store.reset(),
    isFieldRequired: (name: string): boolean => store.isFieldRequired(name),
    destroy: () => unsubscribe(),
  };
}
