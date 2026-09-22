import 'package:flutter_test/flutter_test.dart';
import 'package:teste_final_flutter/dynamic_form/arithmetic_parser.dart';
import 'package:teste_final_flutter/dynamic_form/dynamic_form_controller.dart';

void main() {
  group('ArithmeticParser - Expressões Matemáticas sem eval()', () {
    test('Calcula operações básicas com precedência e parênteses', () {
      final values = {'quantity': 2, 'unit_price': 8500, 'discount_percent': 10};
      const expr = '#{quantity}# * #{unit_price}# * (1 - #{discount_percent}# / 100)';
      // 2 * 8500 * (1 - 0.1) = 17000 * 0.9 = 15300
      final result = ArithmeticParser.evaluate(expr, values);
      expect(result, 15300.0);
    });

    test('Arredondamento por step decimal', () {
      const expr = '10 / 3';
      final result = ArithmeticParser.evaluate(expr, {}, step: 0.01);
      expect(result, 3.33);
    });
  });

  group('DynamicFormController - 10 Regras do DynamicField', () {
    late Map<String, dynamic> schema;

    setUp(() {
      schema = {
        'catalogs': {
          'products': [
            {'label': 'Dell XPS 15', 'value': 'prod_dell', 'record': {'sku': 'DELL-XPS-15', 'price': 8500}},
            {'label': 'LG UltraWide', 'value': 'prod_lg', 'record': {'sku': 'LG-34-UW', 'price': 2400}},
          ],
        },
        'structure': [
          [
            {
              'component': 'select',
              'attr': {'name': 'person_type', 'options': [{'value': 'PF'}, {'value': 'PJ'}]},
              'clearedFieldsChanged': true,
              'clearedFields': ['cpf', 'cnpj', 'corporate_name'],
            },
            {
              'component': 'input',
              'attr': {'name': 'name', 'required': true},
            },
          ],
          [
            {
              'component': 'input',
              'attr': {'name': 'cpf'},
              'dependentFields': {'person_type': 'PF'},
              'requiredFields': {'person_type': 'PF'},
              'requiredRule': 'or',
            },
            {
              'component': 'input',
              'attr': {'name': 'cnpj'},
              'dependentFields': {'person_type': 'PJ'},
              'requiredFields': {'person_type': 'PJ'},
              'requiredRule': 'or',
            },
          ],
          [
            {
              'component': 'select',
              'attr': {'name': 'state_id'},
            },
            {
              'component': 'select',
              'attr': {'name': 'city_id'},
              'clearedFields': ['state_id'],
              'reloadFields': ['state_id'],
            },
          ],
          [
            {
              'component': 'select',
              'attr': {'name': 'supplier_category'},
            },
            {
              'component': 'select',
              'attr': {'name': 'payment_terms'},
              'disabledFields': {'supplier_category': 'restricted', 'person_type': 'PF'},
              'disabledFieldsCondition': 'and',
            },
            {
              'component': 'number',
              'attr': {'name': 'discount_percent'},
              'disabledFields': {'supplier_category': 'restricted'},
              'disabledFieldsCondition': 'or',
            },
          ],
          [
            {
              'component': 'select',
              'attr': {
                'name': 'product_id',
                'options': [
                  {'label': 'Dell XPS 15', 'value': 'prod_dell', 'record': {'sku': 'DELL-XPS-15', 'price': 8500}},
                  {'label': 'LG UltraWide', 'value': 'prod_lg', 'record': {'sku': 'LG-34-UW', 'price': 2400}},
                ],
              },
            },
            {
              'component': 'input',
              'attr': {'name': 'product_sku'},
              'autoSetFields': {'product_id': 'record.sku'},
            },
            {
              'component': 'number',
              'attr': {'name': 'unit_price'},
              'autoSetFields': {'product_id': 'record.price'},
            },
          ],
          [
            {
              'component': 'number',
              'attr': {'name': 'quantity'},
            },
            {
              'component': 'number',
              'attr': {'name': 'total_price'},
              'calcFields': '#{quantity}# * #{unit_price}# * (1 - #{discount_percent}# / 100)',
            },
            {
              'component': 'number',
              'attr': {'name': 'warranty_months'},
              'requiredFields': {'supplier_category': 'vip', 'quantity': 5},
              'requiredRule': 'and',
            },
          ],
        ],
        'default': {
          'person_type': 'PF',
          'supplier_category': 'standard',
          'discount_percent': 10,
          'quantity': 2,
        },
      };
    });

    test('1. dependentFields & 7. clearedFieldsChanged', () {
      final controller = DynamicFormController(schema: schema);
      expect(controller.visibility['cpf'], true);
      expect(controller.visibility['cnpj'], false);

      controller.setValue('cpf', '123.456.789-00');
      expect(controller.values['cpf'], '123.456.789-00');

      // Alternar para PJ deve limpar CPF via clearedFieldsChanged e exibir CNPJ
      controller.setValue('person_type', 'PJ');
      expect(controller.values['cpf'], null);
      expect(controller.visibility['cpf'], false);
      expect(controller.visibility['cnpj'], true);
    });

    test('2 & 3. disabledFields com operador and / or', () {
      final controller = DynamicFormController(schema: schema);

      // standard + PF -> habilitado
      expect(controller.disabledState['payment_terms'], false);

      // restricted + PJ -> habilitado (operador 'and' exige ambos)
      controller.setValue('person_type', 'PJ');
      controller.setValue('supplier_category', 'restricted');
      expect(controller.disabledState['payment_terms'], false);

      // restricted + PF -> DESABILITADO
      controller.setValue('person_type', 'PF');
      expect(controller.disabledState['payment_terms'], true);

      // discount_percent tem operador 'or' com restricted -> desabilita
      expect(controller.disabledState['discount_percent'], true);
    });

    test('4. reloadFields & 6. clearedFields', () {
      final controller = DynamicFormController(schema: schema);
      controller.setValue('state_id', 'SP');
      controller.setValue('city_id', 'Campinas');

      expect(controller.values['city_id'], 'Campinas');

      // Trocar state_id limpa city_id via reloadFields/clearedFields
      controller.setValue('state_id', 'RJ');
      expect(controller.values['city_id'], null);
    });

    test('5. autoSetFields & 10. calcFields em cascata', () {
      final controller = DynamicFormController(schema: schema);
      controller.setValue('discount_percent', 10);
      controller.setValue('quantity', 2);

      // Selecionar Dell deve preencher SKU e Preço via autoSetFields
      // e recalcular total_price em cascata (2 * 8500 * 0.9 = 15300)
      controller.setValue('product_id', 'prod_dell');
      expect(controller.values['product_sku'], 'DELL-XPS-15');
      expect(controller.values['unit_price'], 8500);
      expect(controller.values['total_price'], 15300.0);

      // Mudar produto para LG (2 * 2400 * 0.9 = 4320)
      controller.setValue('product_id', 'prod_lg');
      expect(controller.values['product_sku'], 'LG-34-UW');
      expect(controller.values['unit_price'], 2400);
      expect(controller.values['total_price'], 4320.0);
    });

    test('8. requiredFields & 9. requiredRule com operador and', () {
      final controller = DynamicFormController(schema: schema);

      // CPF é obrigatório para PF
      expect(controller.isFieldRequired('cpf'), true);

      // warranty_months não é obrigatório com quantity = 2
      expect(controller.isFieldRequired('warranty_months'), false);

      // Com VIP e quantity = 5 -> torna-se obrigatório via operador 'and'
      controller.setValue('supplier_category', 'vip');
      controller.setValue('quantity', 5);
      expect(controller.isFieldRequired('warranty_months'), true);

      // Validação falha sem preencher garantia
      expect(controller.validate(), false);
      expect(controller.errors.containsKey('warranty_months'), true);

      // Preenche garantia -> validação passa
      controller.setValue('name', 'João Silva');
      controller.setValue('cpf', '123.456.789-00');
      controller.setValue('warranty_months', 12);
      expect(controller.validate(), true);
    });
  });
}
