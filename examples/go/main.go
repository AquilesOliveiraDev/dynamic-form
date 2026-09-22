package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func getSupplierFormSchema() DynamicFormSchema {
	return DynamicFormSchema{
		Title:    "Cadastro de Pedido e Fornecedor",
		Subtitle: "Gerado pelo backend Go (Server-Driven UI)",
		Structure: [][]DynamicFormField{
			{
				{
					Component: "select",
					Attr: map[string]interface{}{
						"name":  "person_type",
						"label": "Tipo de Pessoa",
						"options": []map[string]string{
							{"label": "Pessoa Física (PF)", "value": "PF"},
							{"label": "Pessoa Jurídica (PJ)", "value": "PJ"},
						},
					},
				},
				{
					Component: "input",
					Attr: map[string]interface{}{
						"name":     "name",
						"label":    "Razão Social / Nome",
						"required": true,
					},
				},
			},
			{
				{
					Component: "input",
					Attr: map[string]interface{}{
						"name":  "cpf",
						"label": "CPF",
						"mask":  "000.000.000-00",
					},
					DependentFields: map[string]interface{}{"person_type": "PF"},
					ClearedFields:   []string{"person_type"},
				},
				{
					Component: "input",
					Attr: map[string]interface{}{
						"name":  "cnpj",
						"label": "CNPJ",
						"mask":  "00.000.000/0001-00",
					},
					DependentFields: map[string]interface{}{"person_type": "PJ"},
					ClearedFields:   []string{"person_type"},
				},
			},
			{
				{
					Component: "number",
					Attr:      map[string]interface{}{"name": "quantity", "label": "Quantidade"},
				},
				{
					Component: "number",
					Attr:      map[string]interface{}{"name": "unit_price", "label": "Preço Unitário"},
				},
				{
					Component:  "number",
					Attr:       map[string]interface{}{"name": "total_price", "label": "Total", "disabled": true},
					CalcFields: "#{quantity}# * #{unit_price}#",
				},
			},
		},
		Default: map[string]interface{}{
			"person_type": "PF",
			"quantity":    1,
			"unit_price":  50,
		},
	}
}

func main() {
	http.HandleFunc("/api/forms/supplier-order", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Method == http.MethodGet {
			json.NewEncoder(w).Encode(getSupplierFormSchema())
			return
		}

		if r.Method == http.MethodPost {
			var payload SupplierOrderPayload
			if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			fmt.Printf("Pedido recebido no Go: %+v\n", payload)
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Pedido salvo com sucesso!"})
			return
		}
	})

	fmt.Println("Servidor Go rodando em http://localhost:8080/api/forms/supplier-order")
	http.ListenAndServe(":8080", nil)
}
