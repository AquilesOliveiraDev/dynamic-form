import React, { useState, useMemo } from 'react';
import type { DynamicFormSchema } from '@dynamic-form/core';
import { useDynamicForm } from './hooks/useDynamicForm';
import schemaData from './form-schema.json';
import type { SupplierFormData } from './types';
import './App.css';

const schema = schemaData as unknown as DynamicFormSchema<SupplierFormData> & { catalogs: any };

export function App() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [, setLastSubmitted] = useState<SupplierFormData | null>(null);

  const {
    values,
    errors,
    visibility,
    disabledState,
    isDirty,
    isSubmitting,
    setValue,
    submit,
    reset,
    isFieldRequired,
  } = useDynamicForm({
    schema,
    onSubmit: (submittedValues) => {
      setLastSubmitted(submittedValues);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    },
  });

  // Opções dinâmicas de cidades pelo estado selecionado
  const availableCities = useMemo(() => {
    const currentState = values['state_id'];
    const citiesCatalog = schema.catalogs?.cities_by_state || {};
    return citiesCatalog[currentState] || [];
  }, [values['state_id']]);

  const formatCurrency = (val: number | null | undefined): string => {
    if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  const handleReset = () => {
    setLastSubmitted(null);
    setSubmitSuccess(false);
    reset();
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-row">
            <span className="tech-badge">React 19 + useSyncExternalStore</span>
            <span className="engine-badge">&#64;dynamic-form/core</span>
            <span className={`status-badge ${isDirty ? 'dirty' : ''}`}>
              {isDirty ? '● Não Salvo (Dirty)' : '✓ Sincronizado'}
            </span>
          </div>
          <h1 className="app-title">{schema.title}</h1>
          <p className="app-subtitle">{schema.subtitle}</p>
        </div>
      </header>

      <main className="main-container">
        {/* Feedback de Sucesso no Envio */}
        {submitSuccess && (
          <div className="alert-success">
            <div className="alert-icon">✓</div>
            <div>
              <strong>Formulário Validado e Submetido com Sucesso!</strong>
              <p>Todos os campos obrigatórios e regras ativas foram respeitados pelo &#64;dynamic-form/core.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Seção 1: Identificação */}
          <section className="card section-card">
            <div className="card-header">
              <div className="section-title-wrap">
                <span className="section-num">1</span>
                <div>
                  <h2 className="section-title">Identificação do Contato</h2>
                  <p className="section-desc">Validação condicional de documentos e limpeza reativa</p>
                </div>
              </div>
              <div className="chip-group">
                <span className="chip">dependentFields</span>
                <span className="chip">requiredFields</span>
                <span className="chip">clearedFieldsChanged</span>
              </div>
            </div>

            <div className="card-body">
              <div className="form-row">
                {/* Tipo de Pessoa */}
                <div className="form-group flex-1">
                  <label className="field-label" htmlFor="person_type_ctrl">Tipo de Pessoa</label>
                  <div className="segmented-control" id="person_type_ctrl">
                    <button
                      type="button"
                      className={`segment-btn ${values['person_type'] === 'PF' ? 'active' : ''}`}
                      onClick={() => setValue('person_type', 'PF')}
                    >
                      Pessoa Física (PF)
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${values['person_type'] === 'PJ' ? 'active' : ''}`}
                      onClick={() => setValue('person_type', 'PJ')}
                    >
                      Pessoa Jurídica (PJ)
                    </button>
                  </div>
                  <small className="field-hint">💡 clearedFieldsChanged limpa CPF/CNPJ na troca de tipo</small>
                </div>

                {/* Nome de Contato */}
                <div className="form-group flex-1">
                  <label className="field-label" htmlFor="field_name">
                    Nome de Contato {isFieldRequired('name') && <span className="req-star">*</span>}
                  </label>
                  <input
                    id="field_name"
                    type="text"
                    className={`form-control ${errors['name'] ? 'has-error' : ''}`}
                    value={values['name'] || ''}
                    onChange={(e) => setValue('name', e.target.value)}
                    placeholder="Ex: João Silva"
                  />
                  {errors['name'] && <span className="error-msg">{errors['name']}</span>}
                </div>
              </div>

              <div className="form-row">
                {/* CPF (Visível se PF) */}
                {visibility['cpf'] !== false && (
                  <div className="form-group flex-1">
                    <label className="field-label" htmlFor="field_cpf">
                      CPF (Pessoa Física) {isFieldRequired('cpf') && <span className="req-star">*</span>}
                    </label>
                    <input
                      id="field_cpf"
                      type="text"
                      className={`form-control ${errors['cpf'] ? 'has-error' : ''}`}
                      value={values['cpf'] || ''}
                      onChange={(e) => setValue('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                    />
                    {errors['cpf'] && <span className="error-msg">{errors['cpf']}</span>}
                    <small className="field-hint">💡 dependentFields: person_type === 'PF'</small>
                  </div>
                )}

                {/* CNPJ (Visível se PJ) */}
                {visibility['cnpj'] !== false && (
                  <div className="form-group flex-1">
                    <label className="field-label" htmlFor="field_cnpj">
                      CNPJ (Pessoa Jurídica) {isFieldRequired('cnpj') && <span className="req-star">*</span>}
                    </label>
                    <input
                      id="field_cnpj"
                      type="text"
                      className={`form-control ${errors['cnpj'] ? 'has-error' : ''}`}
                      value={values['cnpj'] || ''}
                      onChange={(e) => setValue('cnpj', e.target.value)}
                      placeholder="00.000.000/0001-00"
                    />
                    {errors['cnpj'] && <span className="error-msg">{errors['cnpj']}</span>}
                    <small className="field-hint">💡 dependentFields: person_type === 'PJ'</small>
                  </div>
                )}

                {/* Razão Social (Visível se PJ) */}
                {visibility['corporate_name'] !== false && (
                  <div className="form-group flex-1">
                    <label className="field-label" htmlFor="field_corp">Razão Social</label>
                    <input
                      id="field_corp"
                      type="text"
                      className="form-control"
                      value={values['corporate_name'] || ''}
                      onChange={(e) => setValue('corporate_name', e.target.value)}
                      placeholder="Ex: Create Pixels LTDA"
                    />
                    <small className="field-hint">💡 clearedFields: ['person_type']</small>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Seção 2: Localização */}
          <section className="card section-card">
            <div className="card-header">
              <div className="section-title-wrap">
                <span className="section-num">2</span>
                <div>
                  <h2 className="section-title">Localização Geográfica</h2>
                  <p className="section-desc">Recarga e reset de dados em cascata</p>
                </div>
              </div>
              <div className="chip-group">
                <span className="chip">reloadFields</span>
                <span className="chip">clearedFields</span>
              </div>
            </div>

            <div className="card-body">
              <div className="form-row">
                {/* Estado */}
                <div className="form-group flex-1">
                  <label className="field-label" htmlFor="field_state">Estado (UF)</label>
                  <select
                    id="field_state"
                    className="form-control"
                    value={values['state_id'] || ''}
                    onChange={(e) => setValue('state_id', e.target.value)}
                  >
                    <option value="SP">São Paulo (SP)</option>
                    <option value="RJ">Rio de Janeiro (RJ)</option>
                    <option value="MG">Minas Gerais (MG)</option>
                  </select>
                </div>

                {/* Cidade */}
                <div className="form-group flex-1">
                  <label className="field-label" htmlFor="field_city">Cidade</label>
                  <select
                    id="field_city"
                    className="form-control"
                    value={values['city_id'] || ''}
                    onChange={(e) => setValue('city_id', e.target.value)}
                  >
                    <option value="" disabled>Selecione uma cidade...</option>
                    {availableCities.map((c: any) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <small className="field-hint">💡 reloadFields: [state_id] | clearedFields: [state_id]</small>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 3: Condições Comerciais */}
          <section className="card section-card">
            <div className="card-header">
              <div className="section-title-wrap">
                <span className="section-num">3</span>
                <div>
                  <h2 className="section-title">Condições Comerciais</h2>
                  <p className="section-desc">Bloqueio dinâmico com operadores booleanos AND e OR</p>
                </div>
              </div>
              <div className="chip-group">
                <span className="chip">disabledFields</span>
                <span className="chip">disabledFieldsCondition: and/or</span>
              </div>
            </div>

            <div className="card-body">
              <div className="form-row">
                {/* Categoria do Fornecedor */}
                <div className="form-group flex-1">
                  <label className="field-label" htmlFor="supp_cat_ctrl">Categoria do Fornecedor</label>
                  <div className="segmented-control" id="supp_cat_ctrl">
                    <button
                      type="button"
                      className={`segment-btn ${values['supplier_category'] === 'standard' ? 'active' : ''}`}
                      onClick={() => setValue('supplier_category', 'standard')}
                    >
                      Padrão
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${values['supplier_category'] === 'vip' ? 'active' : ''}`}
                      onClick={() => setValue('supplier_category', 'vip')}
                    >
                      VIP (Grandes Contas)
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${values['supplier_category'] === 'restricted' ? 'active' : ''}`}
                      onClick={() => setValue('supplier_category', 'restricted')}
                    >
                      Restrito (Bloqueado)
                    </button>
                  </div>
                </div>

                {/* Prazo de Pagamento */}
                <div className="form-group flex-1">
                  <label className="field-label" htmlFor="field_terms">
                    Prazo de Pagamento
                    {disabledState['payment_terms'] && (
                      <span className="lock-indicator">🔒 Bloqueado</span>
                    )}
                  </label>
                  <select
                    id="field_terms"
                    className="form-control"
                    value={values['payment_terms'] || ''}
                    disabled={disabledState['payment_terms'] === true}
                    onChange={(e) => setValue('payment_terms', e.target.value)}
                  >
                    <option value="cash">À Vista</option>
                    <option value="30_days">Boleto 30 Dias</option>
                    <option value="60_days">Boleto 60 Dias</option>
                  </select>
                  <small className="field-hint">💡 Bloqueia se supplier_category === 'restricted' AND person_type === 'PF'</small>
                </div>

                {/* Desconto (%) */}
                <div className="form-group flex-1">
                  <label className="field-label" htmlFor="field_discount">
                    Desconto (%)
                    {disabledState['discount_percent'] && (
                      <span className="lock-indicator">🔒 Bloqueado</span>
                    )}
                  </label>
                  <input
                    id="field_discount"
                    type="number"
                    className="form-control"
                    min={0}
                    max={100}
                    value={values['discount_percent'] ?? ''}
                    disabled={disabledState['discount_percent'] === true}
                    onChange={(e) => setValue('discount_percent', e.target.value === '' ? null : Number(e.target.value))}
                  />
                  <small className="field-hint">💡 Bloqueia se supplier_category === 'restricted' (OR)</small>
                </div>
              </div>
            </div>
          </section>

          {/* Seção 4: Catálogo & Aritmética */}
          <section className="card section-card">
            <div className="card-header">
              <div className="section-title-wrap">
                <span className="section-num">4</span>
                <div>
                  <h2 className="section-title">Catálogo & Cálculo em Cascata</h2>
                  <p className="section-desc">autoSetFields com record e calcFields sem eval()</p>
                </div>
              </div>
              <div className="chip-group">
                <span className="chip">autoSetFields</span>
                <span className="chip">calcFields</span>
                <span className="chip">requiredRule: and</span>
              </div>
            </div>

            <div className="card-body">
              <label className="field-label" htmlFor="product_catalog_group">Selecione um Produto do Catálogo (Dispara autoSetFields):</label>
              <div className="catalog-cards" id="product_catalog_group">
                {schema.catalogs?.products?.map((prod: any) => (
                  <button
                    key={prod.value}
                    type="button"
                    className={`catalog-item ${values['product_id'] === prod.value ? 'selected' : ''}`}
                    onClick={() => setValue('product_id', prod.value)}
                  >
                    <div className="item-title">{prod.label}</div>
                    <div className="item-sub">SKU: {prod.record?.sku} • {formatCurrency(prod.record?.price)}</div>
                  </button>
                ))}
              </div>

              <div className="form-row mt-3">
                <div className="form-group flex-1">
                  <label className="field-label" htmlFor="field_sku">SKU Derivado (autoSetFields)</label>
                  <input id="field_sku" type="text" className="form-control bg-readonly" value={values['product_sku'] || ''} disabled />
                </div>

                <div className="form-group flex-1">
                  <label className="field-label" htmlFor="field_price">Preço Unitário (R$)</label>
                  <input id="field_price" type="text" className="form-control bg-readonly" value={formatCurrency(values['unit_price'])} disabled />
                </div>

                <div className="form-group flex-1">
                  <label className="field-label" htmlFor="field_qty">Quantidade</label>
                  <input
                    id="field_qty"
                    type="number"
                    className="form-control"
                    min={1}
                    value={values['quantity'] ?? 1}
                    onChange={(e) => setValue('quantity', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Banner de Total Calculado */}
              <div className="calc-banner">
                <div className="calc-info">
                  <span className="calc-label">Total Calculado em Tempo Real (AST Parser)</span>
                  <code className="calc-formula">
                    {values['quantity'] || 0} un × {formatCurrency(values['unit_price'])} × (1 - {values['discount_percent'] || 0}%)
                  </code>
                </div>
                <div className="calc-value">
                  {formatCurrency(values['total_price'])}
                </div>
              </div>

              <div className="form-row mt-3">
                {/* Garantia Adicional */}
                <div className="form-group flex-1">
                  <label className="field-label" htmlFor="field_warranty">
                    Garantia Adicional (Meses)
                    {isFieldRequired('warranty_months') && <span className="req-star">*</span>}
                  </label>
                  <input
                    id="field_warranty"
                    type="number"
                    className={`form-control ${errors['warranty_months'] ? 'has-error' : ''}`}
                    value={values['warranty_months'] ?? ''}
                    onChange={(e) => setValue('warranty_months', e.target.value === '' ? null : Number(e.target.value))}
                    placeholder="Ex: 12"
                  />
                  {errors['warranty_months'] && (
                    <span className="error-msg">{errors['warranty_months']}</span>
                  )}
                  <small className="field-hint">
                    ⚠️ Obrigatório via operador AND se Categoria = 'VIP' E Quantidade = 5!
                  </small>
                </div>
              </div>
            </div>
          </section>

          {/* Barra de Ações */}
          <div className="actions-bar">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              ↺ {schema.actions?.resetText || 'Restaurar'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              ✓ {schema.actions?.submitText || 'Submeter Formulário'}
            </button>
          </div>
        </form>

        {/* Inspetor de Estado Reativo (JSON Debugger) */}
        <section className="card inspector-card mt-4">
          <div className="card-header">
            <h3 className="inspector-title">🔍 Inspetor de Estado React 19 (useSyncExternalStore)</h3>
            <span className="inspector-badge">Tempo Real</span>
          </div>
          <div className="card-body inspector-body">
            <div className="inspector-col">
              <h4>Valores (values)</h4>
              <pre>{JSON.stringify(values, null, 2)}</pre>
            </div>
            <div className="inspector-col">
              <h4>Erros (errors)</h4>
              <pre>{JSON.stringify(errors, null, 2)}</pre>
            </div>
            <div className="inspector-col">
              <h4>Visibilidade & Bloqueios</h4>
              <pre>{JSON.stringify({ visibility, disabled: disabledState }, null, 2)}</pre>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
