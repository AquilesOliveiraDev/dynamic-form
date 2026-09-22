package com.createpixels.dynamicform.controller;

import com.createpixels.dynamicform.dto.SupplierOrderDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forms/supplier-order")
public class DynamicFormController {

    @GetMapping("/schema")
    public ResponseEntity<Map<String, Object>> getSchema() {
        Map<String, Object> schema = Map.of(
            "title", "Cadastro de Pedido e Fornecedor",
            "subtitle", "Backend Spring Boot 3",
            "structure", List.of(
                List.of(
                    Map.of(
                        "component", "select",
                        "attr", Map.of(
                            "name", "personType",
                            "label", "Tipo de Pessoa",
                            "options", List.of(
                                Map.of("label", "Pessoa Física (PF)", "value", "PF"),
                                Map.of("label", "Pessoa Jurídica (PJ)", "value", "PJ")
                            )
                        )
                    ),
                    Map.of(
                        "component", "input",
                        "attr", Map.of("name", "name", "label", "Razão Social", "required", true)
                    )
                )
            )
        );
        return ResponseEntity.ok(schema);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> submitOrder(@Valid @RequestBody SupplierOrderDTO dto) {
        System.out.println("Processando pedido no Spring Boot: " + dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Pedido processado com sucesso!"));
    }
}
