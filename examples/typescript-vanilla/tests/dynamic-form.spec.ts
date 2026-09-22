import { describe, it, expect, beforeEach } from 'vitest';
import { FormStore } from '@dynamic-form/core';
import schemaData from '../src/form-schema.json';

describe('TypeScript Vanilla - 10 Regras do DynamicField', () => {
  let store: FormStore;

  beforeEach(() => {
    store = new FormStore({
      schema: schemaData as any,
    });
  });

  it('deve inicializar o formulário e carregar valores padrão', () => {
    expect(store.getState()).toBeTruthy();
    expect(store.getState().values['person_type']).toBe('PF');
    expect(store.getState().values['state_id']).toBe('SP');
  });

  it('1. dependentFields & 7. clearedFieldsChanged', () => {
    expect(store.getState().visibility['cpf']).toBe(true);
    expect(store.getState().visibility['cnpj']).toBe(false);

    // Preenche CPF
    store.setValue('cpf', '123.456.789-00');
    expect(store.getState().values['cpf']).toBe('123.456.789-00');

    // Ao mudar para PJ, clearedFieldsChanged limpa CPF e exibe CNPJ
    store.setValue('person_type', 'PJ');
    expect(store.getState().values['cpf']).toBeNull();
    expect(store.getState().visibility['cpf']).toBe(false);
    expect(store.getState().visibility['cnpj']).toBe(true);
  });

  it('2. disabledFields & 3. disabledFieldsCondition (and / or)', () => {
    // standard + PF -> payment_terms habilitado
    expect(store.getState().disabledState['payment_terms']).toBe(false);

    // restricted + PJ -> payment_terms ainda habilitado (operador 'and' exige ambos)
    store.setValue('person_type', 'PJ');
    store.setValue('supplier_category', 'restricted');
    expect(store.getState().disabledState['payment_terms']).toBe(false);

    // restricted + PF -> payment_terms BLOQUEADO
    store.setValue('person_type', 'PF');
    expect(store.getState().disabledState['payment_terms']).toBe(true);

    // discount_percent tem condição 'or' com restricted -> BLOQUEADO
    expect(store.getState().disabledState['discount_percent']).toBe(true);
  });

  it('4. reloadFields & 6. clearedFields', () => {
    store.setValue('state_id', 'SP');
    store.setValue('city_id', 'sp_campinas');
    expect(store.getState().values['city_id']).toBe('sp_campinas');

    // Ao alterar estado, cidade é resetada via reloadFields e clearedFields
    store.setValue('state_id', 'RJ');
    expect(store.getState().values['city_id']).toBeNull();
  });

  it('5. autoSetFields & 10. calcFields em cascata', () => {
    store.setValue('discount_percent', 10);
    store.setValue('quantity', 2);

    // Selecionar Dell XPS 15 (Preço 8500)
    // 2 * 8500 * (1 - 0.10) = 15300
    store.setValue('product_id', 'prod_dell');
    expect(store.getState().values['product_sku']).toBe('DELL-XPS-15');
    expect(store.getState().values['unit_price']).toBe(8500);
    expect(store.getState().values['total_price']).toBe(15300);

    // Selecionar Monitor LG (Preço 2400)
    // 2 * 2400 * (1 - 0.10) = 4320
    store.setValue('product_id', 'prod_lg');
    expect(store.getState().values['product_sku']).toBe('LG-34-UW');
    expect(store.getState().values['unit_price']).toBe(2400);
    expect(store.getState().values['total_price']).toBe(4320);
  });

  it('8. requiredFields & 9. requiredRule com operador and', async () => {
    // CPF é obrigatório para PF
    expect(store.isFieldRequired('cpf')).toBe(true);

    // warranty_months NÃO é obrigatório inicialmente com quantity = 2
    expect(store.isFieldRequired('warranty_months')).toBe(false);

    // Com Categoria VIP e Quantidade = 5 -> torna-se obrigatório (regra AND)
    store.setValue('supplier_category', 'vip');
    store.setValue('quantity', 5);
    expect(store.isFieldRequired('warranty_months')).toBe(true);

    // Validação falha sem warranty_months
    store.setValue('warranty_months', null);
    const valid = await store.validateForm();
    expect(valid).toBe(false);
    expect(store.getState().errors['warranty_months']).toBeTruthy();

    // Preenche garantia e campos obrigatórios -> validação passa
    store.setValue('name', 'João Silva');
    store.setValue('cpf', '123.456.789-00');
    store.setValue('warranty_months', 12);
    const valid2 = await store.validateForm();
    expect(valid2).toBe(true);
    expect(store.getState().errors['warranty_months']).toBeFalsy();
  });
});
