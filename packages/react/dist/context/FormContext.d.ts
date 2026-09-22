import React from 'react';
import type { FormStore } from '@dynamic-form/core';
export declare const FormContext: any;
export interface DynamicFormProviderProps<TFormData extends Record<string, any> = Record<string, any>> {
    form: FormStore<TFormData>;
    children: React.ReactNode;
}
export declare function DynamicFormProvider<TFormData extends Record<string, any> = Record<string, any>>({ form, children, }: DynamicFormProviderProps<TFormData>): any;
export declare function useFormStore<TFormData extends Record<string, any> = Record<string, any>>(): FormStore<TFormData>;
//# sourceMappingURL=FormContext.d.ts.map