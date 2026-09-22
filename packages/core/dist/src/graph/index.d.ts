/**
 * Grafo Acíclico Dirigido (DAG) para resolução topológica de dependências entre campos
 */
import type { DynamicField } from '../types/index.js';
export interface FieldDependencyMap {
    /** Campos que devem ser limpos quando esta chave mudar */
    clears: Set<string>;
    /** Campos cujo reload/reset é acionado quando esta chave mudar */
    reloads: Set<string>;
    /** Campos cujo autoSet é alimentado por esta chave */
    autoSets: Set<string>;
    /** Campos cuja visibilidade/habilitação/obrigatoriedade depende desta chave */
    conditions: Set<string>;
    /** Campos calculados que referenciam esta chave */
    calcs: Set<string>;
}
export declare class DependencyGraph {
    private dependencies;
    private fieldsByName;
    private dualPairs;
    constructor(fields: DynamicField[][]);
    getField(name: string): DynamicField | undefined;
    getDependencies(name: string): FieldDependencyMap | undefined;
    isDualPair(sourceField: string, dependentField: string): boolean;
    private ensureNode;
    private buildGraph;
    private extractClearedSources;
    /**
     * Validação de ciclos ilegais (ciclos diretos que gerariam loops infinitos)
     */
    private validateAcyclic;
    /**
     * Ordena topologicamente os campos afetados por uma mudança
     */
    getTopologicalAffectedFields(changedField: string): {
        clears: string[];
        reloads: string[];
        conditions: string[];
        autoSets: string[];
        calcs: string[];
    };
    /**
     * Checagem de Espelho Forward/Reverse para evitar loops destrutivos
     */
    hasMatchingAutoSetMirror(sourceField: string, dependentField: string, values: Record<string, any>): boolean;
}
//# sourceMappingURL=index.d.ts.map