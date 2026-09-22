/**
 * FormStore - Núcleo reativo e agnóstico de gerenciamento de estado do formulário
 */
import type { DynamicFormSchema, FormState } from '../types/index.js';
export type FormListener<TFormData> = (state: FormState<TFormData>) => void;
export type FieldListener<TValue = any> = (fieldState: {
    value: TValue;
    error?: string;
    touched?: boolean;
    visible: boolean;
    disabled: boolean;
}) => void;
export interface FormStoreConfig<TFormData = Record<string, any>> {
    schema: DynamicFormSchema<TFormData>;
    initialValues?: Partial<TFormData>;
    dataSource?: Partial<TFormData>;
    userSettings?: any;
    externalVariables?: Record<string, any>;
    onSubmit?: (values: TFormData) => void | Promise<void>;
    onChangeValues?: (values: TFormData) => void;
    onDirtyChange?: (isDirty: boolean, changedFields: string[]) => void;
    settleMs?: number;
}
export declare class FormStore<TFormData extends Record<string, any> = Record<string, any>> {
    private schema;
    private fields;
    private graph;
    private state;
    private baselineValues;
    private listeners;
    private fieldListeners;
    private userSettings;
    private externalVariables;
    private isSettled;
    private settleTimer;
    private config;
    constructor(config: FormStoreConfig<TFormData>);
    private buildInitialValues;
    getState(): FormState<TFormData>;
    getValues(): TFormData;
    subscribe(listener: FormListener<TFormData>): () => void;
    subscribeField(name: string, listener: FieldListener): () => void;
    private notify;
    private recomputeVisibilityAndDisabled;
    setValue(field: string, value: any, options?: {
        shouldValidate?: boolean;
    }): void;
    private buildNormalizedBaseline;
    private updateDirtyState;
    validateForm(): Promise<boolean>;
    submit(): Promise<void>;
    reset(): void;
}
//# sourceMappingURL=index.d.ts.map