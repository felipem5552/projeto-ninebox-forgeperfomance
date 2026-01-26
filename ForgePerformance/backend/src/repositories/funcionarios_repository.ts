import database from './database'
import FuncionarioRow from '../models/funcionario'

//- REPOSITÓRIO DE FUNCIONÁRIOS

const funcionariosRepository = {

  
  //- CRIAR FUNCIONÁRIO
  
  criar(
    funcionario: {
      nome: string
      email: string
      cargo?: string | null
      time_id: number
      privilegios: 'FUNCIONARIO' | 'GESTOR' | 'ADMIN'
    },
    callback: (id?: number) => void
  ) {
    const sql = `
      INSERT INTO funcionarios
      (nome, email, cargo, time_id, privilegios, ativo)
      VALUES (?, ?, ?, ?, ?, 1)
    `

    const params = [
      funcionario.nome,
      funcionario.email,
      funcionario.cargo ?? null,
      funcionario.time_id,
      funcionario.privilegios
    ]

    database.run(sql, params, function (err) {
      if (err) return callback(undefined)
      callback(this.lastID)
    })
  },

  
  //- LISTAR TODOS (ADMIN / GESTOR)
  
  listarTodos(
    callback: (funcionarios: FuncionarioRow[]) => void
  ) {
    const sql = `
      SELECT
        f.id,
        f.nome,
        f.email,
        f.cargo,
        f.time_id,
        t.nome AS time_nome,
        f.privilegios,
        f.ativo,
        f.data_de_ingresso
      FROM funcionarios f
      JOIN times t ON t.id = f.time_id
      ORDER BY f.nome ASC
    `

    database.all(
      sql,
      [],
      (_err, rows: FuncionarioRow[]) => {
        callback(rows || [])
      }
    )
  },

  
  //- 🔍 BUSCAR POR ID
  
  buscarPorId(
    id: number,
    callback: (funcionario: FuncionarioRow | null) => void
  ) {
    const sql = `
      SELECT
        f.id,
        f.nome,
        f.email,
        f.cargo,
        f.time_id,
        t.nome AS time_nome,
        f.privilegios,
        f.ativo,
        f.data_de_ingresso
      FROM funcionarios f
      JOIN times t ON t.id = f.time_id
      WHERE f.id = ?
    `

    database.get(
      sql,
      [id],
      (_err, row: FuncionarioRow | undefined) => {
        callback(row || null)
      }
    )
  },

  
  //- BUSCAR POR EMAIL (LOGIN)
  
  buscarPorEmail(
    email: string,
    callback: (funcionario: FuncionarioRow | null) => void
  ) {
    const sql = `
      SELECT *
      FROM funcionarios
      WHERE email = ?
    `

    database.get(
      sql,
      [email],
      (_err, row: FuncionarioRow | undefined) => {
        callback(row || null)
      }
    )
  },

  
  //- VERIFICAR EMAIL EXISTENTE
  
  verificarEmailExistente(
    email: string,
    callback: (existe: boolean) => void
  ) {
    const sql = `
      SELECT 1
      FROM funcionarios
      WHERE email = ?
      LIMIT 1
    `

    database.get(sql, [email], (_err, row) => {
      callback(!!row)
    })
  },

  
  //- ATUALIZAR FUNCIONÁRIO
  
  atualizar(
    id: number,
    dados: {
      nome: string
      cargo?: string | null
      time_id: number
      privilegios: 'FUNCIONARIO' | 'GESTOR' | 'ADMIN'
      ativo?: boolean
    },
    callback: (notFound: boolean) => void
  ) {
    const sql = `
      UPDATE funcionarios
      SET
        nome = ?,
        cargo = ?,
        time_id = ?,
        privilegios = ?,
        ativo = COALESCE(?, ativo)
      WHERE id = ?
    `

    const params = [
      dados.nome,
      dados.cargo ?? null,
      dados.time_id,
      dados.privilegios,
      dados.ativo === undefined ? null : (dados.ativo ? 1 : 0),
      id
    ]

    database.run(sql, params, function (_err) {
      callback(this.changes === 0)
    })
  },

  
  //- RESETAR SENHA
  
  resetarSenha(
    id: number,
    callback: (sucesso: boolean) => void
  ) {
    const sql = `
      UPDATE funcionarios
      SET senha = NULL
      WHERE id = ?
    `

    database.run(sql, [id], function (_err) {
      callback(this.changes > 0)
    })
  },

  
  //- DESATIVAR FUNCIONÁRIO
  
  desativar(
    id: number,
    callback: (sucesso: boolean) => void
  ) {
    const sql = `
      UPDATE funcionarios
      SET ativo = 0
      WHERE id = ?
    `

    database.run(sql, [id], function (_err) {
      callback(this.changes > 0)
    })
  },

  
  //- REATIVAR FUNCIONÁRIO
  
  reativar(
    id: number,
    callback: (sucesso: boolean) => void
  ) {
    const sql = `
      UPDATE funcionarios
      SET ativo = 1
      WHERE id = ?
    `

    database.run(sql, [id], function (_err) {
      callback(this.changes > 0)
    })
  }
}

export default funcionariosRepository
