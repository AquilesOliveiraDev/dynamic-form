import React, { memo } from 'react';
import type { DynamicField, DynamicFormSchema } from '@dynamic-form/core';
import { useFormStore } from '../context/FormContext.js';
import { useDynamicField } from '../hooks/useDynamicField.js';

export interface FieldRenderProps {
  field: DynamicField;
  value: any;
  error?: string;
  touched?: boolean;
  disabled: boolean;
  onChange: (value: any) => void;
}

export interface DynamicFormRootProps<TFormData extends Record<string, any> = Record<string, any>> {
  schema: DynamicFormSchema<TFormData>;
  renderField: (props: FieldRenderProps) => React.ReactNode;
  className?: string;
  rowClassName?: string;
  fieldClassName?: string;
}

const FieldWrapper = memo(function FieldWrapper({
  field,
  renderField,
  className,
}: {
  field: DynamicField;
  renderField: (props: FieldRenderProps) => React.ReactNode;
  className?: string;
}) {
  const { value, error, touched, visible, disabled, setValue } = useDynamicField(field.attr.name);

  if (!visible) return null;

  return (
    <div className={className} data-field={field.attr.name}>
      {renderField({
        field,
        value,
        error,
        touched,
        disabled,
        onChange: setValue,
      })}
    </div>
  );
});

export function DynamicFormRoot<TFormData extends Record<string, any> = Record<string, any>>({
  schema,
  renderField,
  className,
  rowClassName,
  fieldClassName,
}: DynamicFormRootProps<TFormData>) {
  const matrix = schema.fields || schema.structure || [];

  return (
    <div className={className}>
      {matrix.map((row, rowIndex) => (
        <div key={rowIndex} className={rowClassName} style={{ display: 'flex', gap: '12px' }}>
          {row.map((field) => (
            <FieldWrapper
              key={field.attr.name}
              field={field}
              renderField={renderField}
              className={fieldClassName}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
