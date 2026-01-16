import database from './database'

type RelatorioNineBoxPorTime = {
    time: string
    media_desempenho: number
    media_potencial: number
}

const RelatoriosRepository = { nineBoxPorTime( callback: (dados: RelatorioNineBoxPorTime[]) => void) {

  // Define a média de notas (Potencial e Desempenho) pra cada time
    const sql = `
      SELECT
        f.time,
        AVG(r.desempenho) AS media_desempenho,
        AVG(r.potencial) AS media_potencial
      FROM avaliacoes_resultado r
      JOIN funcionarios f ON f.id = r.avaliado
      GROUP BY f.time
    `

    database.all(sql,[],(_err: Error | null, rows: RelatorioNineBoxPorTime[]) => {
        callback(rows || [])
      }
    )
  }

}

export default RelatoriosRepository