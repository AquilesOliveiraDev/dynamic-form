<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDynamicForm } from './composables/useDynamicForm';
import schemaData from './form-schema.json';

const schema = schemaData;
const submitSuccess = ref(false);
const lastSubmittedPayload = ref<any>(null);

const { state, setValue, submit, reset, isFieldRequired } = useDynamicForm({
  schema: schema as any,
  onSubmit: (values) => {
    lastSubmittedPayload.value = values;
    submitSuccess.value = true;
    setTimeout(() => {
      submitSuccess.value = false;
    }, 5000);
  },
});

// Opções dinâmicas de cidades pelo estado selecionado
const availableCities = computed(() => {
  const currentState = state.value.values['state_id'];
  const citiesCatalog = (schema.catalogs as any)?.cities_by_state || {};
  return citiesCatalog[currentState] || [];
});

function onInputChange(field: string, event: Event, isNumber = false) {
  const input = event.target as HTMLInputElement;
  const rawVal = input.value;
  if (isNumber) {
    setValue(field, rawVal === '' ? null : Number(rawVal));
  } else {
    setValue(field, rawVal);
  }
}

function onSelectChange(field: string, event: Event) {
  const select = event.target as HTMLSelectElement;
  setValue(field, select.value);
}

function selectProduct(productId: string) {
  setValue('product_id', productId);
}

function setPersonType(type: 'PF' | 'PJ') {
  setValue('person_type', type);
}

function setSupplierCategory(category: 'standard' | 'vip' | 'restricted') {
  setValue('supplier_category', category);
}

async function handleSubmit() {
  await submit();
}

function handleReset() {
  lastSubmittedPayload.value = null;
  submitSuccess.value = false;
  reset();
}

function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
</script>

