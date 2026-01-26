import database from './database'
import Pergunta from '../models/pergunta'
import CicloRow from '../models/ciclo'
import Instancia_de_Avaliacao from '../models/instancia_de_avaliacao'
import { calcularResultadoAvaliacao } from '../services/avaliacao_service'
import CicloRepository from './ciclo_repository'

// - TIPOS AUXILIARES
type ModeloRow = { id: number; titulo: string; ativo: number }
type CountRow = { total: number }
type PerguntaRow = { id: number }
type ResultadoRow = { modelo: number }


const AvaliacaoRepository = {


  // - MODELOS

  listarModelos(callback: (modelos: ModeloRow[]) => void) {
    database.all(
      'SELECT id, titulo, ativo FROM avaliacoes',
      [],
      (_err, rows: ModeloRow[]) => callback(rows ?? [])
    )
  },
  listarModelosAtivos(callback: (modelos: ModeloRow[]) => void) {
    database.all(
      'SELECT id, titulo FROM avaliacoes WHERE ativo = 1',
      [],
      (_err, rows: ModeloRow[]) => callback(rows ?? [])
    )
  },

  criarAvaliacao(
    avaliacao: { titulo: string },
    callback: (id?: number) => void
  ) {
    database.run(
      'INSERT INTO avaliacoes (titulo) VALUES (?)',
      [avaliacao.titulo],
      function () {
        callback(this.lastID)
      }
    )
  },

  alterarAvaliacao(
    id: number,
    avaliacao: { titulo: string },
    callback: (notFound: boolean) => void
  ) {
    database.run(
      'UPDATE avaliacoes SET titulo = ? WHERE id = ?',
      [avaliacao.titulo, id],
      function () {
        callback(this.changes === 0)
      }
    )
  },
    alterarStatusModelo(
    id: number,
    ativo: number,
    callback: (notFound: boolean) => void
  ) {
    database.run(
      'UPDATE avaliacoes SET ativo = ? WHERE id = ?',
      [ativo, id],
      function () {
        callback(this.changes === 0)
      }
    )
  },

  modeloFoiUsado(modeloId: number, callback: (total: number) => void) {
    database.get(
      'SELECT COUNT(*) as total FROM avaliacoes_resultado WHERE modelo = ?',
      [modeloId],
      (_err, row: CountRow | undefined) => callback(row?.total ?? 0)
    )
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
      ORDER BY ciclo_id DESC
      LIMIT 1
    `

    database.get(sql, [funcionarioId], (_err, row: ResultadoRow | undefined) => {
      callback(row ? row.modelo : null)
    })
  },


  // - PERGUNTAS

  verAvaliacao(modeloId: number, callback: (perguntas: Pergunta[]) => void) {
    const sql = `
      SELECT id, enunciado, eixo, peso
      FROM perguntas
      WHERE modelo = ?
        AND disponibilidade = 1
      ORDER BY id ASC
    `

    database.all(sql, [modeloId], (_err, rows: Pergunta[]) => {
      callback(rows ?? [])
    })
  },

  inserirPerguntas(
    modelo: number,
    pergunta: Pergunta,
    callback: (id?: number) => void
  ) {
    database.run(
      `
      INSERT INTO perguntas (enunciado, eixo, peso, modelo)
      VALUES (?, ?, ?, ?)
      `,
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
    database.run(
      `
      UPDATE perguntas
      SET enunciado = ?, eixo = ?, peso = ?
      WHERE id = ?
      `,
      [pergunta.enunciado, pergunta.eixo, pergunta.peso, id],
      function () {
        callback(this.changes === 0)
      }
    )
  },

  apagarPergunta_Real(id: number, callback: (notFound: boolean) => void) {
    database.run(
      'DELETE FROM perguntas WHERE id = ?',
      [id],
      function () {
        callback(this.changes === 0)
      }
    )
  },
    
  // - VERIFICA AVALIAÇÃO NO CICLO

  verificarAvaliacaoNoCiclo(
    avaliado: number,
    cicloId: number,
    tipo: 'GESTOR' | 'AUTO',
    callback: (existe: boolean) => void
  ) {
    const sql = `
      SELECT 1
      FROM avaliacoes_resultado
      WHERE avaliado = ?
        AND ciclo_id = ?
        AND tipo = ?
      LIMIT 1
    `

    database.get(sql, [avaliado, cicloId, tipo], (_err, row) => {
      callback(!!row)
    })
  },


  // - AVALIAÇÃO DO GESTOR

  Avaliar(
    instancia: Instancia_de_Avaliacao & {
      CicloId: number
      Desempenho: number
      Potencial: number
      NineBox: number
    },
    callback: (erro: boolean) => void
  ) {
    CicloRepository.podeAvaliar(instancia.CicloId, pode => {
      if (!pode) return callback(true)

      AvaliacaoRepository.verificarAvaliacaoNoCiclo(
        instancia.Avaliado,
        instancia.CicloId,
        'GESTOR',
        existe => {
          if (existe) return callback(true)

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
            (_err, perguntas: PerguntaRow[]) => {
              if (!perguntas || perguntas.length !== instancia.Notas.length) {
                return callback(true)
              }

              database.serialize(() => {
                database.run('BEGIN TRANSACTION')
                let erro = false

                const stmt = database.prepare(`
                  INSERT INTO historico_de_avaliacoes
                  (avaliador, avaliado, modelo, pergunta, nota, ciclo_id, tipo)
                  VALUES (?, ?, ?, ?, ?, ?, 'GESTOR')
                `)

                perguntas.forEach((p, index) => {
                  stmt.run(
                    instancia.Avaliador,
                    instancia.Avaliado,
                    instancia.Modelo,
                    p.id,
                    instancia.Notas[index],
                    instancia.CicloId,
                    (e: Error | null) => {
                      if (e) erro = true
                    }
                  )
                })

                stmt.finalize(() => {
                  database.run(
                    `
                    INSERT INTO avaliacoes_resultado
                    (avaliador, avaliado, modelo, ciclo_id, desempenho, potencial, nine_box, tipo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'GESTOR')
                    `,
                    [
                      instancia.Avaliador,
                      instancia.Avaliado,
                      instancia.Modelo,
                      instancia.CicloId,
                      instancia.Desempenho,
                      instancia.Potencial,
                      instancia.NineBox
                    ],
                    e => {
                      if (e) erro = true
                      database.run(erro ? 'ROLLBACK' : 'COMMIT', () =>
                        callback(erro)
                      )
                    }
                  )
                })
              })
            }
          )
        }
      )
    })
  },

  // - AUTOAVALIAÇÃO

  registrarAutoavaliacao(
    avaliado: number,
    modelo: number,
    cicloId: number,
    notas: number[],
    callback: (erro: boolean) => void
  ) {
    // ✅ VERIFICA SE CICLO ESTÁ ABERTO
    CicloRepository.podeAvaliar(cicloId, pode => {
      if (!pode) return callback(true)

      AvaliacaoRepository.verificarAvaliacaoNoCiclo(
        avaliado,
        cicloId,
        'AUTO',
        existe => {
          if (existe) return callback(true)

          const sqlPerguntas = `
            SELECT id
            FROM perguntas
            WHERE modelo = ?
              AND disponibilidade = 1
            ORDER BY id ASC
          `

          database.all(sqlPerguntas, [modelo], (_err, perguntas: PerguntaRow[]) => {
            if (!perguntas || perguntas.length !== notas.length) {
              return callback(true)
            }

            const resultado = calcularResultadoAvaliacao(notas)

            database.serialize(() => {
              database.run('BEGIN TRANSACTION')
              let erro = false

              const stmt = database.prepare(`
                INSERT INTO historico_de_avaliacoes
                (avaliador, avaliado, modelo, pergunta, nota, ciclo_id, tipo)
                VALUES (NULL, ?, ?, ?, ?, ?, 'AUTO')
              `)

              perguntas.forEach((p, index) => {
                stmt.run(
                  avaliado,
                  modelo,
                  p.id,
                  notas[index],
                  cicloId,
                  (e: Error | null) => {
                    if (e) erro = true
                  }
                )
              })

              stmt.finalize(() => {
                database.run(
                  `
                  INSERT INTO avaliacoes_resultado
                  (avaliador, avaliado, modelo, ciclo_id, desempenho, potencial, nine_box, tipo)
                  VALUES (NULL, ?, ?, ?, ?, ?, ?, 'AUTO')
                  `,
                  [
                    avaliado,
                    modelo,
                    cicloId,
                    resultado.desempenho,
                    resultado.potencial,
                    resultado.nineBox
                  ],
                  e => {
                    if (e) erro = true
                    database.run(erro ? 'ROLLBACK' : 'COMMIT', () =>
                      callback(erro)
                    )
                  }
                )
              })
            })
          })
        }
      )
    })
  },

  // - RESUMO DO CICLO ATIVO 

  buscarResumoCicloAtivo(
    avaliadoId: number,
    callback: (resultado: {
      ciclo: {
        id: number
        nome: string
      }
      gestor: {
        desempenho: number
        potencial: number
        nine_box: number
      } | null
      auto: {
        desempenho: number
        potencial: number
        nine_box: number
      } | null
    } | null) => void
  ) {
    const sqlCiclo = `
      SELECT id, nome
      FROM ciclos
      WHERE ativo = 1
      LIMIT 1
    `

    database.get(
      sqlCiclo,
      [],
      (_err, ciclo: CicloRow | undefined) => {
        if (!ciclo) return callback(null)

        const sqlAvaliacoes = `
          SELECT
            desempenho,
            potencial,
            nine_box,
            tipo
          FROM avaliacoes_resultado
          WHERE avaliado = ?
            AND ciclo_id = ?
            AND tipo IN ('GESTOR', 'AUTO')
        `

        database.all(
          sqlAvaliacoes,
          [avaliadoId, ciclo.id],
          (
            _err,
            rows: {
              desempenho: number
              potencial: number
              nine_box: number
              tipo: 'GESTOR' | 'AUTO'
            }[]
          ) => {
            const gestor =
              rows.find(r => r.tipo === 'GESTOR') ?? null

            const auto =
              rows.find(r => r.tipo === 'AUTO') ?? null

            callback({
              ciclo: {
                id: ciclo.id,
                nome: ciclo.nome
              },
              gestor,
              auto
            })
          }
        )
      }
    )
  },


  // - HISTÓRICO

  buscarHistorico(
    avaliadoId: number,
    cicloId: number | undefined,
    callback: (historico: {
      ciclo_id: number
      ciclo_nome: string
      desempenho: number
      potencial: number
      nine_box: number
      tipo: 'GESTOR' | 'AUTO'
    }[]) => void
  ) {
    let sql = `
      SELECT
        ar.ciclo_id,
        c.nome AS ciclo_nome,
        ar.desempenho,
        ar.potencial,
        ar.nine_box,
        ar.tipo
      FROM avaliacoes_resultado ar
      JOIN ciclos c ON c.id = ar.ciclo_id
      WHERE ar.avaliado = ?
    `

    const params: (number)[] = [avaliadoId]

    if (cicloId) {
      sql += ' AND ar.ciclo_id = ?'
      params.push(cicloId)
    }

    sql += ' ORDER BY ar.ciclo_id DESC'

    database.all(
      sql,
      params,
      (
        _err,
        rows: {
          ciclo_id: number
          ciclo_nome: string
          desempenho: number
          potencial: number
          nine_box: number
          tipo: 'GESTOR' | 'AUTO'
        }[]
      ) => {
        callback(rows || [])
      }
    )
  }
}

export default AvaliacaoRepository
