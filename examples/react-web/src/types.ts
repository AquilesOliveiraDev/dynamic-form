export interface SupplierFormData {
  person_type: 'PF' | 'PJ';
  name: string;
  cpf?: string;
  cnpj?: string;
  corporate_name?: string;
  state_id: string;
  city_id?: string | null;
  supplier_category: 'standard' | 'vip' | 'restricted';
  payment_terms: string;
  discount_percent: number;
  warranty_months?: number | null;
  product_id?: string;
  product_sku?: string;
  unit_price?: number;
  quantity: number;
  total_price?: number;
}
