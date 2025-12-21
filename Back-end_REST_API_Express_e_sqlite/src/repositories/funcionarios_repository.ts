import Funcionario from '../models/funcionario'
import database from './database'
const funcionarioRepository = {
    criar: (funcionario: Funcionario, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Funcionarios (nome, cargo, posicao) VALUES (?, ?, ?)'
        const params = [funcionario.nome, funcionario.cargo, funcionario.posicao]
        database.run(sql, params, function(_err) {
            callback(this?.lastID)
        })
    },
    lerTodos: (callback: (funcionarios: Funcionario[]) => void) => {
        const sql = 'SELECT * FROM Funcionarios'
        const params: any[] = []
        database.all(sql, params, (_err, rows: Funcionario[]) => callback(rows))
    },
    ler: (id: number, callback: (funcionario?: Funcionario) => void) => {
    const sql = 'SELECT * FROM Funcionarios WHERE id = ?'
    const params = [id]
    database.get(sql, params, (_err, row: Funcionario) => callback(row))
    },
    atualizar: (id: number, funcionario: Funcionario, callback: (notFound: boolean) => void) => {
    const sql = 'UPDATE Funcionarios SET nome = ?, cargo = ?, posicao = ? WHERE id = ?'
    const params = [funcionario.nome, funcionario.cargo, funcionario.posicao, id]
    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    },
    apagar: (id: number, callback: (notFound: boolean) => void) => {
    const sql = 'DELETE FROM Funcionarios WHERE id = ?'
    const params = [id]
    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    }
}
export default funcionarioRepository