// Define os atributos do funcionário.  

type Funcionario = {
    id?: number
    nome: string
    time: string
    email: string
    cargo: string

    // Capacidade do funcionário de alterar o código.
    privilegios: string
}
export default Funcionario
// Disponibiliza o tipo para uso em outros arquivos.