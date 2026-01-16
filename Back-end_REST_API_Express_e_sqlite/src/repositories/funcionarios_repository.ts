// Define os métodos de requisição HTTP para funcionários.

import Funcionario from '../models/funcionario'
import database from './database'
const funcionarioRepository = {

    // Método de requisição HTTP POST.
    /**
     * @param { Funcionario } funcionario - Cria funcionário usando o tipo Funcionário.
     * @param { void } callback - Função callback que busca por ID.
     */
    criar: (funcionario: Funcionario, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Funcionarios (nome, cargo, privilegios, time, email) VALUES (?, ?, ?, ?, ?)'
        const params = [funcionario.nome, funcionario.cargo, funcionario.privilegios, funcionario.time, funcionario.email]
        database.run(sql, params, function(_err) {
            callback(this?.lastID)
        })
    },
    
    // Método de requisição HTTP GET geral.
    /**
     * 
     * @param { void } callback - Função callback que busca por funcionários.
     */
    lerTodos: (callback: (funcionarios: Funcionario[]) => void) => {
        const sql = 'SELECT * FROM Funcionarios'

        // Parâmetro para busca de funcionários (Tipo any visto a não especificação).
        const params: any[] = []

        database.all(sql, params, (_err, rows: Funcionario[]) => callback(rows))
    },

    // Método de requisição HTTP GET por meio de ID.
    /**
     * 
     * @param { number } id - Busca funcionário por ID. 
     * @param { void } callback - Função callback que aguarda a busca por ID e retorna funcionário.
     */
    ler: (id: number, callback: (funcionario?: Funcionario) => void) => {
    const sql = 'SELECT * FROM Funcionarios WHERE id = ?'

    // Parâmetro para busca de funcionários via ID.
    const params = [id]

    database.get(sql, params, (_err, row: Funcionario) => callback(row))
    },

    // Método de requisição HTTP PUT.
    /**
     * 
     * @param { number } id - Busca funcionário por ID.
     * @param { Funcionario } funcionario - Funcionário (corpo).
     * @param { void } callback - Função callback que define se o usuário foi encontrado ou não (True / False), deve aguardar banco de dados.
     */
    atualizar: (id: number, funcionario: Funcionario, callback: (notFound: boolean) => void) => {
    const sql = 'UPDATE Funcionarios SET nome = ?, cargo = ?, privilegios = ?, time = ?, email = ? WHERE id = ?'

    // Parâmetro de modelo (Como deve ser o corpo JSON).
    const params = [funcionario.nome, funcionario.cargo, funcionario.privilegios, funcionario.time, funcionario.email, id]
    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    },

    // Método de requisição HTTP DELETE.
    /**
     * @param { number } id - Use-o para definir qual funcionário deve ser apagado via ID.
     * @param { void } callback - Função callback que define se o usuário foi encontrado ou não (True / False), deve aguardar banco de dados.
     */
    apagar: (id: number, callback: (notFound: boolean) => void) => {
    const sql = 'DELETE FROM Funcionarios WHERE id = ?'

    // Busca o funcionário por ID.
    const params = [id]

    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    },

    // Verifica se existem funcionários sem e-mails cadastrados.
    verificarEmailExistente(
    email: string,
    callback: (existe: boolean) => void
    ) {
    const sql = `SELECT 1 FROM funcionarios WHERE email = ? LIMIT 1`

    database.get(sql, [email], (_err, row) => {
        callback(!!row)
    })
    }
}

export default funcionarioRepository
// Disponibiliza o tipo para uso em outros arquivos.