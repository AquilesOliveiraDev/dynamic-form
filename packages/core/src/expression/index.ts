/**
 * Motor de expressões aritméticas e interpolação de tokens dinâmicos (#{...}#)
 */

import { getByPath, isFilled, normalizeComparableValue } from '../utils/index.js';

export class TokenInterpolator {
  /**
   * Resolve um único token como `area_id` ou `area_id|record.attributes.city_id`
   */
  public static resolveToken(token: string, values: Record<string, any>): unknown {
    if (!token) return undefined;

    let targetValue: unknown;

    if (token.includes('|')) {
      const pipeIdx = token.indexOf('|');
      const rootField = token.slice(0, pipeIdx);
      const subPath = token.slice(pipeIdx + 1);
      const rootObj = values[rootField];

      if (!isFilled(rootObj)) return undefined;

      targetValue = getByPath(rootObj, subPath);
      if (targetValue === undefined && !subPath.startsWith('record.')) {
        targetValue = getByPath(rootObj, `record.${subPath}`);
      }
      if (targetValue === undefined && !subPath.startsWith('attributes.')) {
        targetValue = getByPath(rootObj, `attributes.${subPath}`);
      }
    } else {
      targetValue = values[token];
    }

    if (Array.isArray(targetValue)) {
      return targetValue.map((item) => normalizeComparableValue(item));
    }

    return normalizeComparableValue(targetValue);
  }

  /**
   * Substitui placeholders `#{token}#` em uma string de template.
   * Retorna `null` se qualquer token for ausente (null, undefined ou string vazia).
   * Valores `0` e `false` são estritamente preservados.
   */
  public static interpolateString(template: string, values: Record<string, any>): string | null {
    if (typeof template !== 'string' || !template.includes('#{')) {
      return template;
    }

    let result = template;
    const tokenRegex = /#\{([^}]+)\}#/g;
    const matches = Array.from(template.matchAll(tokenRegex));

    for (const match of matches) {
      const fullMatch = match[0];
      const token = match[1].trim();
      const resolved = this.resolveToken(token, values);

      if (resolved === null || resolved === undefined || (typeof resolved === 'string' && resolved.trim().length === 0)) {
        return null;
      }

      result = result.replace(fullMatch, String(resolved));
    }

    return result;
  }

  /**
   * Interpola placeholders em estruturas de dados JSON (objetos, arrays de filtros, extraOptions).
   */
  public static interpolateSerializable<T>(data: T, values: Record<string, any>): T | null {
    if (data === null || data === undefined || typeof data !== 'object') {
      return data;
    }

    try {
      const serialized = JSON.stringify(data);
      if (!serialized.includes('#{')) return data;

      let result = serialized;
      const regex = /"#\{([^}]+)\}#"/g;
      const matches = Array.from(serialized.matchAll(regex));

      for (const match of matches) {
        const fullMatch = match[0];
        const token = match[1].trim();
        const resolved = this.resolveToken(token, values);

        if (resolved === null || resolved === undefined || (typeof resolved === 'string' && resolved.trim().length === 0)) {
          return null;
        }

        result = result.replace(fullMatch, JSON.stringify(resolved));
      }

      return JSON.parse(result) as T;
    } catch {
      return null;
    }
  }
}

