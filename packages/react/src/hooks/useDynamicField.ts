import { useCallback, useSyncExternalStore } from 'react';
import { useFormStore } from '../context/FormContext.js';

export function useDynamicField<TValue = any>(name: string) {
  const store = useFormStore();

  const getSnapshot = useCallback(() => {
    const s = store.getState();
    return {
      value: s.values[name] as TValue,
      error: s.errors[name],
      touched: s.touched[name],
      visible: s.visibility[name] !== false,
      disabled: s.disabledState[name] === true,
    };
  }, [store, name]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return store.subscribeField(name, onStoreChange);
    },
    [store, name],
  );

  const fieldState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  const setValue = useCallback(
    (value: TValue, options?: { shouldValidate?: boolean }) => {
      store.setValue(name, value, options);
    },
    [store, name],
  );

  return {
    ...fieldState,
    setValue,
  };
}