<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="header-container">
        <div class="brand-row">
          <span class="tech-badge">Vue 3 + Composition API</span>
          <span class="engine-badge">&#64;dynamic-form/core</span>
          <span class="status-badge" :class="{ dirty: state.isDirty }">
            {{ state.isDirty ? '● Não Salvo (Dirty)' : '✓ Sincronizado' }}
          </span>
        </div>
        <h1 class="app-title">{{ schema.title }}</h1>
        <p class="app-subtitle">{{ schema.subtitle }}</p>
      </div>
    </header>

    <main class="main-container">
      <!-- Feedback de Sucesso no Envio -->
      <transition name="fade">
        <div v-if="submitSuccess" class="alert-success">
          <div class="alert-icon">✓</div>
          <div>
            <strong>Formulário Validado e Submetido com Sucesso!</strong>
            <p>Todos os campos obrigatórios e regras ativas foram respeitados pelo &#64;dynamic-form/core.</p>
          </div>
        </div>
      </transition>

      <form @submit.prevent="handleSubmit" class="form-grid">
        <!-- Seção 1: Identificação -->
        <section class="card section-card">
          <div class="card-header">
            <div class="section-title-wrap">
              <span class="section-num">1</span>
              <div>
                <h2 class="section-title">Identificação do Contato</h2>
                <p class="section-desc">Validação condicional de documentos e limpeza reativa</p>
              </div>
            </div>
            <div class="chip-group">
              <span class="chip">dependentFields</span>
              <span class="chip">requiredFields</span>
              <span class="chip">clearedFieldsChanged</span>
            </div>
          </div>

          <div class="card-body">
            <div class="form-row">
              <!-- Tipo de Pessoa -->
              <div class="form-group flex-1">
                <label class="field-label">Tipo de Pessoa</label>
                <div class="segmented-control">
                  <button
                    type="button"
                    class="segment-btn"
                    :class="{ active: state.values['person_type'] === 'PF' }"
                    @click="setPersonType('PF')"
                  >
                    Pessoa Física (PF)
                  </button>
                  <button
                    type="button"
                    class="segment-btn"
                    :class="{ active: state.values['person_type'] === 'PJ' }"
                    @click="setPersonType('PJ')"
                  >
                    Pessoa Jurídica (PJ)
                  </button>
                </div>
                <small class="field-hint">💡 clearedFieldsChanged limpa CPF/CNPJ na troca de tipo</small>
              </div>

              <!-- Nome de Contato -->
              <div class="form-group flex-1">
                <label class="field-label" :class="{ required: isFieldRequired('name') }">
                  Nome de Contato <span v-if="isFieldRequired('name')" class="req-star">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'has-error': state.errors['name'] }"
                  :value="state.values['name'] || ''"
                  @input="e => onInputChange('name', e)"
                  placeholder="Ex: João Silva"
                />
                <span v-if="state.errors['name']" class="error-msg">{{ state.errors['name'] }}</span>
              </div>
            </div>

            <div class="form-row">
              <!-- CPF (Visível se PF) -->
              <div class="form-group flex-1" v-if="state.visibility['cpf'] !== false">
                <label class="field-label" :class="{ required: isFieldRequired('cpf') }">
                  CPF (Pessoa Física) <span v-if="isFieldRequired('cpf')" class="req-star">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'has-error': state.errors['cpf'] }"
                  :value="state.values['cpf'] || ''"
                  @input="e => onInputChange('cpf', e)"
                  placeholder="000.000.000-00"
                />
                <span v-if="state.errors['cpf']" class="error-msg">{{ state.errors['cpf'] }}</span>
                <small class="field-hint">💡 dependentFields: person_type === 'PF'</small>
              </div>

              <!-- CNPJ (Visível se PJ) -->
              <div class="form-group flex-1" v-if="state.visibility['cnpj'] !== false">
                <label class="field-label" :class="{ required: isFieldRequired('cnpj') }">
                  CNPJ (Pessoa Jurídica) <span v-if="isFieldRequired('cnpj')" class="req-star">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  :class="{ 'has-error': state.errors['cnpj'] }"
                  :value="state.values['cnpj'] || ''"
                  @input="e => onInputChange('cnpj', e)"
                  placeholder="00.000.000/0001-00"
                />
                <span v-if="state.errors['cnpj']" class="error-msg">{{ state.errors['cnpj'] }}</span>
                <small class="field-hint">💡 dependentFields: person_type === 'PJ'</small>
              </div>

              <!-- Razão Social (Visível se PJ) -->
              <div class="form-group flex-1" v-if="state.visibility['corporate_name'] !== false">
                <label class="field-label">Razão Social</label>
                <input
                  type="text"
                  class="form-control"
                  :value="state.values['corporate_name'] || ''"
                  @input="e => onInputChange('corporate_name', e)"
                  placeholder="Ex: Create Pixels LTDA"
                />
                <small class="field-hint">💡 clearedFields: ['person_type']</small>
              </div>
            </div>
          </div>
        </section>

        <!-- Seção 2: Localização -->
        <section class="card section-card">
          <div class="card-header">
            <div class="section-title-wrap">
              <span class="section-num">2</span>
              <div>
                <h2 class="section-title">Localização Geográfica</h2>
                <p class="section-desc">Recarga e reset de dados em cascata</p>
              </div>
            </div>
            <div class="chip-group">
              <span class="chip">reloadFields</span>
              <span class="chip">clearedFields</span>
            </div>
          </div>

          <div class="card-body">
            <div class="form-row">
              <!-- Estado -->
              <div class="form-group flex-1">
                <label class="field-label">Estado (UF)</label>
                <select
                  class="form-control"
                  :value="state.values['state_id'] || ''"
                  @change="e => onSelectChange('state_id', e)"
                >
                  <option value="SP">São Paulo (SP)</option>
                  <option value="RJ">Rio de Janeiro (RJ)</option>
                  <option value="MG">Minas Gerais (MG)</option>
                </select>
              </div>

              <!-- Cidade -->
              <div class="form-group flex-1">
                <label class="field-label">Cidade</label>
                <select
                  class="form-control"
                  :value="state.values['city_id'] || ''"
                  @change="e => onSelectChange('city_id', e)"
                >
                  <option value="" disabled>Selecione uma cidade...</option>
                  <option v-for="c in availableCities" :key="c.value" :value="c.value">
                    {{ c.label }}
                  </option>
                </select>
                <small class="field-hint">💡 reloadFields: [state_id] | clearedFields: [state_id]</small>
              </div>
            </div>
          </div>
        </section>

        <!-- Seção 3: Condições Comerciais -->
        <section class="card section-card">
          <div class="card-header">
            <div class="section-title-wrap">
              <span class="section-num">3</span>
              <div>
                <h2 class="section-title">Condições Comerciais</h2>
                <p class="section-desc">Bloqueio dinâmico com operadores booleanos AND e OR</p>
              </div>
            </div>
            <div class="chip-group">
              <span class="chip">disabledFields</span>
              <span class="chip">disabledFieldsCondition: and/or</span>
            </div>
          </div>

          <div class="card-body">
            <div class="form-row">
              <!-- Categoria do Fornecedor -->
              <div class="form-group flex-1">
                <label class="field-label">Categoria do Fornecedor</label>
                <div class="segmented-control">
                  <button
                    type="button"
                    class="segment-btn"
                    :class="{ active: state.values['supplier_category'] === 'standard' }"
                    @click="setSupplierCategory('standard')"
                  >
                    Padrão
                  </button>
                  <button
                    type="button"
                    class="segment-btn"
                    :class="{ active: state.values['supplier_category'] === 'vip' }"
                    @click="setSupplierCategory('vip')"
                  >
                    VIP (Grandes Contas)
                  </button>
                  <button
                    type="button"
                    class="segment-btn"
                    :class="{ active: state.values['supplier_category'] === 'restricted' }"
                    @click="setSupplierCategory('restricted')"
                  >
                    Restrito (Bloqueado)
                  </button>
                </div>
              </div>

              <!-- Prazo de Pagamento -->
              <div class="form-group flex-1">
                <label class="field-label">
                  Prazo de Pagamento
                  <span v-if="state.disabledState['payment_terms']" class="lock-indicator">🔒 Bloqueado</span>
                </label>
                <select
                  class="form-control"
                  :value="state.values['payment_terms'] || ''"
                  :disabled="state.disabledState['payment_terms'] === true"
                  @change="e => onSelectChange('payment_terms', e)"
                >
                  <option value="cash">À Vista</option>
                  <option value="30_days">Boleto 30 Dias</option>
                  <option value="60_days">Boleto 60 Dias</option>
                </select>
                <small class="field-hint">💡 Bloqueia se supplier_category === 'restricted' AND person_type === 'PF'</small>
              </div>

              <!-- Desconto (%) -->
              <div class="form-group flex-1">
                <label class="field-label">
                  Desconto (%)
                  <span v-if="state.disabledState['discount_percent']" class="lock-indicator">🔒 Bloqueado</span>
                </label>
                <input
                  type="number"
                  class="form-control"
                  min="0"
                  max="100"
                  :value="state.values['discount_percent'] ?? ''"
                  :disabled="state.disabledState['discount_percent'] === true"
                  @input="e => onInputChange('discount_percent', e, true)"
                />
                <small class="field-hint">💡 Bloqueia se supplier_category === 'restricted' (OR)</small>
              </div>
            </div>
          </div>
        </section>

        <!-- Seção 4: Catálogo & Aritmética -->
        <section class="card section-card">
          <div class="card-header">
            <div class="section-title-wrap">
              <span class="section-num">4</span>
              <div>
                <h2 class="section-title">Catálogo & Cálculo em Cascata</h2>
                <p class="section-desc">autoSetFields com record e calcFields sem eval()</p>
              </div>
            </div>
            <div class="chip-group">
              <span class="chip">autoSetFields</span>
              <span class="chip">calcFields</span>
              <span class="chip">requiredRule: and</span>
            </div>
          </div>

          <div class="card-body">
            <label class="field-label">Selecione um Produto do Catálogo (Dispara autoSetFields):</label>
            <div class="catalog-cards">
              <button
                type="button"
                class="catalog-item"
                v-for="prod in (schema.catalogs as any)?.products"
                :key="prod.value"
                :class="{ selected: state.values['product_id'] === prod.value }"
                @click="selectProduct(prod.value)"
              >
                <div class="item-title">{{ prod.label }}</div>
                <div class="item-sub">SKU: {{ prod.record?.sku }} • {{ formatCurrency(prod.record?.price) }}</div>
              </button>
            </div>

            <div class="form-row mt-3">
              <div class="form-group flex-1">
                <label class="field-label">SKU Derivado (autoSetFields)</label>
                <input type="text" class="form-control bg-readonly" :value="state.values['product_sku'] || ''" disabled />
              </div>

              <div class="form-group flex-1">
                <label class="field-label">Preço Unitário (R$)</label>
                <input type="text" class="form-control bg-readonly" :value="formatCurrency(state.values['unit_price'])" disabled />
              </div>

              <div class="form-group flex-1">
                <label class="field-label">Quantidade</label>
                <input
                  type="number"
                  class="form-control"
                  min="1"
                  :value="state.values['quantity'] ?? 1"
                  @input="e => onInputChange('quantity', e, true)"
                />
              </div>
            </div>

            <!-- Banner de Total Calculado -->
            <div class="calc-banner">
              <div class="calc-info">
                <span class="calc-label">Total Calculado em Tempo Real (AST Parser)</span>
                <code class="calc-formula">
                  {{ state.values['quantity'] || 0 }} un × {{ formatCurrency(state.values['unit_price']) }} × (1 - {{ state.values['discount_percent'] || 0 }}%)
                </code>
              </div>
              <div class="calc-value">
                {{ formatCurrency(state.values['total_price']) }}
              </div>
            </div>

            <div class="form-row mt-3">
              <!-- Garantia Adicional -->
              <div class="form-group flex-1">
                <label class="field-label" :class="{ required: isFieldRequired('warranty_months') }">
                  Garantia Adicional (Meses)
                  <span v-if="isFieldRequired('warranty_months')" class="req-star">*</span>
                </label>
                <input
                  type="number"
                  class="form-control"
                  :class="{ 'has-error': state.errors['warranty_months'] }"
                  :value="state.values['warranty_months'] ?? ''"
                  @input="e => onInputChange('warranty_months', e, true)"
                  placeholder="Ex: 12"
                />
                <span v-if="state.errors['warranty_months']" class="error-msg">{{ state.errors['warranty_months'] }}</span>
                <small class="field-hint">
                  ⚠️ Obrigatório via operador AND se Categoria = 'VIP' E Quantidade = 5!
                </small>
              </div>
            </div>
          </div>
        </section>

        <!-- Barra de Ações -->
        <div class="actions-bar">
          <button type="button" class="btn btn-secondary" @click="handleReset">
            ↺ {{ (schema.actions as any)?.resetText || 'Restaurar' }}
          </button>
          <button type="submit" class="btn btn-primary" :disabled="state.isSubmitting">
            ✓ {{ (schema.actions as any)?.submitText || 'Submeter Formulário' }}
          </button>
        </div>
      </form>

      <!-- Inspetor de Estado Reativo (JSON Debugger) -->
      <section class="card inspector-card mt-4">
        <div class="card-header">
          <h3 class="inspector-title">🔍 Inspetor de Estado Vue 3 (Composition API)</h3>
          <span class="inspector-badge">Tempo Real</span>
        </div>
        <div class="card-body inspector-body">
          <div class="inspector-col">
            <h4>Valores (values)</h4>
            <pre>{{ JSON.stringify(state.values, null, 2) }}</pre>
          </div>
          <div class="inspector-col">
            <h4>Erros (errors)</h4>
            <pre>{{ JSON.stringify(state.errors, null, 2) }}</pre>
          </div>
          <div class="inspector-col">
            <h4>Visibilidade & Bloqueios</h4>
            <pre>{{ JSON.stringify({ visibility: state.visibility, disabled: state.disabledState }, null, 2) }}</pre>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background-color: #0f172a;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding-bottom: 48px;
}

