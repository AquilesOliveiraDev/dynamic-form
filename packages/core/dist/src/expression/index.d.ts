/**
 * Motor de expressões aritméticas e interpolação de tokens dinâmicos (#{...}#)
 */
export declare class TokenInterpolator {
    /**
     * Resolve um único token como `area_id` ou `area_id|record.attributes.city_id`
     */
    static resolveToken(token: string, values: Record<string, any>): unknown;
    /**
     * Substitui placeholders `#{token}#` em uma string de template.
     * Retorna `null` se qualquer token for ausente (null, undefined ou string vazia).
     * Valores `0` e `false` são estritamente preservados.
     */
    static interpolateString(template: string, values: Record<string, any>): string | null;
    /**
     * Interpola placeholders em estruturas de dados JSON (objetos, arrays de filtros, extraOptions).
     */
    static interpolateSerializable<T>(data: T, values: Record<string, any>): T | null;
}
export declare class ArithmeticParser {
    /**
     * Avalia uma expressão matemática contendo referências `#{campo}#`.
     * @param expression Ex: "#{qtd}# * #{preco}# - #{desconto}#"
     * @param values Mapa de valores atuais do formulário
     * @param step Passo decimal para arredondamento (ex: 0.01 -> 2 casas)
     */
    static evaluate(expression: string, values: Record<string, any>, step?: number | string): number | null;
    /**
     * Parser de descida recursiva para operações aritméticas
     */
    private static parseArithmetic;
}
//# sourceMappingURL=index.d.ts.map