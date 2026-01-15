import Funcionario from '../models/funcionario'
import database from './database'
const funcionarioRepository = {
    criar: (funcionario: Funcionario, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Funcionarios (nome, cargo, privilegios, time, email) VALUES (?, ?, ?, ?, ?)'
        const params = [funcionario.nome, funcionario.cargo, funcionario.privilegios, funcionario.time, funcionario.email]
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
    const sql = 'UPDATE Funcionarios SET nome = ?, cargo = ?, privilegios = ?, time = ?, email = ? WHERE id = ?'
    const params = [funcionario.nome, funcionario.cargo, funcionario.privilegios, funcionario.time, funcionario.email, id]
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
    },
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