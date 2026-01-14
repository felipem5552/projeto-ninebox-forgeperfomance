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
    Avaliar(
    instancia: Instancia_de_Avaliacao,
    callback: (erro: boolean) => void
    ) {
    const sqlPerguntas = 'SELECT * FROM Perguntas WHERE Modelo = ?'

    database.all(
        sqlPerguntas,
        [instancia.Modelo],
        (err: Error | null, perguntas: Pergunta[]) => {

        if (err || !perguntas || perguntas.length !== instancia.Notas.length) {
            return callback(true)
        }

        database.serialize(() => {
            database.run('BEGIN TRANSACTION')
            let erro = false

            const stmt = database.prepare(`
            INSERT INTO Historico_de_Avaliacoes
            (avaliador, avaliado, modelo, pergunta, nota, ciclo)
            VALUES (?, ?, ?, ?, ?, ?)
            `)

            perguntas.forEach((pergunta, index) => {
            stmt.run(
                instancia.Avaliador,
                instancia.Avaliado,
                instancia.Modelo,
                pergunta.id,
                instancia.Notas[index],
                instancia.Ciclo,
                (e: Error | null) => {
                if (e) erro = true
                }
            )
            })

            // 👇 AQUI está a correção principal
            stmt.finalize((e: Error | null) => {
            if (e) erro = true

            database.run(
                `
                INSERT INTO Avaliacoes_Resultado
                (avaliador, avaliado, modelo, ciclo, desempenho, potencial, nine_box)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                instancia.Avaliador,
                instancia.Avaliado,
                instancia.Modelo,
                instancia.Ciclo,
                instancia.Desempenho,
                instancia.Potencial,
                instancia.NineBox
                ],
                (e2: Error | null) => {
                if (e2) erro = true

                if (erro) {
                    database.run('ROLLBACK', () => callback(true))
                } else {
                    database.run('COMMIT', () => callback(false))
                }
                }
            )
            })
        })
        }
    )
    },
    verificarAvaliacaoNoCiclo(
    avaliado: number,
    ciclo: string,
    callback: (existe: boolean) => void
    ) {
    const sql = `
        SELECT 1
        FROM Avaliacoes_Resultado
        WHERE avaliado = ? AND ciclo = ?
        LIMIT 1
    `

    database.get(
        sql,
        [avaliado, ciclo],
        (_err: Error | null, row) => {
        callback(!!row)
        }
    )
    },
    buscarHistorico(
    avaliadoId: number,
    callback: (historico: {
        ciclo: string
        desempenho: number
        potencial: number
        nine_box: number
    }[]) => void
    ) {
    const sql = `
        SELECT
        ciclo,
        desempenho,
        potencial,
        nine_box
        FROM Avaliacoes_Resultado
        WHERE avaliado = ?
        ORDER BY ciclo ASC
    `

    database.all(
        sql,
        [avaliadoId],
        (
        _err: Error | null,
        rows: {
            ciclo: string
            desempenho: number
            potencial: number
            nine_box: number
        }[]
        ) => {
        callback(rows || [])
        }
    )
    }

}
export default AvaliacaoRepository