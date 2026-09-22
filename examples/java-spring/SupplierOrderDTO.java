package com.createpixels.dynamicform.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SupplierOrderDTO(
    @NotBlank(message = "Tipo de pessoa é obrigatório")
    @Pattern(regexp = "PF|PJ", message = "Tipo de pessoa deve ser PF ou PJ")
    String personType,

    @NotBlank(message = "Nome é obrigatório")
    String name,

    String cpf,
    String cnpj,

    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade mínima é 1")
    Integer quantity,

    @NotNull(message = "Preço unitário é obrigatório")
    BigDecimal unitPrice,

    BigDecimal totalPrice,
    Boolean isPriority,
    LocalDate deliveryDate
) {}
