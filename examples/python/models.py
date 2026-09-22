from typing import Optional, Literal
from pydantic import BaseModel, Field

class SupplierOrderPayload(BaseModel):
    person_type: Literal['PF', 'PJ'] = Field(..., description="Tipo de pessoa")
    name: str = Field(..., min_length=3, description="Nome ou Razão Social")
    cpf: Optional[str] = None
    cnpj: Optional[str] = None
    quantity: float = Field(..., gt=0, description="Quantidade")
    unit_price: float = Field(..., gt=0, description="Preço unitário")
    total_price: Optional[float] = None
    is_priority: bool = False
    delivery_date: Optional[str] = None
