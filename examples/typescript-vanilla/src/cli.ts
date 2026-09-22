import { FormStore, type FormState } from '@dynamic-form/core';
import schemaData from './form-schema.json' with { type: 'json' };

console.log('========================================================================');
console.log('🚀 TESTE FINAL: @dynamic-form/core em TypeScript Vanilla (Headless CLI)');
console.log('========================================================================\n');

const store = new FormStore({
  schema: schemaData as any,
  onSubmit: (values: any) => {
    console.log('\n✅ [SUBMIT EVENT] Formulário submetido com payload final validado:');
    console.log(JSON.stringify(values, null, 2));
  },
  onDirtyChange: (isDirty: boolean, fields: string[]) => {
    console.log(`⚡ [DIRTY CHANGE] Modificado: ${isDirty} | Campos alterados:`, fields);
  },
});

// 1. Início e estado inicial
console.log('📋 1. Estado Inicial:');
console.log('   Pessoa:', store.getState().values.person_type);
console.log('   Estado:', store.getState().values.state_id);
console.log('   Visibilidade CPF:', store.getState().visibility.cpf);
console.log('   Visibilidade CNPJ:', store.getState().visibility.cnpj);
console.log('   Garantia Obrigatória?:', store.isFieldRequired('warranty_months'));

// 2. dependentFields & clearedFieldsChanged
console.log('\n📋 2. Regra 1 (dependentFields) & Regra 7 (clearedFieldsChanged):');
store.setValue('cpf', '123.456.789-00');
console.log('   CPF preenchido:', store.getState().values.cpf);
console.log('   Alternando para Pessoa Jurídica (PJ)...');
store.setValue('person_type', 'PJ');
console.log('   CPF após troca (deve ser null):', store.getState().values.cpf);
console.log('   Visibilidade CPF (false):', store.getState().visibility.cpf);
console.log('   Visibilidade CNPJ (true):', store.getState().visibility.cnpj);

// 3. disabledFields & disabledFieldsCondition (and / or)
console.log('\n📋 3. Regra 2 (disabledFields) & Regra 3 (disabledFieldsCondition):');
store.setValue('supplier_category', 'restricted');
store.setValue('person_type', 'PJ');
console.log('   Condição AND: Categoria=restricted + PJ -> payment_terms bloqueado?:', store.getState().disabledState.payment_terms); // false
store.setValue('person_type', 'PF');
console.log('   Condição AND: Categoria=restricted + PF -> payment_terms bloqueado?:', store.getState().disabledState.payment_terms); // true
console.log('   Condição OR: Categoria=restricted -> discount_percent bloqueado?:', store.getState().disabledState.discount_percent); // true

// 4. reloadFields & clearedFields
console.log('\n📋 4. Regra 4 (reloadFields) & Regra 6 (clearedFields):');
store.setValue('state_id', 'SP');
store.setValue('city_id', 'sp_campinas');
console.log('   Cidade selecionada em SP:', store.getState().values.city_id);
console.log('   Alterando Estado para RJ (reloadFields/clearedFields)...');
store.setValue('state_id', 'RJ');
console.log('   Cidade após troca de Estado (deve ser null):', store.getState().values.city_id);

// 5. autoSetFields & calcFields (AST Parser)
console.log('\n📋 5. Regra 5 (autoSetFields) & Regra 10 (calcFields em cascata):');
store.setValue('discount_percent', 10);
store.setValue('quantity', 3);
console.log('   Configurado: Quantidade = 3, Desconto = 10%');
console.log('   Selecionando Notebook Dell XPS 15 (R$ 8.500)...');
store.setValue('product_id', 'prod_dell');
console.log('   SKU autoSet:', store.getState().values.product_sku);
console.log('   Preço Unitário autoSet:', store.getState().values.unit_price);
console.log('   Total Calculado (3 * 8500 * 0.90 = 22950): R$', store.getState().values.total_price);

// 6. requiredFields & requiredRule com operador AND
console.log('\n📋 6. Regra 8 (requiredFields) & Regra 9 (requiredRule com operador and):');
console.log('   Garantia obrigatória inicial?:', store.isFieldRequired('warranty_months'));
store.setValue('supplier_category', 'vip');
store.setValue('quantity', 5);
console.log('   Com VIP + Quantidade 5 -> Garantia obrigatória?:', store.isFieldRequired('warranty_months'));

// 7. Validação e Submissão
console.log('\n📋 7. Validação e Submissão:');
store.setValue('name', 'Empresa Exemplo LTDA');
store.setValue('cpf', '123.456.789-00');
store.setValue('warranty_months', 12);
store.submit();

console.log('\n🎉 Execução CLI concluída com sucesso!');
