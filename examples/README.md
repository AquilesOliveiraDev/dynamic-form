# 🎯 Exemplos Oficiais do @dynamic-form

Esta pasta contém implementações práticas e canônicas do motor `@dynamic-form` através de **13 tecnologias diferentes**, unificadas por um único contrato universal: [`form-schema.json`](./form-schema.json).

---

## 🌟 O Esquema Universal (`form-schema.json`)

Todos os exemplos de interface consomem o arquivo universal [`form-schema.json`](./form-schema.json) que implementa um caso de uso real de cadastro de pedidos e fornecedores com todas as **10 regras do `DynamicField`**:

1. **`dependentFields`**: Alternância condicional de visibilidade entre CPF (PF) e CNPJ + Razão Social (PJ).
2. **`disabledFields`**: Desabilitação de campos de pagamento e desconto.
3. **`disabledFieldsCondition`**: Operadores lógicos booleanos `and` / `or`.
4. **`reloadFields`**: Recarregamento dinâmico de cidades ao selecionar o estado.
5. **`autoSetFields`**: Preenchimento automático de SKU e preço ao selecionar produtos no catálogo.
6. **`clearedFields`**: Limpeza automática de campos dependentes (ex: cidade ao trocar o estado).
7. **`clearedFieldsChanged`**: Limpeza forçada de dados anteriores ao trocar o tipo de pessoa.
8. **`requiredFields`**: Tornar garantia estendida obrigatória condicionalmente.
9. **`requiredRule`**: Avaliação dinâmica da obrigatoriedade com operador `and`.
10. **`calcFields`**: Cálculo aritmético em cascata e tempo real via AST Parser da fórmula:  
   `quantity * unit_price * (1 - discount_percent / 100)`

---

## 🚀 Projetos Web & Mobile Interativos e Testados

Estes projetos contam com código completo, UI moderna em Dark Theme, suítes de testes unitários com 100% de aprovação e builds otimizados:

| Tecnologia | Pasta | Como Executar | Como Testar |
|---|---|---|---|
| **React Web** (React 19) | [`react-web/`](./react-web) | `npm install && npm run dev` | `npm test` |
| **Vue 3** (Composition API) | [`vue/`](./vue) | `npm install && npm run dev` | `npm test` |
| **Svelte 5** (Runes `$state`) | [`svelte/`](./svelte) | `npm install && npm run dev` | `npm test` |
| **Angular 19** (Signals) | [`angular/`](./angular) | `npm install && npm start` | `npm test -- --watch=false` |
| **TypeScript Vanilla** (Web + CLI) | [`typescript-vanilla/`](./typescript-vanilla) | `npm run dev` ou `npm run cli` | `npm test` |
| **Flutter / Dart** (iOS & Android) | [`flutter/`](./flutter) | `flutter run` | `flutter test` |
| **React Native** (Expo Paper) | [`react-native/`](./react-native) | `npm start` | `npx tsc --noEmit` |

---

## 🌐 Exemplos de Backend & Mobile Nativo

Exemplos de integração com emissão de schema, DTOs tipados e validação de payload em múltiplos ecossistemas:

| Linguagem / Framework | Pasta | Destaques |
|---|---|---|
| **Go** | [`go/`](./go) | Servidor HTTP nativo com validação de payload e emissão do schema |
| **Java / Spring Boot 3** | [`java-spring/`](./java-spring) | REST Controller com Spring Validation e DTOs tipados |
| **C# / .NET 8** | [`dotnet-csharp/`](./dotnet-csharp) | Minimal API tipada com `System.Text.Json` |
| **Python** | [`python/`](./python) | FastAPI assíncrono com modelos Pydantic v2 |
| **Swift (iOS)** | [`swift/`](./swift) | View SwiftUI nativa com `@Observable` |
| **Kotlin (Android)** | [`kotlin/`](./kotlin) | Tela Jetpack Compose com `StateFlow` e `ViewModel` |

---

## ⚖️ Licença

MIT License. Desenvolvido para a comunidade open-source.
