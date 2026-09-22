"use strict";
/**
 * Grafo Acíclico Dirigido (DAG) para resolução topológica de dependências entre campos
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyGraph = void 0;
const index_js_1 = require("../expression/index.js");
const index_js_2 = require("../utils/index.js");
class DependencyGraph {
    dependencies = new Map();
    fieldsByName = new Map();
    dualPairs = new Set(); // source:dependent
    constructor(fields) {
        this.buildGraph(fields);
        this.validateAcyclic();
    }
    getField(name) {
        return this.fieldsByName.get(name);
    }
    getDependencies(name) {
        return this.dependencies.get(name);
    }
    isDualPair(sourceField, dependentField) {
        return this.dualPairs.has(`${sourceField}:${dependentField}`);
    }
    ensureNode(name) {
        let node = this.dependencies.get(name);
        if (!node) {
            node = {
                clears: new Set(),
                autoSets: new Set(),
                conditions: new Set(),
                calcs: new Set(),
            };
            this.dependencies.set(name, node);
        }
        return node;
    }
    buildGraph(matrix) {
        const flatFields = [];
        for (const row of matrix) {
            for (const field of row) {
                if (field?.attr?.name) {
                    flatFields.push(field);
                    this.fieldsByName.set(field.attr.name, field);
                    this.ensureNode(field.attr.name);
                }
            }
        }
        for (const field of flatFields) {
            const targetName = field.attr.name;
            // 1. ClearedFields
            if (field.clearedFields) {
                const sources = this.extractClearedSources(field.clearedFields);
                for (const source of sources) {
                    this.ensureNode(source).clears.add(targetName);
                    if (field.autoSetFields && source in field.autoSetFields) {
                        this.dualPairs.add(`${source}:${targetName}`);
                    }
                }
            }
            // 2. AutoSetFields
            if (field.autoSetFields) {
                for (const source of Object.keys(field.autoSetFields)) {
                    this.ensureNode(source).autoSets.add(targetName);
                }
            }
            // 3. DependentFields & DisabledFields
            if (field.dependentFields) {
                const sources = Array.isArray(field.dependentFields)
                    ? field.dependentFields
                    : Object.keys(field.dependentFields);
                for (const source of sources) {
                    this.ensureNode(source).conditions.add(targetName);
                }
            }
            if (field.disabledFields) {
                const sources = Array.isArray(field.disabledFields)
                    ? field.disabledFields
                    : Object.keys(field.disabledFields);
                for (const source of sources) {
                    this.ensureNode(source).conditions.add(targetName);
                }
            }
            // 4. Rule Condition
            const rule = field.attr?.rule || field.rule;
            if (rule) {
                const rules = Array.isArray(rule) ? rule : [rule];
                for (const r of rules) {
                    if (r.field) {
                        this.ensureNode(r.field).conditions.add(targetName);
                    }
                }
            }
            // 5. CalcFields
            const calcExpr = field.calcFields || field.attr?.calcFields || (typeof field.attr?.calcField === 'string' ? field.attr.calcField : field.attr?.calcField?.expression);
            if (calcExpr && typeof calcExpr === 'string') {
                const matches = Array.from(calcExpr.matchAll(/#\{([^}]+)\}#/g));
                for (const m of matches) {
                    const source = m[1].trim();
                    this.ensureNode(source).calcs.add(targetName);
                }
            }
        }
    }
    extractClearedSources(clearedFields) {
        if (!clearedFields)
            return [];
        if (Array.isArray(clearedFields))
            return clearedFields;
        if (typeof clearedFields === 'object') {
            const obj = clearedFields;
            if (obj.fields) {
                return Array.isArray(obj.fields) ? obj.fields : Object.keys(obj.fields);
            }
            return Object.keys(obj).filter((k) => k !== 'allChanges');
        }
        return [];
    }
    /**
     * Validação de ciclos ilegais (ciclos diretos que gerariam loops infinitos)
     */
    validateAcyclic() {
        const visited = new Set();
        const recStack = new Set();
        const checkCycle = (node) => {
            visited.add(node);
            recStack.add(node);
            const deps = this.dependencies.get(node);
            if (deps) {
                const allTargets = new Set([...deps.autoSets, ...deps.calcs]);
                for (const neighbor of allTargets) {
                    if (!visited.has(neighbor) && checkCycle(neighbor)) {
                        return true;
                    }
                    else if (recStack.has(neighbor)) {
                        // Ciclos de autoSets e calcs são perigosos
                        console.warn(`[DynamicForm DAG] Ciclo detectado entre campos: ${node} -> ${neighbor}`);
                        return false;
                    }
                }
            }
            recStack.delete(node);
            return false;
        };
        for (const node of this.dependencies.keys()) {
            if (!visited.has(node)) {
                checkCycle(node);
            }
        }
    }
    /**
     * Ordena topologicamente os campos afetados por uma mudança
     */
    getTopologicalAffectedFields(changedField) {
        const deps = this.dependencies.get(changedField);
        if (!deps) {
            return { clears: [], conditions: [], autoSets: [], calcs: [] };
        }
        return {
            clears: Array.from(deps.clears),
            conditions: Array.from(deps.conditions),
            autoSets: Array.from(deps.autoSets),
            calcs: Array.from(deps.calcs),
        };
    }
    /**
     * Checagem de Espelho Forward/Reverse para evitar loops destrutivos
     */
    hasMatchingAutoSetMirror(sourceField, dependentField, values) {
        const depField = this.fieldsByName.get(dependentField);
        if (depField?.autoSetFields && sourceField in depField.autoSetFields) {
            const path = depField.autoSetFields[sourceField];
            if (path) {
                const derived = index_js_1.TokenInterpolator.resolveToken(`${sourceField}|${path}`, values);
                if (!(0, index_js_2.hasValueChanged)(values[dependentField], derived))
                    return true;
            }
        }
        const srcField = this.fieldsByName.get(sourceField);
        if (srcField?.autoSetFields && dependentField in srcField.autoSetFields) {
            const path = srcField.autoSetFields[dependentField];
            if (path) {
                const derived = index_js_1.TokenInterpolator.resolveToken(`${dependentField}|${path}`, values);
                if (!(0, index_js_2.hasValueChanged)(values[sourceField], derived))
                    return true;
            }
        }
        return false;
    }
}
exports.DependencyGraph = DependencyGraph;
//# sourceMappingURL=index.js.map