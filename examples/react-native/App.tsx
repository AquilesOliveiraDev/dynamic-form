import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Text,
  Card,
  TextInput,
  Button,
  Divider,
  SegmentedButtons,
  Badge,
  Chip,
} from 'react-native-paper';
import {
  FormStore,
  type DynamicFormSchema,
  type DynamicField,
  type FormState,
} from '@dynamic-form/core';

// Tipagem dos dados do formulário
export interface SupplierFormData {
  // Bloco 1: Identificação (dependentFields, clearedFieldsChanged, requiredFields, requiredRule)
  person_type: 'PF' | 'PJ';
  name: string;
  cpf?: string;
  cnpj?: string;
  corporate_name?: string;

  // Bloco 2: Localização (reloadFields, clearedFields)
  state_id: string;
  city_id: string;

  // Bloco 3: Fornecedor e Condições (disabledFields, disabledFieldsCondition)
  supplier_category: 'standard' | 'vip' | 'restricted';
  payment_terms: string;
  discount_percent: number;

  // Bloco 4: Pedido de Produto (autoSetFields, calcFields, requiredFields com 'and')
  product_id: string;
  product_sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  warranty_months?: number;
}

// Importação do arquivo JSON universal único compartilhado em examples/
import formSchemaJson from '../form-schema.json';

// Extração dos catálogos de dados e do esquema a partir do JSON universal
export const PRODUCT_OPTIONS = formSchemaJson.catalogs.products;
export const CITIES_BY_STATE: Record<string, Array<{ label: string; value: string }>> =
  formSchemaJson.catalogs.cities_by_state;

// Esquema universal consumido diretamente do JSON único
export const supplierFormSchema = formSchemaJson as unknown as DynamicFormSchema<SupplierFormData>;

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1677ff',
    secondaryContainer: '#e6f4ff',
  },
};

