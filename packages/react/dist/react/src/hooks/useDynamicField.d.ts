export declare function useDynamicField<TValue = any>(name: string): {
    setValue: (value: TValue, options?: {
        shouldValidate?: boolean;
    }) => void;
    value: TValue;
    error: string;
    touched: boolean;
    visible: boolean;
    disabled: boolean;
};
//# sourceMappingURL=useDynamicField.d.ts.map