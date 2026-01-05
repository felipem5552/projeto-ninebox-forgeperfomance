import Pergunta from '../models/pergunta'
import database from './database'
const ava_funcionariosRepository = {
    criar_avaliacao: (pergunta: Pergunta, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Avaliacao_Funcionarios (enunciado, eixo, peso) VALUES (?, ?, ?)'
        const params = [pergunta.enunciado, pergunta.eixo, pergunta.peso]
        database.run(sql, params, function(_err) {
            callback(this?.lastID)
        })
    },
    lerMax:  (callback: (perguntas: Pergunta[]) => void) => {
        const sql = 'SELECT MAX(Id) FROM Avaliacao_Funcionarios'
        const params: any[] = []
        database.all(sql, params, (_err, rows: Pergunta[]) => callback(rows))
    },
    lerTodos: (callback: (perguntas: Pergunta[]) => void) => {
        const sql = 'SELECT * FROM Avaliacao_Funcionarios'
        const params: any[] = []
        database.all(sql, params, (_err, rows: Pergunta[]) => callback(rows))
    },
    ler: (id: number, callback: (pergunta?: Pergunta) => void) => {
    const sql = 'SELECT * FROM Avaliacao_Funcionarios WHERE id = ?'
    const params = [id]
    database.get(sql, params, (_err, row: Pergunta) => callback(row))
    },
    atualizar: (id: number, pergunta: Pergunta, callback: (notFound: boolean) => void) => {
    const sql = 'UPDATE Avaliacao_Funcionarios SET enunciado = ?, eixo = ?, peso = ? WHERE id = ?'
    const params = [pergunta.enunciado, pergunta.eixo, pergunta.peso, id]
    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    },
    apagar: (id: number, callback: (notFound: boolean) => void) => {
    const sql = 'DELETE FROM Avaliacao_Funcionarios WHERE id = ?'
    const params = [id]
    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    }
}
export default ava_funcionariosRepository