/**
 * Motor de validação dinâmica com bypass em tempo real de campos ocultos e desabilitados
 */

import type { DynamicField } from '../types/index.js';
import { RuleEvaluator } from '../rules/index.js';
import { isFilled } from '../utils/index.js';

export type ValidatorFunction<TValue = any> = (
  value: TValue,
  values: Record<string, any>,
) => string | null | Promise<string | null>;

export class ValidationEngine {
  /**
   * Determina se o campo é obrigatório neste momento
   */
  public static isFieldRequired(
    field: DynamicField,
    values: Record<string, any>,
    userSettings?: any,
    externalVariables?: Record<string, any>,
  ): boolean {
    // 1. requiredFields tem prioridade máxima
    if (field.requiredFields) {
      return RuleEvaluator.evaluateRule(field.requiredFields, values, field.requiredRule || 'or');
    }

    // 2. keyRules
    if (field.attr?.keyRules && Array.isArray(field.attr.keyRules)) {
      for (const rule of field.attr.keyRules) {
        if (rule.rule === 'required') {
          if (RuleEvaluator.evaluateKeyRule(rule, values, userSettings, externalVariables)) {
            return true;
          }
        } else if (rule.rule === 'notRequired') {
          if (RuleEvaluator.evaluateKeyRule(rule, values, userSettings, externalVariables)) {
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
  public static async validateField(
    field: DynamicField,
    value: unknown,
    values: Record<string, any>,
    isVisible: boolean,
    isEnabled: boolean,
    userSettings?: any,
    externalVariables?: Record<string, any>,
  ): Promise<string | null> {
    // REGRA DE OURO: campos invisíveis ou desabilitados NUNCA geram erros
    if (!isVisible || !isEnabled) {
      return null;
    }

    const isRequired = this.isFieldRequired(field, values, userSettings, externalVariables);
    if (isRequired && !isFilled(value)) {
      return field.attr?.requiredMessage || 'Campo obrigatório';
    }

    // Validação de tipo e formato básico
    if (isFilled(value)) {
      if (field.component === 'number' || field.attr?.type === 'number') {
        const num = Number(value);
        if (Number.isNaN(num)) return 'Número inválido';
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
  public static async validateForm(
    fields: DynamicField[],
    values: Record<string, any>,
    visibility: Record<string, boolean>,
    disabledState: Record<string, boolean>,
    userSettings?: any,
    externalVariables?: Record<string, any>,
  ): Promise<Record<string, string>> {
    const errors: Record<string, string> = {};

    for (const field of fields) {
      const fieldName = field.attr.name;
      const isVisible = visibility[fieldName] !== false;
      const isEnabled = disabledState[fieldName] !== true;

      const error = await this.validateField(
        field,
        values[fieldName],
        values,
        isVisible,
        isEnabled,
        userSettings,
        externalVariables,
      );

      if (error) {
        errors[fieldName] = error;
      }
    }

    return errors;
  }
}
