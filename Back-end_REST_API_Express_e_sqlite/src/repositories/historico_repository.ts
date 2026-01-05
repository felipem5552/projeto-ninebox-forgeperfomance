/*import Pergunta_no_Historico from '../models/p_historico'
import database from './database'
const ava_funcionariosRepository = {
    inserirAvaliacao: (perguntas: Pergunta_no_Historico[], callback: () => void) => {
        const sql = 'INSERT INTO Historico_de_Avaliacoes () VALUES (?, ?, ?)'
        database.serialize(() => {
            const stmt = database.prepare(sql)
            perguntas.forEach(pergunta => {
                stmt.run([
                    pergunta.Aplicante,
                    pergunta.Sujeito,
                    pergunta.Enunciado,
                    pergunta.Eixo,
                    pergunta.Nota
                ])
            })
            stmt.finalize(callback)
        })
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
export default ava_funcionariosRepository*/