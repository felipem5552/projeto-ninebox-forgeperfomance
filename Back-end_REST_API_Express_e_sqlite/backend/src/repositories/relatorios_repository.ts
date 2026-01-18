import database from './database'

const RelatoriosRepository = {
  nineBoxPorTime(callback: (dados: any[]) => void) {
    const sql = `
      SELECT
        f.time,
        ROUND(AVG(ar.desempenho)) AS desempenho,
        ROUND(AVG(ar.potencial)) AS potencial
      FROM avaliacoes_resultado ar
      JOIN funcionarios f ON f.id = ar.avaliado
      GROUP BY f.time
      ORDER BY f.time
    `

    database.all(sql, [], (_err, rows) => {
      callback(rows || [])
    })
  }
}

export default RelatoriosRepository
