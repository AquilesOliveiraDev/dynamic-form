# TESTE_FINAL: Vue 3 Dynamic Form

Projeto funcional de referência em **Vue 3 (Composition API & `<script setup>`)** para o motor `@dynamic-form`, consumindo o mesmo contrato unificado [`examples/form-schema.json`](../form-schema.json).

---

## 🚀 Como Executar

### 1. Executar os Testes Unitários (100% Cobertura das 10 Regras)

```bash
npm test
```

### 2. Build de Produção

```bash
npm run build
```

### 3. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
# Acesse o endereço exibido no terminal (ex: http://localhost:5173/)
```

---

## 📋 As 10 Regras do `DynamicField` Implementadas

| # | Regra | Implementação Vue 3 | Descrição |
| --- | --- | --- | --- |
| 1 | `dependentFields` | `v-if="state.visibility[field] !== false"` | Exibe CPF para PF e CNPJ/Razão Social para PJ |
| 2 | `disabledFields` | `:disabled="state.disabledState[field] === true"` | Bloqueia campos com base no estado reativo do store |
| 3 | `disabledFieldsCondition` | Operadores `'and'` / `'or'` | Combina múltiplos campos para desabilitação no `@dynamic-form/core` |
| 4 | `reloadFields` | DAG topológico do `FormStore` | Reseta cidade automaticamente ao trocar de estado |
| 5 | `autoSetFields` | DAG + `extractAutoSetValue` | Preenche SKU e Preço Unitário a partir do produto selecionado |
| 6 | `clearedFields` | Cascata target-driven | Limpa campos dependentes quando a fonte é alterada |
| 7 | `clearedFieldsChanged` | Modo na fonte | Alterar `person_type` limpa imediatamente CPF e CNPJ |
| 8 | `requiredFields` | `isFieldRequired()` reativo | Obrigatoriedade dinâmica (ex: Garantia obrigatória para VIP + Qtd ≥ 5) |
| 9 | `requiredRule` | Operadores `'and'` / `'or'` | Avalia condições de obrigatoriedade no schema |
| 10 | `calcFields` | `ArithmeticParser` sem `eval()` | Calcula `total_price = quantity * unit_price * (1 - discount / 100)` |

---

## 📂 Estrutura de Arquivos

```
examples/vue/
├── public/
│   └── form-schema.json -> ../../form-schema.json (Symlink do contrato universal)
├── src/
│   ├── composables/
│   │   └── useDynamicForm.ts     # Composable Vue 3 conectando ao @dynamic-form/core
│   ├── App.vue                   # Componente principal com script setup e CSS moderno
│   ├── main.ts
│   └── style.css
├── tests/
│   └── dynamic-form.spec.ts      # Testes unitários com Vitest
├── package.json
├── tsconfig.json
└── vite.config.ts
```
