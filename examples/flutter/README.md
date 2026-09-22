# TESTE_FINAL: Flutter Dynamic Form

Projeto funcional de referência em **Flutter** para o motor `@dynamic-form`, consumindo o mesmo contrato unificado `TESTE_FINAL/form-schema.json`.

---

## 🚀 Como Executar

### 1. Executar os Testes Unitários (100% Cobertura das 10 Regras)
```bash
flutter test
```

### 2. Análise Estática (Dart Analyze)
```bash
dart analyze
```

### 3. Rodar o App no Emulador ou Dispositivo Conectado
```bash
flutter run
```

---

## 📋 As 10 Regras do `DynamicField` Implementadas

| # | Regra | Implementação Flutter | Descrição |
|---|---|---|---|
| 1 | `dependentFields` | `DynamicFormController._recomputeRules()` | Exibe CPF apenas para PF e CNPJ/Razão Social para PJ |
| 2 | `disabledFields` | `DynamicFormController._recomputeRules()` | Bloqueia campos com base em valores de outros campos |
| 3 | `disabledFieldsCondition` | Operadores `'and'` / `'or'` | Permite combinar múltiplos campos para desabilitação |
| 4 | `reloadFields` | `DynamicFormController.setValue()` | Reseta cidade quando o estado é alterado |
| 5 | `autoSetFields` | `DynamicFormController._extractAutoSetValue()` | Preenche SKU e Preço Unitário a partir do produto selecionado |
| 6 | `clearedFields` | `DynamicFormController.setValue()` | Limpa campos dependentes quando a fonte é alterada |
| 7 | `clearedFieldsChanged` | Modo reativo na fonte | Quando `person_type` muda, limpa imediatamente CPF e CNPJ |
| 8 | `requiredFields` | `DynamicFormController.isFieldRequired()` | Define obrigatoriedade condicional (ex: Garantia obrigatória para VIP + Qtd ≥ 5) |
| 9 | `requiredRule` | Operadores `'and'` / `'or'` | Combina condições de obrigatoriedade |
| 10 | `calcFields` | `ArithmeticParser.evaluate()` (sem `eval`) | Calcula `total_price = quantity * unit_price * (1 - discount / 100)` com descida recursiva |

---

## 📂 Estrutura de Arquivos

```
TESTE_FINAL/flutter/
├── assets/
│   └── form-schema.json -> ../form-schema.json (Symlink do contrato universal)
├── lib/
│   ├── dynamic_form/
│   │   ├── arithmetic_parser.dart      # Parser recursivo AST aritmético seguro
│   │   └── dynamic_form_controller.dart # Gerenciador de estado reativo ChangeNotifier
│   └── main.dart                       # UI Material 3 completa e interativa
├── test/
│   └── dynamic_form_test.dart          # Suíte de testes unitários para as 10 regras
├── pubspec.yaml
└── README.md
```
