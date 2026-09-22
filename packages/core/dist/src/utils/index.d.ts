/**
 * Funções utilitárias universais para manipulação de caminhos, normalização e igualdade
 */
export declare const isFilled: (v: unknown) => boolean;
export declare const hasResettableValue: (v: unknown) => boolean;
export declare const normalizeComparableValue: (value: unknown) => unknown;
export declare const hasValueChanged: (current: unknown, previous: unknown) => boolean;
export declare const extractRecordSignature: (value: unknown) => string;
export declare const getByPath: (obj: any, path?: string | string[] | null) => any;
export declare const setByPath: (obj: any, path: string, value: any) => any;
export declare const deepClone: <T>(value: T) => T;
export declare const sortObjectKeys: (obj: Record<string, any>) => Record<string, any>;
//# sourceMappingURL=index.d.ts.map