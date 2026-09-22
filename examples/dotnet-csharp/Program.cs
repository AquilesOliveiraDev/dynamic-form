using DynamicForm.Models;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api/forms/supplier-order", () =>
{
    return Results.Ok(new
    {
        title = "Cadastro de Pedido e Fornecedor",
        subtitle = "ASP.NET Core 8 Web API",
        structure = new object[]
        {
            new object[]
            {
                new { component = "select", attr = new { name = "person_type", label = "Tipo de Pessoa" } },
                new { component = "input", attr = new { name = "name", label = "Nome / Razão Social" } }
            },
            new object[]
            {
                new { component = "number", attr = new { name = "quantity", label = "Qtd" } },
                new { component = "number", attr = new { name = "unit_price", label = "Preço Unitário" } },
                new { component = "number", attr = new { name = "total_price", label = "Total", disabled = true }, calcFields = "#{quantity}# * #{unit_price}#" }
            }
        }
    });
});

app.MapPost("/api/forms/supplier-order", (SupplierOrderPayload payload) =>
{
    Console.WriteLine($"[C# .NET 8] Pedido recebido: {payload.Name} - Total: R$ {payload.TotalPrice}");
    return Results.Created($"/orders/1", new { status = "success", message = "Pedido registrado com sucesso no .NET 8" });
});

app.Run();
