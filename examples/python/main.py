from fastapi import FastAPI, HTTPException
from models import SupplierOrderPayload

app = FastAPI(title="DynamicForm Python API", version="1.0.0")

@app.get("/api/forms/supplier-order")
def get_supplier_schema():
    return {
        "title": "Cadastro de Pedido e Fornecedor",
        "subtitle": "FastAPI com Validação Pydantic v2",
        "structure": [
            [
                {
                    "component": "select",
                    "attr": {
                        "name": "person_type",
                        "label": "Tipo de Pessoa",
                        "options": [
                            {"label": "Pessoa Física (PF)", "value": "PF"},
                            {"label": "Pessoa Jurídica (PJ)", "value": "PJ"}
                        ]
                    }
                },
                {
                    "component": "input",
                    "attr": {"name": "name", "label": "Nome Completo", "required": True}
                }
            ],
            [
                {
                    "component": "number",
                    "attr": {"name": "quantity", "label": "Qtd"}
                },
                {
                    "component": "number",
                    "attr": {"name": "unit_price", "label": "Preço Unitário"}
                },
                {
                    "component": "number",
                    "attr": {"name": "total_price", "label": "Total", "disabled": True},
                    "calcFields": "#{quantity}# * #{unit_price}#"
                }
            ]
        ]
    }

@app.post("/api/forms/supplier-order", status_code=201)
def submit_order(order: SupplierOrderPayload):
    print(f"📦 Pedido recebido no Python FastAPI: {order.dict()}")
    return {"status": "success", "data": order}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
