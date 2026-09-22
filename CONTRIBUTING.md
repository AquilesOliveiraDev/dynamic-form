# Contributing to @dynamic-form

Thank you for your interest in contributing to **@dynamic-form**! This project aims to be the definitive open-source ecosystem for complex, declarative, cross-platform dynamic forms.

🌐 **[ English ](./CONTRIBUTING.md)** • **[ Português (Brasil) ](./CONTRIBUTING.pt-BR.md)**

---

## 🧭 Design Principles

1. **Zero UI Coupling in Core**: `@dynamic-form/core` must remain strictly pure TypeScript, compilable to ESM and CommonJS, free of DOM, React, Vue, or any UI framework dependencies.
2. **Directed Acyclic Graph (DAG)**: All field dependencies must be modeled as a topologically sorted graph. The use of `setTimeout` or arbitrary delays to resolve reactive calculations is strictly prohibited.
3. **Expression Safety**: The arithmetic parser (`ArithmeticParser`) must continue to be based on formal lexical and syntactic analysis (Recursive Descent AST Parser). Never use `eval()` or `new Function()`.
4. **Universal Interoperability**: Every new schema feature must respect and extend the formal JSON Schema contract in [`spec/dynamic-form.schema.json`](./spec/dynamic-form.schema.json).

---

## 🛠️ Local Development

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/AquilesOliveiraDev/dynamic-form
cd dynamic-form
npm install
```

### 2. Build Packages
```bash
# Build @dynamic-form/core
cd packages/core
npm run build

# Build @dynamic-form/react
cd ../react
npm run build
```

### 3. Run Test Suites
```bash
# Core engine tests
cd packages/core
npm test

# Example test suites
cd ../../examples/react-web && npm test
cd ../vue && npm test
cd ../svelte && npm test
cd ../angular && npm test -- --watch=false
cd ../flutter && flutter test
```

---

## 🚀 Adding a New Example or Platform

1. Create a dedicated folder under `examples/<platform-name>/`.
2. Consume the shared [`examples/form-schema.json`](./examples/form-schema.json) to guarantee conformance with the 10 `DynamicField` rules.
3. Include automated unit/integration tests verifying all 10 dependency rules.
4. Include a detailed `README.md` with setup, running, and test instructions.

---

## 📝 Commit Conventions

We enforce the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat: add support for XOR operator in disabledFieldsCondition`
- `fix: correct cascading clearance logic in clearedFields`
- `docs: update async validation documentation`
- `test: add stress benchmark suite for DAG with 500 nodes`

---

## ⚖️ License

By contributing to `@dynamic-form`, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
