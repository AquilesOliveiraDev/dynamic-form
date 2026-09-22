/**
 * Motor de validação dinâmica com bypass em tempo real de campos ocultos e desabilitados
 */
import type { DynamicField } from '../types/index.js';
export type ValidatorFunction<TValue = any> = (value: TValue, values: Record<string, any>) => string | null | Promise<string | null>;
export declare class ValidationEngine {
    /**
     * Determina se o campo é obrigatório neste momento
     */
    static isFieldRequired(field: DynamicField, values: Record<string, any>, userSettings?: any, externalVariables?: Record<string, any>): boolean;
    /**
     * Valida um único campo com base no seu valor e regras
     */
    static validateField(field: DynamicField, value: unknown, values: Record<string, any>, isVisible: boolean, isEnabled: boolean, userSettings?: any, externalVariables?: Record<string, any>): Promise<string | null>;
    /**
     * Valida todos os campos visíveis e habilitados do formulário
     */
    static validateForm(fields: DynamicField[], values: Record<string, any>, visibility: Record<string, boolean>, disabledState: Record<string, boolean>, userSettings?: any, externalVariables?: Record<string, any>): Promise<Record<string, string>>;
}
//# sourceMappingURL=index.d.ts.map