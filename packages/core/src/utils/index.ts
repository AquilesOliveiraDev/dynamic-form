/**
 * Funções utilitárias universais para manipulação de caminhos, normalização e igualdade
 */

export const isFilled = (v: unknown): boolean => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'number') return !Number.isNaN(v);
  if (typeof v === 'boolean') return true; // false é preenchido!
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return Boolean(v);
};

export const hasResettableValue = (v: unknown): boolean =>
  v !== null && v !== undefined;

export const normalizeComparableValue = (value: unknown): unknown => {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if ('value' in value && (value as { value: unknown }).value !== undefined) {
    return (value as { value: unknown }).value;
  }
  if ('id' in value && (value as { id: unknown }).id !== undefined) {
    return (value as { id: unknown }).id;
  }
  return value;
};

export const hasValueChanged = (current: unknown, previous: unknown): boolean => {
  const normCurrent = normalizeComparableValue(current);
  const normPrev = normalizeComparableValue(previous);
  if (normCurrent === normPrev) return false;
  if (normCurrent === null || normCurrent === undefined || normPrev === null || normPrev === undefined) {
    return normCurrent !== normPrev;
  }
  return String(normCurrent) !== String(normPrev);
};

export const extractRecordSignature = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object' && 'record' in value) {
    const rec = (value as { record: unknown }).record;
    if (rec && typeof rec === 'object') {
      try {
        return JSON.stringify(rec);
      } catch {
        return '';
      }
    }
  }
  return String(normalizeComparableValue(value));
};

export const getByPath = (obj: any, path?: string | string[] | null): any => {
  if (!obj || !path) return undefined;

  const parts = Array.isArray(path)
    ? path
    : path
        .replace(/\[|\]\.?/g, '.')
        .split('.')
        .filter(Boolean);

  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }

  return current;
};

export const setByPath = (obj: any, path: string, value: any): any => {
  if (!obj || typeof obj !== 'object' || !path) return obj;

  const parts = path
    .replace(/\[|\]\.?/g, '.')
    .split('.')
    .filter(Boolean);

  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === null || current[part] === undefined || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart) {
    current[lastPart] = value;
  }

  return obj;
};

export const deepClone = <T>(value: T): T => {
  if (value === null || value === undefined || typeof value !== 'object') {
    return value;
  }
  if (value instanceof Date) {
    return new Date(value.getTime()) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as unknown as T;
  }
  const copy = {} as Record<string, any>;
  for (const [key, val] of Object.entries(value)) {
    copy[key] = deepClone(val);
  }
  return copy as T;
};

export const sortObjectKeys = (obj: Record<string, any>): Record<string, any> => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  for (const key of sortedKeys) {
    const val = obj[key];
    result[key] = val && typeof val === 'object' && !Array.isArray(val)
      ? sortObjectKeys(val)
      : val;
  }
  return result;
};
