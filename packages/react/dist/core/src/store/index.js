"use strict";
/**
 * FormStore - Núcleo reativo e agnóstico de gerenciamento de estado do formulário
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormStore = void 0;
const index_js_1 = require("../graph/index.js");
const index_js_2 = require("../rules/index.js");
const index_js_3 = require("../expression/index.js");
const index_js_4 = require("../validation/index.js");
const index_js_5 = require("../utils/index.js");
class FormStore {
    schema;
    fields;
    graph;
    state;
    baselineValues;
    listeners = new Set();
    fieldListeners = new Map();
    userSettings;
    externalVariables;
    isSettled = false;
    settleTimer = null;
    config;
    constructor(config) {
        this.config = config;
        this.schema = config.schema;
        this.userSettings = config.userSettings;
        this.externalVariables = config.externalVariables || {};
        const matrix = this.schema.fields || this.schema.structure || [];
        this.fields = matrix.flat();
        this.graph = new index_js_1.DependencyGraph(matrix);
        const initialValues = this.buildInitialValues(config.initialValues, config.dataSource);
        this.state = {
            values: initialValues,
            errors: {},
            touched: {},
            visibility: {},
            disabledState: {},
            isDirty: false,
            changedFields: [],
            isSubmitting: false,
            isValidating: false,
            submitCount: 0,
        };
        this.recomputeVisibilityAndDisabled();
        this.baselineValues = this.buildNormalizedBaseline(this.state.values);
        if (config.dataSource && Object.keys(config.dataSource).length > 0) {
            this.isSettled = false;
            this.settleTimer = setTimeout(() => {
                this.isSettled = true;
                this.baselineValues = this.buildNormalizedBaseline(this.state.values);
            }, config.settleMs ?? 400);
        }
        else {
            this.isSettled = true;
        }
    }
    buildInitialValues(userInitials, dataSource) {
        const vals = ((0, index_js_5.deepClone)(this.schema.default || {}) || {});
        for (const field of this.fields) {
            const name = field.attr.name;
            if (vals[name] === undefined) {
                if (field.component === 'switch')
                    vals[name] = false;
                else if (['autocomplete', 'select', 'datepicker', 'radio'].includes(field.component))
                    vals[name] = null;
                else if (field.component === 'checkbox' && field.attr?.options?.length)
                    vals[name] = [];
                else
                    vals[name] = '';
            }
        }
        if (userInitials) {
            Object.assign(vals, userInitials);
        }
        if (dataSource) {
            Object.assign(vals, dataSource);
        }
        return vals;
    }
    getState() {
        return this.state;
    }
    getValues() {
        return this.state.values;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    subscribeField(name, listener) {
        if (!this.fieldListeners.has(name)) {
            this.fieldListeners.set(name, new Set());
        }
        this.fieldListeners.get(name).add(listener);
        return () => this.fieldListeners.get(name)?.delete(listener);
    }
    notify() {
        for (const listener of this.listeners) {
            listener(this.state);
        }
        for (const [name, listeners] of this.fieldListeners) {
            const fieldState = {
                value: this.state.values[name],
                error: this.state.errors[name],
                touched: this.state.touched[name],
                visible: this.state.visibility[name] !== false,
                disabled: this.state.disabledState[name] === true,
            };
            for (const listener of listeners) {
                listener(fieldState);
            }
        }
    }
    recomputeVisibilityAndDisabled() {
        const vals = this.state.values;
        const nextVis = {};
        const nextDis = {};
        for (const field of this.fields) {
            const name = field.attr.name;
            let visible = field.attr.hidden !== true;
            let disabled = field.attr.disabled === true;
            // 1. keyRules
            if (field.attr?.keyRules && Array.isArray(field.attr.keyRules)) {
                for (const kr of field.attr.keyRules) {
                    const match = index_js_2.RuleEvaluator.evaluateKeyRule(kr, vals, this.userSettings, this.externalVariables);
                    if (kr.rule === 'show')
                        visible = visible && match;
                    if (kr.rule === 'hide')
                        visible = visible && !match;
                    if (kr.rule === 'disable')
                        disabled = disabled || match;
                    if (kr.rule === 'enable' && match)
                        disabled = false;
                }
            }
            // 2. dependentFields & disabledFields
            if (field.dependentFields) {
                const cond = field.dependentFieldsCondition || 'or';
                visible = visible && index_js_2.RuleEvaluator.evaluateRule(field.dependentFields, vals, cond);
            }
            if (field.disabledFields) {
                const cond = field.disabledFieldsCondition || 'or';
                disabled = disabled || index_js_2.RuleEvaluator.evaluateRule(field.disabledFields, vals, cond);
            }
            // 3. rule condition
            if (field.attr?.rule) {
                const eff = index_js_2.RuleEvaluator.evaluateConditionRule(field.attr.rule, vals);
                if (eff.show !== undefined)
                    visible = visible && eff.show;
                if (eff.hide !== undefined)
                    visible = visible && !eff.hide;
                if (eff.enable && eff.enable)
                    disabled = false;
                if (eff.disable !== undefined)
                    disabled = disabled || eff.disable;
            }
            nextVis[name] = visible;
            nextDis[name] = disabled;
        }
        this.state.visibility = nextVis;
        this.state.disabledState = nextDis;
    }
    setValue(field, value, options = {}) {
        if (this.settleTimer && !this.isSettled) {
            clearTimeout(this.settleTimer);
            this.isSettled = true;
        }
        const previousValue = this.state.values[field];
        if (!(0, index_js_5.hasValueChanged)(previousValue, value)) {
            return;
        }
        const vals = this.state.values;
        vals[field] = value;
        this.state.touched[field] = true;
        // PIPELINE DE EXECUÇÃO VIA DAG
        const affected = this.graph.getTopologicalAffectedFields(field);
        // 1. ClearedFields em cascata
        for (const dep of affected.clears) {
            const isDual = this.graph.isDualPair(field, dep);
            const isMirror = !isDual && this.graph.hasMatchingAutoSetMirror(field, dep, vals);
            if (!isMirror && (isDual || (0, index_js_5.hasResettableValue)(vals[dep]))) {
                vals[dep] = null;
            }
        }
        // 2. Recalcula visibilidade e habilitação
        this.recomputeVisibilityAndDisabled();
        // 3. AutoSetFields
        for (const target of affected.autoSets) {
            const targetField = this.graph.getField(target);
            if (targetField?.autoSetFields) {
                const sourcePath = targetField.autoSetFields[field];
                if (sourcePath !== undefined) {
                    if (sourcePath === null) {
                        vals[target] = null;
                    }
                    else if ((0, index_js_5.isFilled)(value)) {
                        const derived = index_js_3.TokenInterpolator.resolveToken(sourcePath.startsWith('#{') ? sourcePath.slice(2, -2) : `${field}|${sourcePath}`, vals);
                        if (derived !== undefined && derived !== null) {
                            vals[target] = derived;
                        }
                    }
                    else {
                        vals[target] = null;
                    }
                }
            }
        }
        // 4. CalcFields
        for (const calcTarget of affected.calcs) {
            const targetField = this.graph.getField(calcTarget);
            const calcExpr = targetField?.calcFields || targetField?.attr?.calcFields || (typeof targetField?.attr?.calcField === 'string' ? targetField.attr.calcField : targetField?.attr?.calcField?.expression);
            if (calcExpr) {
                const result = index_js_3.ArithmeticParser.evaluate(calcExpr, vals, targetField?.attr?.step);
                vals[calcTarget] = result !== null ? (targetField?.component === 'number' ? result : String(result)) : null;
            }
        }
        // 5. Atualiza dirty check
        this.updateDirtyState();
        // 6. Validação (se solicitada)
        if (options.shouldValidate) {
            this.validateForm();
        }
        this.notify();
        this.config.onChangeValues?.(this.state.values);
    }
    buildNormalizedBaseline(raw) {
        const copy = (0, index_js_5.deepClone)(raw);
        for (const key of Object.keys(copy)) {
            if (this.state.visibility[key] === false && this.graph.getField(key)?.attr?.hidden !== true) {
                delete copy[key];
            }
            copy[key] = (0, index_js_5.normalizeComparableValue)(copy[key]);
        }
        return (0, index_js_5.sortObjectKeys)(copy);
    }
    updateDirtyState() {
        const currentNormalized = this.buildNormalizedBaseline(this.state.values);
        const baseline = this.baselineValues;
        const allKeys = new Set([...Object.keys(baseline), ...Object.keys(currentNormalized)]);
        const changed = [];
        for (const key of allKeys) {
            if (JSON.stringify(baseline[key]) !== JSON.stringify(currentNormalized[key])) {
                changed.push(key);
            }
        }
        const wasDirty = this.state.isDirty;
        this.state.isDirty = changed.length > 0;
        this.state.changedFields = changed.sort();
        if (wasDirty !== this.state.isDirty) {
            this.config.onDirtyChange?.(this.state.isDirty, this.state.changedFields);
        }
    }
    async validateForm() {
        this.state.isValidating = true;
        this.notify();
        const errors = await index_js_4.ValidationEngine.validateForm(this.fields, this.state.values, this.state.visibility, this.state.disabledState, this.userSettings, this.externalVariables);
        this.state.errors = errors;
        this.state.isValidating = false;
        this.notify();
        return Object.keys(errors).length === 0;
    }
    async submit() {
        this.state.submitCount++;
        const isValid = await this.validateForm();
        if (!isValid) {
            return;
        }
        this.state.isSubmitting = true;
        this.notify();
        // Filtra campos ocultos que não sejam hidden estáticos
        const submitValues = (0, index_js_5.deepClone)(this.state.values);
        for (const key of Object.keys(submitValues)) {
            if (this.state.visibility[key] === false && this.graph.getField(key)?.attr?.hidden !== true) {
                delete submitValues[key];
            }
            submitValues[key] = (0, index_js_5.normalizeComparableValue)(submitValues[key]);
        }
        try {
            if (this.config.onSubmit) {
                await this.config.onSubmit(submitValues);
            }
        }
        finally {
            this.state.isSubmitting = false;
            this.notify();
        }
    }
    reset() {
        const initialValues = this.buildInitialValues(this.config.initialValues, this.config.dataSource);
        this.state.values = initialValues;
        this.state.errors = {};
        this.state.touched = {};
        this.state.submitCount = 0;
        this.state.isSubmitting = false;
        this.recomputeVisibilityAndDisabled();
        this.baselineValues = this.buildNormalizedBaseline(this.state.values);
        this.updateDirtyState();
        this.notify();
    }
}
exports.FormStore = FormStore;
//# sourceMappingURL=index.js.map