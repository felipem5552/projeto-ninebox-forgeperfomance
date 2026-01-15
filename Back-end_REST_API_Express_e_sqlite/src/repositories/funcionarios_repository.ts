// Métodos de requisição HTTP para funcionários.

import Funcionario from '../models/funcionario'
import database from './database'
const funcionarioRepository = {

    // Método de requisição HTTP POST.
    /**
     * @param { Funcionario } funcionario - Cria funcionário usando o tipo Funcionário.
     * @param { void } callback - Função callback que busca por ID.
     */
    criar: (funcionario: Funcionario, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Funcionarios (nome, cargo, privilegios) VALUES (?, ?, ?)'

        // Parâmetros necessários para a requisição POST.
        const params = [funcionario.nome, funcionario.cargo, funcionario.privilegios]

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

    // Parâmetro para busca de funcionários via ID
    const params = [id]

    database.get(sql, params, (_err, row: Funcionario) => callback(row))
    },

    // Método de requisição HTTP PUT.
    /**
     * 
     * @param { number } id - Busca funcionário por ID, deve ser aguardado pela função callback
     * @param { Funcionario } funcionario - Busca 
     * @param { void } callback - Função callback que define se o usuário foi encontrado ou não (True / False).
     */
    atualizar: (id: number, funcionario: Funcionario, callback: (notFound: boolean) => void) => {
    const sql = 'UPDATE Funcionarios SET nome = ?, cargo = ?, privilegios = ? WHERE id = ?'

    // Parâmetros necessários para atualização de dados
    const params = [funcionario.nome, funcionario.cargo, funcionario.privilegios, id]

    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    },

    // Método de requisição HTTP DELETE
    /**
     * @param { number } id - Use-o para definir qual funcionário deve ser apagado via ID, deve ser aguardado pela função callback
     * @param { void } callback - Função callback que define se o usuário foi encontrado ou não (True / False)
     */
    apagar: (id: number, callback: (notFound: boolean) => void) => {
    const sql = 'DELETE FROM Funcionarios WHERE id = ?'

    // Busca o funcionário por ID
    const params = [id]

    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    }
}

export default funcionarioRepository
// Disponibiliza as requisições 