"use strict";
/**
 * Funções utilitárias universais para manipulação de caminhos, normalização e igualdade
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortObjectKeys = exports.deepClone = exports.setByPath = exports.getByPath = exports.extractRecordSignature = exports.hasValueChanged = exports.normalizeComparableValue = exports.hasResettableValue = exports.isFilled = void 0;
const isFilled = (v) => {
    if (v === null || v === undefined)
        return false;
    if (typeof v === 'string')
        return v.trim().length > 0;
    if (Array.isArray(v))
        return v.length > 0;
    if (typeof v === 'number')
        return !Number.isNaN(v);
    if (typeof v === 'boolean')
        return true; // false é preenchido!
    if (typeof v === 'object')
        return Object.keys(v).length > 0;
    return Boolean(v);
};
exports.isFilled = isFilled;
const hasResettableValue = (v) => v !== null && v !== undefined;
exports.hasResettableValue = hasResettableValue;
const normalizeComparableValue = (value) => {
    if (value === null || value === undefined)
        return value;
    if (typeof value !== 'object')
        return value;
    if ('value' in value && value.value !== undefined) {
        return value.value;
    }
    if ('id' in value && value.id !== undefined) {
        return value.id;
    }
    return value;
};
exports.normalizeComparableValue = normalizeComparableValue;
const hasValueChanged = (current, previous) => {
    const normCurrent = (0, exports.normalizeComparableValue)(current);
    const normPrev = (0, exports.normalizeComparableValue)(previous);
    if (normCurrent === normPrev)
        return false;
    if (normCurrent === null || normCurrent === undefined || normPrev === null || normPrev === undefined) {
        return normCurrent !== normPrev;
    }
    return String(normCurrent) !== String(normPrev);
};
exports.hasValueChanged = hasValueChanged;
const extractRecordSignature = (value) => {
    if (value === null || value === undefined)
        return '';
    if (typeof value === 'object' && 'record' in value) {
        const rec = value.record;
        if (rec && typeof rec === 'object') {
            try {
                return JSON.stringify(rec);
            }
            catch {
                return '';
            }
        }
    }
    return String((0, exports.normalizeComparableValue)(value));
};
exports.extractRecordSignature = extractRecordSignature;
const getByPath = (obj, path) => {
    if (!obj || !path)
        return undefined;
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
exports.getByPath = getByPath;
const setByPath = (obj, path, value) => {
    if (!obj || typeof obj !== 'object' || !path)
        return obj;
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
exports.setByPath = setByPath;
const deepClone = (value) => {
    if (value === null || value === undefined || typeof value !== 'object') {
        return value;
    }
    if (value instanceof Date) {
        return new Date(value.getTime());
    }
    if (Array.isArray(value)) {
        return value.map((item) => (0, exports.deepClone)(item));
    }
    const copy = {};
    for (const [key, val] of Object.entries(value)) {
        copy[key] = (0, exports.deepClone)(val);
    }
    return copy;
};
exports.deepClone = deepClone;
const sortObjectKeys = (obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj))
        return obj;
    const sortedKeys = Object.keys(obj).sort();
    const result = {};
    for (const key of sortedKeys) {
        const val = obj[key];
        result[key] = val && typeof val === 'object' && !Array.isArray(val)
            ? (0, exports.sortObjectKeys)(val)
            : val;
    }
    return result;
};
exports.sortObjectKeys = sortObjectKeys;
//# sourceMappingURL=index.js.map