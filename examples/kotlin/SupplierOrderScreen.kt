package com.createpixels.dynamicform.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class FormUiState(
    val personType: String = "PF",
    val name: String = "",
    val cpf: String = "",
    val cnpj: String = "",
    val quantity: Int = 1,
    val unitPrice: Double = 50.0,
    val totalPrice: Double = 50.0,
    val isPriority: Boolean = false
) {
    val isCpfVisible: Boolean get() = personType == "PF"
    val isCnpjVisible: Boolean get() = personType == "PJ"
}

class DynamicFormViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(FormUiState())
    val uiState = _uiState.asStateFlow()

    fun onPersonTypeChanged(newType: String) {
        _uiState.update {
            // Regra de limpeza (clearedFields)
            it.copy(personType = newType, cpf = "", cnpj = "")
        }
    }

    fun onNameChanged(newName: String) {
        _uiState.update { it.copy(name = newName) }
    }

    fun onQuantityChanged(newQtd: Int) {
        _uiState.update {
            it.copy(quantity = newQtd, totalPrice = newQtd * it.unitPrice)
        }
    }

    fun onUnitPriceChanged(newPrice: Double) {
        _uiState.update {
            it.copy(unitPrice = newPrice, totalPrice = it.quantity * newPrice)
        }
    }
}

@Composable
fun SupplierOrderScreen(viewModel: DynamicFormViewModel = DynamicFormViewModel()) {
    val state by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text("Cadastro de Pedido (Jetpack Compose)", style = MaterialTheme.typography.headlineSmall)

        Spacer(modifier = Modifier.height(16.dp))

        // Tipo de Pessoa
        Row {
            Button(
                onClick = { viewModel.onPersonTypeChanged("PF") },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (state.personType == "PF") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                )
            ) { Text("Pessoa Física (PF)") }

            Spacer(modifier = Modifier.width(8.dp))

            Button(
                onClick = { viewModel.onPersonTypeChanged("PJ") },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (state.personType == "PJ") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                )
            ) { Text("Pessoa Jurídica (PJ)") }
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = state.name,
            onValueChange = { viewModel.onNameChanged(it) },
            label = { Text("Nome Completo / Razão Social") },
            modifier = Modifier.fillMaxWidth()
        )

        if (state.isCpfVisible) {
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = state.cpf,
                onValueChange = {},
                label = { Text("CPF") },
                modifier = Modifier.fillMaxWidth()
            )
        }

        if (state.isCnpjVisible) {
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = state.cnpj,
                onValueChange = {},
                label = { Text("CNPJ") },
                modifier = Modifier.fillMaxWidth()
            )
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("Total Calculado: R$ ${state.totalPrice}", style = MaterialTheme.typography.titleMedium)
    }
}
