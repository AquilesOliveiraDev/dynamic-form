import './style.css';
import { FormStore, type FormState } from '@dynamic-form/core';
import schemaData from './form-schema.json';

const schema: any = schemaData;

const store = new FormStore({
  schema,
  onSubmit: (submittedValues: any) => {
    showSubmitAlert(submittedValues);
  },
});

const appEl = document.getElementById('app')!;

function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
  return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function showSubmitAlert(values: any) {
  const alertEl = document.getElementById('submit-alert');
  if (alertEl) {
    alertEl.style.display = 'flex';
    const alertDesc = document.getElementById('submit-desc');
    if (alertDesc) {
      alertDesc.innerText = `Payload validado com sucesso para ${values.name || 'Contato'}! Total: ${formatCurrency(values.total_price)}`;
    }
    setTimeout(() => {
      alertEl.style.display = 'none';
    }, 5000);
  }
}

// 1. Renderiza o layout inicial
appEl.innerHTML = `
  <div class="app-layout">
    <header class="app-header">
      <div class="header-container">
        <div class="brand-row">
          <span class="tech-badge">TypeScript Vanilla</span>
          <span class="engine-badge">@dynamic-form/core</span>
          <span id="dirty-badge" class="status-badge">Limpo (isDirty: false)</span>
        </div>
        <h1 class="app-title">${schema.title || 'Formulário Dinâmico Universal'}</h1>
        <p class="app-subtitle">${schema.subtitle || 'Exemplo Funcional e Reativo em TypeScript Vanilla'}</p>
      </div>
    </header>

    <main class="main-container">
      <div id="submit-alert" class="alert-success" style="display: none;">
        <span class="alert-icon">✅</span>
        <div>
          <div class="alert-title">Formulário Enviado com Sucesso!</div>
          <div id="submit-desc" class="alert-desc"></div>
        </div>
      </div>

      <!-- Chips com as 10 regras -->
      <section class="rules-card">
        <div class="rules-title">10 Regras do DynamicField em Ação</div>
        <div class="rules-grid">
          <div class="rule-chip active"><span class="rule-num">1</span><span class="rule-name">dependentFields</span></div>
          <div class="rule-chip active"><span class="rule-num">2</span><span class="rule-name">disabledFields</span></div>
          <div class="rule-chip active"><span class="rule-num">3</span><span class="rule-name">disabledFieldsCondition</span></div>
          <div class="rule-chip active"><span class="rule-num">4</span><span class="rule-name">reloadFields</span></div>
          <div class="rule-chip active"><span class="rule-num">5</span><span class="rule-name">autoSetFields</span></div>
          <div class="rule-chip active"><span class="rule-num">6</span><span class="rule-name">clearedFields</span></div>
          <div class="rule-chip active"><span class="rule-num">7</span><span class="rule-name">clearedFieldsChanged</span></div>
          <div class="rule-chip active"><span class="rule-num">8</span><span class="rule-name">requiredFields</span></div>
          <div class="rule-chip active"><span class="rule-num">9</span><span class="rule-name">requiredRule</span></div>
          <div class="rule-chip active"><span class="rule-num">10</span><span class="rule-name">calcFields</span></div>
        </div>
      </section>

      <form id="dynamic-form" novalidate>
        <!-- 1. Identificação -->
        <div class="form-card">
          <div class="section-header">
            <span class="section-icon">👤</span>
            <h2>1. Identificação & Regras Dependentes</h2>
          </div>
          <div class="grid-2">
            <div class="form-group" id="group-person_type">
              <label class="form-label" for="field-person_type">Tipo de Pessoa <span class="req">*</span></label>
              <select id="field-person_type" class="form-select" data-field="person_type">
                <option value="PF">Pessoa Física (PF)</option>
                <option value="PJ">Pessoa Jurídica (PJ)</option>
              </select>
              <div class="field-hint">Alterne para ver dependentFields e clearedFieldsChanged</div>
            </div>

            <div class="form-group" id="group-name">
              <label class="form-label" for="field-name">Nome do Contato <span class="req">*</span></label>
              <input id="field-name" class="form-input" data-field="name" type="text" placeholder="Ex: João Silva" />
              <div id="error-name" class="field-error"></div>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group" id="group-cpf">
              <label class="form-label" for="field-cpf">CPF <span id="req-cpf" class="req">*</span></label>
              <input id="field-cpf" class="form-input" data-field="cpf" type="text" placeholder="000.000.000-00" />
              <div class="field-hint">Visível apenas para Pessoa Física</div>
              <div id="error-cpf" class="field-error"></div>
            </div>

            <div class="form-group" id="group-cnpj">
              <label class="form-label" for="field-cnpj">CNPJ <span id="req-cnpj" class="req">*</span></label>
              <input id="field-cnpj" class="form-input" data-field="cnpj" type="text" placeholder="00.000.000/0001-00" />
              <div class="field-hint">Visível apenas para Pessoa Jurídica</div>
              <div id="error-cnpj" class="field-error"></div>
            </div>
          </div>

          <div class="form-group" id="group-corporate_name">
            <label class="form-label" for="field-corporate_name">Razão Social</label>
            <input id="field-corporate_name" class="form-input" data-field="corporate_name" type="text" placeholder="Ex: Tech Solutions LTDA" />
            <div class="field-hint">Visível apenas para Pessoa Jurídica</div>
            <div id="error-corporate_name" class="field-error"></div>
          </div>
        </div>

        <!-- 2. Localização -->
        <div class="form-card">
          <div class="section-header">
            <span class="section-icon">📍</span>
            <h2>2. Localização (reloadFields & clearedFields)</h2>
          </div>
          <div class="grid-2">
            <div class="form-group" id="group-state_id">
              <label class="form-label" for="field-state_id">Estado (UF) <span class="req">*</span></label>
              <select id="field-state_id" class="form-select" data-field="state_id">
                <option value="SP">São Paulo (SP)</option>
                <option value="RJ">Rio de Janeiro (RJ)</option>
                <option value="MG">Minas Gerais (MG)</option>
              </select>
              <div class="field-hint">Altere o estado para recarregar cidades e limpar o campo</div>
            </div>

            <div class="form-group" id="group-city_id">
              <label class="form-label" for="field-city_id">Cidade <span class="req">*</span></label>
              <select id="field-city_id" class="form-select" data-field="city_id">
                <option value="">Selecione uma cidade...</option>
              </select>
              <div class="field-hint">Opções recarregadas via reloadFields</div>
              <div id="error-city_id" class="field-error"></div>
            </div>
          </div>
        </div>

        <!-- 3. Condições Comerciais -->
        <div class="form-card">
          <div class="section-header">
            <span class="section-icon">⚙️</span>
            <h2>3. Condições Comerciais (disabledFields & disabledFieldsCondition)</h2>
          </div>
          <div class="grid-2">
            <div class="form-group" id="group-supplier_category">
              <label class="form-label" for="field-supplier_category">Categoria do Fornecedor <span class="req">*</span></label>
              <select id="field-supplier_category" class="form-select" data-field="supplier_category">
                <option value="standard">Padrão (Standard)</option>
                <option value="vip">VIP / Estratégico</option>
                <option value="restricted">Restrito (Restricted)</option>
              </select>
            </div>

            <div class="form-group" id="group-payment_terms">
              <label class="form-label" for="field-payment_terms">Condições de Pagamento</label>
              <select id="field-payment_terms" class="form-select" data-field="payment_terms">
                <option value="cash">À Vista / Boleto Antecipado</option>
                <option value="30_days">30 Dias</option>
                <option value="60_days">60 Dias</option>
              </select>
              <div class="field-hint">Bloqueado se Categoria = Restrito E Pessoa = PF (Regra AND)</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group" id="group-discount_percent">
              <label class="form-label" for="field-discount_percent">% Desconto Especial</label>
              <input id="field-discount_percent" class="form-input" data-field="discount_percent" type="number" min="0" max="90" />
              <div class="field-hint">Bloqueado se Categoria = Restrito OU Pagamento = 60 Dias (Regra OR)</div>
            </div>

            <div class="form-group" id="group-warranty_months">
              <label class="form-label" for="field-warranty_months">Garantia Estendida (Meses) <span id="req-warranty_months" class="req" style="display: none;">*</span></label>
              <input id="field-warranty_months" class="form-input" data-field="warranty_months" type="number" min="0" placeholder="Ex: 12" />
              <div class="field-hint">Obrigatório apenas se Categoria = VIP E Quantidade >= 5 (Regra AND)</div>
              <div id="error-warranty_months" class="field-error"></div>
            </div>
          </div>
        </div>

        <!-- 4. Pedido & Catálogo -->
        <div class="form-card">
          <div class="section-header">
            <span class="section-icon">📦</span>
            <h2>4. Itens do Pedido (autoSetFields & calcFields)</h2>
          </div>

          <label class="form-label">Catálogo de Produtos (autoSetFields)</label>
          <div class="catalog-grid" id="catalog-grid"></div>

          <div class="grid-2">
            <div class="form-group" id="group-product_sku">
              <label class="form-label" for="field-product_sku">SKU do Produto</label>
              <input id="field-product_sku" class="form-input" data-field="product_sku" type="text" readonly />
              <div class="field-hint">Preenchido automaticamente via autoSetFields</div>
            </div>

            <div class="form-group" id="group-unit_price">
              <label class="form-label" for="field-unit_price">Preço Unitário (R$)</label>
              <input id="field-unit_price" class="form-input" data-field="unit_price" type="number" step="0.01" />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group" id="group-quantity">
              <label class="form-label" for="field-quantity">Quantidade <span class="req">*</span></label>
              <input id="field-quantity" class="form-input" data-field="quantity" type="number" min="1" />
              <div id="error-quantity" class="field-error"></div>
            </div>

            <div class="form-group" id="group-total_price">
              <label class="form-label" for="field-total_price">Valor Total (R$)</label>
              <input id="field-total_price" class="form-input" data-field="total_price" type="number" readonly />
              <div class="field-hint">Calculado em tempo real por AST Parser</div>
            </div>
          </div>

          <!-- Banner de Cálculo -->
          <div class="calc-banner">
            <div>
              <div class="calc-formula-title">Fórmula AST Parser (calcFields)</div>
              <div class="calc-formula-text">quantity * unit_price * (1 - discount_percent / 100)</div>
            </div>
            <div class="calc-total-box">
              <div class="calc-total-label">Total Liquidado</div>
              <div id="calc-total-display" class="calc-total-value">R$ 0,00</div>
            </div>
          </div>
        </div>

        <!-- Ações -->
        <div class="form-actions">
          <button type="button" id="btn-reset" class="btn-secondary">Restaurar Padrões</button>
          <button type="submit" id="btn-submit" class="btn-primary">Validar & Enviar</button>
        </div>
      </form>

      <!-- Inspetor de Estado -->
      <section class="state-inspector" style="margin-top: 24px;">
        <div class="state-inspector-title">Inspetor de Estado em Tempo Real (FormState)</div>
        <pre id="state-json" class="state-code"></pre>
      </section>
    </main>
  </div>
`;

