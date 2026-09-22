import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicFormService } from './dynamic-form.service';
import schemaData from '../form-schema.json';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  public readonly formService = inject(DynamicFormService);
  public readonly schema: any = schemaData;

  // Signal derivado para cidades baseado no estado selecionado
  public readonly availableCities = computed(() => {
    const s = this.formService.state();
    const currentState = s?.values?.['state_id'];
    const citiesCatalog = this.schema.catalogs?.cities_by_state || {};
    return citiesCatalog[currentState] || [];
  });

  public lastSubmittedPayload: any = null;
  public submitSuccess = false;

  ngOnInit() {
    this.formService.init({
      schema: this.schema,
      onSubmit: (values) => {
        this.lastSubmittedPayload = values;
        this.submitSuccess = true;
        setTimeout(() => {
          this.submitSuccess = false;
        }, 5000);
      },
    });
  }

  // Manipuladores de eventos reativos
  onInputChange(field: string, event: Event, isNumber = false) {
    const input = event.target as HTMLInputElement;
    const rawVal = input.value;
    if (isNumber) {
      this.formService.setValue(field, rawVal === '' ? null : Number(rawVal));
    } else {
      this.formService.setValue(field, rawVal);
    }
  }

  onSelectChange(field: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    this.formService.setValue(field, select.value);
  }

  selectProduct(productId: string) {
    this.formService.setValue('product_id', productId);
  }

  setPersonType(type: 'PF' | 'PJ') {
    this.formService.setValue('person_type', type);
  }

  setSupplierCategory(category: 'standard' | 'vip' | 'restricted') {
    this.formService.setValue('supplier_category', category);
  }

  onSubmit() {
    this.formService.submit();
  }

  onReset() {
    this.lastSubmittedPayload = null;
    this.submitSuccess = false;
    this.formService.reset();
  }

  isFieldRequired(field: string): boolean {
    return this.formService.isFieldRequired(field);
  }

  formatCurrency(val: number | null | undefined): string {
    if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
