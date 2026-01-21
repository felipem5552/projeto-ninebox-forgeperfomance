import database from './database'


// - TIPOS

export type CicloRow = {
  id: number
  nome: string
  ativo: number
  data_inicio?: string | null
  data_fim?: string | null
}


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
      INSERT INTO ciclos (nome, data_inicio, data_fim)
      VALUES (?, ?, ?)
    `

    database.run(
      sql,
      [
        dados.nome,
        dados.data_inicio || null,
        dados.data_fim || null
      ],
      function (err) {
        if (err) return callback(undefined)
        callback(this.lastID)
      }
    )
  },

  
  // - LISTAR TODOS OS CICLOS
  
  listar(callback: (ciclos: CicloRow[]) => void) {
    const sql = `
      SELECT *
      FROM ciclos
      ORDER BY id DESC
    `

    database.all(
      sql,
      [],
      (_err, rows: CicloRow[]) => {
        callback(rows || [])
      }
    )
  },

  
  // - BUSCAR CICLO ATIVO
  
  buscarAtivo(callback: (ciclo: CicloRow | null) => void) {
    const sql = `
      SELECT *
      FROM ciclos
      WHERE ativo = 1
      LIMIT 1
    `

    database.get(
      sql,
      [],
      (_err, row: CicloRow | undefined) => {
        callback(row || null)
      }
    )
  },

  
  // - BUSCAR CICLO POR ID
  
  buscarPorId(
    id: number,
    callback: (ciclo: CicloRow | null) => void
  ) {
    const sql = `
      SELECT *
      FROM ciclos
      WHERE id = ?
    `

    database.get(
      sql,
      [id],
      (_err, row: CicloRow | undefined) => {
        callback(row || null)
      }
    )
  },

  
  // - ATIVAR CICLO (DESATIVA OS OUTROS)
  
  ativar(
    id: number,
    callback: (sucesso: boolean) => void
  ) {
    database.serialize(() => {
      database.run('BEGIN TRANSACTION')

      // - DESATIVA TODOS
      database.run(
        `UPDATE ciclos SET ativo = 0`,
        [],
        err => {
          if (err) {
            database.run('ROLLBACK')
            return callback(false)
          }

          // - ATIVA O SELECIONADO
          database.run(
            `UPDATE ciclos SET ativo = 1 WHERE id = ?`,
            [id],
            function (err2) {
              if (err2 || this.changes === 0) {
                database.run('ROLLBACK')
                return callback(false)
              }

              database.run('COMMIT', () => callback(true))
            }
          )
        }
      )
    })
  }
}

export default CicloRepository
