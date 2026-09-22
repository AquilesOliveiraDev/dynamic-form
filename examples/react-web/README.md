# Teste Final: React 19 + @dynamic-form/core

Exemplo funcional e reativo de formulário dinâmico em **React 19** consumindo o JSON Schema universal (`examples/form-schema.json`), cobrindo com fidelidade todas as **10 regras do `DynamicField`**.

---

## 🚀 Arquitetura e Reatividade

O projeto utiliza **React 19 + TypeScript + Vite**, integrando o `@dynamic-form/core` através de um Hook customizado de alto desempenho:

- **`useDynamicForm`** ([`src/hooks/useDynamicForm.ts`](./src/hooks/useDynamicForm.ts)):
  - Utiliza `useSyncExternalStore` (API padrão do React 18/19 para integração sem _tearing_ com stores externos).
  - Mantém snapshots imutáveis (`cloneState`) garantindo re-renderizações instantâneas e consistentes a cada transição de estado da `FormStore`.
  - Expõe os estados de forma desestruturada: `values`, `errors`, `touched`, `visibility`, `disabledState`, `isDirty`, `isSubmitting`, `submitCount`, `setValue`, `submit`, `reset` e `isFieldRequired`.

---

## 📋 As 10 Regras do `DynamicField` Cobertas

| # | Regra | Implementação no Exemplo |
| --- | --- | --- |
| 1 | `dependentFields` | Alternância condicional de visibilidade entre **CPF** (PF) e **CNPJ + Razão Social** (PJ). |
| 2 | `disabledFields` | Desabilitação de **Condições de Pagamento** e **% Desconto** com base no tipo de pessoa e fornecedor. |
| 3 | `disabledFieldsCondition` | Operadores lógicos: `and` para Condições de Pagamento (exige `restricted` **AND** `PF`) e `or` para % Desconto. |
| 4 | `reloadFields` | Ao mudar o **Estado (UF)** (`state_id`), o catálogo de **Cidades** (`city_id`) é recarregado dinamicamente. |
| 5 | `autoSetFields` | Ao selecionar um produto no catálogo, os campos **SKU** (`product_sku`) e **Preço Unitário** (`unit_price`) são preenchidos automaticamente. |
| 6 | `clearedFields` | Ao trocar o Estado, o campo Cidade é resetado para `null`. |
| 7 | `clearedFieldsChanged` | Ao alternar de PF para PJ (ou vice-versa), os campos de documento anteriores são limpos imediatamente. |
| 8 | `requiredFields` | O campo **Garantia Estendida** (`warranty_months`) torna-se obrigatório somente em compras corporativas com alta quantidade. |
| 9 | `requiredRule` | Avaliação da obrigatoriedade dinâmica utilizando operador lógico `and` (`supplier_category === 'vip'` E `quantity >= 5`). |
| 10 | `calcFields` | Cálculo reativo em tempo real via AST Parser da fórmula `quantity * unit_price * (1 - discount_percent / 100)`. |

---

## 🛠️ Comandos

### Instalar dependências

```bash
npm install
```

### Rodar servidor de desenvolvimento

```bash
npm run dev
```

### Executar testes unitários (Vitest)

```bash
npm test
```

### Build de produção

```bash
npm run build
```