// 2. Renderiza os Cards de Produtos
const catalogContainer = document.getElementById('catalog-grid')!;
const products = schema.catalogs?.products || [];
products.forEach((prod: any) => {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.id = `prod-${prod.value}`;
  card.innerHTML = `
    <div class="product-name">${prod.label}</div>
    <div class="product-price">${formatCurrency(prod.record?.price)}</div>
    <div class="product-sku">SKU: ${prod.record?.sku}</div>
  `;
  card.addEventListener('click', () => {
    store.setValue('product_id', prod.value);
  });
  catalogContainer.appendChild(card);
});

// 3. Atualizador reativo do DOM baseado no FormState
let previousStateId: string | null = null;

function updateDOM(state: FormState) {
  // Dirty badge
  const dirtyBadge = document.getElementById('dirty-badge');
  if (dirtyBadge) {
    if (state.isDirty) {
      dirtyBadge.className = 'status-badge dirty';
      dirtyBadge.innerText = `Modificado (Campos: ${state.changedFields.join(', ') || 'nenhum'})`;
    } else {
      dirtyBadge.className = 'status-badge';
      dirtyBadge.innerText = 'Limpo (isDirty: false)';
    }
  }

  // Atualiza opções de cidades quando o estado muda
  const currentStateId = state.values['state_id'];
  if (currentStateId !== previousStateId) {
    previousStateId = currentStateId;
    const citySelect = document.getElementById('field-city_id') as HTMLSelectElement;
    if (citySelect) {
      const cities = schema.catalogs?.cities_by_state?.[currentStateId] || [];
      citySelect.innerHTML = '<option value="">Selecione uma cidade...</option>' +
        cities.map((c: any) => `<option value="${c.value}">${c.label}</option>`).join('');
    }
  }

  // Atualiza valores, visibilidade, desabilitação e erros de cada campo
  const fieldInputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-field]');
  fieldInputs.forEach((input) => {
    const fieldName = input.getAttribute('data-field')!;
    const val = state.values[fieldName];

    // Atualiza valor no input (evita loop se usuário está digitando)
    if (document.activeElement !== input) {
      input.value = val === null || val === undefined ? '' : String(val);
    }

    // Visibilidade
    const groupEl = document.getElementById(`group-${fieldName}`);
    const isVisible = state.visibility[fieldName] !== false;
    if (groupEl) {
      groupEl.style.display = isVisible ? '' : 'none';
    }

    // Desabilitado
    const isDisabled = state.disabledState[fieldName] === true;
    input.disabled = isDisabled;

    // Erros
    const errorEl = document.getElementById(`error-${fieldName}`);
    if (errorEl) {
      errorEl.innerText = state.errors[fieldName] || '';
    }

    // Indicador de obrigatório dinâmico
    const reqEl = document.getElementById(`req-${fieldName}`);
    if (reqEl) {
      const isReq = store.isFieldRequired(fieldName);
      reqEl.style.display = isReq ? 'inline' : 'none';
    }
  });

  // Atualiza card de produto selecionado
  const selectedProdId = state.values['product_id'];
  document.querySelectorAll('.product-card').forEach((card) => {
    card.classList.toggle('selected', card.id === `prod-${selectedProdId}`);
  });

  // Atualiza display de valor total calculado
  const totalDisplay = document.getElementById('calc-total-display');
  if (totalDisplay) {
    totalDisplay.innerText = formatCurrency(state.values['total_price']);
  }

  // Atualiza inspetor de estado JSON
  const stateJson = document.getElementById('state-json');
  if (stateJson) {
    stateJson.innerText = JSON.stringify(
      {
        values: state.values,
        visibility: state.visibility,
        disabledState: state.disabledState,
        errors: state.errors,
        isDirty: state.isDirty,
        changedFields: state.changedFields,
      },
      null,
      2
    );
  }
}

// 4. Conecta eventos de input dos campos
document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-field]').forEach((input) => {
  const fieldName = input.getAttribute('data-field')!;
  const handler = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    let val: any = target.value;
    if (target.type === 'number') {
      val = val === '' ? null : Number(val);
    }
    store.setValue(fieldName, val);
  };

  input.addEventListener('input', handler);
  input.addEventListener('change', handler);
});

// 5. Botões de ação
document.getElementById('dynamic-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const isValid = await store.validateForm();
  if (isValid) {
    await store.submit();
  }
});

document.getElementById('btn-reset')?.addEventListener('click', () => {
  store.reset();
  const alertEl = document.getElementById('submit-alert');
  if (alertEl) alertEl.style.display = 'none';
});

// 6. Subscrição do store para renderizar atualizações reativas
store.subscribe((state: FormState) => {
  updateDOM(state);
});

// Disparo inicial
updateDOM(store.getState());
