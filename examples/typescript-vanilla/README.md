# Teste Final: TypeScript Vanilla + @dynamic-form/core

Exemplo funcional e de alta performance de formulário dinâmico em **TypeScript Vanilla** consumindo o JSON Schema universal (`TESTE_FINAL/form-schema.json`), cobrindo com fidelidade todas as **10 regras do `DynamicField`**.

O projeto suporta **dois modos de execução**:
1. **Modo Web / DOM Interativo**: Aplicação web com Dark Theme moderno renderizada com manipulação de DOM nativa e reatividade fina via `store.subscribe`.
2. **Modo Headless / CLI Node.js**: Script executável em linha de comando (`cli.ts`) demonstrando a execução do motor sem nenhuma dependência de navegador.

---

## 🚀 Arquitetura e Reatividade

- **`FormStore` puro**: O `@dynamic-form/core` gerencia 100% do estado, validações e DAG de dependências sem qualquer framework de terceiros.
- **Subscrição Granular**: `store.subscribe((state) => updateDOM(state))` atualiza de forma reativa os elementos do DOM, inputs, visibilidade, desabilitação e cálculos.
- **Zero Overhead**: Build ultraleve de apenas 38 kB com tempo de compilação inferior a 600ms.

---

## 📋 As 10 Regras do `DynamicField` Cobertas

| # | Regra | Implementação no Exemplo |
|---|---|---|
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

### Executar em Modo CLI (Headless Node.js)
```bash
npm run cli
```

### Rodar servidor de desenvolvimento Web
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
