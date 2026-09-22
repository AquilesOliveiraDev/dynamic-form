using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DynamicForm.Models;

public record SupplierOrderPayload(
    [property: JsonPropertyName("person_type")]
    [Required, RegularExpression("^(PF|PJ)$")]
    string PersonType,

    [property: JsonPropertyName("name")]
    [Required, MinLength(3)]
    string Name,

    [property: JsonPropertyName("cpf")]
    string? Cpf,

    [property: JsonPropertyName("cnpj")]
    string? Cnpj,

    [property: JsonPropertyName("quantity")]
    [Range(1, int.MaxValue)]
    int Quantity,

    [property: JsonPropertyName("unit_price")]
    [Range(0.01, double.MaxValue)]
    decimal UnitPrice,

    [property: JsonPropertyName("total_price")]
    decimal TotalPrice,

    [property: JsonPropertyName("is_priority")]
    bool IsPriority,

    [property: JsonPropertyName("delivery_date")]
    string? DeliveryDate
);
