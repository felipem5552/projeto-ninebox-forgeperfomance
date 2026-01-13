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
    },
    apagarPergunta: (id: number, callback: (notFound: boolean) => void) => {
    const sql = 'DELETE FROM Perguntas WHERE id = ?'
    const params = [id]
    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    },
    Avaliar: (InstanciaAvaliacao: Instancia_de_Avaliacao, callback: (Erro: Boolean) => void) => {
        const sql = 'SELECT * FROM Perguntas WHERE Modelo = ?'
        const params = [InstanciaAvaliacao.Modelo]
        database.all(sql, params, (_err, perguntas: Pergunta[]) => {
            database.serialize(() => {
                database.run("BEGIN TRANSACTION")
                let i = 0
                let Nota_Maxima_Horizontal = 0
                let Nota_Maxima_Vertical = 0
                let Nota_Horizontal = 0
                let Nota_Vertical = 0
                let Erro = false
                const sql = database.prepare('INSERT INTO Historico_de_Avaliacoes (avaliador, avaliado, modelo, nota, ciclo) VALUES (?, ?, ?, ?, ?)')
                perguntas.forEach((pergunta, index) => {
                    if (pergunta.eixo == "Horizontal") {
                        Nota_Horizontal += InstanciaAvaliacao.Notas[index]
                        Nota_Maxima_Horizontal++
                    }
                    else {
                        Nota_Vertical += InstanciaAvaliacao.Notas[index]
                        Nota_Maxima_Vertical++
                    }
                    const params = [InstanciaAvaliacao.Avaliador, InstanciaAvaliacao.Avaliado, InstanciaAvaliacao.Modelo, InstanciaAvaliacao.Notas[index], InstanciaAvaliacao.Ciclo]
                    sql.run(params, (err) => {
                        if (err) {
                            Erro = true
                            console.log("Erro na transação.")
                        }
                    })
                })
                sql.finalize()
                if (Erro) {
                    console.log("Rollback")
                    database.run('ROLLBACK', () => callback(true))
                }
                else {
                    database.run('COMMIT', (err) =>  {
                        if (err) {
                            console.log("Erro no commit")
                            return callback(true)
                        }
                        else {
                            callback(false)
                        }
                    })
                }
                Nota_Maxima_Horizontal *= 5
                Nota_Maxima_Vertical *= 5
            }) 
        })
    }
}
export default AvaliacaoRepository