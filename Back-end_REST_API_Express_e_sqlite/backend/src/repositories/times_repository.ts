import database from './database'

export type TimeRow = {
  id: number
  nome: string
  ativo: number
}

const TimesRepository = {
  listar(callback: (times: TimeRow[]) => void) {
    database.all(
      `SELECT * FROM times ORDER BY nome ASC`,
      [],
      (_err, rows: TimeRow[]) => callback(rows || [])
    )
  },

  criar(nome: string, callback: (id?: number) => void) {
    database.run(
      `INSERT INTO times (nome) VALUES (?)`,
      [nome.trim()],
      function (this: any, err) {
        if (err) return callback(undefined)
        callback(this.lastID)
      }
    )
  },

  atualizar(
    id: number,
    nome: string,
    callback: (ok: boolean) => void
  ) {
    database.run(
      `UPDATE times SET nome = ? WHERE id = ?`,
      [nome.trim(), id],
      function (this: any) {
        callback(this.changes > 0)
      }
    )
  },

  desativar(id: number, callback: (ok: boolean) => void) {
    database.run(
      `UPDATE times SET ativo = 0 WHERE id = ?`,
      [id],
      function (this: any) {
        callback(this.changes > 0)
      }
    )
  },

  reativar(id: number, callback: (ok: boolean) => void) {
    database.run(
      `UPDATE times SET ativo = 1 WHERE id = ?`,
      [id],
      function (this: any) {
        callback(this.changes > 0)
      }
    )
  }
}

export default TimesRepository