export class ArithmeticParser {
  /**
   * Avalia uma expressão matemática contendo referências `#{campo}#`.
   * @param expression Ex: "#{qtd}# * #{preco}# - #{desconto}#"
   * @param values Mapa de valores atuais do formulário
   * @param step Passo decimal para arredondamento (ex: 0.01 -> 2 casas)
   */
  public static evaluate(
    expression: string,
    values: Record<string, any>,
    step?: number | string,
  ): number | null {
    if (!expression || typeof expression !== 'string') return null;

    const tokenRegex = /#\{([^}]+)\}#/g;
    const matches = Array.from(expression.matchAll(tokenRegex));
    let sanitizedExpr = expression;

    for (const match of matches) {
      const fullMatch = match[0];
      const fieldName = match[1].trim();
      const rawVal = TokenInterpolator.resolveToken(fieldName, values);

      let numVal: number | null = null;
      if (typeof rawVal === 'boolean') {
        numVal = rawVal ? 1 : 0;
      } else if (rawVal !== null && rawVal !== undefined && rawVal !== '') {
        numVal = Number(rawVal);
      }

      if (numVal === null || Number.isNaN(numVal) || !Number.isFinite(numVal)) {
        return null; // Qualquer operando inválido anula a expressão
      }

      sanitizedExpr = sanitizedExpr.replace(new RegExp(fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(numVal));
    }

    // Se a expressão não usar #{...}#, resolve identificadores alfanuméricos diretos
    if (!expression.includes('#{')) {
      const words = Array.from(new Set(expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || []));
      for (const word of words) {
        if (word in values) {
          const rawVal = values[word];
          let numVal: number | null = null;
          if (typeof rawVal === 'boolean') {
            numVal = rawVal ? 1 : 0;
          } else if (rawVal !== null && rawVal !== undefined && rawVal !== '') {
            numVal = Number(rawVal);
          }

          if (numVal === null || Number.isNaN(numVal) || !Number.isFinite(numVal)) {
            return null;
          }

          sanitizedExpr = sanitizedExpr.replace(new RegExp(`\\b${word}\\b`, 'g'), String(numVal));
        }
      }
    }

    sanitizedExpr = sanitizedExpr.replace(/\s+/g, '');

    // Validação estrita: apenas dígitos, operadores e parênteses
    if (!/^[0-9+\-*/().]+$/.test(sanitizedExpr)) return null;
    if (/([+\-*/]{2,})|(\.[0-9]*\.)/.test(sanitizedExpr)) return null;

    try {
      const result = this.parseArithmetic(sanitizedExpr);
      if (typeof result !== 'number' || Number.isNaN(result) || !Number.isFinite(result)) {
        return null;
      }

      const parsedStep = Number(step);
      const decimalPlaces =
        Number.isFinite(parsedStep) && parsedStep > 0
          ? Math.max(0, Math.min(10, `${parsedStep}`.split('.')[1]?.length || 0))
          : 2;

      const factor = 10 ** decimalPlaces;
      return Math.round(result * factor) / factor;
    } catch {
      return null;
    }
  }

  /**
   * Parser de descida recursiva para operações aritméticas
   */
  private static parseArithmetic(input: string): number {
    let pos = 0;
    const peek = () => input[pos];

    const parseNumber = (): number => {
      const start = pos;
      while (pos < input.length && /[0-9.]/.test(input[pos])) pos++;
      if (pos === start) throw new Error(`Token inesperado na posição ${pos}`);
      const num = Number(input.slice(start, pos));
      if (Number.isNaN(num)) throw new Error('Número inválido');
      return num;
    };

    const parseFactor = (): number => {
      if (peek() === '+') {
        pos++;
        return parseFactor();
      }
      if (peek() === '-') {
        pos++;
        return -parseFactor();
      }
      if (peek() === '(') {
        pos++;
        const val = parseExpression();
        if (peek() !== ')') throw new Error('Parêntese não fechado');
        pos++;
        return val;
      }
      return parseNumber();
    };

    const parseTerm = (): number => {
      let val = parseFactor();
      while (pos < input.length && (peek() === '*' || peek() === '/')) {
        const op = input[pos++];
        const rhs = parseFactor();
        val = op === '*' ? val * rhs : val / rhs;
      }
      return val;
    };

    const parseExpression = (): number => {
      let val = parseTerm();
      while (pos < input.length && (peek() === '+' || peek() === '-')) {
        const op = input[pos++];
        const rhs = parseTerm();
        val = op === '+' ? val + rhs : val - rhs;
      }
      return val;
    };

    const result = parseExpression();
    if (pos !== input.length) throw new Error(`Caractere inesperado na posição ${pos}`);
    return result;
  }
}
