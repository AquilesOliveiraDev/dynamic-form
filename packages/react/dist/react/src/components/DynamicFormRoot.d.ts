import React from 'react';
import type { DynamicField, DynamicFormSchema } from '@dynamic-form/core';
export interface FieldRenderProps {
    field: DynamicField;
    value: any;
    error?: string;
    touched?: boolean;
    disabled: boolean;
    onChange: (value: any) => void;
}
export interface DynamicFormRootProps<TFormData extends Record<string, any> = Record<string, any>> {
    schema: DynamicFormSchema<TFormData>;
    renderField: (props: FieldRenderProps) => React.ReactNode;
    className?: string;
    rowClassName?: string;
    fieldClassName?: string;
}
export declare function DynamicFormRoot<TFormData extends Record<string, any> = Record<string, any>>({ schema, renderField, className, rowClassName, fieldClassName, }: DynamicFormRootProps<TFormData>): React.JSX.Element;
//# sourceMappingURL=DynamicFormRoot.d.ts.map