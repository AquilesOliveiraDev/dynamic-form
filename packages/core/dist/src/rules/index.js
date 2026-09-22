/**
 * Motor de avaliação de regras dinâmicas, operadores e keyRules
 */
import { isFilled, normalizeComparableValue } from '../utils/index.js';
import { TokenInterpolator } from '../expression/index.js';
export class RuleEvaluator {
    /**
     * Avalia igualdade semântica entre dois valores
     */
    static valuesAreEqual(left, right) {
        if (left === right)
            return true;
        if (left === null || left === undefined || right === null || right === undefined)
            return false;
        return String(left) === String(right);
    }
    /**
     * Avalia se o valor bruto atende à expectativa da regra
     */
    static ruleValueMatches(rawValue, expected) {
        if (expected === 'any')
            return isFilled(rawValue);
        const normalized = normalizeComparableValue(rawValue);
        if (Array.isArray(expected)) {
            return expected.some((e) => this.valuesAreEqual(normalized, e));
        }
        return this.valuesAreEqual(normalized, expected);
    }
    /**
     * Avalia uma regra do tipo `DynamicFieldRule` (array de nomes de campo ou objeto { campo: esperado })
     */
    static evaluateRule(rule, values, operator = 'or') {
        if (!rule)
            return false;
        if (Array.isArray(rule)) {
            return operator === 'and'
                ? rule.every((fieldName) => isFilled(values[fieldName]))
                : rule.some((fieldName) => isFilled(values[fieldName]));
        }
        const results = Object.entries(rule).map(([fieldName, expected]) => this.ruleValueMatches(values[fieldName], expected));
        return operator === 'and' ? results.every(Boolean) : results.some(Boolean);
    }
    /**
     * Avalia operador condicional individual
     */
    static evaluateOperator(targetValue, expectedValue, operator = '===') {
        const normTarget = normalizeComparableValue(targetValue);
        const normExpected = normalizeComparableValue(expectedValue);
        switch (operator) {
            case '===':
            case '==':
                return String(normTarget ?? '') === String(normExpected ?? '');
            case '!==':
            case '!=':
                return String(normTarget ?? '') !== String(normExpected ?? '');
            case '>':
                return Number(normTarget) > Number(normExpected);
            case '>=':
                return Number(normTarget) >= Number(normExpected);
            case '<':
                return Number(normTarget) < Number(normExpected);
            case '<=':
                return Number(normTarget) <= Number(normExpected);
            case 'in':
            case 'includes':
                if (Array.isArray(normExpected))
                    return normExpected.includes(normTarget);
                if (typeof normExpected === 'string')
                    return normExpected.includes(String(normTarget));
                return false;
            case 'isFilled':
                return isFilled(normTarget);
            case 'isEmpty':
                return !isFilled(normTarget);
            default:
                return String(normTarget ?? '') === String(normExpected ?? '');
        }
    }
    /**
     * Avalia uma regra granular de condição (`FieldRuleCondition`)
     */
    static evaluateConditionRule(rule, values) {
        const rules = Array.isArray(rule) ? rule : [rule];
        const effects = {};
        for (const r of rules) {
            if (!r.field)
                continue;
            const targetVal = values[r.field];
            const match = this.evaluateOperator(targetVal, r.value, r.operator);
            const action = r.action || 'show';
            switch (action) {
                case 'show':
                    effects.show = match;
                    break;
                case 'hide':
                    effects.hide = match;
                    break;
                case 'enable':
                    effects.enable = match;
                    break;
                case 'disable':
                    effects.disable = match;
                    break;
            }
        }
        return effects;
    }
    /**
     * Avalia uma regra do tipo `KeyRule` baseada em permissões/configurações do usuário ou variáveis
     */
    static evaluateKeyRule(rule, values, userSettings, externalVariables) {
        const operator = rule.operator || 'and';
        let entries = [];
        if (Array.isArray(rule.keys)) {
            entries = rule.keys;
        }
        else if (Array.isArray(rule.variables)) {
            entries = rule.variables.map((v) => ({ variable: v, requiredValue: rule.requiredValue }));
        }
        else if (rule.key) {
            entries = [{ key: rule.key, requiredValue: rule.requiredValue, areaId: rule.areaId }];
        }
        else if (rule.variable) {
            entries = [{ variable: rule.variable, requiredValue: rule.requiredValue }];
        }
        if (entries.length === 0)
            return false;
        const results = entries.map((entry) => {
            if (entry.key) {
                let areaId = entry.areaId ?? rule.areaId;
                if (typeof areaId === 'string' && areaId.includes('#{')) {
                    areaId = TokenInterpolator.resolveToken(areaId.replace(/#\{|\}#/g, ''), values);
                }
                let currentSetting;
                if (typeof userSettings === 'function') {
                    currentSetting = userSettings(entry.key, areaId);
                }
                else if (userSettings && typeof userSettings === 'object') {
                    currentSetting = userSettings[entry.key];
                }
                const required = entry.requiredValue !== undefined ? entry.requiredValue : rule.requiredValue;
                if (String(required).toLowerCase() === 'default') {
                    return currentSetting === undefined || currentSetting === null || currentSetting === '' || String(currentSetting).toLowerCase() === 'default';
                }
                if (Array.isArray(required)) {
                    return required.includes(currentSetting);
                }
                return String(currentSetting) === String(required);
            }
            if (entry.variable) {
                const val = externalVariables?.[entry.variable];
                const required = entry.requiredValue !== undefined ? entry.requiredValue : rule.requiredValue;
                if (Array.isArray(required)) {
                    return required.includes(val);
                }
                return val === required;
            }
            return false;
        });
        return operator === 'or' ? results.some(Boolean) : results.every(Boolean);
    }
}
//# sourceMappingURL=index.js.map