export default function App() {
  const [store] = useState(
    () =>
      new FormStore<SupplierFormData>({
        schema: supplierFormSchema,
        initialValues: supplierFormSchema.default,
      }),
  );

  const [formState, setFormState] = useState(() => store.getState());
  const [submittedPayload, setSubmittedPayload] = useState<SupplierFormData | null>(null);

  useEffect(() => {
    return store.subscribe((next: FormState<SupplierFormData>) => {
      setFormState({ ...next });
    });
  }, [store]);

  const handleSubmit = async () => {
    const isValid = await store.validateForm();
    if (isValid) {
      setSubmittedPayload(store.getValues());
    }
  };

  const handleReset = () => {
    store.reset();
    setSubmittedPayload(null);
  };

  const { values, errors, visibility, disabledState, isDirty } = formState;

  // Lista dinâmica de cidades baseada no estado selecionado (reloadFields)
  const availableCities = values.state_id ? CITIES_BY_STATE[values.state_id] || [] : [];

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <Card style={styles.headerCard} mode="elevated">
            <Card.Content>
              <View style={styles.headerRow}>
                <Text variant="titleLarge" style={styles.title}>
                  TESTE FINAL: 10 REGRAS
                </Text>
                <Badge style={[styles.badge, isDirty ? styles.badgeDirty : styles.badgeClean]}>
                  {isDirty ? 'Modificado' : 'Limpo'}
                </Badge>
              </View>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Demonstração completa das 10 regras arquitetadas do DynamicField no React Native.
              </Text>
            </Card.Content>
          </Card>

          {/* Seção 1: Identificação */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content>
              <View style={styles.ruleBadgeRow}>
                <Chip icon="check-circle" compact style={styles.ruleChip}>
                  clearedFieldsChanged
                </Chip>
                <Chip icon="eye" compact style={styles.ruleChip}>
                  dependentFields
                </Chip>
                <Chip icon="alert" compact style={styles.ruleChip}>
                  requiredFields / requiredRule
                </Chip>
              </View>

              <Text variant="labelLarge" style={styles.sectionTitle}>
                1. Identificação do Fornecedor
              </Text>

              <Text variant="bodySmall" style={styles.fieldLabel}>
                Tipo de Pessoa (Dispara clearedFieldsChanged limpando CPF/CNPJ/Razão Social):
              </Text>
              <SegmentedButtons
                value={values.person_type}
                onValueChange={(val: string) => store.setValue('person_type', val as 'PF' | 'PJ')}
                buttons={[
                  { value: 'PF', label: 'Pessoa Física (PF)' },
                  { value: 'PJ', label: 'Pessoa Jurídica (PJ)' },
                ]}
                style={styles.segmented}
              />

              <TextInput
                label="Nome do Responsável *"
                mode="outlined"
                value={values.name ?? ''}
                error={Boolean(errors.name)}
                onChangeText={(text: string) => store.setValue('name', text)}
                style={styles.input}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

              {/* CPF: dependentFields + requiredFields (PF) */}
              {visibility.cpf !== false && (
                <View style={styles.fieldBox}>
                  <TextInput
                    label={`CPF ${store.isFieldRequired('cpf') ? '*' : ''} (Exibido para PF)`}
                    mode="outlined"
                    value={values.cpf ?? ''}
                    keyboardType="numeric"
                    error={Boolean(errors.cpf)}
                    onChangeText={(text: string) => store.setValue('cpf', text)}
                    style={styles.input}
                  />
                  {errors.cpf ? <Text style={styles.errorText}>{errors.cpf}</Text> : null}
                  <Text variant="bodySmall" style={styles.hintText}>
                    💡 dependentFields: PF | requiredFields: PF | requiredRule: 'or'
                  </Text>
                </View>
              )}

              {/* CNPJ: dependentFields + requiredFields (PJ) */}
              {visibility.cnpj !== false && (
                <View style={styles.fieldBox}>
                  <TextInput
                    label={`CNPJ ${store.isFieldRequired('cnpj') ? '*' : ''} (Exibido para PJ)`}
                    mode="outlined"
                    value={values.cnpj ?? ''}
                    keyboardType="numeric"
                    error={Boolean(errors.cnpj)}
                    onChangeText={(text: string) => store.setValue('cnpj', text)}
                    style={styles.input}
                  />
                  {errors.cnpj ? <Text style={styles.errorText}>{errors.cnpj}</Text> : null}
                  <Text variant="bodySmall" style={styles.hintText}>
                    💡 dependentFields: PJ | requiredFields: PJ
                  </Text>
                </View>
              )}

              {/* Razão Social: dependentFields + clearedFields */}
              {visibility.corporate_name !== false && (
                <View style={styles.fieldBox}>
                  <TextInput
                    label="Razão Social (Exibido para PJ)"
                    mode="outlined"
                    value={values.corporate_name ?? ''}
                    onChangeText={(text: string) => store.setValue('corporate_name', text)}
                    style={styles.input}
                  />
                  <Text variant="bodySmall" style={styles.hintText}>
                    💡 dependentFields: PJ | clearedFields: ['person_type']
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Seção 2: Localização */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content>
              <View style={styles.ruleBadgeRow}>
                <Chip icon="refresh" compact style={styles.ruleChip}>
                  reloadFields
                </Chip>
                <Chip icon="eraser" compact style={styles.ruleChip}>
                  clearedFields
                </Chip>
              </View>

              <Text variant="labelLarge" style={styles.sectionTitle}>
                2. Localização Geográfica
              </Text>

              <Text variant="bodySmall" style={styles.fieldLabel}>
                Selecione o Estado (Gatilho de reloadFields e clearedFields para Cidade):
              </Text>
              <SegmentedButtons
                value={values.state_id}
                onValueChange={(val: string) => store.setValue('state_id', val)}
                buttons={[
                  { value: 'SP', label: 'São Paulo' },
                  { value: 'RJ', label: 'Rio de Janeiro' },
                  { value: 'MG', label: 'Minas Gerais' },
                ]}
                style={styles.segmented}
              />

              <Text variant="bodySmall" style={styles.fieldLabel}>
                Cidade (Limpa e recarregada via reloadFields quando o Estado muda):
              </Text>
              <SegmentedButtons
                value={values.city_id ?? ''}
                onValueChange={(val: string) => store.setValue('city_id', val)}
                buttons={availableCities.map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
                style={styles.segmented}
              />
              <Text variant="bodySmall" style={styles.hintText}>
                💡 Ao trocar o Estado, city_id é limpo e recarregado instantaneamente.
              </Text>
            </Card.Content>
          </Card>

          {/* Seção 3: Condições Comerciais */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content>
              <View style={styles.ruleBadgeRow}>
                <Chip icon="cancel" compact style={styles.ruleChip}>
                  disabledFields
                </Chip>
                <Chip icon="tune" compact style={styles.ruleChip}>
                  disabledFieldsCondition: 'and' | 'or'
                </Chip>
              </View>

              <Text variant="labelLarge" style={styles.sectionTitle}>
                3. Condições Comerciais & Descontos
              </Text>

              <Text variant="bodySmall" style={styles.fieldLabel}>
                Categoria do Fornecedor:
              </Text>
              <SegmentedButtons
                value={values.supplier_category}
                onValueChange={(val: string) =>
                  store.setValue('supplier_category', val as 'standard' | 'vip' | 'restricted')
                }
                buttons={[
                  { value: 'standard', label: 'Padrão' },
                  { value: 'vip', label: 'VIP' },
                  { value: 'restricted', label: 'Restrito' },
                ]}
                style={styles.segmented}
              />

              {/* Prazo de Pagamento: disabledFields com 'and' */}
              <Text variant="bodySmall" style={styles.fieldLabel}>
                Prazo de Pagamento (Desabilita apenas se Restrito E PF):
              </Text>
              <SegmentedButtons
                value={values.payment_terms}
                onValueChange={(val: string) => store.setValue('payment_terms', val)}
                buttons={[
                  { value: 'cash', label: 'À Vista', disabled: disabledState.payment_terms === true },
                  { value: '30_days', label: '30 Dias', disabled: disabledState.payment_terms === true },
                  { value: '60_days', label: '60 Dias', disabled: disabledState.payment_terms === true },
                ]}
                style={styles.segmented}
              />
              {disabledState.payment_terms === true && (
                <Text style={styles.disabledNotice}>
                  🔒 Bloqueado: Fornecedor Restrito e Pessoa Física (disabledFieldsCondition: 'and')
                </Text>
              )}

              {/* Desconto: disabledFields com 'or' */}
              <TextInput
                label="Desconto (%) (Desabilitado se Categoria for Restrito)"
                mode="outlined"
                keyboardType="numeric"
                value={String(values.discount_percent ?? '')}
                disabled={disabledState.discount_percent === true}
                onChangeText={(text: string) => store.setValue('discount_percent', Number(text) || 0)}
                style={[styles.input, disabledState.discount_percent === true ? styles.disabledInput : null]}
              />
              <Text variant="bodySmall" style={styles.hintText}>
                💡 disabledFields: {`{ supplier_category: 'restricted' }`} | disabledFieldsCondition: 'or'
              </Text>
            </Card.Content>
          </Card>

          {/* Seção 4: Pedido de Produto */}
          <Card style={styles.sectionCard} mode="elevated">
            <Card.Content>
              <View style={styles.ruleBadgeRow}>
                <Chip icon="lightning-bolt" compact style={styles.ruleChip}>
                  autoSetFields
                </Chip>
                <Chip icon="calculator" compact style={styles.ruleChip}>
                  calcFields (AST)
                </Chip>
              </View>

              <Text variant="labelLarge" style={styles.sectionTitle}>
                4. Pedido, AutoSet & Cálculo em Tempo Real
              </Text>

              <Text variant="bodySmall" style={styles.fieldLabel}>
                Selecione o Produto (Dispara autoSetFields preenchendo SKU e Preço):
              </Text>
              <View style={styles.productButtonCol}>
                {PRODUCT_OPTIONS.map((prod) => {
                  const isSelected = values.product_id === prod.value;
                  return (
                    <Button
                      key={prod.value}
                      mode={isSelected ? 'contained' : 'outlined'}
                      onPress={() => store.setValue('product_id', prod.value)}
                      style={styles.productBtn}
                    >
                      {prod.label}
                    </Button>
                  );
                })}
              </View>

              <View style={styles.row}>
                <TextInput
                  label="SKU (AutoSet)"
                  mode="outlined"
                  value={values.product_sku ?? ''}
                  disabled={true}
                  style={[styles.input, styles.halfInput, styles.disabledInput]}
                />
                <TextInput
                  label="Preço Unit. (AutoSet)"
                  mode="outlined"
                  value={`R$ ${values.unit_price ?? 0}`}
                  disabled={true}
                  style={[styles.input, styles.halfInput, styles.disabledInput]}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  label="Quantidade"
                  mode="outlined"
                  keyboardType="numeric"
                  value={String(values.quantity ?? '')}
                  onChangeText={(text: string) => store.setValue('quantity', Number(text) || 0)}
                  style={[styles.input, styles.halfInput]}
                />
                <TextInput
                  label="Desconto Aplicado"
                  mode="outlined"
                  value={`${values.discount_percent ?? 0}%`}
                  disabled={true}
                  style={[styles.input, styles.halfInput, styles.disabledInput]}
                />
              </View>

              {/* Total Calculado via AST */}
              <TextInput
                label="Valor Total Calculado (R$)"
                mode="outlined"
                value={`R$ ${values.total_price ?? 0}`}
                disabled={true}
                style={[styles.input, styles.totalInput]}
              />
              <Text variant="bodySmall" style={styles.hintText}>
                💡 calcFields: "#{`{quantity}# * #{unit_price}# * (1 - #{discount_percent}# / 100)`}"
              </Text>

              <Divider style={styles.divider} />

              {/* Garantia: requiredFields com 'and' */}
              <TextInput
                label={`Garantia Adicional (Meses) ${store.isFieldRequired('warranty_months') ? '* (Obrigatório)' : ''
                  }`}
                mode="outlined"
                keyboardType="numeric"
                placeholder="Ex: 12"
                value={values.warranty_months ? String(values.warranty_months) : ''}
                error={Boolean(errors.warranty_months)}
                onChangeText={(text: string) => store.setValue('warranty_months', Number(text) || undefined)}
                style={styles.input}
              />
              {errors.warranty_months ? (
                <Text style={styles.errorText}>{errors.warranty_months}</Text>
              ) : null}
              <Text variant="bodySmall" style={styles.hintText}>
                💡 requiredFields: {`{ supplier_category: 'vip', quantity: 5 }`} | requiredRule: 'and'
              </Text>
            </Card.Content>
          </Card>

          {/* Botões de Ação */}
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitBtn}
              icon="check"
            >
              Submeter Formulário
            </Button>
            <Button
              mode="outlined"
              onPress={handleReset}
              style={styles.resetBtn}
              icon="refresh"
            >
              Restaurar
            </Button>
          </View>

          {/* Card de Sucesso */}
          {submittedPayload && (
            <Card style={styles.resultCard} mode="elevated">
              <Card.Content>
                <Text variant="titleMedium" style={styles.resultTitle}>
                  ✅ Payload Validado e Submetido:
                </Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>
                    {JSON.stringify(submittedPayload, null, 2)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Inspetor de Estado do DAG Engine */}
          <Card style={styles.stateCard} mode="outlined">
            <Card.Content>
              <Text variant="titleSmall" style={styles.stateTitle}>
                🔍 Inspetor de Estado em Tempo Real:
              </Text>
              <Text variant="bodySmall">
                • Total Calculado: <Text style={styles.bold}>{values.total_price}</Text>
              </Text>
              <Text variant="bodySmall">
                • SKU AutoSet: <Text style={styles.bold}>{values.product_sku}</Text>
              </Text>
              <Text variant="bodySmall">
                • Visibilidade CPF: <Text style={styles.bold}>{String(visibility.cpf !== false)}</Text> | CNPJ:{' '}
                <Text style={styles.bold}>{String(visibility.cnpj !== false)}</Text>
              </Text>
              <Text variant="bodySmall">
                • Prazo Pagamento Desabilitado:{' '}
                <Text style={styles.bold}>{String(disabledState.payment_terms === true)}</Text>
              </Text>
              <Text variant="bodySmall">
                • Desconto Desabilitado:{' '}
                <Text style={styles.bold}>{String(disabledState.discount_percent === true)}</Text>
              </Text>
              <Text variant="bodySmall">
                • Garantia Obrigatória:{' '}
                <Text style={styles.bold}>{String(store.isFieldRequired('warranty_months'))}</Text>
              </Text>
              <Text variant="bodySmall">
                • Formulário Dirty: <Text style={styles.bold}>{String(isDirty)}</Text>
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { padding: 16, paddingBottom: 40 },
  headerCard: { marginBottom: 16, backgroundColor: '#ffffff', borderRadius: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: 'bold', color: '#1677ff' },
  subtitle: { color: '#666666', marginTop: 4 },
  badge: { paddingHorizontal: 8, fontSize: 12 },
  badgeClean: { backgroundColor: '#52c41a' },
  badgeDirty: { backgroundColor: '#faad14' },
  sectionCard: { backgroundColor: '#ffffff', borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontWeight: 'bold', color: '#1677ff', marginBottom: 10, marginTop: 4 },
  ruleBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  ruleChip: { backgroundColor: '#f0f5ff' },
  fieldLabel: { fontWeight: '600', marginBottom: 6, color: '#333333' },
  segmented: { marginBottom: 12 },
  input: { marginBottom: 8, backgroundColor: '#ffffff' },
  disabledInput: { backgroundColor: '#f5f5f5' },
  halfInput: { flex: 1, marginHorizontal: 4 },
  totalInput: { backgroundColor: '#e6f7ff', fontWeight: 'bold' },
  row: { flexDirection: 'row', marginHorizontal: -4 },
  fieldBox: { marginVertical: 4 },
  hintText: { color: '#888888', fontStyle: 'italic', marginBottom: 8, marginLeft: 2 },
  disabledNotice: { color: '#fa8c16', fontSize: 12, marginBottom: 8, fontStyle: 'italic' },
  errorText: { color: '#ff4d4f', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  divider: { marginVertical: 14 },
  productButtonCol: { gap: 8, marginBottom: 12 },
  productBtn: { borderRadius: 8 },
  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 16 },
  submitBtn: { flex: 2, borderRadius: 8 },
  resetBtn: { flex: 1, borderRadius: 8 },
  resultCard: { backgroundColor: '#f6ffed', borderColor: '#b7eb8f', borderWidth: 1, borderRadius: 12, marginBottom: 16 },
  resultTitle: { color: '#389e0d', fontWeight: 'bold', marginBottom: 8 },
  codeBlock: { backgroundColor: '#ffffff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d9d9d9' },
  codeText: { fontFamily: 'monospace', fontSize: 12, color: '#262626' },
  stateCard: { backgroundColor: '#fafafa', borderRadius: 12 },
  stateTitle: { fontWeight: 'bold', marginBottom: 6, color: '#595959' },
  bold: { fontWeight: 'bold', color: '#1677ff' },
});
