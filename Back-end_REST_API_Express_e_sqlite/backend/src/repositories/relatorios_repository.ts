import database from './database'

const RelatoriosRepository = {

  nineBoxPorTime(
    cicloId: number,
    callback: (dados: any[]) => void
  ) {
    const sql = `
      SELECT
        f.time,
        ar.nine_box,
        COUNT(*) as total
      FROM avaliacoes_resultado ar
      JOIN funcionarios f ON f.id = ar.avaliado
      WHERE ar.tipo = 'GESTOR'
        AND ar.ciclo_id = ?
      GROUP BY f.time, ar.nine_box
    `

    database.all(sql, [cicloId], (_err, rows) => {
      callback(rows || [])
    })
  }

}

export default RelatoriosRepository