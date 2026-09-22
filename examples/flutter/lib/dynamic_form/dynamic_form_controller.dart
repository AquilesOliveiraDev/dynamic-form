import 'package:flutter/foundation.dart';
import 'arithmetic_parser.dart';

/// Controller reativo e universal para Flutter aplicando as 10 regras fundamentais do DynamicField
class DynamicFormController extends ChangeNotifier {
  final Map<String, dynamic> schema;
  final Map<String, dynamic> values = {};
  final Map<String, bool> visibility = {};
  final Map<String, bool> disabledState = {};
  final Map<String, String> errors = {};
  final Map<String, dynamic> _baseline = {};

  bool isDirty = false;
  List<Map<String, dynamic>> _flatFields = [];

  DynamicFormController({
    required this.schema,
    Map<String, dynamic>? initialValues,
  }) {
    _flattenFields();
    _initValues(initialValues);
    _recomputeRules();
    _runAutoSetsAndCalcs();
    _saveBaseline();
  }

  void _flattenFields() {
    _flatFields = [];
    final structure = (schema['structure'] ?? schema['fields']) as List<dynamic>? ?? [];
    for (final row in structure) {
      if (row is List) {
        for (final field in row) {
          if (field is Map<String, dynamic>) {
            _flatFields.add(field);
          }
        }
      }
    }
  }

  Map<String, dynamic>? getField(String name) {
    for (final f in _flatFields) {
      final attr = f['attr'] as Map<String, dynamic>?;
      if (attr?['name'] == name) return f;
    }
    return null;
  }

  void _initValues(Map<String, dynamic>? initialValues) {
    final defaultValues = schema['default'] as Map<String, dynamic>? ?? {};
    values.addAll(defaultValues);

    for (final f in _flatFields) {
      final attr = f['attr'] as Map<String, dynamic>?;
      final name = attr?['name'] as String?;
      if (name != null && !values.containsKey(name)) {
        final comp = f['component'];
        if (comp == 'switch') {
          values[name] = false;
        } else if (comp == 'select' || comp == 'autocomplete' || comp == 'datepicker' || comp == 'radio') {
          values[name] = null;
        } else if (comp == 'number') {
          values[name] = null;
        } else {
          values[name] = '';
        }
      }
    }

    if (initialValues != null) {
      values.addAll(initialValues);
    }
  }

  void _saveBaseline() {
    _baseline.clear();
    _baseline.addAll(Map<String, dynamic>.from(values));
    _updateDirty();
  }

  void _updateDirty() {
    bool dirty = false;
    for (final key in values.keys) {
      if (values[key] != _baseline[key]) {
        dirty = true;
        break;
      }
    }
    isDirty = dirty;
  }

  /// Avalia regra genérica DynamicFieldRule (array de campos ou mapa de correspondência)
  bool evaluateRule(dynamic rule, {String operator = 'or'}) {
    if (rule == null) return false;

    if (rule is List) {
      if (operator == 'and') {
        return rule.every((f) => _isFilled(values[f.toString()]));
      } else {
        return rule.any((f) => _isFilled(values[f.toString()]));
      }
    }

    if (rule is Map) {
      final results = <bool>[];
      for (final entry in rule.entries) {
        final fieldName = entry.key.toString();
        final expected = entry.value;
        final current = values[fieldName];

        if (expected == 'any') {
          results.add(_isFilled(current));
        } else if (expected is List) {
          results.add(expected.any((e) => e.toString() == current?.toString()));
        } else {
          results.add(expected.toString() == current?.toString());
        }
      }

      return operator == 'and' ? results.every((r) => r) : results.any((r) => r);
    }

    return false;
  }

  bool _isFilled(dynamic v) {
    if (v == null) return false;
    if (v is String) return v.trim().isNotEmpty;
    if (v is List) return v.isNotEmpty;
    if (v is bool) return true;
    if (v is num) return !v.isNaN;
    return true;
  }

  /// Verifica se o campo é obrigatório dinamicamente
  bool isFieldRequired(String name) {
    final field = getField(name);
    if (field == null) return false;

    // REGRA 8 & 9: requiredFields & requiredRule
    if (field.containsKey('requiredFields')) {
      final rule = field['requiredFields'];
      final op = field['requiredRule']?.toString() ?? 'or';
      return evaluateRule(rule, operator: op);
    }

    final attr = field['attr'] as Map<String, dynamic>?;
    return attr?['required'] == true;
  }

  /// Recalcula regras de visibilidade e desabilitação
  void _recomputeRules() {
    for (final f in _flatFields) {
      final attr = f['attr'] as Map<String, dynamic>?;
      final name = attr?['name'] as String?;
      if (name == null) continue;

      bool visible = attr?['hidden'] != true;
      bool disabled = attr?['disabled'] == true;

      // REGRA 1: dependentFields
      if (f.containsKey('dependentFields')) {
        final cond = f['dependentFieldsCondition']?.toString() ?? 'or';
        visible = visible && evaluateRule(f['dependentFields'], operator: cond);
      }

      // REGRA 2 & 3: disabledFields & disabledFieldsCondition
      if (f.containsKey('disabledFields')) {
        final cond = f['disabledFieldsCondition']?.toString() ?? 'or';
        disabled = disabled || evaluateRule(f['disabledFields'], operator: cond);
      }

      visibility[name] = visible;
      disabledState[name] = disabled;
    }
  }

