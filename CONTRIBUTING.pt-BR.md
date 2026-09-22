# Contribuindo para o @dynamic-form

Obrigado pelo seu interesse em contribuir para o **@dynamic-form**! Este projeto visa ser o ecossistema open-source definitivo para formulários dinâmicos complexos, declarativos e multiplataforma.

🌐 **[ English ](./CONTRIBUTING.md)** • **[ Português (Brasil) ](./CONTRIBUTING.pt-BR.md)**

---

## 🧭 Princípios de Design

1. **Zero UI Coupling no Core**: O pacote `@dynamic-form/core` deve permanecer estritamente em TypeScript puro, compilável para ESM e CommonJS, sem dependência de DOM, React, Vue ou qualquer framework de interface.
2. **Grafo Acíclico Dirigido (DAG)**: Toda dependência entre campos deve ser tratada como um grafo ordenado topologicamente. É estritamente proibido o uso de `setTimeout` ou delays arbitrários para resolver reatividades.
3. **Segurança de Expressões**: O parser aritmético (`ArithmeticParser`) deve continuar baseado em análise léxica e sintática (Recursive Descent AST Parser). Nunca utilize `eval()` ou `new Function()`.
4. **Interoperabilidade Universal**: Toda nova funcionalidade de esquema deve respeitar e estender o contrato JSON Schema em [`spec/dynamic-form.schema.json`](./spec/dynamic-form.schema.json).

---

## 🛠️ Como Desenvolver Localmente

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/AquilesOliveiraDev/dynamic-form
cd dynamic-form
npm install
```

### 2. Compilar Pacotes
```bash
# Compilar @dynamic-form/core
cd packages/core
npm run build

# Compilar @dynamic-form/react
cd ../react
npm run build
```

### 3. Executar Testes
```bash
# Testes do Core
cd packages/core
npm test

# Testes dos Exemplos
cd ../../examples/react-web && npm test
cd ../vue && npm test
cd ../svelte && npm test
cd ../angular && npm test -- --watch=false
cd ../flutter && flutter test
```

---

## 🚀 Adicionando um Novo Exemplo ou Plataforma

1. Adicione a pasta correspondente dentro de `examples/<nome-da-plataforma>/`.
2. Consuma o arquivo [`examples/form-schema.json`](./examples/form-schema.json) para garantir compatibilidade com as 10 regras do `DynamicField`.
3. Adicione testes automatizados cobrindo as 10 regras de dependência.
4. Adicione um `README.md` detalhado com instruções de inicialização e testes.

---

## 📝 Padrão de Commits

Adotamos a convenção de [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: adiciona suporte a operador XOR em disabledFieldsCondition`
- `fix: corrige limpeza em cascata no clearedFields`
- `docs: atualiza documentação de validação assíncrona`
- `test: adiciona suíte de testes de estresse para DAG com 500 nós`

---

## ⚖️ Licença

Ao contribuir para o projeto `@dynamic-form`, você concorda que suas contribuições serão licenciadas sob a licença [MIT](./LICENSE).
