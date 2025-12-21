import Pergunta from '../models/pergunta'
import database from './database'
const perguntaRepository = {
    criar: (pergunta: Pergunta, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Perguntas (ennunciado, eixo) VALUES (?, ?)'
        const params = [pergunta.enunciado, pergunta.eixo]
        database.run(sql, params, function(_err) {
            callback(this?.lastID)
        })
    },
    lerTodos: (callback: (perguntas: Pergunta[]) => void) => {
        const sql = 'SELECT * FROM Perguntas'
        const params: any[] = []
        database.all(sql, params, (_err, rows: Pergunta[]) => callback(rows))
    },
    ler: (id: number, callback: (pergunta?: Pergunta) => void) => {
    const sql = 'SELECT * FROM Perguntas WHERE id = ?'
    const params = [id]
    database.get(sql, params, (_err, row: Pergunta) => callback(row))
    },
    atualizar: (id: number, pergunta: Pergunta, callback: (notFound: boolean) => void) => {
    const sql = 'UPDATE Perguntas SET enunciado = ?, eixo = ? WHERE id = ?'
    const params = [pergunta.enunciado, pergunta.eixo, id]
    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    },
    apagar: (id: number, callback: (notFound: boolean) => void) => {
    const sql = 'DELETE FROM Perguntas WHERE id = ?'
    const params = [id]
    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    }
}
export default perguntaRepository