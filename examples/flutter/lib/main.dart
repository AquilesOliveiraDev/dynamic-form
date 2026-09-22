import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dynamic_form/dynamic_form_controller.dart';

void main() {
  runApp(const DynamicFormApp());
}

class DynamicFormApp extends StatelessWidget {
  const DynamicFormApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TESTE FINAL: Flutter 10 Regras',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1677FF),
          brightness: Brightness.light,
        ),
      ),
      home: const FormScreen(),
    );
  }
}

class FormScreen extends StatefulWidget {
  const FormScreen({super.key});

  @override
  State<FormScreen> createState() => _FormScreenState();
}

class _FormScreenState extends State<FormScreen> {
  DynamicFormController? _controller;
  Map<String, dynamic>? _catalogs;
  Map<String, dynamic>? _submittedPayload;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSchema();
  }

  Future<void> _loadSchema() async {
    try {
      final raw = await rootBundle.loadString('assets/form-schema.json');
      final data = jsonDecode(raw) as Map<String, dynamic>;
      _catalogs = data['catalogs'] as Map<String, dynamic>?;

      setState(() {
        _controller = DynamicFormController(schema: data);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Erro ao carregar form-schema.json: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Text(_error!, style: const TextStyle(color: Colors.red)),
          ),
        ),
      );
    }

    final controller = _controller!;

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F5),
      appBar: AppBar(
        title: const Text('TESTE FINAL: FLUTTER'),
        backgroundColor: Colors.white,
        elevation: 1,
        actions: [
          AnimatedBuilder(
            animation: controller,
            builder: (context, _) {
              return Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Chip(
                  label: Text(
                    controller.isDirty ? 'Modificado' : 'Limpo',
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                  backgroundColor: controller.isDirty ? Colors.orange : Colors.green,
                ),
              );
            },
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: controller,
        builder: (context, _) {
          final values = controller.values;
          final visibility = controller.visibility;
          final disabled = controller.disabledState;
          final errors = controller.errors;

          // Catálogo de cidades dinâmico para o reloadFields
          final currentState = values['state_id']?.toString();
          final citiesMap = _catalogs?['cities_by_state'] as Map<String, dynamic>?;
          final availableCities = (citiesMap != null && currentState != null)
              ? (citiesMap[currentState] as List<dynamic>? ?? [])
              : [];

          final productsList = (_catalogs?['products'] as List<dynamic>? ?? []);

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Header Card
              Card(
                elevation: 0,
                color: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: const Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Validação Universal do DynamicField no Flutter',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1677FF)),
                      ),
                      SizedBox(height: 6),
                      Text(
                        'Aplicação Flutter consumindo exatamente o mesmo form-schema.json compartilhado com o React Native, com 10 regras em tempo real.',
                        style: TextStyle(color: Colors.black54, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Seção 1: Identificação
              _buildSectionCard(
                title: '1. Identificação do Fornecedor',
                chips: const ['clearedFieldsChanged', 'dependentFields', 'requiredFields'],
                children: [
                  const Text('Tipo de Pessoa (Dispara clearedFieldsChanged limpando CPF/CNPJ):',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 8),
                  SegmentedButton<String>(
                    segments: const [
                      ButtonSegment(value: 'PF', label: Text('Pessoa Física (PF)')),
                      ButtonSegment(value: 'PJ', label: Text('Pessoa Jurídica (PJ)')),
                    ],
                    selected: {values['person_type'] ?? 'PF'},
                    onSelectionChanged: (val) => controller.setValue('person_type', val.first),
                  ),
                  const SizedBox(height: 12),

                  // Nome
                  TextField(
                    decoration: InputDecoration(
                      labelText: 'Nome de Contato *',
                      border: const OutlineInputBorder(),
                      errorText: errors['name'],
                    ),
                    controller: TextEditingController(text: values['name']?.toString() ?? '')
                      ..selection = TextSelection.collapsed(offset: (values['name']?.toString() ?? '').length),
                    onChanged: (val) => controller.setValue('name', val),
                  ),
                  const SizedBox(height: 12),

                  // CPF (PF)
                  if (visibility['cpf'] != false) ...[
                    TextField(
                      decoration: InputDecoration(
                        labelText: 'CPF ${controller.isFieldRequired('cpf') ? '*' : ''} (Exibido para PF)',
                        border: const OutlineInputBorder(),
                        errorText: errors['cpf'],
                      ),
                      keyboardType: TextInputType.number,
                      controller: TextEditingController(text: values['cpf']?.toString() ?? '')
                        ..selection = TextSelection.collapsed(offset: (values['cpf']?.toString() ?? '').length),
                      onChanged: (val) => controller.setValue('cpf', val),
                    ),
                    const SizedBox(height: 4),
                    const Text('💡 dependentFields: PF | requiredFields: PF', style: TextStyle(fontSize: 11, color: Colors.black45)),
                    const SizedBox(height: 12),
                  ],

                  // CNPJ (PJ)
                  if (visibility['cnpj'] != false) ...[
                    TextField(
                      decoration: InputDecoration(
                        labelText: 'CNPJ ${controller.isFieldRequired('cnpj') ? '*' : ''} (Exibido para PJ)',
                        border: const OutlineInputBorder(),
                        errorText: errors['cnpj'],
                      ),
                      keyboardType: TextInputType.number,
                      controller: TextEditingController(text: values['cnpj']?.toString() ?? '')
                        ..selection = TextSelection.collapsed(offset: (values['cnpj']?.toString() ?? '').length),
                      onChanged: (val) => controller.setValue('cnpj', val),
                    ),
                    const SizedBox(height: 4),
                    const Text('💡 dependentFields: PJ | requiredFields: PJ', style: TextStyle(fontSize: 11, color: Colors.black45)),
                    const SizedBox(height: 12),
                  ],

                  // Razão Social (PJ)
                  if (visibility['corporate_name'] != false) ...[
                    TextField(
                      decoration: const InputDecoration(
                        labelText: 'Razão Social (Exibido para PJ)',
                        border: OutlineInputBorder(),
                      ),
                      controller: TextEditingController(text: values['corporate_name']?.toString() ?? '')
                        ..selection = TextSelection.collapsed(offset: (values['corporate_name']?.toString() ?? '').length),
                      onChanged: (val) => controller.setValue('corporate_name', val),
                    ),
                    const SizedBox(height: 4),
                    const Text('💡 dependentFields: PJ | clearedFields: [person_type]', style: TextStyle(fontSize: 11, color: Colors.black45)),
                  ],
                ],
              ),
              const SizedBox(height: 12),

              // Seção 2: Localização
              _buildSectionCard(
                title: '2. Localização Geográfica',
                chips: const ['reloadFields', 'clearedFields'],
                children: [
                  const Text('Estado (UF):', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    key: ValueKey('state_${values['state_id']}'),
                    initialValue: values['state_id']?.toString(),
                    decoration: const InputDecoration(border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(value: 'SP', child: Text('São Paulo (SP)')),
                      DropdownMenuItem(value: 'RJ', child: Text('Rio de Janeiro (RJ)')),
                      DropdownMenuItem(value: 'MG', child: Text('Minas Gerais (MG)')),
                    ],
                    onChanged: (val) => controller.setValue('state_id', val),
                  ),
                  const SizedBox(height: 12),

                  const Text('Cidade (Reseta ao mudar de Estado via reloadFields):',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    key: ValueKey('city_${values['city_id']}_state_${values['state_id']}'),
                    initialValue: availableCities.any((c) => c['value'] == values['city_id']) ? values['city_id'] : null,
                    decoration: const InputDecoration(border: OutlineInputBorder()),
                    items: availableCities.map<DropdownMenuItem<String>>((c) {
                      return DropdownMenuItem(value: c['value'].toString(), child: Text(c['label'].toString()));
                    }).toList(),
                    onChanged: (val) => controller.setValue('city_id', val),
                  ),
                  const SizedBox(height: 4),
                  const Text('💡 reloadFields: [state_id] | clearedFields: [state_id]',
                      style: TextStyle(fontSize: 11, color: Colors.black45)),
                ],
              ),
              const SizedBox(height: 12),

              // Seção 3: Condições Comerciais
              _buildSectionCard(
                title: '3. Condições Comerciais & Descontos',
                chips: const ['disabledFields', 'disabledFieldsCondition: and/or'],
                children: [
                  const Text('Categoria do Fornecedor:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    key: ValueKey('supplier_${values['supplier_category']}'),
                    initialValue: values['supplier_category']?.toString(),
                    decoration: const InputDecoration(border: OutlineInputBorder()),
                    items: const [
                      DropdownMenuItem(value: 'standard', child: Text('Padrão (Standard)')),
                      DropdownMenuItem(value: 'vip', child: Text('VIP (Grandes Contas)')),
                      DropdownMenuItem(value: 'restricted', child: Text('Restrito (Bloqueado)')),
                    ],
                    onChanged: (val) => controller.setValue('supplier_category', val),
                  ),
                  const SizedBox(height: 12),

                  Text('Prazo de Pagamento ${disabled['payment_terms'] == true ? "(🔒 Bloqueado: Restrito + PF)" : ""}:',
                      style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                          color: disabled['payment_terms'] == true ? Colors.orange : Colors.black)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    key: ValueKey('payment_${values['payment_terms']}_disabled_${disabled['payment_terms']}'),
                    initialValue: values['payment_terms']?.toString(),
                    decoration: InputDecoration(
                      border: const OutlineInputBorder(),
                      fillColor: disabled['payment_terms'] == true ? Colors.grey.shade200 : Colors.white,
                      filled: true,
                    ),
                    items: const [
                      DropdownMenuItem(value: 'cash', child: Text('À Vista')),
                      DropdownMenuItem(value: '30_days', child: Text('Boleto 30 Dias')),
                      DropdownMenuItem(value: '60_days', child: Text('Boleto 60 Dias')),
                    ],
                    onChanged: disabled['payment_terms'] == true ? null : (val) => controller.setValue('payment_terms', val),
                  ),
                  const SizedBox(height: 12),

                  // Desconto
                  TextField(
                    enabled: disabled['discount_percent'] != true,
                    decoration: InputDecoration(
                      labelText: 'Desconto (%) ${disabled['discount_percent'] == true ? "(🔒 Desabilitado)" : ""}',
                      border: const OutlineInputBorder(),
                      fillColor: disabled['discount_percent'] == true ? Colors.grey.shade200 : Colors.white,
                      filled: true,
                    ),
                    keyboardType: TextInputType.number,
                    controller: TextEditingController(text: values['discount_percent']?.toString() ?? '')
                      ..selection = TextSelection.collapsed(offset: (values['discount_percent']?.toString() ?? '').length),
                    onChanged: (val) => controller.setValue('discount_percent', num.tryParse(val) ?? 0),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Seção 4: Pedido de Produto
              _buildSectionCard(
                title: '4. Pedido, AutoSet & Cálculo Aritmético',
                chips: const ['autoSetFields', 'calcFields', 'requiredFields: and'],
                children: [
                  const Text('Selecione o Produto (Dispara autoSetFields preenchendo SKU e Preço):',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                  const SizedBox(height: 8),
                  Column(
                    children: productsList.map<Widget>((prod) {
                      final isSelected = values['product_id'] == prod['value'];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            backgroundColor: isSelected ? const Color(0xFF1677FF) : Colors.white,
                            foregroundColor: isSelected ? Colors.white : Colors.black87,
                            minimumSize: const Size.fromHeight(44),
                          ),
                          onPressed: () => controller.setValue('product_id', prod['value']),
                          child: Text(prod['label']?.toString() ?? ''),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 8),

                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          enabled: false,
                          decoration: const InputDecoration(
                            labelText: 'SKU (AutoSet)',
                            border: OutlineInputBorder(),
                            filled: true,
                            fillColor: Color(0xFFF5F5F5),
                          ),
                          controller: TextEditingController(text: values['product_sku']?.toString() ?? ''),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          enabled: false,
                          decoration: InputDecoration(
                            labelText: 'Preço (AutoSet)',
                            border: const OutlineInputBorder(),
                            filled: true,
                            fillColor: const Color(0xFFF5F5F5),
                          ),
                          controller: TextEditingController(text: 'R\$ ${values['unit_price'] ?? 0}'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          decoration: const InputDecoration(
                            labelText: 'Quantidade',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.number,
                          controller: TextEditingController(text: values['quantity']?.toString() ?? '')
                            ..selection = TextSelection.collapsed(offset: (values['quantity']?.toString() ?? '').length),
                          onChanged: (val) => controller.setValue('quantity', num.tryParse(val) ?? 0),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          enabled: false,
                          decoration: InputDecoration(
                            labelText: 'Desconto Aplicado',
                            border: const OutlineInputBorder(),
                            filled: true,
                            fillColor: const Color(0xFFF5F5F5),
                          ),
                          controller: TextEditingController(text: '${values['discount_percent'] ?? 0}%'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Total Calculado (AST)
                  TextField(
                    enabled: false,
                    decoration: InputDecoration(
                      labelText: 'Total Calculado (R\$) [calcFields]',
                      border: const OutlineInputBorder(),
                      filled: true,
                      fillColor: const Color(0xFFE6F7FF),
                    ),
                    controller: TextEditingController(text: 'R\$ ${values['total_price'] ?? 0}'),
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1677FF)),
                  ),
                  const SizedBox(height: 4),
                  const Text('💡 calcFields: #{quantity}# * #{unit_price}# * (1 - #{discount_percent}# / 100)',
                      style: TextStyle(fontSize: 11, color: Colors.black45)),
                  const SizedBox(height: 12),

                  // Garantia Adicional (Condicionada a VIP + 5 itens)
                  TextField(
                    decoration: InputDecoration(
                      labelText: 'Garantia Adicional (Meses) ${controller.isFieldRequired('warranty_months') ? '* (Obrigatório)' : ''}',
                      border: const OutlineInputBorder(),
                      errorText: errors['warranty_months'],
                    ),
                    keyboardType: TextInputType.number,
                    controller: TextEditingController(text: values['warranty_months']?.toString() ?? '')
                      ..selection = TextSelection.collapsed(offset: (values['warranty_months']?.toString() ?? '').length),
                    onChanged: (val) => controller.setValue('warranty_months', num.tryParse(val)),
                  ),
                  const SizedBox(height: 4),
                  const Text('💡 requiredFields: { supplier_category: "vip", quantity: 5 } com operator: "and"',
                      style: TextStyle(fontSize: 11, color: Colors.black45)),
                ],
              ),
              const SizedBox(height: 16),

              // Botões de Ação
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1677FF),
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        if (controller.validate()) {
                          setState(() {
                            _submittedPayload = Map<String, dynamic>.from(controller.values);
                          });
                        }
                      },
                      icon: const Icon(Icons.check),
                      label: const Text('Submeter no Flutter'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 1,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        controller.reset();
                        setState(() {
                          _submittedPayload = null;
                        });
                      },
                      icon: const Icon(Icons.refresh),
                      label: const Text('Restaurar'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Card de Sucesso com Payload
              if (_submittedPayload != null) ...[
                Card(
                  color: const Color(0xFFF6FFED),
                  shape: RoundedRectangleBorder(
                    side: const BorderSide(color: Color(0xFFB7EB8F)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '✅ Payload Validado e Submetido com Sucesso:',
                          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF389E0D)),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.black12),
                          ),
                          child: Text(
                            const JsonEncoder.withIndent('  ').convert(_submittedPayload),
                            style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Inspetor de Estado do Grafo Reativo
              Card(
                color: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '🔍 Inspetor de Estado Reativo (Flutter):',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black87),
                      ),
                      const SizedBox(height: 8),
                      Text('• Total Calculado: R\$ ${values['total_price'] ?? 0}'),
                      Text('• SKU AutoSet: ${values['product_sku']}'),
                      Text('• Visibilidade CPF: ${visibility['cpf']} | CNPJ: ${visibility['cnpj']}'),
                      Text('• Prazo Pagamento Desabilitado: ${disabled['payment_terms']}'),
                      Text('• Desconto Desabilitado: ${disabled['discount_percent']}'),
                      Text('• Garantia Obrigatória: ${controller.isFieldRequired('warranty_months')}'),
                      Text('• Formulário Dirty: ${controller.isDirty}'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required List<String> chips,
    required List<Widget> children,
  }) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: chips.map((c) {
                return Chip(
                  label: Text(c, style: const TextStyle(fontSize: 11, color: Color(0xFF1677FF))),
                  backgroundColor: const Color(0xFFF0F5FF),
                  padding: EdgeInsets.zero,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                );
              }).toList(),
            ),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1677FF))),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }
}
