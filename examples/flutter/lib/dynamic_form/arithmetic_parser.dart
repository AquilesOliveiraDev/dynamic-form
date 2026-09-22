import 'dart:math' as math;

/// Parser de expressões aritméticas com descida recursiva e precedência de operadores sem eval()
class ArithmeticParser {
  /// Avalia expressões como "#{quantity}# * #{unit_price}# * (1 - #{discount_percent}# / 100)"
  static double? evaluate(String expression, Map<String, dynamic> values, {num? step}) {
    if (expression.isEmpty) return null;

    String sanitized = expression;

    // 1. Substitui tokens #{campo}#
    final tokenRegex = RegExp(r'#\{([^}]+)\}#');
    final matches = tokenRegex.allMatches(expression);

    for (final match in matches) {
      final fullMatch = match.group(0)!;
      final fieldName = match.group(1)!.trim();
      final rawVal = values[fieldName];

      num? numVal;
      if (rawVal is num) {
        numVal = rawVal;
      } else if (rawVal is bool) {
        numVal = rawVal ? 1 : 0;
      } else if (rawVal != null) {
        numVal = num.tryParse(rawVal.toString());
      }

      if (numVal == null) return null;
      sanitized = sanitized.replaceAll(fullMatch, numVal.toString());
    }

    // 2. Se não houver #{}, substitui identificadores alfanuméricos diretos
    if (!expression.contains('#{')) {
      final wordRegex = RegExp(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b');
      final wordMatches = wordRegex.allMatches(expression);
      for (final match in wordMatches) {
        final word = match.group(0)!;
        if (values.containsKey(word)) {
          final rawVal = values[word];
          final numVal = rawVal is num ? rawVal : num.tryParse(rawVal?.toString() ?? '');
          if (numVal == null) return null;
          sanitized = sanitized.replaceAll(RegExp(r'\b' + word + r'\b'), numVal.toString());
        }
      }
    }

    sanitized = sanitized.replaceAll(' ', '');

    // Validação estrita
    if (!RegExp(r'^[0-9+\-*/().]+$').hasMatch(sanitized)) return null;

    try {
      final parser = _RecursiveParser(sanitized);
      final result = parser.parse();

      if (step != null && step > 0) {
        final stepStr = step.toString();
        final decimals = stepStr.contains('.') ? stepStr.split('.')[1].length : 0;
        final factor = math.pow(10, decimals).toDouble();
        return (result * factor).round() / factor;
      }

      // Arredonda para 2 casas decimais por padrão
      return (result * 100).round() / 100.0;
    } catch (_) {
      return null;
    }
  }
}

class _RecursiveParser {
  final String input;
  int pos = 0;

  _RecursiveParser(this.input);

  String? get peek => pos < input.length ? input[pos] : null;

  double parse() {
    final res = parseExpression();
    if (pos != input.length) {
      throw FormatException('Caractere inesperado em $pos');
    }
    return res;
  }

  double parseExpression() {
    double val = parseTerm();
    while (pos < input.length && (peek == '+' || peek == '-')) {
      final op = input[pos++];
      final rhs = parseTerm();
      val = op == '+' ? val + rhs : val - rhs;
    }
    return val;
  }

  double parseTerm() {
    double val = parseFactor();
    while (pos < input.length && (peek == '*' || peek == '/')) {
      final op = input[pos++];
      final rhs = parseFactor();
      val = op == '*' ? val * rhs : val / rhs;
    }
    return val;
  }

  double parseFactor() {
    if (peek == '+') {
      pos++;
      return parseFactor();
    }
    if (peek == '-') {
      pos++;
      return -parseFactor();
    }
    if (peek == '(') {
      pos++;
      final val = parseExpression();
      if (peek != ')') throw const FormatException('Parêntese não fechado');
      pos++;
      return val;
    }
    return parseNumber();
  }

  double parseNumber() {
    final start = pos;
    while (pos < input.length && RegExp(r'[0-9.]').hasMatch(input[pos])) {
      pos++;
    }
    if (pos == start) throw FormatException('Número esperado em $pos');
    final numStr = input.substring(start, pos);
    final val = double.tryParse(numStr);
    if (val == null) throw FormatException('Número inválido: $numStr');
    return val;
  }
}