/* Header */
.app-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 32px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.header-container {
  max-width: 900px;
  margin: 0 auto;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tech-badge {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(66, 184, 131, 0.3);
}

.engine-badge {
  background: #334155;
  color: #38bdf8;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.status-badge {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
}

.status-badge.dirty {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}

.app-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.app-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

/* Main Container */
.main-container {
  max-width: 900px;
  margin: 28px auto 0 auto;
  padding: 0 16px;
}

/* Alert Success */
.alert-success {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #a7f3d0;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.alert-icon {
  background: #10b981;
  color: #064e3b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.alert-success strong {
  display: block;
  font-size: 15px;
  color: #ecfdf5;
  margin-bottom: 2px;
}

.alert-success p {
  margin: 0;
  font-size: 13px;
  color: #6ee7b7;
}

/* Form Grid */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Cards */
.card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.card:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.card-header {
  padding: 18px 22px;
  background: rgba(15, 23, 42, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.section-num {
  width: 28px;
  height: 28px;
  background: #10b981;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 2px 0;
  color: #f1f5f9;
}

.section-desc {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.chip-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  background: rgba(16, 185, 129, 0.12);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.25);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.card-body {
  padding: 22px;
}

/* Form Controls */
.form-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.flex-1 {
  flex: 1;
  min-width: 240px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.req-star {
  color: #ef4444;
}

.lock-indicator {
  font-size: 11px;
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  padding: 2px 6px;
  border-radius: 4px;
}

.form-control {
  background: #0f172a;
  border: 1px solid #334155;
  color: #f8fafc;
  padding: 11px 14px;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.form-control:disabled {
  background: #1e293b;
  color: #64748b;
  cursor: not-allowed;
  border-color: rgba(255, 255, 255, 0.05);
}

.form-control.has-error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.bg-readonly {
  background: rgba(15, 23, 42, 0.5) !important;
  font-weight: 600;
  color: #94a3b8;
}

.error-msg {
  color: #f87171;
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
}

.field-hint {
  color: #64748b;
  font-size: 11px;
  margin-top: 6px;
}

/* Segmented Control */
.segmented-control {
  display: flex;
  background: #0f172a;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid #334155;
  gap: 4px;
}

.segment-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 8px 12px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment-btn.active {
  background: #10b981;
  color: white;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
}

/* Catalog Cards */
.catalog-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.catalog-item {
  background: #0f172a;
  border: 1px solid #334155;
  padding: 14px 16px;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.catalog-item:hover {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.catalog-item.selected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  box-shadow: 0 0 0 1px #10b981;
}

.item-title {
  color: #f1f5f9;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
}

.item-sub {
  color: #94a3b8;
  font-size: 12px;
}

/* Calc Banner */
.calc-banner {
  background: linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(15, 23, 42, 0.7) 100%);
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 14px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.calc-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calc-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #34d399;
}

.calc-formula {
  font-family: 'JetBrains Mono', Courier, monospace;
  font-size: 13px;
  color: #a7f3d0;
}

.calc-value {
  font-size: 26px;
  font-weight: 800;
  color: #4ade80;
  letter-spacing: -0.5px;
}

/* Action Buttons */
.actions-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.btn {
  padding: 13px 26px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
}

.btn-secondary:hover {
  background: #475569;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
  transform: translateY(-1px);
}

/* Inspector */
.inspector-card {
  margin-top: 36px;
  border-color: rgba(255, 255, 255, 0.05);
}

.inspector-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  color: #cbd5e1;
}

.inspector-badge {
  font-size: 11px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  padding: 2px 8px;
  border-radius: 6px;
}

.inspector-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  padding: 16px;
}

.inspector-col h4 {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
}

.inspector-col pre {
  background: #090d16;
  padding: 12px;
  border-radius: 8px;
  font-family: 'JetBrains Mono', Courier, monospace;
  font-size: 11px;
  color: #a5f3fc;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.05);
  max-height: 220px;
}

.mt-3 { margin-top: 16px; }
.mt-4 { margin-top: 24px; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
