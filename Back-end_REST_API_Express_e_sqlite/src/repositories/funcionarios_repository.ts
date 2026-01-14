/** Métodos de requisição HTTP  para funcionários*/
import Funcionario from '../models/funcionario'
import database from './database'
const funcionarioRepository = {

    /** Método de requisição HTTP POST */
    criar: (funcionario: Funcionario, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Funcionarios (nome, cargo, privilegios) VALUES (?, ?, ?)'
        const params = [funcionario.nome, funcionario.cargo, funcionario.privilegios]
        database.run(sql, params, function(_err) {
            callback(this?.lastID)
        })
    },
    /** Método de requisição HTTP GET geral */
    lerTodos: (callback: (funcionarios: Funcionario[]) => void) => {
        const sql = 'SELECT * FROM Funcionarios'
        const params: any[] = []
        database.all(sql, params, (_err, rows: Funcionario[]) => callback(rows))
    },

    /** Método de requisição HTTP GET por meio de ID*/
    ler: (id: number, callback: (funcionario?: Funcionario) => void) => {
    const sql = 'SELECT * FROM Funcionarios WHERE id = ?'
    const params = [id]
    database.get(sql, params, (_err, row: Funcionario) => callback(row))
    },

    /** Método de requisição HTTP PUT */
    atualizar: (id: number, funcionario: Funcionario, callback: (notFound: boolean) => void) => {
    const sql = 'UPDATE Funcionarios SET nome = ?, cargo = ?, privilegios = ? WHERE id = ?'
    const params = [funcionario.nome, funcionario.cargo, funcionario.privilegios, id]
    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    },

    /** Método de requisição HTTP DELETE */
    apagar: (id: number, callback: (notFound: boolean) => void) => {
    const sql = 'DELETE FROM Funcionarios WHERE id = ?'
    const params = [id]
    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    }
}

export default funcionarioRepository