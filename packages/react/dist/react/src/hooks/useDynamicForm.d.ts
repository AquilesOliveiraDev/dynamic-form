import { FormStore, type FormStoreConfig, type FormState } from '@dynamic-form/core';
export declare function useDynamicForm<TFormData extends Record<string, any> = Record<string, any>>(config: FormStoreConfig<TFormData>): {
    store: FormStore<TFormData>;
    state: FormState<TFormData>;
    values: TFormData;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isDirty: boolean;
    isSubmitting: boolean;
    submitCount: number;
    setValue: (field: string, value: any, options?: {
        shouldValidate?: boolean;
    }) => void;
    submit: () => Promise<void>;
    reset: () => void;
    validateForm: () => Promise<boolean>;
};
//# sourceMappingURL=useDynamicForm.d.ts.map