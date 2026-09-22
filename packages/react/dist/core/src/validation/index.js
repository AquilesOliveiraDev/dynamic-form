"use strict";
/**
 * Motor de validação dinâmica com bypass em tempo real de campos ocultos e desabilitados
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationEngine = void 0;
const index_js_1 = require("../rules/index.js");
const index_js_2 = require("../utils/index.js");
class ValidationEngine {
    /**
     * Determina se o campo é obrigatório neste momento
     */
    static isFieldRequired(field, values, userSettings, externalVariables) {
        // 1. requiredFields tem prioridade máxima
        if (field.requiredFields) {
            return index_js_1.RuleEvaluator.evaluateRule(field.requiredFields, values, field.requiredRule || 'or');
        }
        // 2. keyRules
        if (field.attr?.keyRules && Array.isArray(field.attr.keyRules)) {
            for (const rule of field.attr.keyRules) {
                if (rule.rule === 'required') {
                    if (index_js_1.RuleEvaluator.evaluateKeyRule(rule, values, userSettings, externalVariables)) {
                        return true;
                    }
                }
                else if (rule.rule === 'notRequired') {
                    if (index_js_1.RuleEvaluator.evaluateKeyRule(rule, values, userSettings, externalVariables)) {
                        return false;
                    }
                }
            }
        }
        // 3. Regra estática
        return Boolean(field.attr?.required);
    }
    /**
     * Valida um único campo com base no seu valor e regras
     */
    static async validateField(field, value, values, isVisible, isEnabled, userSettings, externalVariables) {
        // REGRA DE OURO: campos invisíveis ou desabilitados NUNCA geram erros
        if (!isVisible || !isEnabled) {
            return null;
        }
        const isRequired = this.isFieldRequired(field, values, userSettings, externalVariables);
        if (isRequired && !(0, index_js_2.isFilled)(value)) {
            return field.attr?.requiredMessage || 'Campo obrigatório';
        }
        // Validação de tipo e formato básico
        if ((0, index_js_2.isFilled)(value)) {
            if (field.component === 'number' || field.attr?.type === 'number') {
                const num = Number(value);
                if (Number.isNaN(num))
                    return 'Número inválido';
                if (field.attr?.min !== undefined && num < field.attr.min) {
                    return `O valor mínimo é ${field.attr.min}`;
                }
                if (field.attr?.max !== undefined && num > field.attr.max) {
                    return `O valor máximo é ${field.attr.max}`;
                }
            }
            if (field.attr?.pattern) {
                const regex = new RegExp(field.attr.pattern);
                if (!regex.test(String(value))) {
                    return field.attr?.patternMessage || 'Formato inválido';
                }
            }
            if (field.attr?.minLength && String(value).length < field.attr.minLength) {
                return `Tamanho mínimo de ${field.attr.minLength} caracteres`;
            }
            if (field.attr?.maxLength && String(value).length > field.attr.maxLength) {
                return `Tamanho máximo de ${field.attr.maxLength} caracteres`;
            }
        }
        // Validador customizado síncrono ou assíncrono
        if (typeof field.attr?.customValidator === 'function') {
            return await field.attr.customValidator(value, values);
        }
        return null;
    }
    /**
     * Valida todos os campos visíveis e habilitados do formulário
     */
    static async validateForm(fields, values, visibility, disabledState, userSettings, externalVariables) {
        const errors = {};
        for (const field of fields) {
            const fieldName = field.attr.name;
            const isVisible = visibility[fieldName] !== false;
            const isEnabled = disabledState[fieldName] !== true;
            const error = await this.validateField(field, values[fieldName], values, isVisible, isEnabled, userSettings, externalVariables);
            if (error) {
                errors[fieldName] = error;
            }
        }
        return errors;
    }
}
exports.ValidationEngine = ValidationEngine;
//# sourceMappingURL=index.js.map