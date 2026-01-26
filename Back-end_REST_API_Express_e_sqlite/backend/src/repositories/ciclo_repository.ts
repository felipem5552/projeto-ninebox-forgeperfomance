import database from './database'
import CicloRow from '../models/ciclo'

// - REPOSITÓRIO DE CICLOS

const CicloRepository = {
  // - CRIAR CICLO
  criar(
    dados: {
      nome: string
      data_inicio?: string
      data_fim?: string
    },
    callback: (id?: number) => void
  ) {
    const sql = `
      INSERT INTO ciclos (nome, ativo, data_inicio, data_fim)
      VALUES (?, 0, ?, ?)
    `

    database.run(
      sql,
      [
        dados.nome,
        dados.data_inicio || null,
        dados.data_fim || null
      ],
      function (err) {
        if (err) {
          console.error('Erro ao criar ciclo:', err)
          return callback(undefined)
        }
        callback(this.lastID)
      }
    )
  },

  // - LISTAR CICLOS
  listar(callback: (ciclos: CicloRow[]) => void) {
    const sql = `
      SELECT *
      FROM ciclos
      ORDER BY id DESC
    `

    database.all(sql, [], (_err, rows: CicloRow[]) => {
      callback(rows || [])
    })
  },

  // - BUSCAR CICLO ATIVO
  buscarAtivo(callback: (ciclo: CicloRow | null) => void) {
    const sql = `
      SELECT *
      FROM ciclos
      WHERE ativo = 1
      LIMIT 1
    `

    database.get(sql, [], (_err, row: CicloRow | undefined) => {
      callback(row || null)
    })
  },

  // - ATIVAR CICLO (desativa todos antes)
  ativar(id: number, callback: (sucesso: boolean) => void) {
    database.serialize(() => {
      database.run(`UPDATE ciclos SET ativo = 0`, err => {
        if (err) return callback(false)

        database.run(
          `UPDATE ciclos SET ativo = 1 WHERE id = ?`,
          [id],
          function (err2) {
            if (err2 || this.changes === 0) {
              return callback(false)
            }
            callback(true)
          }
        )
      })
    })
  },
  podeAvaliar(cicloId: number, callback: (pode: boolean) => void) {
    const sql = `
      SELECT data_inicio, data_fim
      FROM ciclos
      WHERE id = ?
    `

    database.get(
      sql,
      [cicloId],
      (_err, row: { data_inicio?: string | null; data_fim?: string | null } | undefined) => {
        if (!row) return callback(false)

        const hoje = new Date()

        const inicio = row.data_inicio
          ? new Date(row.data_inicio)
          : null

        const fim = row.data_fim
          ? new Date(row.data_fim)
          : null

        if (inicio && hoje < inicio) return callback(false)
        if (fim && hoje > fim) return callback(false)

        callback(true)
      }
    )
  },
  // - DESATIVAR CICLO
  desativar(id: number, callback: (sucesso: boolean) => void) {
    const sql = `
      UPDATE ciclos SET ativo = 0 WHERE id = ?
    `

    database.run(sql, [id], function (err) {
      if (err || this.changes === 0) {
        return callback(false)
      }
      callback(true)
    })
  }
}

export default CicloRepository
