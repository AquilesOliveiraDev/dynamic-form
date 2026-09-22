/**
 * Tipos universais e estritos do @dynamic-form/core
 */

export type Primitive = string | number | boolean | null | undefined | Date;

/** Gera uniões de caminhos em notação ponto para objetos aninhados (ex: 'address.city') */
export type Paths<T, D extends number = 5> = [D] extends [never]
  ? never
  : T extends Primitive
  ? never
  : T extends Array<infer U>
  ? `${number}` | `${number}.${Paths<U, Prev[D]>}`
  : T extends Record<string, any>
  ? {
      [K in keyof T & string]: T[K] extends Primitive
        ? K
        : K | `${K}.${Paths<T[K], Prev[D]>}`;
    }[keyof T & string]
  : string;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export type FieldComponentType =
  | 'input'
  | 'number'
  | 'password'
  | 'switch'
  | 'select'
  | 'autocomplete'
  | 'datepicker'
  | 'rangepicker'
  | 'textarea'
  | 'richtext'
  | 'editorHtml'
  | 'html'
  | 'checkbox'
  | 'colorpicker'
  | 'radio'
  | 'iconpicker'
  | 'slider'
  | 'photo'
  | 'upload'
  | 'file'
  | 'currency'
  | 'percent'
  | 'tree'
  | 'customComponent'
  | (string & {});

export interface SelectOption<TRecord = Record<string, unknown>> {
  label: string;
  value: any;
  id?: any;
  disabled?: boolean;
  record?: TRecord;
  [key: string]: any;
}

export type ConditionOperator =
  | '==='
  | '!=='
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'includes'
  | 'in'
  | 'isFilled'
  | 'isEmpty';

export interface FieldRuleCondition<TField = string> {
  field: TField;
  value?: any;
  operator?: ConditionOperator;
  action?: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'clear';
}

export type DynamicFieldRule<TField = string> =
  | TField[]
  | Record<string, any>;

export type DynamicClearedFieldsRule<TField = string> =
  | TField[]
  | {
      fields: DynamicFieldRule<TField>;
      allChanges?: boolean;
    }
  | Record<string, any>;

export interface KeyRule {
  rule: 'show' | 'hide' | 'disable' | 'enable' | 'required' | 'notRequired';
  key?: string;
  variable?: string;
  requiredValue?: any;
  areaId?: any;
  operator?: 'and' | 'or';
  keys?: Array<{ key?: string; variable?: string; requiredValue?: any; areaId?: any }>;
  variables?: string[];
}

export interface FieldAttributes<TField = string> {
  name: TField;
  label?: string;
  placeholder?: string;
  hidden?: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  mask?: string;
  maskType?: string;
  maskOptions?: any;
  route?: string;
  searchRoute?: string;
  subPath?: string;
  dataKey?: string;
  totalKey?: string;
  pageSizeKey?: string;
  optionLabel?: string | string[];
  optionValue?: string | string[];
  searchColumns?: string[];
  extraParams?: string;
  extraOptions?: Record<string, any>;
  step?: number | string;
  calcField?: { expression: string } | string;
  rule?: FieldRuleCondition<TField> | Array<FieldRuleCondition<TField>>;
  keyRules?: KeyRule[];
  operator?: 'and' | 'or';
  prefix?: string | string[];
  suffix?: string | string[];
  prefixLabel?: string;
  suffixLabel?: string;
  groupTitle?: string;
  tooltip?: string;
  hasLegend?: boolean;
  multiple?: boolean;
  staticSearch?: boolean;
  [key: string]: any;
}

export interface DynamicField<TFormData = Record<string, any>> {
  component: FieldComponentType;
  title?: string;
  options?: SelectOption[];
  attr: FieldAttributes<Paths<TFormData> | string>;
  dependentFields?: DynamicFieldRule<Paths<TFormData> | string>;
  dependentFieldsCondition?: 'and' | 'or';
  disabledFields?: DynamicFieldRule<Paths<TFormData> | string>;
  disabledFieldsCondition?: 'and' | 'or';
  reloadFields?: DynamicFieldRule<Paths<TFormData> | string>;
  autoSetFields?: Record<string, string | null>;
  clearedFields?: DynamicClearedFieldsRule<Paths<TFormData> | string>;
  clearedFieldsChanged?: boolean;
  requiredFields?: DynamicFieldRule<Paths<TFormData> | string>;
  requiredRule?: 'and' | 'or';
  calcFields?: string;
}

export interface FormActions {
  submit?: boolean;
  reset?: boolean;
  submitText?: string;
  submittingText?: string;
  submitIcon?: string;
  resetText?: string;
}

export interface DynamicFormSchema<TFormData = Record<string, any>> {
  title?: string;
  subtitle?: string;
  structure?: Array<Array<DynamicField<TFormData>>>;
  fields?: Array<Array<DynamicField<TFormData>>>;
  default?: Partial<TFormData>;
  actions?: FormActions;
}

export interface FormState<TFormData = Record<string, any>> {
  values: TFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  visibility: Record<string, boolean>;
  disabledState: Record<string, boolean>;
  isDirty: boolean;
  changedFields: string[];
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
}
