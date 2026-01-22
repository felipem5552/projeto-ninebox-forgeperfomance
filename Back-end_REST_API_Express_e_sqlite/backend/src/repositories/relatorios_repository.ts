import database from './database'

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type NineBoxPorTimeRow = {
  time_id: number
  time_nome: string
  tipo: 'GESTOR' | 'AUTO'
  desempenho_medio: number
  potencial_medio: number
  quantidade: number
}

export type NineBoxTimeEvolucaoRow = {
  ciclo_id: number
  ciclo_nome: string
  tipo: 'GESTOR' | 'AUTO'
  desempenho_medio: number
  potencial_medio: number
  quantidade: number
}

// ─────────────────────────────────────────────
// REPOSITORY
// ─────────────────────────────────────────────

const RelatoriosRepository = {
  // ─────────────────────────────────────────────
  // NINE BOX POR TIME (UM CICLO)
  // ─────────────────────────────────────────────
  nineBoxPorTime(
    cicloId: number,
    callback: (dados: NineBoxPorTimeRow[]) => void
  ) {
    const sql = `
      SELECT
        t.id                AS time_id,
        t.nome              AS time_nome,
        ar.tipo             AS tipo,
        AVG(ar.desempenho)  AS desempenho_medio,
        AVG(ar.potencial)   AS potencial_medio,
        COUNT(*)            AS quantidade
      FROM avaliacoes_resultado ar
      JOIN funcionarios f ON f.id = ar.avaliado
      JOIN times t        ON t.id = f.time_id
      WHERE ar.ciclo_id = ?
        AND ar.tipo IN ('GESTOR', 'AUTO')
      GROUP BY t.id, t.nome, ar.tipo
      ORDER BY t.nome ASC
    `

    database.all(
      sql,
      [cicloId],
      (_err, rows: NineBoxPorTimeRow[] | undefined) => {
        callback(rows ?? [])
      }
    )
  },

  // ─────────────────────────────────────────────
  // EVOLUÇÃO NINE BOX DE UM TIME (TODOS OS CICLOS)
  // ─────────────────────────────────────────────
  buscarNineBoxPorTimeEvolucao(
    timeId: number,
    callback: (dados: NineBoxTimeEvolucaoRow[]) => void
  ) {
    const sql = `
      SELECT
        ar.ciclo_id,
        c.nome              AS ciclo_nome,
        ar.tipo,
        AVG(ar.desempenho)  AS desempenho_medio,
        AVG(ar.potencial)   AS potencial_medio,
        COUNT(*)            AS quantidade
      FROM avaliacoes_resultado ar
      JOIN funcionarios f ON f.id = ar.avaliado
      JOIN ciclos c       ON c.id = ar.ciclo_id
      WHERE f.time_id = ?
        AND ar.tipo IN ('GESTOR', 'AUTO')
      GROUP BY ar.ciclo_id, c.nome, ar.tipo
      ORDER BY ar.ciclo_id ASC
    `

    database.all(
      sql,
      [timeId],
      (_err, rows: NineBoxTimeEvolucaoRow[] | undefined) => {
        callback(rows ?? [])
      }
    )
  }
}

export default RelatoriosRepository
