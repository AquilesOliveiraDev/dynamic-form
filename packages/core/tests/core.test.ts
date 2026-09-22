import test from 'node:test';
import assert from 'node:assert/strict';
import { ArithmeticParser, TokenInterpolator } from '../src/expression/index.js';
import { FormStore } from '../src/store/index.js';
import type { DynamicFormSchema } from '../src/types/index.js';

test('ArithmeticParser - Expressões Matemáticas e Precedência', () => {
  const values = { qtd: 5, preco: 10.5, desc: 2.5 };
  const expr = '#{qtd}# * #{preco}# - #{desc}#'; // 5 * 10.5 - 2.5 = 52.5 - 2.5 = 50

  const res = ArithmeticParser.evaluate(expr, values);
  assert.equal(res, 50);

  // Parênteses e prioridade
  const exprPar = '(#{qtd}# + 5) * 2'; // (5 + 5) * 2 = 20
  assert.equal(ArithmeticParser.evaluate(exprPar, values), 20);

  // Arredondamento com step decimal
  const exprStep = '10 / 3';
  assert.equal(ArithmeticParser.evaluate(exprStep, {}, '0.001'), 3.333);

  // Operando ausente -> null
  assert.equal(ArithmeticParser.evaluate('#{inexistente}# + 10', values), null);
});

test('TokenInterpolator - Interpolação e Preservação', () => {
  const values = {
    user: { id: 10, name: 'Alice', record: { attributes: { role: 'Admin' } } },
    isZero: 0,
    isFalse: false,
  };

  // Simples
  assert.equal(TokenInterpolator.resolveToken('user', values), 10);
  assert.equal(TokenInterpolator.resolveToken('isZero', values), 0);
  assert.equal(TokenInterpolator.resolveToken('isFalse', values), false);

  // Pipe aninhado
  assert.equal(TokenInterpolator.resolveToken('user|record.attributes.role', values), 'Admin');

  // String interpolation
  const str = TokenInterpolator.interpolateString('/users/#{user}#/role/#{user|record.attributes.role}#', values);
  assert.equal(str, '/users/10/role/Admin');
});

test('FormStore & DAG - Cascatas de Limpeza, AutoSet e CalcFields', () => {
  interface MyForm {
    state_id: number | null;
    city_id: { value: number; label: string; record: { ibge: string } } | null;
    ibge_code: string | null;
    quantity: number;
    unit_price: number;
    total: number | null;
  }

  const schema: DynamicFormSchema<MyForm> = {
    structure: [
      [
        {
          component: 'select',
          attr: { name: 'state_id' },
        },
        {
          component: 'autocomplete',
          attr: { name: 'city_id' },
          clearedFields: ['state_id'], // Se state_id mudar, city_id limpa
        },
        {
          component: 'input',
          attr: { name: 'ibge_code' },
          autoSetFields: {
            city_id: 'record.ibge',
          },
        },
      ],
      [
        {
          component: 'number',
          attr: { name: 'quantity' },
        },
        {
          component: 'number',
          attr: { name: 'unit_price' },
        },
        {
          component: 'number',
          attr: { name: 'total' },
          calcFields: '#{quantity}# * #{unit_price}#',
        },
      ],
    ],
  };

  const store = new FormStore<MyForm>({
    schema,
    initialValues: {
      state_id: 1,
      city_id: { value: 101, label: 'São Paulo', record: { ibge: '3550308' } },
      quantity: 2,
      unit_price: 50,
    },
  });

  // 1. Verifica inicialização e cálculo automático
  store.setValue('quantity', 3);
  assert.equal(store.getValues().total, 150);

  // 2. Verifica autoSet a partir da cidade
  store.setValue('city_id', { value: 102, label: 'Campinas', record: { ibge: '3509502' } });
  assert.equal(store.getValues().ibge_code, '3509502');

  // 3. Verifica limpeza em cascata ao mudar o estado
  store.setValue('state_id', 2);
  assert.equal(store.getValues().city_id, null);
});

test('FormStore - AutoSet via Opções com Record e Cascata para CalcFields', () => {
  interface ProductForm {
    product_id: string;
    product_sku: string;
    unit_price: number;
    quantity: number;
    total_price: number;
  }

  const schema: DynamicFormSchema<ProductForm> = {
    structure: [
      [
        {
          component: 'select',
          attr: {
            name: 'product_id',
            options: [
              { label: 'Dell XPS', value: 'dell', record: { sku: 'DELL-1', price: 8000 } },
              { label: 'LG Monitor', value: 'lg', record: { sku: 'LG-1', price: 2000 } },
            ],
          },
        },
        {
          component: 'input',
          attr: { name: 'product_sku' },
          autoSetFields: { product_id: 'record.sku' },
        },
        {
          component: 'number',
          attr: { name: 'unit_price' },
          autoSetFields: { product_id: 'record.price' },
        },
      ],
      [
        {
          component: 'number',
          attr: { name: 'quantity' },
        },
        {
          component: 'number',
          attr: { name: 'total_price' },
          calcFields: '#{quantity}# * #{unit_price}#',
        },
      ],
    ],
  };

  const store = new FormStore<ProductForm>({
    schema,
    initialValues: {
      quantity: 3,
    },
  });

  // Ao selecionar Dell:
  // product_sku deve receber DELL-1 via autoSet
  // unit_price deve receber 8000 via autoSet
  // total_price deve calcular 3 * 8000 = 24000
  store.setValue('product_id', 'dell');

  const values1 = store.getValues();
  assert.equal(values1.product_sku, 'DELL-1');
  assert.equal(values1.unit_price, 8000);
  assert.equal(values1.total_price, 24000);

  // Ao alternar para LG:
  store.setValue('product_id', 'lg');
  const values2 = store.getValues();
  assert.equal(values2.product_sku, 'LG-1');
  assert.equal(values2.unit_price, 2000);
  assert.equal(values2.total_price, 6000);
});
