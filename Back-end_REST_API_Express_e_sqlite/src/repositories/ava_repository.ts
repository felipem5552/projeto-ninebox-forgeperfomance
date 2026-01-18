// Define os métodos de requisição HTTP para as avaliações.

import Pergunta from "../models/pergunta";
import Modelo_de_Avaliacao from "../models/modelo_de_avaliacao";
import Instancia_de_Avaliacao from "../models/instancia_de_avaliacao";
import database from "./database";

const AvaliacaoRepository = {

    // Método de requisição HTTP POST.
    /**
     * @param { Modelo_de_Avaliacao } avaliacao - Busca por avaliações.
     * @param { void } callback - Função callback que cria nova avaliação, deve aguardar banco de dados.
     */
    criarAvaliacao: (avaliacao: Modelo_de_Avaliacao, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Avaliacoes (titulo) VALUES (?)'
        
        // Parâmetro para busca (título). 
        const params = [avaliacao.titulo]

        database.run(sql, params, function(_err) {
            callback(this?.lastID)
        })
    },

    // Método de requisição HTTP PUT.
    /**
     * 
     * @param { number } id - Busca pelo ID da avaliação, espera pela função callback.
     * @param { Modelo_de_Avaliacao } avaliacao - Busca pela avaliação, espera pela função callback.
     * @param { void } callback - Função callback que retorna se a avaliação existe ou não, deve aguardar banco de dados.
     */    
    alterarAvaliacao: (id: number, avaliacao: Modelo_de_Avaliacao, callback: (notFound: boolean) => void) => {
    const sql = 'UPDATE avaliacoes SET titulo = ? WHERE id = ?'

    // Parâmetro de modelo (Como deve ser o corpo da avaliação).
    const params = [avaliacao.titulo, id]

    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    },

    // Método de requisição HTTP GET.
    /**
     * 
     * @param { number } Id_Avaliacao - ID da avaliação para busca, deve esperar a função callback.
     * @param { void } callback - Função callback que retorna perguntas, deve aguardar banco de dados.
     */
    verAvaliacao: (Id_Avaliacao: number, callback: (perguntas: Pergunta[]) => void) => {
        const sql = 'SELECT * FROM Perguntas WHERE Modelo = ?'

        // Parâmetro de busca (ID).
        const params = [Id_Avaliacao]

        database.all(sql, params, (_err, rows: Pergunta[]) => {callback(rows)})
    },

    // Método de requisição HTTP POST.
    /**
     * 
     * @param { number } modelo - Modelo da avaliação. 
     * @param { Pergunta } pergunta - Pergunta (corpo).
     * @param { void } callback - Função callback que retorna perguntas, deve aguarda banco de dados.
     */
    inserirPerguntas: (modelo: number, pergunta: Pergunta, callback: (id?: number) => void) => {
        const sql = 'INSERT INTO Perguntas (enunciado, eixo, peso, modelo, disponibilidade) VALUES (?, ?, ?, ?, ?)'

        // Parâmetro de modelo (Como deve ser o corpo da pergunta).
        const params = [pergunta.enunciado, pergunta.eixo, pergunta.peso, modelo, 1]

        database.run(sql, params, function(_err) {
            callback(this?.lastID)
        })
    },

    // Método de requisição HTTP PUT.
    /**
     * 
     * @param id - ID da pergunta. 
     * @param pergunta - Pergunta (corpo).
     * @param callback - Função callback que retorna se pergunta existe ou não (True / False), deve aguardar banco de dados.
     */
    alterarPergunta: (id: number, pergunta: Pergunta, callback: (notFound: boolean) => void) => {
    const sql = 'UPDATE perguntas SET enunciado = ?, eixo = ?, peso = ?, modelo = ?, disponibilidade = ? WHERE id = ?'

    // Parâmetro de modelo (Como deve ser o corpo da pergunta).
    const params =  [pergunta.enunciado, pergunta.eixo, pergunta.peso, pergunta.modelo, 1, id]

    database.run(sql, params, function(_err) {
        callback(this.changes === 0)
    })
    },

    // Método de requisição HTTP DELETE.
    /**
     * 
     * @param id - ID da pergunta.
     * @param callback - Função callback que retorna se pergunta existe ou não (True / False), deve aguardar banco de dados.
     */    
    apagarPergunta_Real: (id: number, callback: (notFound: boolean) => void) => {
    const sql = 'DELETE FROM Perguntas WHERE id = ?'

    // Parâmetro para busca (ID).
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

    // Requisição GET.
    database.all(
        sqlPerguntas,
        [instancia.Modelo],
        (err: Error | null, perguntas: Pergunta[]) => {

        if (err || !perguntas || perguntas.length !== instancia.Notas.length) {
            return callback(true)
        }

        // Força uma série de comandos a ser sequenciais, definindo uma operação por vez, evita conflitos entre TS e banco de dados.
        database.serialize(() => {
            database.run('BEGIN TRANSACTION')
            let erro = false

            // Repetidor de query
            const stmt = database.prepare(`
            INSERT INTO Historico_de_Avaliacoes
            (avaliador, avaliado, modelo, pergunta, nota, ciclo)
            VALUES (?, ?, ?, ?, ?, ?)
            `)

            // Insere-se no histórico de avaliações.
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

                // Se houver erros, ele descarta todas as alterações feitas pelo forEach.
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
// Disponibiliza as requisições