import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { DynamicFormService } from './dynamic-form.service';

describe('App & DynamicFormService - 10 Regras do DynamicField no Angular', () => {
  let app: App;
  let service: DynamicFormService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [DynamicFormService],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    app = fixture.componentInstance;
    service = TestBed.inject(DynamicFormService);
    app.ngOnInit();
  });

  it('deve inicializar o app e carregar o schema com sucesso', () => {
    expect(app).toBeTruthy();
    const s = service.state();
    expect(s).toBeTruthy();
    expect(s?.values['person_type']).toBe('PF');
  });

  it('1. dependentFields & 7. clearedFieldsChanged', () => {
    const s1 = service.state();
    expect(s1?.visibility['cpf']).toBe(true);
    expect(s1?.visibility['cnpj']).toBe(false);

    // Preenche CPF
    service.setValue('cpf', '123.456.789-00');
    expect(service.state()?.values['cpf']).toBe('123.456.789-00');

    // Ao mudar para PJ, clearedFieldsChanged limpa CPF e exibe CNPJ
    service.setValue('person_type', 'PJ');
    const s2 = service.state();
    expect(s2?.values['cpf']).toBeNull();
    expect(s2?.visibility['cpf']).toBe(false);
    expect(s2?.visibility['cnpj']).toBe(true);
  });

  it('2. disabledFields & 3. disabledFieldsCondition (and / or)', () => {
    // standard + PF -> payment_terms habilitado
    expect(service.state()?.disabledState['payment_terms']).toBe(false);

    // restricted + PJ -> payment_terms ainda habilitado (operador 'and' exige ambos)
    service.setValue('person_type', 'PJ');
    service.setValue('supplier_category', 'restricted');
    expect(service.state()?.disabledState['payment_terms']).toBe(false);

    // restricted + PF -> payment_terms BLOQUEADO
    service.setValue('person_type', 'PF');
    expect(service.state()?.disabledState['payment_terms']).toBe(true);

    // discount_percent tem condição 'or' com restricted -> BLOQUEADO
    expect(service.state()?.disabledState['discount_percent']).toBe(true);
  });

  it('4. reloadFields & 6. clearedFields', () => {
    service.setValue('state_id', 'SP');
    service.setValue('city_id', 'sp_campinas');
    expect(service.state()?.values['city_id']).toBe('sp_campinas');

    // Ao alterar estado, cidade é resetada via reloadFields e clearedFields
    service.setValue('state_id', 'RJ');
    expect(service.state()?.values['city_id']).toBeNull();
  });

  it('5. autoSetFields & 10. calcFields em cascata', () => {
    service.setValue('discount_percent', 10);
    service.setValue('quantity', 2);

    // Selecionar Dell XPS 15 (Preço 8500)
    // 2 * 8500 * (1 - 0.10) = 15300
    service.setValue('product_id', 'prod_dell');
    const sDell = service.state();
    expect(sDell?.values['product_sku']).toBe('DELL-XPS-15');
    expect(sDell?.values['unit_price']).toBe(8500);
    expect(sDell?.values['total_price']).toBe(15300);

    // Selecionar Monitor LG (Preço 2400)
    // 2 * 2400 * (1 - 0.10) = 4320
    service.setValue('product_id', 'prod_lg');
    const sLg = service.state();
    expect(sLg?.values['product_sku']).toBe('LG-34-UW');
    expect(sLg?.values['unit_price']).toBe(2400);
    expect(sLg?.values['total_price']).toBe(4320);
  });

  it('8. requiredFields & 9. requiredRule com operador and', async () => {
    // CPF é obrigatório para PF
    expect(service.isFieldRequired('cpf')).toBe(true);

    // warranty_months NÃO é obrigatório inicialmente com quantity = 2
    expect(service.isFieldRequired('warranty_months')).toBe(false);

    // Com Categoria VIP e Quantidade = 5 -> torna-se obrigatório (regra AND)
    service.setValue('supplier_category', 'vip');
    service.setValue('quantity', 5);
    expect(service.isFieldRequired('warranty_months')).toBe(true);

    // Submissão falha se warranty_months estiver vazio
    service.setValue('warranty_months', null);
    const valid = await service.submit();
    expect(valid).toBe(false);
    expect(service.state()?.errors['warranty_months']).toBeTruthy();

    // Preenche garantia e campos obrigatórios -> validação passa
    service.setValue('name', 'João Silva');
    service.setValue('cpf', '123.456.789-00');
    service.setValue('warranty_months', 12);
    const valid2 = await service.submit();
    expect(valid2).toBe(true);
    expect(service.state()?.errors['warranty_months']).toBeFalsy();
  });
});
