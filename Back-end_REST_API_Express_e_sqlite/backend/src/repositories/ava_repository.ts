import database from './database'
import Pergunta from '../models/pergunta'
import Instancia_de_Avaliacao from '../models/instancia_de_avaliacao'

const AvaliacaoRepository = {
  /* =========================
     📋 MODELOS
  ========================= */

  listarModelos(
    callback: (modelos: { id: number; titulo: string }[]) => void
    ) {
    const sql = 'SELECT id, titulo FROM avaliacoes'

    database.all(
        sql,
        [],
        (_err: Error | null, rows: { id: number; titulo: string }[]) => {
        callback(rows || [])
        }
    )
    },

  criarAvaliacao(
    avaliacao: { titulo: string },
    callback: (id?: number) => void
  ) {
    const sql = 'INSERT INTO avaliacoes (titulo) VALUES (?)'

    database.run(sql, [avaliacao.titulo], function () {
      callback(this.lastID)
    })
  },

  alterarAvaliacao(
    id: number,
    avaliacao: { titulo: string },
    callback: (notFound: boolean) => void
  ) {
    const sql = 'UPDATE avaliacoes SET titulo = ? WHERE id = ?'

    database.run(sql, [avaliacao.titulo, id], function () {
      callback(this.changes === 0)
    })
  },

  modeloFoiUsado(
    modeloId: number,
    callback: (total: number) => void
  ) {
    const sql = `
      SELECT COUNT(*) as total
      FROM avaliacoes_resultado
      WHERE modelo = ?
    `

    database.get(sql, [modeloId], (_err, row: any) => {
      callback(row?.total || 0)
    })
  },

 buscarUltimoModeloDoFuncionario(
  funcionarioId: number,
  callback: (modeloId: number | null) => void
) {
  const sql = `
    SELECT modelo
    FROM avaliacoes_resultado
    WHERE avaliado = ?
      AND tipo = 'GESTOR'
    ORDER BY ciclo DESC
    LIMIT 1
  `

  database.get(
    sql,
    [funcionarioId],
    (err: Error | null, row: { modelo: number } | undefined) => {
      if (err || !row) {
        callback(null)
      } else {
        callback(row.modelo)
      }
    }
  )
},

  /* =========================
     ❓ PERGUNTAS
  ========================= */

  verAvaliacao(
    modeloId: number,
    callback: (perguntas: Pergunta[]) => void
  ) {
    const sql = `
      SELECT id, enunciado, eixo, peso
      FROM perguntas
      WHERE modelo = ? AND disponibilidade = 1
      ORDER BY id ASC
    `

    database.all(
    sql,
    [modeloId],
    (_err: Error | null, rows: Pergunta[]) => {
        callback(rows || [])
    }
    )
  },

  inserirPerguntas(
    modelo: number,
    pergunta: Pergunta,
    callback: (id?: number) => void
  ) {
    const sql = `
      INSERT INTO perguntas (enunciado, eixo, peso, modelo)
      VALUES (?, ?, ?, ?)
    `

    database.run(
      sql,
      [pergunta.enunciado, pergunta.eixo, pergunta.peso, modelo],
      function () {
        callback(this.lastID)
      }
    )
  },

  alterarPergunta(
    id: number,
    pergunta: Pergunta,
    callback: (notFound: boolean) => void
  ) {
    const sql = `
      UPDATE perguntas
      SET enunciado = ?, eixo = ?, peso = ?
      WHERE id = ?
    `

    database.run(
      sql,
      [pergunta.enunciado, pergunta.eixo, pergunta.peso, id],
      function () {
        callback(this.changes === 0)
      }
    )
  },

  apagarPergunta_Real(
    id: number,
    callback: (notFound: boolean) => void
  ) {
    const sql = 'DELETE FROM perguntas WHERE id = ?'

    database.run(sql, [id], function () {
      callback(this.changes === 0)
    })
  },

  /* =========================
     🧑‍💼 AVALIAÇÃO DO GESTOR
  ========================= */

  Avaliar(
    instancia: Instancia_de_Avaliacao,
    callback: (erro: boolean) => void
  ) {
    const sqlPerguntas = `
      SELECT id
      FROM perguntas
      WHERE modelo = ?
        AND disponibilidade = 1
      ORDER BY id ASC
    `

    database.all(
      sqlPerguntas,
      [instancia.Modelo],
      (_err, perguntas: { id: number }[]) => {
        if (!perguntas || perguntas.length !== instancia.Notas.length) {
          return callback(true)
        }

        database.serialize(() => {
          database.run('BEGIN TRANSACTION')
          let erro = false

          const stmt = database.prepare(`
            INSERT INTO historico_de_avaliacoes
            (avaliador, avaliado, modelo, pergunta, nota, ciclo, tipo)
            VALUES (?, ?, ?, ?, ?, ?, 'GESTOR')
          `)

          perguntas.forEach((p, index) => {
            stmt.run(
              instancia.Avaliador,
              instancia.Avaliado,
              instancia.Modelo,
              p.id,
              instancia.Notas[index],
              instancia.Ciclo,
              (e: Error | null) => {
                if (e) erro = true
              }
            )
          })

          stmt.finalize(() => {
            database.run(
              `
              INSERT INTO avaliacoes_resultado
              (avaliador, avaliado, modelo, ciclo, desempenho, potencial, nine_box, tipo)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'GESTOR')
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
              (e: Error | null) => {
                if (e) erro = true

                database.run(
                  erro ? 'ROLLBACK' : 'COMMIT',
                  () => callback(erro)
                )
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
  tipo: 'GESTOR' | 'AUTO',
  callback: (existe: boolean) => void
) {
  const sql = `
    SELECT 1
    FROM avaliacoes_resultado
    WHERE avaliado = ?
      AND ciclo = ?
      AND tipo = ?
    LIMIT 1
  `

  database.get(
    sql,
    [avaliado, ciclo, tipo],
    (_err, row) => {
      callback(!!row)
    }
  )
},

  /* =========================
     🧍 AUTOAVALIAÇÃO
  ========================= */

  registrarAutoavaliacao(
    avaliado: number,
    modelo: number,
    ciclo: string,
    notas: number[],
    callback: (erro: boolean) => void
  ) {
    const sqlPerguntas = `
      SELECT id
      FROM perguntas
      WHERE modelo = ?
        AND disponibilidade = 1
      ORDER BY id ASC
    `

    database.all(
      sqlPerguntas,
      [modelo],
      (_err, perguntas: { id: number }[]) => {
        if (!perguntas || perguntas.length !== notas.length) {
          return callback(true)
        }

        database.serialize(() => {
          database.run('BEGIN TRANSACTION')
          let erro = false

          const stmt = database.prepare(`
            INSERT INTO historico_de_avaliacoes
            (avaliador, avaliado, modelo, pergunta, nota, ciclo, tipo)
            VALUES (?, ?, ?, ?, ?, ?, 'AUTO')
          `)

          perguntas.forEach((p, index) => {
            stmt.run(
              avaliado,      // 👈 avaliador = próprio funcionário
              avaliado,
              modelo,
              p.id,
              notas[index],
              ciclo,
              (e: Error | null) => {
                if (e) erro = true
              }
            )
          })


          stmt.finalize(() => {
            database.run(
              `
              INSERT INTO avaliacoes_resultado
              (avaliador, avaliado, modelo, ciclo, desempenho, potencial, nine_box, tipo)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'AUTO')
              `,
              [
                avaliado,
                avaliado,
                modelo,
                ciclo,
                1, // ✅ válido
                1, // ✅ válido
                1  // ✅ válido
              ],
              (e: Error | null) => {
                if (e) erro = true
                database.run(erro ? 'ROLLBACK' : 'COMMIT', () => callback(erro))
              }
            )
          })
        })
      }
    )
  },

  /* =========================
     📜 HISTÓRICO
  ========================= */

  buscarHistorico(
    avaliadoId: number,
    callback: (historico: any[]) => void
  ) {
    const sql = `
      SELECT ciclo, desempenho, potencial, nine_box, tipo
      FROM avaliacoes_resultado
      WHERE avaliado = ?
      ORDER BY ciclo DESC
    `

    database.all(sql, [avaliadoId], (_err, rows) => {
      callback(rows || [])
    })
  }
}


export default AvaliacaoRepository
