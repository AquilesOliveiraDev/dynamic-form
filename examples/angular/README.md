# TESTE_FINAL: Angular Dynamic Form

Projeto funcional de referência em **Angular 22+ (Signals)** para o motor `@dynamic-form`, consumindo o mesmo contrato unificado [`TESTE_FINAL/form-schema.json`](../form-schema.json).

---

## 🚀 Como Executar

### 1. Executar os Testes Unitários (100% Cobertura das 10 Regras)
```bash
npm test -- --watch=false
```

### 2. Build de Produção
```bash
npm run build
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm start
# Acesse http://localhost:4200/
```

---

## 📋 As 10 Regras do `DynamicField` Implementadas

| # | Regra | Implementação Angular | Descrição |
|---|---|---|---|
| 1 | `dependentFields` | Template condicional via `@if` / Signals | Exibe CPF para PF e CNPJ/Razão Social para PJ |
| 2 | `disabledFields` | `[disabled]="s.disabledState[field]"` | Bloqueia campos com base no estado reativo do store |
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
TESTE_FINAL/angular/
├── public/
│   └── form-schema.json -> ../../form-schema.json (Symlink do contrato universal)
├── src/
│   ├── app/
│   │   ├── app.ts                  # Componente standalone com Signals e computed
│   │   ├── app.html                # Template moderno com cards, chips e feedback visual
│   │   ├── app.css                 # Estilos modernos em Dark Theme
│   │   ├── app.spec.ts             # Testes unitários cobrindo as 10 regras
│   │   └── dynamic-form.service.ts # Serviço Angular que conecta com @dynamic-form/core
│   ├── main.ts
│   └── styles.css
├── angular.json
├── package.json
└── tsconfig.json
```
