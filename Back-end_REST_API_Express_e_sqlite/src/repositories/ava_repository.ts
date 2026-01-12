import Pergunta from "../models/pergunta";
import Modelo_de_Avaliacao from "../models/modelo_de_avaliacao";
import Instancia_de_Avaliacao from "../models/instancia_de_avaliacao";
import database from "./database";
const AvaliacaoRepository = {
    criarAvaliacao: (avaliacao: Modelo_de_Avaliacao, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Avaliacoes (titulo) VALUES (?)'
        const params = [avaliacao.titulo]
        database.run(sql, params, function(_err) {
            callback(this?.lastID)
        })
    },
    inserirPerguntas: (modelo: number, pergunta: Pergunta, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Perguntas (enunciado, eixo, peso, modelo, disponibilidade) VALUES (?, ?, ?, ?, ?)'
        const params = [pergunta.enunciado, pergunta.eixo, pergunta.peso, modelo, "Disponível"]
        database.run(sql, params, function(_err) {
            callback(this?.lastID)
        })
    },
    verAvaliacao: (Id_Avaliacao: number, callback: (perguntas: Pergunta[]) => void) => {
        const sql = 'SELECT * FROM Perguntas WHERE Modelo = ?'
        const params = [Id_Avaliacao]
        database.all(sql, params, (_err, rows: Pergunta[]) => {callback(rows)})
    }
    /*Avaliar: (InstanciaAvaliacao: Instancia_de_Avaliacao, callback: () => void) => {
        const sql = 'SELECT * FROM Perguntas WHERE Modelo = ?'
        const params = [InstanciaAvaliacao.Modelo]
        database.all(sql, params, (_err, rows: Pergunta[]) => {
            let i = 0
            for (const pergunta of rows) {
                //Função que calcula a nota final do avaliado e coloca ela, assim como as notas das perguntas, num histórico
            }
        })
    }*/
}
export default AvaliacaoRepository