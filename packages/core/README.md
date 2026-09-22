# @dynamic-form/core

> **Reactive, Headless, and Typed Engine for Complex Dynamic Forms Based on a Directed Acyclic Graph (DAG).**

`@dynamic-form/core` is the UI-agnostic engine of the `@dynamic-form` ecosystem. Written in strict TypeScript, it compiles to pure ESM and CommonJS with **zero visual dependencies**, executing seamlessly in browsers, Node.js/Bun/Deno runtimes, React Native, and web workers.

---

## ⚡ Installation

```bash
npm install @dynamic-form/core
# or
yarn add @dynamic-form/core
# or
pnpm add @dynamic-form/core
```

---

## 🌟 Key Features

1. **Dependency Graph (DAG)**: Constructs a topological model of relationships between fields, ensuring instant, deterministic event propagation without loops and without arbitrary `setTimeout` delays.
2. **Arithmetic AST Parser (`ArithmeticParser`)**: Formal lexical and syntactic parser without `eval()` that evaluates mathematical formulas with operator precedence (`+`, `-`, `*`, `/`, `( )`), dynamic field values, and step-based rounding.
3. **Token Interpolator (`TokenInterpolator`)**: Robust string interpolation for patterns like `#{field}#` and `#{field|record.path}#`, safely preserving `0` and `false`.
4. **FormStore (Observer Pattern)**: High-performance state management supporting both global subscriptions and granular per-field subscriptions (`subscribeField`).
5. **Dynamic Conditional Validation (`ValidationEngine`)**: Real-time validation that automatically bypasses hidden or disabled fields based on active rules.

---

## 📋 The 10 Supported `DynamicField` Rules

| Rule | Description |
|---|---|
| `dependentFields` | Conditional visibility toggle based on values of other fields. |
| `disabledFields` | Conditional disabling/locking of inputs. |
| `disabledFieldsCondition` | Boolean logical operator (`'and'` \| `'or'`) to resolve multiple disabling conditions. |
| `reloadFields` | Trigger to reload catalogs and option lists for dependent fields. |
| `autoSetFields` | Automated field population from selected record attributes. |
| `clearedFields` | List of target fields reset to `null` whenever the origin field changes. |
| `clearedFieldsChanged` | Boolean flag forcing immediate clearing of dependent fields upon value modification. |
| `requiredFields` | Dynamic condition that makes a field mandatory. |
| `requiredRule` | Logical operator (`'and'` \| `'or'`) for evaluating dynamic requirement rules. |
| `calcFields` | Real-time arithmetic formula evaluated and assigned to the field via AST parser. |

---

## 💻 Headless / Node.js Usage Example

```typescript
import { FormStore, type DynamicFormSchema } from '@dynamic-form/core';

const schema: DynamicFormSchema = {
  structure: [
    [
      {
        component: 'select',
        attr: {
          name: 'person_type',
          label: 'Type',
          options: [
            { label: 'Individual', value: 'INDIVIDUAL' },
            { label: 'Company', value: 'COMPANY' }
          ]
        },
        clearedFieldsChanged: true,
        clearedFields: ['tax_id', 'company_id']
      }
    ],
    [
      {
        component: 'input',
        attr: { name: 'tax_id', label: 'Tax ID' },
        dependentFields: { person_type: 'INDIVIDUAL' }
      },
      {
        component: 'input',
        attr: { name: 'company_id', label: 'Company Registration' },
        dependentFields: { person_type: 'COMPANY' }
      }
    ]
  ]
};

const store = new FormStore({
  schema,
  initialValues: { person_type: 'INDIVIDUAL' }
});

// Subscribe to state transitions
const unsubscribe = store.subscribe((state) => {
  console.log('Values:', state.values);
  console.log('Tax ID Visibility:', state.visibility.tax_id);
});

// Update a value
store.setValue('person_type', 'COMPANY');
// tax_id is reset to null and hidden; company_id becomes visible!
```

---

## 📖 API Reference (`FormStore`)

| Method | Return | Description |
|---|---|---|
| `setValue(field, val, options?)` | `void` | Updates a field value and propagates all 10 rules through the DAG. |
| `getState()` | `FormState<T>` | Returns a state snapshot containing `values`, `errors`, `visibility`, `disabledState`, etc. |
| `subscribe(listener)` | `() => void` | Registers an observer for state transitions and returns an unsubscribe callback. |
| `subscribeField(name, listener)` | `() => void` | Granular subscription for a specific single field. |
| `validateForm()` | `Promise<boolean>` | Runs real-time validation respecting visibility and disabled rules. |
| `submit()` | `Promise<void>` | Validates the form and executes the `onSubmit` callback if valid. |
| `reset()` | `void` | Restores initial values and rules state. |
| `isFieldRequired(name)` | `boolean` | Evaluates whether a field is dynamically required in the current state. |

---

## ⚖️ License

MIT License. Developed for the open-source community.
