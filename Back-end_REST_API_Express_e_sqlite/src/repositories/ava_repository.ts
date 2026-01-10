import Pergunta_Teste from "../models/pergunta_teste";
import Avaliacao from "../models/avaliacao";
import database from "./database";
const AvaliacaoRepository = {
    criarAvaliacao: (avaliacao: Avaliacao, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Avaliacoes (titulo) VALUES (?)'
        const params = [avaliacao.titulo]
        database.run(sql, params, function(_err) {
            callback(this?.lastID)
        })
    },
    inserirPerguntas: (pergunta: Pergunta_Teste, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Perguntas (enunciado, eixo, peso, avaliacao) VALUES (?, ?, ?, ?)'
        const params = [pergunta.enunciado, pergunta.eixo, pergunta.peso, pergunta.avaliacao]
        database.run(sql, params, function(_err) {
            callback(this?.lastID)
        })
    },
    verAvaliacao: (Avaliacao: number, callback: (avalicoes: Avaliacao[]) => void) => {
        const sql = 'SELECT * FROM Perguntas WHERE Avaliacao = ?'
        const params = [Avaliacao]
        database.all(sql, params, (_err, rows: Avaliacao[]) => callback(rows))
    }
}
export default AvaliacaoRepository