import { describe, it, expect, beforeEach } from 'vitest';
import { useDynamicForm } from '../src/composables/useDynamicForm';
import schemaData from '../src/form-schema.json';

describe('useDynamicForm Vue 3 - 10 Regras do DynamicField', () => {
  let form: ReturnType<typeof useDynamicForm>;

  beforeEach(() => {
    form = useDynamicForm({
      schema: schemaData as any,
    });
  });

  it('deve inicializar o formulário e carregar valores padrão', () => {
    expect(form.state.value).toBeTruthy();
    expect(form.state.value.values['person_type']).toBe('PF');
    expect(form.state.value.values['state_id']).toBe('SP');
  });

  it('1. dependentFields & 7. clearedFieldsChanged', () => {
    expect(form.state.value.visibility['cpf']).toBe(true);
    expect(form.state.value.visibility['cnpj']).toBe(false);

    // Preenche CPF
    form.setValue('cpf', '123.456.789-00');
    expect(form.state.value.values['cpf']).toBe('123.456.789-00');

    // Ao mudar para PJ, clearedFieldsChanged limpa CPF e exibe CNPJ
    form.setValue('person_type', 'PJ');
    expect(form.state.value.values['cpf']).toBeNull();
    expect(form.state.value.visibility['cpf']).toBe(false);
    expect(form.state.value.visibility['cnpj']).toBe(true);
  });

  it('2. disabledFields & 3. disabledFieldsCondition (and / or)', () => {
    // standard + PF -> payment_terms habilitado
    expect(form.state.value.disabledState['payment_terms']).toBe(false);

    // restricted + PJ -> payment_terms ainda habilitado (operador 'and' exige ambos)
    form.setValue('person_type', 'PJ');
    form.setValue('supplier_category', 'restricted');
    expect(form.state.value.disabledState['payment_terms']).toBe(false);

    // restricted + PF -> payment_terms BLOQUEADO
    form.setValue('person_type', 'PF');
    expect(form.state.value.disabledState['payment_terms']).toBe(true);

    // discount_percent tem condição 'or' com restricted -> BLOQUEADO
    expect(form.state.value.disabledState['discount_percent']).toBe(true);
  });

  it('4. reloadFields & 6. clearedFields', () => {
    form.setValue('state_id', 'SP');
    form.setValue('city_id', 'sp_campinas');
    expect(form.state.value.values['city_id']).toBe('sp_campinas');

    // Ao alterar estado, cidade é resetada via reloadFields e clearedFields
    form.setValue('state_id', 'RJ');
    expect(form.state.value.values['city_id']).toBeNull();
  });

  it('5. autoSetFields & 10. calcFields em cascata', () => {
    form.setValue('discount_percent', 10);
    form.setValue('quantity', 2);

    // Selecionar Dell XPS 15 (Preço 8500)
    // 2 * 8500 * (1 - 0.10) = 15300
    form.setValue('product_id', 'prod_dell');
    expect(form.state.value.values['product_sku']).toBe('DELL-XPS-15');
    expect(form.state.value.values['unit_price']).toBe(8500);
    expect(form.state.value.values['total_price']).toBe(15300);

    // Selecionar Monitor LG (Preço 2400)
    // 2 * 2400 * (1 - 0.10) = 4320
    form.setValue('product_id', 'prod_lg');
    expect(form.state.value.values['product_sku']).toBe('LG-34-UW');
    expect(form.state.value.values['unit_price']).toBe(2400);
    expect(form.state.value.values['total_price']).toBe(4320);
  });

  it('8. requiredFields & 9. requiredRule com operador and', async () => {
    // CPF é obrigatório para PF
    expect(form.isFieldRequired('cpf')).toBe(true);

    // warranty_months NÃO é obrigatório inicialmente com quantity = 2
    expect(form.isFieldRequired('warranty_months')).toBe(false);

    // Com Categoria VIP e Quantidade = 5 -> torna-se obrigatório (regra AND)
    form.setValue('supplier_category', 'vip');
    form.setValue('quantity', 5);
    expect(form.isFieldRequired('warranty_months')).toBe(true);

    // Validação falha sem warranty_months
    form.setValue('warranty_months', null);
    const valid = await form.validate();
    expect(valid).toBe(false);
    expect(form.state.value.errors['warranty_months']).toBeTruthy();

    // Preenche garantia e campos obrigatórios -> validação passa
    form.setValue('name', 'João Silva');
    form.setValue('cpf', '123.456.789-00');
    form.setValue('warranty_months', 12);
    const valid2 = await form.validate();
    expect(valid2).toBe(true);
    expect(form.state.value.errors['warranty_months']).toBeFalsy();
  });
});
