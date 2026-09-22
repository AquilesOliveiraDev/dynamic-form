package main

// SupplierOrderPayload representa o payload recebido e validado pelo backend Go
type SupplierOrderPayload struct {
	PersonType   string   `json:"person_type" validate:"required,oneof=PF PJ"`
	Name         string   `json:"name" validate:"required,min=3"`
	CPF          *string  `json:"cpf,omitempty"`
	CNPJ         *string  `json:"cnpj,omitempty"`
	Quantity     float64  `json:"quantity" validate:"required,gt=0"`
	UnitPrice    float64  `json:"unit_price" validate:"required,gt=0"`
	TotalPrice   float64  `json:"total_price"`
	IsPriority   bool     `json:"is_priority"`
	DeliveryDate *string  `json:"delivery_date,omitempty"`
}

// DynamicFormField representa um campo no padrão JSON Schema universal
type DynamicFormField struct {
	Component       string                 `json:"component"`
	Attr            map[string]interface{} `json:"attr"`
	DependentFields map[string]interface{} `json:"dependentFields,omitempty"`
	ClearedFields   []string               `json:"clearedFields,omitempty"`
	CalcFields      string                 `json:"calcFields,omitempty"`
}

// DynamicFormSchema representa a estrutura enviada via API para os clientes
type DynamicFormSchema struct {
	Title     string                 `json:"title"`
	Subtitle  string                 `json:"subtitle"`
	Structure [][]DynamicFormField   `json:"structure"`
	Default   map[string]interface{} `json:"default"`
}
