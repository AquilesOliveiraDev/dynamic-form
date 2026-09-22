import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDynamicForm } from '../src/hooks/useDynamicForm';
import schemaData from '../src/form-schema.json';

describe('useDynamicForm React 19 - 10 Regras do DynamicField', () => {
  it('deve inicializar o formulário e carregar valores padrão', () => {
    const { result } = renderHook(() =>
      useDynamicForm({
        schema: schemaData as any,
      })
    );

    expect(result.current.values['person_type']).toBe('PF');
    expect(result.current.values['state_id']).toBe('SP');
  });

  it('1. dependentFields & 7. clearedFieldsChanged', () => {
    const { result } = renderHook(() =>
      useDynamicForm({
        schema: schemaData as any,
      })
    );

    expect(result.current.visibility['cpf']).toBe(true);
    expect(result.current.visibility['cnpj']).toBe(false);

    // Preenche CPF
    act(() => {
      result.current.setValue('cpf', '123.456.789-00');
    });
    expect(result.current.values['cpf']).toBe('123.456.789-00');

    // Ao mudar para PJ, clearedFieldsChanged limpa CPF e exibe CNPJ
    act(() => {
      result.current.setValue('person_type', 'PJ');
    });
    expect(result.current.values['cpf']).toBeNull();
    expect(result.current.visibility['cpf']).toBe(false);
    expect(result.current.visibility['cnpj']).toBe(true);
  });

  it('2. disabledFields & 3. disabledFieldsCondition (and / or)', () => {
    const { result } = renderHook(() =>
      useDynamicForm({
        schema: schemaData as any,
      })
    );

    // standard + PF -> payment_terms habilitado
    expect(result.current.disabledState['payment_terms']).toBe(false);

    // restricted + PJ -> payment_terms ainda habilitado (operador 'and' exige ambos)
    act(() => {
      result.current.setValue('person_type', 'PJ');
      result.current.setValue('supplier_category', 'restricted');
    });
    expect(result.current.disabledState['payment_terms']).toBe(false);

    // restricted + PF -> payment_terms BLOQUEADO
    act(() => {
      result.current.setValue('person_type', 'PF');
    });
    expect(result.current.disabledState['payment_terms']).toBe(true);

    // discount_percent tem condição 'or' com restricted -> BLOQUEADO
    expect(result.current.disabledState['discount_percent']).toBe(true);
  });

  it('4. reloadFields & 6. clearedFields', () => {
    const { result } = renderHook(() =>
      useDynamicForm({
        schema: schemaData as any,
      })
    );

    act(() => {
      result.current.setValue('state_id', 'SP');
      result.current.setValue('city_id', 'sp_campinas');
    });
    expect(result.current.values['city_id']).toBe('sp_campinas');

    // Ao alterar estado, cidade é resetada via reloadFields e clearedFields
    act(() => {
      result.current.setValue('state_id', 'RJ');
    });
    expect(result.current.values['city_id']).toBeNull();
  });

  it('5. autoSetFields & 10. calcFields em cascata', () => {
    const { result } = renderHook(() =>
      useDynamicForm({
        schema: schemaData as any,
      })
    );

    act(() => {
      result.current.setValue('discount_percent', 10);
      result.current.setValue('quantity', 2);
    });

    // Selecionar Dell XPS 15 (Preço 8500)
    // 2 * 8500 * (1 - 0.10) = 15300
    act(() => {
      result.current.setValue('product_id', 'prod_dell');
    });
    expect(result.current.values['product_sku']).toBe('DELL-XPS-15');
    expect(result.current.values['unit_price']).toBe(8500);
    expect(result.current.values['total_price']).toBe(15300);

    // Selecionar Monitor LG (Preço 2400)
    // 2 * 2400 * (1 - 0.10) = 4320
    act(() => {
      result.current.setValue('product_id', 'prod_lg');
    });
    expect(result.current.values['product_sku']).toBe('LG-34-UW');
    expect(result.current.values['unit_price']).toBe(2400);
    expect(result.current.values['total_price']).toBe(4320);
  });

  it('8. requiredFields & 9. requiredRule com operador and', async () => {
    const { result } = renderHook(() =>
      useDynamicForm({
        schema: schemaData as any,
      })
    );

    // CPF é obrigatório para PF
    expect(result.current.isFieldRequired('cpf')).toBe(true);

    // warranty_months NÃO é obrigatório inicialmente com quantity = 2
    expect(result.current.isFieldRequired('warranty_months')).toBe(false);

    // Com Categoria VIP e Quantidade = 5 -> torna-se obrigatório (regra AND)
    act(() => {
      result.current.setValue('supplier_category', 'vip');
      result.current.setValue('quantity', 5);
    });
    expect(result.current.isFieldRequired('warranty_months')).toBe(true);

    // Validação falha sem warranty_months
    act(() => {
      result.current.setValue('warranty_months', null);
    });
    let valid = false;
    await act(async () => {
      valid = await result.current.validate();
    });
    expect(valid).toBe(false);
    expect(result.current.errors['warranty_months']).toBeTruthy();

    // Preenche garantia e campos obrigatórios -> validação passa
    act(() => {
      result.current.setValue('name', 'João Silva');
      result.current.setValue('cpf', '123.456.789-00');
      result.current.setValue('warranty_months', 12);
    });
    let valid2 = false;
    await act(async () => {
      valid2 = await result.current.validate();
    });
    expect(valid2).toBe(true);
    expect(result.current.errors['warranty_months']).toBeFalsy();
  });
});
