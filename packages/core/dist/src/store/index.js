/**
 * FormStore - Núcleo reativo e agnóstico de gerenciamento de estado do formulário
 */
import { DependencyGraph } from '../graph/index.js';
import { RuleEvaluator } from '../rules/index.js';
import { ArithmeticParser, TokenInterpolator } from '../expression/index.js';
import { ValidationEngine } from '../validation/index.js';
import { deepClone, getByPath, hasResettableValue, hasValueChanged, isFilled, normalizeComparableValue, sortObjectKeys, } from '../utils/index.js';
export class FormStore {
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
        this.graph = new DependencyGraph(matrix);
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
        this.runAutoSetsAndCalcsForInitialValues();
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
    runAutoSetsAndCalcsForInitialValues() {
        const vals = this.state.values;
        for (const field of this.fields) {
            const name = field.attr.name;
            const val = vals[name];
            if (isFilled(val)) {
                const deps = this.graph.getDependencies(name);
                if (deps && deps.autoSets.size > 0) {
                    for (const target of deps.autoSets) {
                        const targetField = this.graph.getField(target);
                        const options = field.options || field.attr?.options;
                        let sourcePath;
                        if (targetField?.autoSetFields && targetField.autoSetFields[name] !== undefined) {
                            sourcePath = targetField.autoSetFields[name];
                        }
                        else if (field.autoSetFields && field.autoSetFields[target] !== undefined) {
                            sourcePath = field.autoSetFields[target];
                        }
                        if (sourcePath && (vals[target] === undefined || vals[target] === null || vals[target] === '')) {
                            let derived;
                            if (options && Array.isArray(options)) {
                                const matchedOpt = options.find((opt) => String(opt.value) === String(val) || String(opt.id) === String(val));
                                if (matchedOpt) {
                                    if (sourcePath === 'record') {
                                        derived = matchedOpt.record;
                                    }
                                    else if (sourcePath.startsWith('record.')) {
                                        derived = getByPath(matchedOpt, sourcePath);
                                        if (derived === undefined && matchedOpt.record) {
                                            derived = getByPath(matchedOpt.record, sourcePath.replace(/^record\./, ''));
                                        }
                                    }
                                    else if (matchedOpt.record && typeof matchedOpt.record === 'object' && sourcePath in matchedOpt.record) {
                                        derived = matchedOpt.record[sourcePath];
                                    }
                                    else if (sourcePath in matchedOpt) {
                                        derived = matchedOpt[sourcePath];
                                    }
                                }
                            }
                            if (derived === undefined) {
                                derived = TokenInterpolator.resolveToken(sourcePath.startsWith('#{') ? sourcePath.slice(2, -2) : `${name}|${sourcePath}`, vals);
                            }
                            if (derived !== undefined && derived !== null) {
                                vals[target] = derived;
                            }
                        }
                    }
                }
            }
        }
        for (const field of this.fields) {
            const name = field.attr.name;
            const calcExpr = field.calcFields || field.attr?.calcFields || (typeof field.attr?.calcField === 'string' ? field.attr.calcField : field.attr?.calcField?.expression);
            if (calcExpr && (vals[name] === undefined || vals[name] === null || vals[name] === 0 || vals[name] === '')) {
                const result = ArithmeticParser.evaluate(calcExpr, vals, field.attr?.step);
                if (result !== null) {
                    vals[name] = field.component === 'number' ? result : String(result);
                }
            }
        }
    }
    buildInitialValues(userInitials, dataSource) {
        const vals = (deepClone(this.schema.default || {}) || {});
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
                    const match = RuleEvaluator.evaluateKeyRule(kr, vals, this.userSettings, this.externalVariables);
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
                visible = visible && RuleEvaluator.evaluateRule(field.dependentFields, vals, cond);
            }
            if (field.disabledFields) {
                const cond = field.disabledFieldsCondition || 'or';
                disabled = disabled || RuleEvaluator.evaluateRule(field.disabledFields, vals, cond);
            }
            // 3. rule condition
            if (field.attr?.rule) {
                const eff = RuleEvaluator.evaluateConditionRule(field.attr.rule, vals);
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
        if (!hasValueChanged(previousValue, value)) {
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
            if (!isMirror && (isDual || hasResettableValue(vals[dep]))) {
                vals[dep] = null;
            }
        }
        // 1b. ReloadFields (quando a fonte muda, reseta valor do dependente para recarregar opções)
        for (const dep of affected.reloads) {
            const depField = this.graph.getField(dep);
            if (depField?.reloadFields) {
                const shouldReload = RuleEvaluator.evaluateRule(depField.reloadFields, vals, 'or');
                if (shouldReload && hasResettableValue(vals[dep])) {
                    vals[dep] = null;
                }
            }
        }
        // 2. Recalcula visibilidade e habilitação
        this.recomputeVisibilityAndDisabled();
        // 3. AutoSetFields
        const modifiedFields = new Set([field]);
        for (const target of affected.autoSets) {
            const targetField = this.graph.getField(target);
            const srcField = this.graph.getField(field);
            const options = srcField?.options || srcField?.attr?.options;
            let sourcePath;
            if (targetField?.autoSetFields && targetField.autoSetFields[field] !== undefined) {
                sourcePath = targetField.autoSetFields[field];
            }
            else if (srcField?.autoSetFields && srcField.autoSetFields[target] !== undefined) {
                sourcePath = srcField.autoSetFields[target];
            }
            if (sourcePath !== undefined) {
                if (sourcePath === null) {
                    vals[target] = null;
                    modifiedFields.add(target);
                }
                else if (isFilled(value)) {
                    let derived;
                    if (options && Array.isArray(options)) {
                        const matchedOpt = options.find((opt) => String(opt.value) === String(value) || String(opt.id) === String(value));
                        if (matchedOpt) {
                            if (sourcePath === 'record') {
                                derived = matchedOpt.record;
                            }
                            else if (sourcePath.startsWith('record.')) {
                                derived = getByPath(matchedOpt, sourcePath);
                                if (derived === undefined && matchedOpt.record) {
                                    derived = getByPath(matchedOpt.record, sourcePath.replace(/^record\./, ''));
                                }
                            }
                            else if (matchedOpt.record && typeof matchedOpt.record === 'object' && sourcePath in matchedOpt.record) {
                                derived = matchedOpt.record[sourcePath];
                            }
                            else if (sourcePath in matchedOpt) {
                                derived = matchedOpt[sourcePath];
                            }
                        }
                    }
                    if (derived === undefined) {
                        derived = TokenInterpolator.resolveToken(sourcePath.startsWith('#{') ? sourcePath.slice(2, -2) : `${field}|${sourcePath}`, vals);
                    }
                    if (derived !== undefined && derived !== null) {
                        vals[target] = derived;
                        modifiedFields.add(target);
                    }
                }
                else {
                    vals[target] = null;
                    modifiedFields.add(target);
                }
            }
        }
        // 4. CalcFields (recalcula campos que dependem de 'field' OU de campos modificados por autoSet)
        const allCalcs = new Set(affected.calcs);
        for (const modField of modifiedFields) {
            const modDeps = this.graph.getDependencies(modField);
            if (modDeps) {
                for (const calcName of modDeps.calcs) {
                    allCalcs.add(calcName);
                }
            }
        }
        for (const calcTarget of allCalcs) {
            const targetField = this.graph.getField(calcTarget);
            const calcExpr = targetField?.calcFields || targetField?.attr?.calcFields || (typeof targetField?.attr?.calcField === 'string' ? targetField.attr.calcField : targetField?.attr?.calcField?.expression);
            if (calcExpr) {
                const result = ArithmeticParser.evaluate(calcExpr, vals, targetField?.attr?.step);
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
        const copy = deepClone(raw);
        for (const key of Object.keys(copy)) {
            if (this.state.visibility[key] === false && this.graph.getField(key)?.attr?.hidden !== true) {
                delete copy[key];
            }
            copy[key] = normalizeComparableValue(copy[key]);
        }
        return sortObjectKeys(copy);
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
        const errors = await ValidationEngine.validateForm(this.fields, this.state.values, this.state.visibility, this.state.disabledState, this.userSettings, this.externalVariables);
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
        const submitValues = deepClone(this.state.values);
        for (const key of Object.keys(submitValues)) {
            if (this.state.visibility[key] === false && this.graph.getField(key)?.attr?.hidden !== true) {
                delete submitValues[key];
            }
            submitValues[key] = normalizeComparableValue(submitValues[key]);
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
    isFieldRequired(name) {
        const field = this.graph.getField(name);
        if (!field)
            return false;
        return ValidationEngine.isFieldRequired(field, this.state.values, this.userSettings, this.externalVariables);
    }
}
//# sourceMappingURL=index.js.map