  /// Executa autoSetFields e calcFields para popular valores iniciais
  void _runAutoSetsAndCalcs() {
    for (final f in _flatFields) {
      final attr = f['attr'] as Map<String, dynamic>?;
      final name = attr?['name'] as String?;
      if (name == null) continue;

      // Se campo tem autoSetFields declarado e fonte preenchida
      if (f.containsKey('autoSetFields')) {
        final autoSets = f['autoSetFields'] as Map<String, dynamic>?;
        if (autoSets != null) {
          for (final entry in autoSets.entries) {
            final sourceField = entry.key;
            final path = entry.value?.toString();
            final sourceVal = values[sourceField];

            if (_isFilled(sourceVal) && path != null) {
              final derived = _extractAutoSetValue(sourceField, sourceVal, path);
              if (derived != null) {
                values[name] = derived;
              }
            }
          }
        }
      }
    }

    // Calcula fórmulas calcFields
    _runCalcs();
  }

  dynamic _extractAutoSetValue(String sourceField, dynamic sourceVal, String path) {
    final srcFieldDef = getField(sourceField);
    final attr = srcFieldDef?['attr'] as Map<String, dynamic>?;
    final options = (srcFieldDef?['options'] ?? attr?['options']) as List<dynamic>?;

    if (options != null) {
      for (final opt in options) {
        if (opt is Map<String, dynamic>) {
          if (opt['value']?.toString() == sourceVal?.toString()) {
            final record = opt['record'];
            if (path == 'record') return record;
            if (record is Map<String, dynamic>) {
              final subKey = path.startsWith('record.') ? path.substring(7) : path;
              if (record.containsKey(subKey)) return record[subKey];
            }
            if (opt.containsKey(path)) return opt[path];
          }
        }
      }
    }
    return null;
  }

  void _runCalcs() {
    for (final f in _flatFields) {
      final attr = f['attr'] as Map<String, dynamic>?;
      final name = attr?['name'] as String?;
      final calcExpr = f['calcFields'] ?? attr?['calcFields'];
      if (name != null && calcExpr is String && calcExpr.isNotEmpty) {
        final step = attr?['step'] as num?;
        final res = ArithmeticParser.evaluate(calcExpr, values, step: step);
        if (res != null) {
          values[name] = res;
        }
      }
    }
  }

  /// Define o valor de um campo e executa o pipeline reativo completo
  void setValue(String field, dynamic value) {
    if (values[field] == value) return;
    values[field] = value;

    // REGRA 7: clearedFieldsChanged no campo fonte
    final srcField = getField(field);
    final isChangedMode = srcField?['clearedFieldsChanged'] == true;
    if (isChangedMode && srcField?.containsKey('clearedFields') == true) {
      final targets = srcField!['clearedFields'];
      if (targets is List) {
        for (final t in targets) {
          values[t.toString()] = null;
        }
      }
    }

    // REGRA 6: clearedFields (target-driven nos campos dependentes)
    for (final f in _flatFields) {
      final attr = f['attr'] as Map<String, dynamic>?;
      final targetName = attr?['name'] as String?;
      if (targetName != null && f['clearedFieldsChanged'] != true && f.containsKey('clearedFields')) {
        final sources = f['clearedFields'];
        if (sources is List && sources.any((s) => s.toString() == field)) {
          values[targetName] = null;
        }
      }
    }

    // REGRA 4: reloadFields (reseta valor se a fonte mudar)
    for (final f in _flatFields) {
      final attr = f['attr'] as Map<String, dynamic>?;
      final targetName = attr?['name'] as String?;
      if (targetName != null && f.containsKey('reloadFields')) {
        final sources = f['reloadFields'];
        if (sources is List && sources.any((s) => s.toString() == field)) {
          values[targetName] = null;
        }
      }
    }

    // REGRA 5: autoSetFields
    for (final f in _flatFields) {
      final attr = f['attr'] as Map<String, dynamic>?;
      final targetName = attr?['name'] as String?;
      if (targetName != null && f.containsKey('autoSetFields')) {
        final autoSets = f['autoSetFields'] as Map<String, dynamic>?;
        if (autoSets != null && autoSets.containsKey(field)) {
          final path = autoSets[field]?.toString();
          if (path != null && _isFilled(value)) {
            final derived = _extractAutoSetValue(field, value, path);
            if (derived != null) {
              values[targetName] = derived;
            }
          } else {
            values[targetName] = null;
          }
        }
      }
    }

    // REGRA 10: calcFields
    _runCalcs();

    // Recalcula visibilidade e desabilitação
    _recomputeRules();

    // Atualiza dirty check
    _updateDirty();

    notifyListeners();
  }

  /// Valida todos os campos visíveis e habilitados
  bool validate() {
    errors.clear();

    for (final f in _flatFields) {
      final attr = f['attr'] as Map<String, dynamic>?;
      final name = attr?['name'] as String?;
      if (name == null) continue;

      final isVisible = visibility[name] != false;
      final isEnabled = disabledState[name] != true;

      // REGRA DE OURO: campos invisíveis ou desabilitados NUNCA geram erro
      if (!isVisible || !isEnabled) continue;

      final required = isFieldRequired(name);
      final val = values[name];

      if (required && !_isFilled(val)) {
        errors[name] = attr?['requiredMessage'] ?? 'Campo obrigatório';
      }
    }

    notifyListeners();
    return errors.isEmpty;
  }

  /// Restaura o formulário para o estado inicial
  void reset() {
    values.clear();
    errors.clear();
    _initValues(null);
    _recomputeRules();
    _runAutoSetsAndCalcs();
    _saveBaseline();
    notifyListeners();
  }
}
