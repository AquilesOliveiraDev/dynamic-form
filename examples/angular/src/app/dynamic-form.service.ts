import { Injectable, signal } from '@angular/core';
import { FormStore, type FormStoreConfig, type FormState } from '@dynamic-form/core';

@Injectable({
  providedIn: 'root',
})
export class DynamicFormService<TFormData extends Record<string, any> = Record<string, any>> {
  private store!: FormStore<TFormData>;
  public state = signal<FormState<TFormData> | null>(null);

  public init(config: FormStoreConfig<TFormData>) {
    this.store = new FormStore<TFormData>(config);
    this.state.set(this.store.getState());

    this.store.subscribe((next) => {
      // Cria uma nova referência para disparar a reatividade dos signals
      this.state.set({
        ...next,
        values: { ...next.values },
        errors: { ...next.errors },
        touched: { ...next.touched },
        visibility: { ...next.visibility },
        disabledState: { ...next.disabledState },
      });
    });
  }

  public setValue(field: string, val: any) {
    if (this.store) {
      this.store.setValue(field, val);
    }
  }

  public async validate(): Promise<boolean> {
    if (this.store) {
      return await this.store.validateForm();
    }
    return false;
  }

  public async submit(): Promise<boolean> {
    if (this.store) {
      const isValid = await this.store.validateForm();
      if (isValid) {
        await this.store.submit();
        return true;
      }
      return false;
    }
    return false;
  }

  public reset() {
    if (this.store) {
      this.store.reset();
    }
  }

  public isFieldRequired(name: string): boolean {
    if (!this.store) return false;
    return this.store.isFieldRequired(name);
  }

  public getStore(): FormStore<TFormData> {
    return this.store;
  }
}
