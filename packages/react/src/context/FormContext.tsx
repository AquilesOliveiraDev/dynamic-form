import React, { createContext, useContext } from 'react';
import type { FormStore } from '@dynamic-form/core';

export const FormContext = createContext<FormStore<any> | null>(null);

export interface DynamicFormProviderProps<TFormData extends Record<string, any> = Record<string, any>> {
  form: FormStore<TFormData>;
  children: React.ReactNode;
}

export function DynamicFormProvider<TFormData extends Record<string, any> = Record<string, any>>({
  form,
  children,
}: DynamicFormProviderProps<TFormData>) {
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
}

export function useFormStore<TFormData extends Record<string, any> = Record<string, any>>(): FormStore<TFormData> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormStore deve ser utilizado dentro de um <DynamicFormProvider>');
  }
  return context as FormStore<TFormData>;
}
