# @dynamic-form/react

> **Reactive and Headless Hooks and Component Layer for React and React Native.**

`@dynamic-form/react` bridges the power of `@dynamic-form/core` with React 18, React 19, Next.js, and React Native applications, offering high-performance integration via `useSyncExternalStore` and atomic per-field subscriptions.

---

## ⚡ Installation

```bash
npm install @dynamic-form/react @dynamic-form/core
# or
yarn add @dynamic-form/react @dynamic-form/core
# or
pnpm add @dynamic-form/react @dynamic-form/core
```

---

## 🌟 Key Features

- **`useDynamicForm`**: Primary hook that initializes the `FormStore`, synchronizes via `useSyncExternalStore` without tearing, and exposes form manipulation handlers.
- **`useDynamicField`**: Granular hook for atomic subscription to a specific field. Changes in other fields will **not** trigger re-renders on this component!
- **`DynamicFormProvider` & `DynamicFormRoot`**: Pre-built declarative rendering components customizable with Ant Design, Material UI, Shadcn/UI, Tailwind, or React Native Paper.

---

## 💻 Quick Start: `useDynamicForm`

```tsx
import React from 'react';
import { useDynamicForm } from '@dynamic-form/react';
import type { DynamicFormSchema } from '@dynamic-form/core';

const schema: DynamicFormSchema = {
  structure: [
    [
      {
        component: 'input',
        attr: { name: 'email', label: 'Email', required: true }
      }
    ]
  ]
};

export function SimpleForm() {
  const { values, errors, setValue, submit, isSubmitting } = useDynamicForm({
    schema,
    onSubmit: async (data) => {
      console.log('Submitted data:', data);
    }
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <label>Email</label>
      <input
        type="email"
        value={values.email || ''}
        onChange={(e) => setValue('email', e.target.value)}
      />
      {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
      <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
  );
}
```

---

## 🚀 Atomic Subscription with `useDynamicField`

```tsx
import React from 'react';
import { useDynamicField } from '@dynamic-form/react';
import type { FormStore } from '@dynamic-form/core';

export function CustomInput({ name, form }: { name: string; form: FormStore }) {
  // Only re-renders when this specific field changes!
  const { value, error, visible, disabled, setValue } = useDynamicField(name, form);

  if (!visible) return null;

  return (
    <div>
      <input
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## ⚖️ License

MIT License. Developed for the open-source community.
