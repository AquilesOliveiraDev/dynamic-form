import { type FormStoreConfig } from '@dynamic-form/core';
export declare function useDynamicForm<TFormData extends Record<string, any> = Record<string, any>>(config: FormStoreConfig<TFormData>): {
    store: any;
    state: any;
    values: any;
    errors: any;
    touched: any;
    isDirty: any;
    isSubmitting: any;
    submitCount: any;
    setValue: any;
    submit: any;
    reset: any;
    validateForm: any;
};
//# sourceMappingURL=useDynamicForm.d.ts.map