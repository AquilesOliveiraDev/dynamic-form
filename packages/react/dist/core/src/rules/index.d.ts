/**
 * Motor de avaliação de regras dinâmicas, operadores e keyRules
 */
import type { ConditionOperator, DynamicFieldRule, FieldRuleCondition, KeyRule } from '../types/index.js';
export declare class RuleEvaluator {
    /**
     * Avalia igualdade semântica entre dois valores
     */
    static valuesAreEqual(left: unknown, right: unknown): boolean;
    /**
     * Avalia se o valor bruto atende à expectativa da regra
     */
    static ruleValueMatches(rawValue: unknown, expected: unknown): boolean;
    /**
     * Avalia uma regra do tipo `DynamicFieldRule` (array de nomes de campo ou objeto { campo: esperado })
     */
    static evaluateRule(rule: DynamicFieldRule | undefined, values: Record<string, any>, operator?: 'and' | 'or'): boolean;
    /**
     * Avalia operador condicional individual
     */
    static evaluateOperator(targetValue: unknown, expectedValue: unknown, operator?: ConditionOperator): boolean;
    /**
     * Avalia uma regra granular de condição (`FieldRuleCondition`)
     */
    static evaluateConditionRule(rule: FieldRuleCondition | FieldRuleCondition[], values: Record<string, any>): {
        show?: boolean;
        hide?: boolean;
        enable?: boolean;
        disable?: boolean;
    };
    /**
     * Avalia uma regra do tipo `KeyRule` baseada em permissões/configurações do usuário ou variáveis
     */
    static evaluateKeyRule(rule: KeyRule, values: Record<string, any>, userSettings?: Record<string, any> | ((key: string, areaId?: any) => any), externalVariables?: Record<string, any>): boolean;
}
//# sourceMappingURL=index.d.ts.map