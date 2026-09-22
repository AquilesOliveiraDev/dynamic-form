import SwiftUI
import Observation

@Observable
class DynamicFormViewModel {
    var personType: String = "PF" {
        didSet {
            // Regra de limpeza (clearedFields)
            cpf = ""
            cnpj = ""
        }
    }
    var name: String = ""
    var cpf: String = ""
    var cnpj: String = ""
    var quantity: Double = 1 {
        didSet { recomputeTotal() }
    }
    var unitPrice: Double = 50.0 {
        didSet { recomputeTotal() }
    }
    var totalPrice: Double = 50.0
    var isPriority: Bool = false

    var isCpfVisible: Bool { personType == "PF" }
    var isCnpjVisible: Bool { personType == "PJ" }

    private func recomputeTotal() {
        totalPrice = quantity * unitPrice
    }
}

struct SupplierOrderView: View {
    @State private var viewModel = DynamicFormViewModel()

    var body: some View {
        NavigationStack {
            Form {
                Section("Identificação") {
                    Picker("Tipo de Pessoa", selection: $viewModel.personType) {
                        Text("Pessoa Física (PF)").tag("PF")
                        Text("Pessoa Jurídica (PJ)").tag("PJ")
                    }
                    .pickerStyle(.segmented)

                    TextField("Nome Completo / Razão", text: $viewModel.name)

                    if viewModel.isCpfVisible {
                        TextField("CPF", text: $viewModel.cpf)
                            .keyboardType(.numberPad)
                    }

                    if viewModel.isCnpjVisible {
                        TextField("CNPJ", text: $viewModel.cnpj)
                            .keyboardType(.numberPad)
                    }
                }

                Section("Itens & Valores (Cálculo)") {
                    Stepper("Quantidade: \(Int(viewModel.quantity))", value: $viewModel.quantity, in: 1...1000)
                    HStack {
                        Text("Preço Unitário:")
                        Spacer()
                        TextField("Preço", value: $viewModel.unitPrice, format: .currency(code: "BRL"))
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                    HStack {
                        Text("Total Calculado:")
                            .fontWeight(.bold)
                        Spacer()
                        Text(viewModel.totalPrice, format: .currency(code: "BRL"))
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                    }
                }

                Section("Entrega") {
                    Toggle("Entrega Prioritária?", isOn: $viewModel.isPriority)
                }

                Button("Salvar Pedido (SwiftUI)") {
                    print("Pedido Salvo no iOS: \(viewModel.name), Total: \(viewModel.totalPrice)")
                }
            }
            .navigationTitle("DynamicForm SwiftUI")
        }
    }
}
