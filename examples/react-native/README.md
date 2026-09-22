# 📱 Project: React Native App com 10 Regras do DynamicField

Aplicação **React Native / Expo** independente organizada dentro de `examples/react-native`, configurada para validar o motor universal **`@dynamic-form/core`** cobrindo com precisão as **10 regras do DynamicField**:

1. `dependentFields`
2. `disabledFields`
3. `disabledFieldsCondition`
4. `reloadFields`
5. `autoSetFields`
6. `clearedFields`
7. `clearedFieldsChanged`
8. `requiredFields`
9. `requiredRule`
10. `calcFields`

---

## 🚀 Como Executar

Acesse a pasta do projeto:

```bash
cd examples/react-native
```

### 1. No Emulador ou Dispositivo Android

```bash
npm run android
```

### 2. No Simulador iOS (macOS)

```bash
npm run ios
```

---

## 🔍 Guia de Teste das 10 Regras na Interface

### 1. `clearedFieldsChanged` & `clearedFields` & `dependentFields` (Seção 1)

- **Onde:** Seletor **Tipo de Pessoa (PF / PJ)**.
- **Como testar:**
  - Como **PF**, preencha o campo **CPF**.
  - Alterne para **PJ**: o `clearedFieldsChanged: true` no campo `person_type` limpa instantaneamente o CPF para `null`.
  - O campo **CNPJ** e **Razão Social** tornam-se visíveis através de `dependentFields: { person_type: 'PJ' }`.
  - Preencha a Razão Social e retorne para PF: a Razão Social é limpa via `clearedFields: ['person_type']` (target-driven).

### 2. `requiredFields` & `requiredRule` (Seção 1 e Seção 4)

- **Onde:** Campos **CPF**, **CNPJ** e **Garantia Adicional**.
- **Como testar:**
  - Quando selecionado **PF**, o CPF ganha o asterisco `*` de obrigatório dinamicamente via `requiredFields: { person_type: 'PF' }` com `requiredRule: 'or'`.
  - Quando selecionado **PJ**, o CNPJ torna-se obrigatório.
  - Na Seção 4, selecione a categoria **VIP** e defina a quantidade para **5**: o campo **Garantia Adicional** torna-se obrigatório dinamicamente devido à regra com operador `'and'`: `requiredFields: { supplier_category: 'vip', quantity: 5 }` com `requiredRule: 'and'`.
  - Tente submeter o formulário sem preencher a garantia: a validação bloqueia e exibe mensagem de erro.

### 3. `reloadFields` (Seção 2)

- **Onde:** Seletores de **Estado (UF)** e **Cidade**.
- **Como testar:**
  - Selecione **São Paulo (SP)**: as opções de cidades passam a ser São Paulo, Campinas e São José dos Campos. Selecione **Campinas**.
  - Mude o estado para **Rio de Janeiro (RJ)**: o campo `city_id` possui `reloadFields: ['state_id']`. O valor anterior é resetado para `null` e a lista de opções é atualizada para as cidades do RJ (Rio de Janeiro, Niterói, Petrópolis).

### 4. `disabledFields` & `disabledFieldsCondition` (Seção 3)

- **Onde:** **Prazo de Pagamento** e **Desconto (%)**.
- **Como testar:**
  - O campo **Prazo de Pagamento** possui:
    `disabledFields: { supplier_category: 'restricted', person_type: 'PF' }` com `disabledFieldsCondition: 'and'`.
    - Se Categoria = "Restrito" e Tipo = "PJ", o campo permanece **habilitado**.
    - Se Categoria = "Restrito" e Tipo = "PF", o campo é **bloqueado/desabilitado** imediatamente e exibe aviso de bloqueio.
  - O campo **Desconto (%)** possui:
    `disabledFields: { supplier_category: 'restricted' }` com `disabledFieldsCondition: 'or'`.
    - Ao selecionar categoria "Restrito", o desconto fica desabilitado para edição.

### 5. `autoSetFields` (Seção 4)

- **Onde:** Seletor de **Produto / Item**.
- **Como testar:**
  - Clique em **Notebook Dell XPS 15**: os campos `product_sku` ("DELL-XPS-15") e `unit_price` (R$ 8.500) são auto-preenchidos a partir de `record.sku` e `record.price`.
  - Clique em **Monitor LG UltraWide**: o SKU muda para "LG-34-UW" e o Preço para R$ 2.400 sem intervenção manual.

### 6. `calcFields` (Seção 4)

- **Onde:** Campo **Total Calculado (R$)**.
- **Como testar:**
  - Fórmula matemática segura avaliada via parser recursivo AST:
    `#{quantity}# * #{unit_price}# * (1 - #{discount_percent}# / 100)`
  - Altere a **Quantidade** (ex: de 2 para 3) ou o **Desconto** (ex: de 10% para 20%).
  - O Total Calculado atualiza em tempo real com arredondamento preciso de 2 casas decimais.

### 7. Inspetor de Estado do DAG Engine

- No rodapé da tela, o card exibe em tempo real:
  - Estado `isDirty` (Limpo / Modificado) com baseline normalizada.
  - Valores calculados e visibilidade dos nós do DAG.
  - Status de obrigatoriedade dinâmica calculada.
